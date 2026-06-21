import { SuperCircleLoader } from '@/components/loader'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  BooleanToggleInput,
  CheckboxGroupInput,
  CodeMirrorWrapped,
  ColorPickerInput,
  ComponentInputType,
  ComponentMetaField,
  DatePicker,
  DateRangePicker,
  DropdownMultiSelect,
  DropdownSearchSelect,
  DropdownSelectInput,
  FileInput,
  KeyValuePairInput,
  LinkOrFileInput,
  NumberInput,
  RichTextEditor,
  SliderInput,
  TagInput,
  TextAreaInput,
  TextInput,
  URLInput,
} from '@/features/component-meta'
import { SaveIcon } from '@/features/component-meta/assets'
import {
  LegacyApiEndpoint,
  LegacyComponentMeta,
} from '@/features/services/api/api-v2-adapters'
import { assetUrlV2, uploadFileV2 } from '@/features/uploads/api/uploads'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { zodResolver } from '@hookform/resolvers/zod'
import { buildMetaData, flattenMetaData } from '@uigraph/sdk'
import { buildDynamicZodSchema } from '@uigraph/sdk/browser'
import { arrayNonNullable } from 'daily-code'
import { Lock } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm, useFormState } from 'react-hook-form'
import { toast } from 'sonner'
import { useServiceApiEndpointsContext } from '../../contexts/service-api-endpoints'

type ConfigureApiEndpointMetaProps = {
  endpoint: LegacyApiEndpoint
  componentMeta: LegacyComponentMeta
  readonly?: boolean
  className?: string
  hideFooter?: boolean
  lockedFieldLabels?: string[]
  onDirtyChange?: (dirty: boolean) => void
  onBindActions?: (actions: {
    submit: () => Promise<boolean>
    reset: () => void
  }) => void
}

export function ConfigureApiEndpointMeta({
  componentMeta,
  readonly = false,
  className = '',
  hideFooter = false,
  lockedFieldLabels = [],
  onDirtyChange,
  onBindActions,
}: ConfigureApiEndpointMetaProps) {
  const { updateServiceApiEndpointMeta } = useServiceApiEndpointsContext()

  const containerRef = useRef<HTMLDivElement>(null)

  const fields = useMemo(() => {
    return arrayNonNullable(componentMeta.componentModalFields)
  }, [componentMeta.componentModalFields])

  const flattenedMemoizedData = useMemo(() => {
    return flattenMetaData(fields, fields)
  }, [fields])

  const memoizedSchema = useMemo(() => {
    return buildDynamicZodSchema(fields)
  }, [fields])

  const { handleSubmit, control, reset } = useForm({
    resolver: zodResolver(memoizedSchema),
    defaultValues: flattenedMemoizedData,
  })
  const { isDirty, errors, isSubmitting } = useFormState({ control })

  const organizationId = useCurrentOrganization()?.id

  const [isUploading, setIsUploading] = useState(false)
  const lockedFieldSet = useMemo(
    () => new Set(lockedFieldLabels.map((label) => label.toLowerCase())),
    [lockedFieldLabels]
  )

  async function submitForm(): Promise<boolean> {
    let isValid = true
    await handleSubmit(handleSuccessfulSubmit, () => {
      isValid = false
      const container = containerRef.current
      if (!container) return

      const firstErrorElement = container.querySelector('[data-has-error]')
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    })()
    return isValid
  }

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  useEffect(() => {
    onBindActions?.({
      submit: submitForm,
      reset: () => reset(flattenedMemoizedData),
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flattenedMemoizedData, onBindActions, reset])

  async function handleSuccessfulSubmit(input: typeof flattenedMemoizedData) {
    const duplicatedMetaData = { ...input }
    const metaDataFiles: Record<string, File> = Object.fromEntries(
      Object.entries(input).filter(([_, value]) => value instanceof File)
    )

    if (Object.keys(metaDataFiles).length > 0) {
      setIsUploading(true)

      for (const file in metaDataFiles) {
        const fileData = metaDataFiles[file]

        const assetId = await uploadFileV2(organizationId!, fileData)

        duplicatedMetaData[file] = assetUrlV2(assetId)
      }

      setIsUploading(false)
    }

    const data = buildMetaData(fields, duplicatedMetaData)
    await updateServiceApiEndpointMeta({
      variables: {
        componentMetaId: componentMeta.componentMetaId!,
        input: {
          componentModalFields: data,
        },
      },
    })

    toast.success('API endpoint meta updated successfully')
  }

  return (
    <>
      <div ref={containerRef} className={cn('space-y-4 px-6', className)}>
        {fields.map((field, i) => (
          <Controller
            key={field.componentFieldId ?? i}
            control={control}
            name={field.componentFieldId!}
            render={({ field: controllerField }) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const value = controllerField.value as any | null
              const isLocked =
                !readonly &&
                lockedFieldSet.has((field.label || '').toLowerCase().trim())
              const setValue =
                readonly || isLocked
                  ? () => undefined
                  : controllerField.onChange

              return (
                <ComponentMetaField
                  label={
                    isLocked ? (
                      <span className="inline-flex items-center gap-1.5">
                        {field.label ?? 'Label'}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex cursor-help items-center text-[#828DA3]">
                              <Lock className="h-3.5 w-3.5" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>
                            From spec
                          </TooltipContent>
                        </Tooltip>
                      </span>
                    ) : (
                      (field.label ?? 'Label')
                    )
                  }
                  required={field.required ?? false}
                  componentType={field.type ?? 'unknown'}
                  error={errors[field.componentFieldId!]?.message?.toString()}
                >
                  {field.type === ComponentInputType.NumberInput && (
                    <NumberInput
                      value={value ?? ''}
                      readonly={readonly}
                      onChange={setValue}
                    />
                  )}

                  {field.type === ComponentInputType.TextInput && (
                    <TextInput
                      value={value ?? ''}
                      readonly={readonly}
                      onChange={setValue}
                    />
                  )}

                  {field.type === ComponentInputType.TextBox && (
                    <TextAreaInput
                      value={value ?? ''}
                      readonly={readonly}
                      onChange={setValue}
                    />
                  )}

                  {field.type === ComponentInputType.URLInput && (
                    <URLInput
                      value={value ?? ''}
                      readonly={readonly}
                      onChange={setValue}
                    />
                  )}

                  {field.type === ComponentInputType.FileUpload && (
                    <FileInput
                      file={value ?? null}
                      onChange={setValue}
                      isViewMode={readonly ? true : undefined}
                    />
                  )}

                  {field.type === ComponentInputType.LinkOrFileUpload && (
                    <LinkOrFileInput
                      value={value ?? null}
                      onChange={setValue}
                      isViewMode={readonly ? true : undefined}
                    />
                  )}

                  {field.type === ComponentInputType.DropdownSelect && (
                    <DropdownSelectInput
                      options={arrayNonNullable(field.options)}
                      value={value ?? ''}
                      readonly={readonly}
                      onChange={setValue}
                    />
                  )}

                  {field.type === ComponentInputType.RichTextEditor && (
                    <RichTextEditor
                      value={value ?? ''}
                      readonly={readonly}
                      setValue={setValue}
                    />
                  )}

                  {field.type === ComponentInputType.CodeEditor && (
                    <div className="border-stock w-full overflow-hidden rounded-[0.75rem] border bg-[#141925]">
                      <CodeMirrorWrapped
                        height={'10rem'}
                        value={value ?? ''}
                        readonly={readonly}
                        setValue={setValue}
                      />
                    </div>
                  )}

                  {field.type === ComponentInputType.KeyValueList && (
                    <KeyValuePairInput
                      value={value ?? []}
                      readonly={readonly}
                      onChange={setValue}
                    />
                  )}

                  {field.type === ComponentInputType.BooleanToggle && (
                    <BooleanToggleInput
                      checked={Boolean(value)}
                      readonly={readonly}
                      onChange={setValue}
                    />
                  )}

                  {field.type === ComponentInputType.MultiSelect && (
                    <DropdownMultiSelect
                      options={arrayNonNullable(field.options)}
                      value={value ?? []}
                      readonly={readonly}
                      onChange={setValue}
                    />
                  )}

                  {field.type === ComponentInputType.SearchSelect && (
                    <DropdownSearchSelect
                      options={arrayNonNullable(field.options)}
                      value={value ?? ''}
                      readonly={readonly}
                      onChange={setValue}
                    />
                  )}

                  {field.type === ComponentInputType.CheckboxGroup && (
                    <CheckboxGroupInput
                      value={value ?? []}
                      readonly={readonly}
                      onChange={setValue}
                      options={arrayNonNullable(field.options)}
                    />
                  )}

                  {field.type === ComponentInputType.TagInput && (
                    <TagInput
                      value={value ?? []}
                      readonly={readonly}
                      onChange={setValue}
                    />
                  )}

                  {field.type === ComponentInputType.DatePicker && (
                    <DatePicker
                      value={value ?? null}
                      readonly={readonly}
                      onChange={setValue}
                    />
                  )}

                  {field.type === ComponentInputType.DateRangePicker && (
                    <DateRangePicker
                      value={value ?? null}
                      readonly={readonly}
                      onChange={setValue}
                    />
                  )}

                  {field.type === ComponentInputType.ColorPicker && (
                    <ColorPickerInput
                      value={value ?? null}
                      readonly={readonly}
                      onChange={setValue}
                    />
                  )}

                  {field.type === ComponentInputType.Slider && (
                    <SliderInput
                      value={value ?? null}
                      readonly={readonly}
                      onChange={setValue}
                    />
                  )}
                </ComponentMetaField>
              )
            }}
          />
        ))}
      </div>

      {!readonly && !hideFooter && (
        <div className="sticky bottom-0 flex justify-end bg-[#141925] px-6 py-4">
          <Button
            disabled={isSubmitting || !isDirty}
            className={'h-11 rounded-[0.8125rem]'}
            onClick={() => {
              void submitForm()
            }}
          >
            <div className="flex w-4 items-center justify-center">
              {isSubmitting ? (
                <SuperCircleLoader className="text-base" />
              ) : (
                <SaveIcon className="text-lg" />
              )}
            </div>

            {isUploading ? 'Uploading File' : 'Update Endpoint'}
          </Button>
        </div>
      )}
    </>
  )
}

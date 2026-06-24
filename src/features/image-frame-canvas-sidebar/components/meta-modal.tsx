import { SettingsIcon } from '@/assets/svgs'
import { CrossButton } from '@/components/cross-button'
import { SuperCircleLoader } from '@/components/loader'
import { SectionLoader } from '@/components/section-loader'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  BooleanToggleInput,
  CheckboxGroupInput,
  CodeMirrorWrapped,
  ColorPickerInput,
  ComponentInputType,
  ComponentMetaField,
  ComponentMetaThemeProvider,
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
import { ComponentField } from '@/features/components/components/configure-component/component-field-list'
import { assetUrl, uploadFile } from '@/features/uploads/api/uploads'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { buildMetaData, flattenMetaData } from '@uigraph/sdk'
import { buildDynamicZodSchema } from '@uigraph/sdk/browser'
import { arrayNonNullable } from 'daily-code'
import { ReactNode, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { FiEdit } from 'react-icons/fi'
import {
  ComponentFieldInput,
  FOCAL_POINT_META_BY_COMPONENT_LINK,
} from '../api/focal-point-meta'
import { FocalPointMetaLayoutModalContent } from './modal-customize'

function FocalPointMetaModalContent({
  title,
  description,
  fields,

  submit,
  submitLabel,
  isViewMode = false,
  isReadOnly = false,
  setEditMode,
}: ModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const flattenedMemoizedData = useMemo(() => {
    return flattenMetaData(fields, fields)
  }, [fields])

  const memoizedSchema = useMemo(() => {
    return buildDynamicZodSchema(fields)
  }, [fields])

  const { formState, handleSubmit, control } = useForm({
    resolver: zodResolver(memoizedSchema),
    defaultValues: flattenedMemoizedData,
    values: flattenedMemoizedData,
  })

  const organizationId = useCurrentOrganization()?.id

  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  async function handleSuccessfulSubmit(input: typeof flattenedMemoizedData) {
    setIsLoading(true)

    const duplicatedMetaData = { ...input }
    const metaDataFiles: Record<string, File> = Object.fromEntries(
      Object.entries(input).filter(([_, value]) => value instanceof File)
    )

    if (Object.keys(metaDataFiles).length > 0) {
      setIsUploading(true)

      for (const file in metaDataFiles) {
        const fileData = metaDataFiles[file]

        const assetId = await uploadFile(organizationId!, fileData)

        duplicatedMetaData[file] = assetUrl(assetId)
      }

      setIsUploading(false)
    }

    submit(
      buildMetaData(fields, duplicatedMetaData).map((field) => {
        const { readonly, ...rest } = field as ComponentFieldInput & {
          readonly?: boolean | null
        }

        return {
          ...rest,
          isReadonly: rest.isReadonly ?? readonly ?? null,
          options: arrayNonNullable(rest.options),
        }
      })
    )
      .then(() => {
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Submission error:', error)
        setIsLoading(false)
      })
  }

  return (
    <>
      <DialogHeader className="border-stock min-h-[6.1rem] gap-2.5 border-b p-6">
        <DialogTitle asChild>
          <h3>{title}</h3>
        </DialogTitle>

        <DialogDescription asChild>
          <p className="text-paragraph text-sm">{description}</p>
        </DialogDescription>
      </DialogHeader>

      <div
        ref={containerRef}
        className="max-h-full overflow-auto p-6 pb-0"
        onFocus={(e) => {
          if (isViewMode) e.target.blur()
        }}
      >
        <ComponentMetaThemeProvider theme="modal">
          <div className={cn(isViewMode && 'pointer-events-none')}>
            {fields.map((field, i) => (
              <Controller
                key={field.componentFieldId ?? i}
                control={control}
                name={field.componentFieldId!}
                render={({ field: controllerField }) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const value = controllerField.value as any | null
                  const setValue = controllerField.onChange

                  return (
                    <ComponentMetaField
                      label={field.label ?? 'Label'}
                      required={!isReadOnly && (field.required ?? false)}
                      componentType={field.type ?? 'unknown'}
                      error={formState.errors[
                        field.componentFieldId!
                      ]?.message?.toString()}
                    >
                      {field.type === ComponentInputType.NumberInput && (
                        <NumberInput value={value ?? ''} onChange={setValue} />
                      )}

                      {field.type === ComponentInputType.TextInput && (
                        <TextInput value={value ?? ''} onChange={setValue} />
                      )}

                      {field.type === ComponentInputType.TextBox && (
                        <TextAreaInput
                          value={value ?? ''}
                          onChange={setValue}
                        />
                      )}

                      {field.type === ComponentInputType.URLInput && (
                        <URLInput value={value ?? ''} onChange={setValue} />
                      )}

                      {field.type === ComponentInputType.FileUpload && (
                        <FileInput
                          file={value ?? null}
                          isViewMode={isViewMode}
                          onChange={setValue}
                        />
                      )}

                      {field.type === ComponentInputType.LinkOrFileUpload && (
                        <LinkOrFileInput
                          value={value ?? null}
                          isViewMode={isViewMode}
                          onChange={setValue}
                        />
                      )}

                      {field.type === ComponentInputType.DropdownSelect && (
                        <DropdownSelectInput
                          options={arrayNonNullable(field.options)}
                          value={value ?? ''}
                          onChange={setValue}
                        />
                      )}

                      {field.type === ComponentInputType.RichTextEditor && (
                        <RichTextEditor
                          value={value ?? ''}
                          setValue={setValue}
                        />
                      )}

                      {field.type === ComponentInputType.CodeEditor && (
                        <CodeMirrorWrapped
                          height={'10rem'}
                          value={value ?? ''}
                          setValue={setValue}
                        />
                      )}

                      {field.type === ComponentInputType.KeyValueList && (
                        <KeyValuePairInput
                          value={value ?? []}
                          onChange={setValue}
                        />
                      )}

                      {field.type === ComponentInputType.BooleanToggle && (
                        <BooleanToggleInput
                          checked={Boolean(value)}
                          onChange={setValue}
                        />
                      )}

                      {field.type === ComponentInputType.MultiSelect && (
                        <DropdownMultiSelect
                          options={arrayNonNullable(field.options)}
                          value={value ?? []}
                          onChange={setValue}
                        />
                      )}

                      {field.type === ComponentInputType.SearchSelect && (
                        <DropdownSearchSelect
                          options={arrayNonNullable(field.options)}
                          value={value ?? ''}
                          onChange={setValue}
                        />
                      )}

                      {field.type === ComponentInputType.CheckboxGroup && (
                        <CheckboxGroupInput
                          value={value ?? []}
                          onChange={setValue}
                          options={arrayNonNullable(field.options)}
                        />
                      )}

                      {field.type === ComponentInputType.TagInput && (
                        <TagInput value={value ?? []} onChange={setValue} />
                      )}

                      {field.type === ComponentInputType.DatePicker && (
                        <DatePicker value={value ?? null} onChange={setValue} />
                      )}

                      {field.type === ComponentInputType.DateRangePicker && (
                        <DateRangePicker
                          value={value ?? null}
                          onChange={setValue}
                        />
                      )}

                      {field.type === ComponentInputType.ColorPicker && (
                        <ColorPickerInput
                          value={value ?? null}
                          onChange={setValue}
                        />
                      )}

                      {field.type === ComponentInputType.Slider && (
                        <SliderInput
                          value={value ?? null}
                          onChange={setValue}
                        />
                      )}
                    </ComponentMetaField>
                  )
                }}
              />
            ))}
          </div>
        </ComponentMetaThemeProvider>
      </div>

      <DialogFooter className="border-stock flex-row items-center justify-end border-t p-6 pt-2 pb-3 sm:pb-6">
        {isReadOnly && (
          <p className="text-paragraph mr-auto text-sm">
            This component is linked to a service and cannot be edited here.
            <br />
            You can edit the component in the service.
          </p>
        )}

        <DialogClose asChild>
          <Button
            preset="outline"
            disabled={isLoading}
            className={'h-11 rounded-[0.8125rem]'}
          >
            {isViewMode ? 'Close' : 'Cancel'}
          </Button>
        </DialogClose>

        {!isReadOnly && (
          <Button
            preset="cta"
            disabled={isLoading || isReadOnly}
            className={'h-11 rounded-[0.8125rem]'}
            onClick={() => {
              if (isViewMode && setEditMode) {
                return setEditMode()
              }

              void handleSubmit(handleSuccessfulSubmit, () => {
                const container = containerRef.current!
                if (!container) return

                const firstErrorElement =
                  container.querySelector('[data-has-error]')

                if (firstErrorElement) {
                  firstErrorElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                  })
                }
              })()
            }}
          >
            <div className="flex w-4 items-center justify-center">
              {isLoading ? (
                <SuperCircleLoader className="text-base" />
              ) : isViewMode ? (
                <FiEdit className="text-lg" />
              ) : (
                <SaveIcon className="text-lg" />
              )}
            </div>

            {isUploading
              ? 'Uploading File'
              : isViewMode
                ? 'Start Editing'
                : submitLabel}
          </Button>
        )}
      </DialogFooter>
    </>
  )
}

function FocalPointMetaModalWrapper({
  isOpen,
  setIsOpen,
  isViewMode = false,
  componentMetaId,
  ...props
}: ModalProps & { isOpen: boolean; setIsOpen: (open: boolean) => void }) {
  const memoizedFields = useMemo(() => {
    return props.fields
      .filter((field) => field.type)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }, [props.fields])

  const [fieldsState, setFieldsState] = useState(memoizedFields)
  const [isEditLayoutMode, setIsEditLayoutMode] = useState(false)

  return (
    <>
      {isEditLayoutMode ? (
        <FocalPointMetaLayoutModalContent
          title={props.title}
          fields={fieldsState}
          setFields={setFieldsState}
          doneEditing={() => setIsEditLayoutMode(false)}
        />
      ) : (
        <FocalPointMetaModalContent
          {...props}
          isViewMode={isViewMode}
          fields={fieldsState}
        />
      )}

      {isEditLayoutMode ? (
        <CrossButton
          className="absolute top-3 right-3"
          onClick={() => setIsEditLayoutMode(false)}
        />
      ) : (
        <>
          <DialogClose asChild>
            <CrossButton className="absolute top-3 right-3" />
          </DialogClose>

          {!isViewMode && (
            <button
              onClick={() => setIsEditLayoutMode(true)}
              className="hover:bg-stock absolute top-4 right-14 rounded-md p-2"
            >
              <SettingsIcon />
            </button>
          )}
        </>
      )}
    </>
  )
}

function FocalPointMetaModalLoader({
  componentMetaId,
  ...props
}: ModalProps & { isOpen: boolean; setIsOpen: (open: boolean) => void }) {
  const organizationId = useCurrentOrganization()?.id

  const { data: componentMetaData, loading: isLoadingComponentMetaData } =
    useQuery(FOCAL_POINT_META_BY_COMPONENT_LINK, {
      variables: { orgId: organizationId!, componentLinkId: componentMetaId! },
      skip: !componentMetaId || !organizationId,
      fetchPolicy: 'cache-first',
    })

  const memoizedFields = useMemo(() => {
    return componentMetaId
      ? arrayNonNullable(
          componentMetaData?.focalPointMetaByComponentLink?.[0]
            ?.componentModalFields
        )
      : props.fields
  }, [componentMetaData, componentMetaId, props.fields])

  if (isLoadingComponentMetaData) {
    return (
      <>
        <DialogTitle hidden>Loading...</DialogTitle>
        <DialogDescription hidden>
          Loading component meta data...
        </DialogDescription>

        <SectionLoader label={'Loading component meta data...'} />
      </>
    )
  }

  return <FocalPointMetaModalWrapper {...props} fields={memoizedFields} />
}

export function FocalPointMetaModal({
  isOpen,
  setIsOpen,

  ...props
}: ModalProps & { isOpen: boolean; setIsOpen: (open: boolean) => void }) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        showCloseButton={false}
        className="h-full max-h-full w-full max-w-full grid-rows-[auto_1fr_auto] gap-0 rounded-none border border-[#2A3242] bg-[#141925] p-0 sm:h-auto sm:max-h-[95%] sm:max-w-[min(43rem,95%)] sm:rounded-[1rem]"
      >
        <FocalPointMetaModalLoader
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          {...props}
        />
      </DialogContent>
    </Dialog>
  )
}

type ModalProps = {
  title: ReactNode
  description: ReactNode
  fields: ComponentField[]

  submit: (data: ComponentFieldInput[]) => Promise<void>
  submitLabel: string

  isViewMode?: boolean
  isReadOnly?: boolean
  setEditMode?: () => void

  componentMetaId?: string | null
}

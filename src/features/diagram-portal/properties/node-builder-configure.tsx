import { BetterDialogProvider } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import {
  CheckboxGroupInput,
  CodeMirrorWrapped,
  ColorPickerInput,
  ComponentInputType,
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
import { useComponentMetaClasses } from '@/features/component-meta/theme'
import { useEffectState } from '@/hooks/use-effect-state'
import { buildMetaData, flattenMetaData } from '@uigraph/sdk'
import { arrayNonNullable } from 'daily-code'
import { Maximize2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { nodeVisibleInputFields } from '../constants/flow-diagram-node'
import { useSingleSelectedNode } from '../hooks/use-single-selected-node'
import { TBuilderNode } from '../nodes'
import { TComponentField } from '../types/component-fields'
import { Field } from './field'
import { NodeBuilderExpandDialog } from './node-builder-expand-dialog'

export function NodeBuilderConfigure() {
  const { data, updateData } = useSingleSelectedNode<TBuilderNode>()

  const flattenedMemoizedData = useMemo(() => {
    return flattenMetaData(
      data?.componentFields ?? [],
      data?.componentFields ?? []
    )
  }, [data])

  const [values, setValues] = useEffectState(flattenedMemoizedData)

  return (
    <>
      {data?.componentFields?.map((field) => {
        return (
          <NodeConfigureField
            field={field}
            key={field.componentFieldId}
            value={values[field.componentFieldId!]}
            setValue={(value: unknown) => {
              const updatedValues = {
                ...values,
                [field.componentFieldId!]: value,
              }
              setValues(updatedValues)
              updateData({
                ...data,
                componentFields: buildMetaData(
                  data?.componentFields ?? [],
                  updatedValues
                ),
              })
            }}
            isVisible={!field.hidden}
            setIsVisible={(isVisible: boolean) => {
              updateData({
                ...data,
                componentFields: data?.componentFields?.map((f) =>
                  f.componentFieldId === field.componentFieldId
                    ? { ...f, hidden: !isVisible }
                    : f
                ),
              })
            }}
          />
        )
      })}
    </>
  )
}

function NodeConfigureField({
  field,
  value,
  setValue,
  isVisible,
  setIsVisible,
}: {
  field: TComponentField

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
  setValue: (value: unknown) => void

  isVisible: boolean
  setIsVisible: (isVisible: boolean) => void
}) {
  const [isExpandedOpen, setIsExpandedOpen] = useState(false)
  const { codeEditorWrapper } = useComponentMetaClasses()

  const isVisibilityDisabled = useMemo(
    () => !nodeVisibleInputFields.includes(field.type as ComponentInputType),
    [field.type]
  )

  const isExpandable =
    field.type === ComponentInputType.RichTextEditor ||
    field.type === ComponentInputType.CodeEditor ||
    field.type === ComponentInputType.TextBox

  return (
    <>
      <Field
        key={field.componentFieldId}
        label={field.label ?? ''}
        visible={isVisible}
        onChangeVisibility={setIsVisible}
        isVisibilityDisabled={isVisibilityDisabled}
        labelExtra={
          isExpandable ? (
            <Button
              size="icon"
              variant="ghost"
              className="size-6 text-[#828DA3] hover:text-[#F4F7FC]"
              onClick={() => setIsExpandedOpen(true)}
            >
              <Maximize2 className="size-3" />
            </Button>
          ) : null
        }
      >
        {field.type === ComponentInputType.NumberInput && (
          <NumberInput value={value ?? ''} onChange={setValue} />
        )}

        {field.type === ComponentInputType.TextInput && (
          <TextInput value={value ?? ''} onChange={setValue} />
        )}

        {field.type === ComponentInputType.TextBox && (
          <TextAreaInput value={value ?? ''} onChange={setValue} />
        )}

        {field.type === ComponentInputType.URLInput && (
          <URLInput value={value ?? ''} onChange={setValue} />
        )}

        {field.type === ComponentInputType.FileUpload && (
          <FileInput file={value ?? null} onChange={setValue} />
        )}

        {field.type === ComponentInputType.LinkOrFileUpload && (
          <LinkOrFileInput value={value ?? null} onChange={setValue} />
        )}

        {field.type === ComponentInputType.DropdownSelect && (
          <DropdownSelectInput
            options={arrayNonNullable(field.options)}
            value={value ?? ''}
            onChange={setValue}
          />
        )}

        {field.type === ComponentInputType.RichTextEditor && (
          <RichTextEditor value={value ?? ''} setValue={setValue} />
        )}

        {field.type === ComponentInputType.CodeEditor && (
          <div className={codeEditorWrapper}>
            <CodeMirrorWrapped value={value ?? ''} setValue={setValue} />
          </div>
        )}

        {field.type === ComponentInputType.KeyValueList && (
          <KeyValuePairInput value={value ?? []} onChange={setValue} />
        )}

        {field.type === ComponentInputType.BooleanToggle && (
          <DropdownSelectInput
            options={['Yes', 'No']}
            value={value ? 'Yes' : 'No'}
            onChange={(value) => setValue(value === 'Yes')}
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
            enableMinified
            value={value ?? null}
            onChange={setValue}
          />
        )}

        {field.type === ComponentInputType.ColorPicker && (
          <ColorPickerInput value={value ?? null} onChange={setValue} />
        )}

        {field.type === ComponentInputType.Slider && (
          <SliderInput value={value ?? null} onChange={setValue} />
        )}
      </Field>

      {isExpandable && (
        <BetterDialogProvider
          open={isExpandedOpen}
          onOpenChange={setIsExpandedOpen}
          className="[--width:72rem]"
        >
          <NodeBuilderExpandDialog
            field={field}
            value={value ?? ''}
            setValue={setValue}
          />
        </BetterDialogProvider>
      )}
    </>
  )
}

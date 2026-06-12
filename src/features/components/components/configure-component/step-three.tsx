import { GT } from '@/api'
import { CodeMirrorRaw } from '@/components/code-mirror'
import {
  BooleanToggleInput,
  CheckboxGroupInput,
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
  SliderInput,
  TagInput,
  TextAreaInput,
  TextInput,
  URLInput,
} from '@/features/component-meta'
import { ComponentMetaField } from '@/features/component-meta/components/field'
import { QuillRichTextEditor } from '@/features/component-meta/components/quill-rte/editor'
import { arrayNonNullable } from 'daily-code'
import { useRef } from 'react'

type StepThreeComponentProps = {
  componentFields: GT.ComponentField[]
}

export function StepThreeComponent({
  componentFields,
}: StepThreeComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef}>
      <div className="mb-6">
        <h2 className="mb-2 font-semibold">Preview Inputs</h2>
        <p className="text-paragraph text-sm">
          NOTE: This is just a preview not the actual inputs that will be.
        </p>
      </div>

      <div
        className="*:!pointer-events-none *:!cursor-default"
        onFocus={(e) => {
          e.target.blur()

          let parent: HTMLElement | null = containerRef.current
          while (parent) {
            const next = parent.nextElementSibling as HTMLElement | null
            if (next) {
              next.scrollIntoView({ behavior: 'smooth' })
              next.focus()
              break
            }

            parent = parent.parentElement
          }
        }}
      >
        {componentFields
          .filter((f) => f.type)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((field) => (
            <ComponentMetaField
              key={field.componentFieldId}
              label={field.label ?? 'Label'}
              required={field.required ?? false}
              componentType={field.type ?? 'unknown'}
              error={null}
            >
              {field.type === ComponentInputType.NumberInput && (
                <NumberInput value="" onChange={console.log} />
              )}

              {field.type === ComponentInputType.TextInput && (
                <TextInput value="" onChange={console.log} />
              )}

              {field.type === ComponentInputType.TextBox && (
                <TextAreaInput value="" onChange={console.log} />
              )}

              {field.type === ComponentInputType.URLInput && (
                <URLInput value="" onChange={console.log} />
              )}

              {field.type === ComponentInputType.FileUpload && (
                <FileInput file={null} onChange={console.log} />
              )}

              {field.type === ComponentInputType.LinkOrFileUpload && (
                <LinkOrFileInput value="" onChange={console.log} />
              )}

              {field.type === ComponentInputType.DropdownSelect && (
                <DropdownSelectInput
                  value=""
                  onChange={console.log}
                  options={arrayNonNullable(field.options)}
                />
              )}

              {field.type === ComponentInputType.RichTextEditor && (
                <QuillRichTextEditor value="" setValue={console.log} />
              )}

              {field.type === ComponentInputType.CodeEditor && (
                <div className="border-stock w-full overflow-hidden rounded-[0.75rem] border bg-white">
                  <CodeMirrorRaw
                    height={'10rem'}
                    value=""
                    onChange={console.log}
                  />
                </div>
              )}

              {field.type === ComponentInputType.KeyValueList && (
                <KeyValuePairInput value={[]} onChange={console.log} />
              )}

              {field.type === ComponentInputType.BooleanToggle && (
                <BooleanToggleInput checked={false} onChange={console.log} />
              )}

              {field.type === ComponentInputType.MultiSelect && (
                <DropdownMultiSelect
                  value={[]}
                  options={arrayNonNullable(field.options)}
                  onChange={console.log}
                />
              )}

              {field.type === ComponentInputType.TagInput && (
                <TagInput value={[]} onChange={console.log} />
              )}

              {field.type === ComponentInputType.DatePicker && (
                <DatePicker value="" onChange={console.log} />
              )}

              {field.type === ComponentInputType.DateRangePicker && (
                <DateRangePicker value={null} onChange={console.log} />
              )}

              {field.type === ComponentInputType.ColorPicker && (
                <ColorPickerInput value="" onChange={console.log} />
              )}

              {field.type === ComponentInputType.Slider && (
                <SliderInput value={null} onChange={console.log} />
              )}

              {field.type === ComponentInputType.CheckboxGroup && (
                <CheckboxGroupInput
                  options={arrayNonNullable(field.options)}
                  value={[]}
                  onChange={console.log}
                />
              )}

              {field.type === ComponentInputType.SearchSelect && (
                <DropdownSearchSelect
                  options={arrayNonNullable(field.options)}
                  value=""
                  onChange={console.log}
                />
              )}
            </ComponentMetaField>
          ))}
      </div>
    </div>
  )
}

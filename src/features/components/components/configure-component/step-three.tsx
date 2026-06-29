import {
  BooleanToggleInput,
  CheckboxGroupInput,
  CodeMirrorWrapped,
  ColorPickerInput,
  ComponentInputType,
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
  SliderInput,
  TagInput,
  TextAreaInput,
  TextInput,
  URLInput,
} from '@/features/component-meta'
import { ComponentMetaField } from '@/features/component-meta/components/field'
import { QuillRichTextEditor } from '@/features/component-meta/components/quill-rte/editor'
import { arrayNonNullable } from 'daily-code'
import { ComponentField } from './component-field-list'

type StepThreeComponentProps = {
  componentFields: ComponentField[]
}

export function StepThreeComponent({
  componentFields,
}: StepThreeComponentProps) {
  return (
    <ComponentMetaThemeProvider theme="modal">
      <div>
        <div className="mb-6">
          <h2 className="mb-1 text-base font-medium">Preview Inputs</h2>
          <p className="text-muted-foreground text-sm">
            This is a read-only preview of how the component fields will appear.
          </p>
        </div>

        <div className="pointer-events-none space-y-0 select-none">
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
                  <NumberInput value="" onChange={() => undefined} readonly />
                )}

                {field.type === ComponentInputType.TextInput && (
                  <TextInput value="" onChange={() => undefined} readonly />
                )}

                {field.type === ComponentInputType.TextBox && (
                  <TextAreaInput value="" onChange={() => undefined} readonly />
                )}

                {field.type === ComponentInputType.URLInput && (
                  <URLInput value="" onChange={() => undefined} readonly />
                )}

                {field.type === ComponentInputType.FileUpload && (
                  <FileInput
                    file={null}
                    onChange={() => undefined}
                    isViewMode
                  />
                )}

                {field.type === ComponentInputType.LinkOrFileUpload && (
                  <LinkOrFileInput
                    value={null}
                    onChange={() => undefined}
                    isViewMode
                  />
                )}

                {field.type === ComponentInputType.DropdownSelect && (
                  <DropdownSelectInput
                    value=""
                    onChange={() => undefined}
                    options={arrayNonNullable(field.options)}
                    readonly
                  />
                )}

                {field.type === ComponentInputType.RichTextEditor && (
                  <QuillRichTextEditor
                    value=""
                    setValue={() => undefined}
                    readonly
                  />
                )}

                {field.type === ComponentInputType.CodeEditor && (
                  <CodeMirrorWrapped
                    height="10rem"
                    value=""
                    setValue={() => undefined}
                    readonly
                  />
                )}

                {field.type === ComponentInputType.KeyValueList && (
                  <KeyValuePairInput
                    value={[]}
                    onChange={() => undefined}
                    readonly
                  />
                )}

                {field.type === ComponentInputType.BooleanToggle && (
                  <BooleanToggleInput
                    checked={false}
                    onChange={() => undefined}
                    readonly
                  />
                )}

                {field.type === ComponentInputType.MultiSelect && (
                  <DropdownMultiSelect
                    value={[]}
                    options={arrayNonNullable(field.options)}
                    onChange={() => undefined}
                    readonly
                  />
                )}

                {field.type === ComponentInputType.TagInput && (
                  <TagInput value={[]} onChange={() => undefined} readonly />
                )}

                {field.type === ComponentInputType.DatePicker && (
                  <DatePicker value="" onChange={() => undefined} readonly />
                )}

                {field.type === ComponentInputType.DateRangePicker && (
                  <DateRangePicker
                    value={null}
                    onChange={() => undefined}
                    readonly
                  />
                )}

                {field.type === ComponentInputType.ColorPicker && (
                  <ColorPickerInput
                    value=""
                    onChange={() => undefined}
                    readonly
                  />
                )}

                {field.type === ComponentInputType.Slider && (
                  <SliderInput
                    value={null}
                    onChange={() => undefined}
                    readonly
                  />
                )}

                {field.type === ComponentInputType.CheckboxGroup && (
                  <CheckboxGroupInput
                    options={arrayNonNullable(field.options)}
                    value={[]}
                    onChange={() => undefined}
                    readonly
                  />
                )}

                {field.type === ComponentInputType.SearchSelect && (
                  <DropdownSearchSelect
                    options={arrayNonNullable(field.options)}
                    value=""
                    onChange={() => undefined}
                    readonly
                  />
                )}
              </ComponentMetaField>
            ))}
        </div>
      </div>
    </ComponentMetaThemeProvider>
  )
}

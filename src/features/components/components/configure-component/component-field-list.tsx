import { V2 } from '@/api'
import {
  DragBarIcon,
  LinkBackwardIcon,
  PlusIcon,
  TrashIcon,
} from '@/assets/svgs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ComponentInputType } from '@/features/component-meta'
import * as SwitchPrimitives from '@radix-ui/react-switch'
import { arrayNonNullable } from 'daily-code'
import { Reorder, useDragControls } from 'framer-motion'
import { Dispatch, SetStateAction } from 'react'
import { ImCommand } from 'react-icons/im'
import { toast } from 'sonner'

export type ComponentField = V2.ComponentModalField

export type ComponentFieldWithError = ComponentField & { error?: string }

export type ComponentFieldListProps = {
  enableRequired?: boolean
  componentFields: ComponentFieldWithError[]
  setComponentFields: Dispatch<SetStateAction<ComponentField[]>>
}

export function ComponentFieldList({
  enableRequired = true,
  componentFields,
  setComponentFields,
}: ComponentFieldListProps) {
  return (
    <Reorder.Group
      className="space-y-3"
      values={componentFields}
      onReorder={(reorderedFields) => {
        setComponentFields(
          reorderedFields.map((field, index) => ({
            ...field,
            order: index + 1,
          }))
        )
      }}
    >
      {componentFields.map((field) => (
        <ComponentFieldItem
          key={field.componentFieldId}
          enableRequired={enableRequired}
          field={field}
          setField={(updatedField) =>
            setComponentFields((prev) =>
              prev.map((f) =>
                f.componentFieldId === field.componentFieldId
                  ? { ...f, ...updatedField }
                  : f
              )
            )
          }
          onRemove={() =>
            setComponentFields((prev) =>
              prev.filter((f) => f.componentFieldId !== field.componentFieldId)
            )
          }
        />
      ))}
    </Reorder.Group>
  )
}

export function ComponentFieldAdd({
  setComponentFields,
}: Pick<ComponentFieldListProps, 'setComponentFields'>) {
  return (
    <div className="flex items-center justify-between rounded-[16px] border border-[#2A3242] bg-transparent p-2">
      <Button
        className="h-10 rounded-[0.5rem] !px-4"
        onClick={() => {
          setComponentFields((prev) => [
            ...prev,
            {
              componentFieldId: crypto.randomUUID(),
              order: prev.length + 1,
              required: false,
              label: '',
              type: ComponentInputType.TextInput,
            },
          ])
        }}
      >
        <PlusIcon />
        Add Field
      </Button>

      <div className="text-paragraph flex items-center gap-2 px-3 text-lg">
        <ImCommand />
        <LinkBackwardIcon />
      </div>
    </div>
  )
}

function ComponentFieldItem({
  field,
  setField,
  onRemove,
  enableRequired,
}: {
  enableRequired: boolean
  field: ComponentFieldWithError
  setField: (field: Partial<ComponentFieldWithError>) => void
  onRemove: () => void
}) {
  const controls = useDragControls()

  return (
    <Reorder.Item
      value={field}
      layout="position"
      dragListener={false}
      dragControls={controls}
      className="rounded-[16px] border border-[#2A3242] bg-transparent p-3 select-none"
    >
      <div className="flex items-center justify-between">
        <div className="flex basis-[13.0625rem] items-center gap-1">
          <div
            className="reorder-handle flex cursor-grab items-center justify-center p-1"
            onPointerDown={(e) => controls.start(e)}
          >
            <DragBarIcon className="size-4" />
          </div>

          <Input
            maxLength={20}
            placeholder="Field Name"
            className="h-10 rounded-[0.5rem] border border-[#2A3242] bg-transparent"
            value={field.label || ''}
            disabled={field.isReadonly ?? false}
            readOnly={field.isReadonly ?? false}
            onChange={(e) =>
              setField({
                label: e.target.value,
                error: e.target.value ? undefined : `Field name is required`,
              })
            }
          />
        </div>

        <div className="basis-[12.25rem]">
          <Select
            value={field.type || ''}
            disabled={field.isReadonly ?? false}
            onValueChange={(value) => setField({ type: value })}
          >
            <SelectTrigger className="!h-10 w-full rounded-[0.5rem] border border-[#2A3242] bg-transparent">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>

            <SelectContent>
              {Object.values(ComponentInputType).map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {enableRequired && (
          <div className="flex items-center gap-2">
            <SwitchPrimitives.Root
              checked={field.required || false}
              disabled={field.isReadonly ?? false}
              onCheckedChange={(checked) => setField({ required: checked })}
              className="peer focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-[1.6rem] w-[2.88rem] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-[#2A3242] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SwitchPrimitives.Thumb className="data-[state=checked]:bg-primary pointer-events-none block h-[1.28rem] w-[1.28rem] rounded-full bg-white shadow-lg ring-0 transition-all data-[state=checked]:translate-x-full data-[state=unchecked]:translate-x-0" />
            </SwitchPrimitives.Root>

            <span className="text-foreground mb-1 block text-sm">Required</span>
          </div>
        )}
        <button
          onClick={onRemove}
          disabled={field.isReadonly ?? false}
          className="text-destructive not-disabled:hover:bg-destructive/20 not-disabled:hover:text-destructive rounded-md transition-all disabled:opacity-60"
        >
          <TrashIcon className="size-8 p-1.5" />
        </button>
      </div>

      {field.error && (
        <p className="text-destructive mt-2 ml-7.5 overflow-hidden text-xs">
          {field.error}
        </p>
      )}

      {(field.type === ComponentInputType.DropdownSelect ||
        field.type === ComponentInputType.SearchSelect ||
        field.type === ComponentInputType.MultiSelect ||
        field.type === ComponentInputType.CheckboxGroup) && (
        <div className="mt-3 border-t border-[#2A3242] pt-2">
          <h5 className="mb-3 text-sm font-medium">Options:</h5>

          <div>
            {arrayNonNullable(field.options).map((option, index) => (
              <div key={index} className="mb-2 flex items-center gap-2">
                <Input
                  placeholder="Option Label"
                  className="h-10 w-full rounded-[0.5rem] border border-[#2A3242] bg-transparent"
                  value={option}
                  onChange={(e) => {
                    const newOptions = arrayNonNullable(field.options)
                    newOptions[index] = e.target.value

                    setField({ options: newOptions })
                  }}
                />
                <Button
                  variant="ghost"
                  onClick={() => {
                    setField({
                      options: field.options?.filter((_, i) => i !== index),
                    })
                  }}
                >
                  <TrashIcon className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          <div>
            <Button
              variant="ghost"
              className="!text-primary"
              onClick={() => {
                if (field.options?.some((opt) => opt?.trim() === '')) {
                  return toast.warning('Please fill all the options')
                }

                setField({
                  options: [...(field.options || []), ''],
                })
              }}
            >
              Add New
            </Button>
          </div>
        </div>
      )}
    </Reorder.Item>
  )
}

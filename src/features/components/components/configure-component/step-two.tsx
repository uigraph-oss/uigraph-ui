import { GT } from '@/api'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ComponentInputType } from '@/features/component-meta'
import { cn } from '@/lib/utils'
import { arrayNonNullable } from 'daily-code'
import { IoChevronDownOutline } from 'react-icons/io5'
import {
  ComponentFieldAdd,
  ComponentFieldList,
  ComponentFieldListProps,
} from './component-field-list'

type StepTwoComponentProps = ComponentFieldListProps & {
  nativeComponents?: GT.Component[]
  hideDescription?: boolean
  largeEmptyState?: boolean
  enableRequired?: boolean
}

export function StepTwoComponent({
  componentFields,
  setComponentFields,
  nativeComponents,
  largeEmptyState,
  enableRequired,
  hideDescription,
}: StepTwoComponentProps) {
  return (
    <div className="leading-[1.3333]">
      {!hideDescription && (
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="mb-2 font-semibold">Component Structure</h2>
            <p className="text-paragraph text-sm">
              Define the fields for your component
            </p>
          </div>

          {nativeComponents && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border-stock text-paragraph h-14 w-[12.25rem] justify-between rounded-2xl bg-white !px-6 text-base"
                >
                  Apply Template
                  <IoChevronDownOutline />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                {nativeComponents
                  .filter((n) => n.type === 'modal')
                  .map((component) => (
                    <DropdownMenuItem
                      key={component.componentId}
                      onClick={() => {
                        setComponentFields(
                          arrayNonNullable(component.componentFields).map(
                            (field, i) => ({
                              ...field,
                              order: i + 1,
                            })
                          )
                        )
                      }}
                    >
                      {component.name}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      <div className="mb-6">
        {componentFields.length === 0 && (
          <div
            className={cn(
              'border-stock/40 flex items-center justify-center rounded-2xl border bg-white/50 p-3',
              largeEmptyState && 'py-8'
            )}
          >
            <p className="text-paragraph text-sm">No fields added</p>
          </div>
        )}

        <ComponentFieldList
          enableRequired={enableRequired}
          componentFields={componentFields}
          setComponentFields={setComponentFields}
        />
      </div>

      <div hidden>
        <Button
          variant="destructive"
          className="mb-4 h-11 w-full rounded-xl"
          onClick={() => {
            const types = Object.values(ComponentInputType)
              .map((t) => [t, t])
              .flat()

            setComponentFields(
              types.map((type, i) => ({
                componentFieldId: crypto.randomUUID(),
                order: i + 1,
                type,
                label: type,
                required: i % 2 === 0,
                options: Array.from({ length: 5 }, (_, i) => `Option ${i + 1}`),
              }))
            )
          }}
        >
          Add All Fields (Required + Optional) - For Testing
        </Button>

        <Button
          variant="destructive"
          className="mb-4 h-11 w-full rounded-xl"
          onClick={() => {
            const types = Object.values(ComponentInputType)
            setComponentFields(
              types.map((type, i) => ({
                componentFieldId: crypto.randomUUID(),
                type,
                order: i + 1,
                label: type,
                required: true,
                options: Array.from({ length: 5 }, (_, i) => `Option ${i + 1}`),
              }))
            )
          }}
        >
          Add All Fields (Required) - For Testing
        </Button>

        <Button
          variant="destructive"
          className="mb-4 h-11 w-full rounded-xl"
          onClick={() => {
            const types = Object.values(ComponentInputType)
            setComponentFields(
              types.map((type, i) => ({
                componentFieldId: crypto.randomUUID(),
                type,
                order: i + 1,
                label: type,
                required: false,
                options: Array.from({ length: 5 }, (_, i) => `Option ${i + 1}`),
              }))
            )
          }}
        >
          Add All Fields (Optional) - For Testing
        </Button>
      </div>

      <ComponentFieldAdd setComponentFields={setComponentFields} />
    </div>
  )
}

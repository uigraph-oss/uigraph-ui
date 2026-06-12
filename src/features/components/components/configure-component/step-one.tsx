import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DropdownSelectInput } from '@/features/component-meta'
import { Control, Controller, FieldErrors } from 'react-hook-form'
import { COMPONENT_CATEGORIES } from '../../constants'

type StepOneFormData = {
  name: string
  category: string
  description: string
}

type StepOneComponentProps = {
  includeCategory: boolean
  control: Control<StepOneFormData>
  errors: FieldErrors<StepOneFormData>
}

export function StepOneComponent({
  includeCategory,
  control,
  errors,
}: StepOneComponentProps) {
  return (
    <div className="leading-[1.3333]">
      <div className="mb-6">
        <h2 className="mb-2 font-semibold">Basic Information</h2>
        <p className="text-paragraph text-sm">
          Define the core details of your component
        </p>
      </div>

      <div className="mb-6">
        <label className="block">
          <span className="mb-3 block text-sm font-medium">Component Name</span>

          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                type="text"
                placeholder="Enter component name"
                className="!h-14 w-full rounded-2xl bg-white"
                {...field}
              />
            )}
          />
        </label>
        {errors.name && (
          <p className="text-destructive mt-2 ml-1 text-sm">
            {errors.name.message}
          </p>
        )}
      </div>

      {includeCategory && (
        <div className="mb-6">
          <label className="block">
            <span className="mb-3 block text-sm font-medium">Category</span>

            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <DropdownSelectInput
                  className="!h-72"
                  options={COMPONENT_CATEGORIES}
                  {...field}
                />
              )}
            />
          </label>

          {errors.category && (
            <p className="text-destructive mt-2 ml-1 text-sm">
              {errors.category.message}
            </p>
          )}
        </div>
      )}
      <div className="mb-6">
        <label className="block">
          <span className="mb-3 block text-sm font-medium">Description</span>

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea
                placeholder="Short note about this component..."
                className="min-h-[8.4375rem] w-full resize-none rounded-2xl bg-white"
                {...field}
              />
            )}
          />
        </label>
        {errors.description && (
          <p className="text-destructive mt-2 ml-1 text-sm">
            {errors.description.message}
          </p>
        )}
      </div>
    </div>
  )
}

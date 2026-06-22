import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
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

const inputClassName =
  'h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none'
const textareaClassName =
  'min-h-[6.75rem] w-full resize-none rounded-[16px] border border-[#2A3242] bg-transparent p-6 text-sm leading-normal focus:outline-none'
const selectTriggerClassName =
  'h-[56px]! w-full rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none'

export function StepOneComponent({
  includeCategory,
  control,
  errors,
}: StepOneComponentProps) {
  return (
    <form className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="component-name" className="text-sm font-normal">
          Name
        </Label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              id="component-name"
              placeholder="Enter component name"
              autoCorrect="off"
              autoComplete="off"
              autoCapitalize="off"
              className={cn(inputClassName, errors.name && 'border-red-500')}
              {...field}
            />
          )}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {includeCategory && (
        <div className="space-y-2">
          <Label htmlFor="component-category" className="text-sm font-normal">
            Category
          </Label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="component-category"
                  className={cn(
                    selectTriggerClassName,
                    errors.category && 'border-red-500'
                  )}
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {COMPONENT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && (
            <p className="text-sm text-red-500">{errors.category.message}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="component-description" className="text-sm font-normal">
          Description
        </Label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Textarea
              id="component-description"
              placeholder="Enter component description"
              autoCorrect="off"
              autoComplete="off"
              autoCapitalize="off"
              className={cn(
                textareaClassName,
                errors.description && 'border-red-500'
              )}
              {...field}
            />
          )}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>
    </form>
  )
}

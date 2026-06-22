import { CrossButton } from '@/components/cross-button'
import { SuperCircleLoader } from '@/components/loader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  getViewPointPositionStyle,
  getViewPointSizeStyle,
} from '@/features/image-frame-canvas/helpers'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'

import { useFocalPointContext } from '../context/focal-point-context'

const inputClassName =
  'h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none'

const createFrameGroupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

export function DrawRectArea({
  y,
  x,
  width,
  height,
}: {
  y: number
  x: number
  width: number
  height: number
}) {
  const { setDrawRectMode, createFrameGroup } = useFocalPointContext()
  const form = useForm({
    resolver: zodResolver(createFrameGroupSchema),
    defaultValues: { name: '' },
  })

  return (
    <Popover open>
      <PopoverTrigger asChild>
        <div
          className="bg-destructive/30 absolute rounded-[0.25rem] transition-[box-shadow,background-color]"
          style={{
            ...getViewPointPositionStyle({ x, y }),
            ...getViewPointSizeStyle(width, height),
          }}
        />
      </PopoverTrigger>

      <PopoverContent
        align="center"
        className="w-[24.0625rem] rounded-2xl border border-[#2A3242] bg-[#141925] p-0"
      >
        <header className="flex h-14 items-center justify-between border-b border-[#2A3242] p-3">
          <h3 className="text-sm font-semibold text-[#F4F7FC]">
            Add Frame Group
          </h3>
          <CrossButton onClick={() => setDrawRectMode(null)} />
        </header>

        <form
          className="space-y-6 p-3"
          onSubmit={form.handleSubmit(async ({ name }) => {
            await createFrameGroup({
              name,
              locationX: x,
              locationY: y,
              width,
              height,
            })

            setDrawRectMode(null)
          })}
        >
          <Controller
            name="name"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label
                  htmlFor="frame-group-name"
                  className="text-sm font-normal"
                >
                  Name
                </Label>
                <Input
                  {...field}
                  id="frame-group-name"
                  disabled={form.formState.isSubmitting}
                  placeholder="Enter group name"
                  className={cn(
                    inputClassName,
                    form.formState.errors.name && 'border-red-500'
                  )}
                  autoCorrect="off"
                  autoComplete="off"
                  autoCapitalize="off"
                />
                {form.formState.errors.name?.message && (
                  <p className="text-destructive text-xs">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
            )}
          />

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              preset="outline"
              onClick={() => setDrawRectMode(null)}
            >
              Cancel
            </Button>

            <Button
              preset="primary"
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && <SuperCircleLoader />}
              Save Group
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}

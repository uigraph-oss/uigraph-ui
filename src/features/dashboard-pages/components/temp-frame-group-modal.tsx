import { CrossButton } from '@/components/cross-button'
import { SuperCircleLoader } from '@/components/loader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  getViewPointPositionStyle,
  getViewPointSizeStyle,
} from '@/features/image-frame-canvas/helpers'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'

import { useFocalPointContext } from '../context/focal-point-context'

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
        className="border-stock bg-shading w-[24.0625rem] rounded-2xl border p-0"
      >
        <header className="border-stock flex h-14 items-center justify-between border-b p-3">
          <h3 className="font-semibold">Add Frame Group</h3>
          <CrossButton onClick={() => setDrawRectMode(null)} />
        </header>

        <form
          className="space-y-6 p-3"
          onSubmit={form.handleSubmit(async ({ name }) => {
            await createFrameGroup({
              groupName: name,
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
              <label className="block">
                <span className="mb-3 block">Name</span>
                <Input
                  {...field}
                  disabled={form.formState.isSubmitting}
                  placeholder="Enter group name"
                  className="!h-14 rounded-2xl bg-white"
                  autoCorrect="off"
                  autoComplete="off"
                  autoCapitalize="off"
                />
                {form.formState.errors.name?.message && (
                  <p className="text-destructive mt-2 text-xs">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </label>
            )}
          />

          <div className="flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              className="border-stock !h-11 rounded-[0.8125rem] border"
              onClick={() => setDrawRectMode(null)}
            >
              Cancel
            </Button>

            <Button
              className="!h-11 rounded-[0.8125rem]"
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

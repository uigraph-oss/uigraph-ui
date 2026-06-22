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
import { getViewPointPositionStyle } from '@/features/image-frame-canvas/helpers'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'
import { PlusIcon } from '../../../assets/svgs/component-icons'
import { useFocalPointContext } from '../context/focal-point-context'

type AddFocalPointModalProps = {
  x: number
  y: number
}

const inputClassName =
  'h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none'

const createFocalPointSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

export function AddFocalPointModal({ x, y }: AddFocalPointModalProps) {
  const { createFocalPoint, canvasTarget, setNewPoint } = useFocalPointContext()

  const form = useForm({
    resolver: zodResolver(createFocalPointSchema),
    defaultValues: { name: '' },
  })

  return (
    <Popover open>
      <PopoverTrigger asChild>
        <div className="absolute" style={getViewPointPositionStyle({ x, y })}>
          <div className="bg-stock absolute top-0 left-0 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white shadow-[0_4px_6px_rgba(0,0,0,0.1)]">
            <PlusIcon className={'text-[1.25rem]'} />
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent
        align={'start'}
        sideOffset={40}
        alignOffset={40}
        className="w-[24.0625rem] rounded-2xl border border-[#2A3242] bg-[#141925] p-0"
      >
        <header className="flex h-14 items-center justify-between border-b border-[#2A3242] p-3">
          <h3 className="text-sm font-semibold text-[#F4F7FC]">
            Add Focal Point
          </h3>
          <CrossButton
            onClick={() => {
              setNewPoint(null)
            }}
          />
        </header>

        <form
          className="space-y-6 p-3"
          onSubmit={form.handleSubmit(async ({ name }) => {
            const { data } = await createFocalPoint({
              visibility: 'public',
              name,
              locationX: x,
              locationY: y,
            })

            const id = data?.createFocalPoint?.id

            if (id) {
              canvasTarget.setTarget('point', id)
            }

            setNewPoint(null)
          })}
        >
          <Controller
            name="name"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label
                  htmlFor="focal-point-name"
                  className="text-sm font-normal"
                >
                  Name
                </Label>
                <Input
                  {...field}
                  id="focal-point-name"
                  disabled={form.formState.isSubmitting}
                  placeholder="Enter focal point name"
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
              onClick={() => setNewPoint(null)}
            >
              Cancel
            </Button>

            <Button
              preset="primary"
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && <SuperCircleLoader />}
              Save Focal Point
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}

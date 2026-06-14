import { CrossButton } from '@/components/cross-button'
import { SuperCircleLoader } from '@/components/loader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { getViewPointPositionStyle } from '@/features/image-frame-canvas/helpers'
import { trackGTag } from '@/helpers/track'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'
import { PlusIcon } from '../../../assets/svgs/component-icons'
import { useFocalPointContext } from '../context/focal-point-context'

type AddFocalPointModalProps = {
  x: number
  y: number
}

const createFocalPointSchema = z.object({
  name: z.string(),
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
        className="border-stock bg-shading w-[24.0625rem] rounded-2xl border p-0"
      >
        <header className="border-stock flex h-14 items-center justify-between border-b p-3">
          <h3 className="font-semibold">Add Focal Point</h3>
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

            trackGTag('create_focal_point', {
              focal_point_id: id,
            })

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
              <label className="block">
                <span className="mb-3 block">Name</span>
                <Input
                  {...field}
                  disabled={form.formState.isSubmitting}
                  placeholder="Enter focal point name"
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
              onClick={() => setNewPoint(null)}
            >
              Cancel
            </Button>

            <Button
              className="!h-11 rounded-[0.8125rem]"
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

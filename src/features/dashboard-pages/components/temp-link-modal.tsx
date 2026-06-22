import { CrossButton } from '@/components/cross-button'
import { SuperCircleLoader } from '@/components/loader'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { getViewPointPositionStyle } from '@/features/image-frame-canvas/helpers'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'
import { PlusIcon } from '../../../assets/svgs/component-icons'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FRAMES, MAPS } from '@/features/dashboard-projects/api'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useMemo } from 'react'
import { useFocalPointContext } from '../context/focal-point-context'

type AddLinkModalProps = {
  x: number
  y: number
}

const createLinkModalSchema = z.object({
  targetMapId: z.string().min(1, 'Map is required'),
  targetFrameId: z.string().nullable().optional(),
  label: z.string(),
})

export function AddLinkModal({ x, y }: AddLinkModalProps) {
  const orgId = useCurrentOrganization()?.id
  const { setNewPoint, createFrameLink } = useFocalPointContext()

  const form = useForm({
    resolver: zodResolver(createLinkModalSchema),
    defaultValues: {
      label: '',
      targetMapId: '',
      targetFrameId: null,
    },
  })

  const mapsQuery = useQuery(MAPS, {
    fetchPolicy: 'cache-first',
    variables: { orgId: orgId! },
    skip: !orgId,
  })

  const targetMapId = form.watch('targetMapId')
  const framesQuery = useQuery(FRAMES, {
    fetchPolicy: 'cache-first',
    variables: { orgId: orgId!, mapId: targetMapId },
    skip: !orgId || !targetMapId,
  })

  const maps = useMemo(
    () => arrayNonNullable(mapsQuery.data?.maps),
    [mapsQuery.data?.maps]
  )

  const frames = useMemo(
    () => arrayNonNullable(framesQuery.data?.frames),
    [framesQuery.data?.frames]
  )

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
          <h3 className="font-semibold">Add External Link</h3>
          <CrossButton
            onClick={() => {
              setNewPoint(null)
            }}
          />
        </header>

        <form
          className="space-y-6 p-3"
          onSubmit={form.handleSubmit(async (formData) => {
            if (formData.targetFrameId) {
              await createFrameLink({
                kind: 'frame',
                targetFrameId: formData.targetFrameId,
                label: formData.label,
                locationX: x,
                locationY: y,
              })
            } else {
              await createFrameLink({
                kind: 'map',
                targetMapId: formData.targetMapId,
                label: formData.label,
                locationX: x,
                locationY: y,
              })
            }

            setNewPoint(null)
          })}
        >
          <Controller
            name="targetMapId"
            control={form.control}
            render={({ field }) => (
              <label className="block">
                <span className="mb-3 block">Map</span>

                <Select
                  {...field}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="!h-14 w-full rounded-2xl bg-white">
                    <SelectValue placeholder="Select map" />
                  </SelectTrigger>
                  <SelectContent>
                    {maps.map((map) => (
                      <SelectItem key={map.id} value={map.id}>
                        {map.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {form.formState.errors.targetMapId?.message && (
                  <p className="text-destructive mt-2 text-xs">
                    {form.formState.errors.targetMapId.message}
                  </p>
                )}
              </label>
            )}
          />

          <Controller
            name="targetFrameId"
            control={form.control}
            render={({ field }) => (
              <label className="block">
                <span className="mb-3 block">Frame</span>

                <Select
                  {...field}
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="!h-14 w-full rounded-2xl bg-white">
                    <SelectValue placeholder="Select frame" />
                  </SelectTrigger>
                  <SelectContent>
                    {frames.map((frame) => (
                      <SelectItem key={frame.id} value={frame.id}>
                        {frame.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {form.formState.errors.targetFrameId?.message && (
                  <p className="text-destructive mt-2 text-xs">
                    {form.formState.errors.targetFrameId.message}
                  </p>
                )}
              </label>
            )}
          />

          <Controller
            name="label"
            control={form.control}
            render={({ field }) => (
              <label className="block">
                <span className="mb-3 block">Label</span>
                <Input
                  {...field}
                  value={field.value}
                  onChange={field.onChange}
                  className="!h-14 rounded-2xl bg-white"
                  placeholder="Enter link label"
                />
                {form.formState.errors.label?.message && (
                  <p className="text-destructive mt-2 text-xs">
                    {form.formState.errors.label.message}
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
              Save Link
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}

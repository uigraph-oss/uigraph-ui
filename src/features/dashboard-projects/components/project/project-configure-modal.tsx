'use client'

import { SuperCircleLoader } from '@/components/loader'
import { SimpleModal } from '@/components/simple-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GET_TEAM } from '@/features/dashboard-settings/api'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { arrayNonNullable } from 'daily-code'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

interface CreateProjectModalProps {
  title: string
  description: string
  ctaLabel: string

  open: boolean
  onOpenChange: (isOpen: boolean) => void

  initialValues?: Partial<z.infer<typeof projectSchema>>
  submitForm: (data: z.infer<typeof projectSchema>) => Promise<void>
}

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  teamId: z.string().optional(),
})

export function ConfigureProjectModal({
  submitForm,
  ctaLabel,
  ...props
}: CreateProjectModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const organizationId = useCurrentOrganization()?.id
  const teamRes = useQuery(GET_TEAM, {
    variables: { organizationId: organizationId! },
    skip: !organizationId,
  })
  const teams = arrayNonNullable(teamRes.data?.GetTeam)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    resolver: zodResolver(projectSchema),
    values: {
      ...props.initialValues,
      name: props.initialValues?.name || '',
    },
  })

  useEffect(() => {
    reset()
  }, [props.open, reset])

  return (
    <SimpleModal {...props}>
      <form
        onSubmit={handleSubmit(async (data) => {
          setIsLoading(true)
          setErrorMessage('')
          try {
            await submitForm(data)
          } catch (_err) {
            setErrorMessage('Something went wrong. Please try again.')
          }
          setIsLoading(false)
        })}
        className="space-y-6"
      >
        <div className="space-y-2">
          <Label htmlFor="name" className="leding-[1.33] text-sm font-normal">
            Map Name
          </Label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                id="name"
                {...field}
                autoCorrect="off"
                autoComplete="off"
                autoCapitalize="off"
                placeholder="e.g. Checkout Flow"
                className={cn(
                  'h-[56px] rounded-[16px] border border-[#E5E7E9] bg-white px-6 focus:outline-none',
                  errors.name && 'border-red-500'
                )}
              />
            )}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Input
                id="description"
                {...field}
                autoCorrect="off"
                autoComplete="off"
                autoCapitalize="off"
                placeholder="Describe what this map represents"
                className={cn(
                  'h-[56px] rounded-[16px] border border-[#E5E7E9] bg-white px-6 focus:outline-none',
                  errors.description && 'border-red-500'
                )}
              />
            )}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="team">Team</Label>
          <Controller
            name="teamId"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className={cn(
                    'h-[56px]! w-full rounded-[16px] border border-[#E5E7E9] bg-white px-6 focus:outline-none',
                    errors.teamId && 'border-red-500'
                  )}
                >
                  <SelectValue
                    className="text-sm leading-[1.33] font-normal text-[#6B7480]"
                    placeholder="Select a team"
                  />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.teamId} value={team.teamId ?? 'none'}>
                      <div className="flex w-full items-center justify-between">
                        <span>{team.teamName}</span>
                        <span className="ml-2 text-sm text-gray-500">
                          ({team.memberCount} members)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.teamId && (
            <p className="text-sm text-red-500">{errors.teamId.message}</p>
          )}
        </div>

        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => props.onOpenChange(false)}
            disabled={isLoading}
            className="bg-shading text-paragraph border-stock h-11 rounded-[12.85px] text-sm leading-[1.33] font-normal"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 rounded-[12.85px] bg-[#015AEB] text-sm leading-[1.33] font-normal hover:bg-blue-700"
          >
            {isLoading && <SuperCircleLoader />}
            {ctaLabel}
          </Button>
        </div>
      </form>
    </SimpleModal>
  )
}

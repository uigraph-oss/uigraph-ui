'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'

const teamSchema = z.object({
  teamName: z.string().min(1, 'Team name is required'),
  description: z.string().optional(),
})

type ConfigureTeamModalProps = {
  mode?: 'create' | 'edit'
  defaultValues?: Partial<z.infer<typeof teamSchema>>
  onSubmit: SubmitHandler<z.infer<typeof teamSchema>>
}

export function ConfigureTeamModal({
  mode = 'create',
  defaultValues = {},
  onSubmit,
}: ConfigureTeamModalProps) {
  const form = useForm({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      teamName: defaultValues.teamName ?? '',
      description: defaultValues.description ?? '',
    },
  })

  return (
    <BetterDialogContent
      title={mode === 'create' ? 'Add New Team' : 'Edit Team'}
      description={
        mode === 'create'
          ? 'Add your team to manage projects and members.'
          : 'Update your team details.'
      }
      footerSubmitLoading={form.formState.isSubmitting}
      onFooterSubmitClick={form.handleSubmit(onSubmit)}
      footerSubmit={mode === 'create' ? 'Create Team' : 'Save Changes'}
      footerCancel
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Controller
          name="teamName"
          control={form.control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label
                htmlFor="team-name"
                className="text-foreground text-sm font-medium"
              >
                Team Name
              </Label>
              <Input
                {...field}
                id="team-name"
                placeholder="Enter your team name"
                className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6"
                autoComplete="off"
              />
              {form.formState.errors.teamName && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.teamName.message}
                </p>
              )}
            </div>
          )}
        />

        <Controller
          name="description"
          control={form.control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label
                htmlFor="team-description"
                className="text-foreground text-sm font-medium"
              >
                Description
              </Label>
              <Textarea
                {...field}
                id="team-description"
                placeholder="Enter your team description"
                className="min-h-[98px] resize-none rounded-[16px] border border-[#2A3242] bg-transparent px-4 py-3"
              />
            </div>
          )}
        />
      </form>
    </BetterDialogContent>
  )
}

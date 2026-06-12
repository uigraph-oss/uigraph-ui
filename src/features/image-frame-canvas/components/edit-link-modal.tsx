'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'

const teamSchema = z.object({
  label: z.string().min(1, 'Label is required'),
})

type ConfigureTeamModalProps = {
  defaultValues?: Partial<z.infer<typeof teamSchema>>
  onSubmit: SubmitHandler<z.infer<typeof teamSchema>>
}

export function EditLinkModal({
  defaultValues = {},
  onSubmit,
}: ConfigureTeamModalProps) {
  const form = useForm({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      label: defaultValues.label ?? '',
    },
  })

  return (
    <BetterDialogContent
      title="Edit Link"
      description="Update link details."
      footerSubmitLoading={form.formState.isSubmitting}
      onFooterSubmitClick={form.handleSubmit(onSubmit)}
      footerSubmit="Save Changes"
      footerCancel
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Controller
          name="label"
          control={form.control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label
                htmlFor="label"
                className="text-sm font-medium text-[#111110]"
              >
                Label
              </Label>
              <Input
                {...field}
                id="label"
                placeholder="Enter link label"
                className="h-[56px] rounded-[16px] border border-[#E5E7E9] bg-white px-6"
                autoComplete="off"
              />
              {form.formState.errors.label && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.label.message}
                </p>
              )}
            </div>
          )}
        />
      </form>
    </BetterDialogContent>
  )
}

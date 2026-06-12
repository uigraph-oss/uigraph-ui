'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'

const createTokenSchema = z.object({
  name: z.string().min(1, 'Token name is required'),
  expiresAt: z.string().optional(),
})

type CreateTokenModalProps = {
  onSubmit: SubmitHandler<z.infer<typeof createTokenSchema>>
  onClose: () => void
}

export function CreateTokenModal({ onSubmit }: CreateTokenModalProps) {
  const form = useForm({
    resolver: zodResolver(createTokenSchema),
    defaultValues: {
      name: '',
      expiresAt: '',
    },
  })

  return (
    <BetterDialogContent
      title="Create API Token"
      description="Create a new API token for programmatic access to your organization."
      footerSubmit="Create Token"
      footerSubmitLoading={form.formState.isSubmitting}
      onFooterSubmitClick={form.handleSubmit(onSubmit)}
      footerCancel
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Controller
          name="name"
          control={form.control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label
                htmlFor="token-name"
                className="text-sm font-medium text-[#111110]"
              >
                Token Name
              </Label>
              <Input
                id="token-name"
                {...field}
                placeholder="e.g., Production API, CI/CD Pipeline"
                className="h-[56px] rounded-[16px] border border-[#E5E7E9] bg-white px-6"
                autoComplete="off"
              />
              {form.formState.errors.name && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
          )}
        />

        <Controller
          name="expiresAt"
          control={form.control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label
                htmlFor="token-expires-at"
                className="text-sm font-medium text-[#111110]"
              >
                Expiration Date (Optional)
              </Label>
              <Input
                id="token-expires-at"
                type="datetime-local"
                {...field}
                className="h-[56px] rounded-[16px] border border-[#E5E7E9] bg-white px-6"
              />
              <p className="text-muted-foreground text-xs">
                Leave empty to set expiration to 1 year from now
              </p>
              {form.formState.errors.expiresAt && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.expiresAt.message}
                </p>
              )}
            </div>
          )}
        />
      </form>
    </BetterDialogContent>
  )
}

'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'

const runPackSchema = z.object({
  environment: z.string().min(1, 'Environment is required'),
  releaseLabel: z.string().optional(),
})

type RunPackModalProps = {
  defaultEnvironment?: string
  defaultReleaseLabel?: string
  onSubmit: (data: {
    environment: string
    releaseLabel?: string
  }) => Promise<void>
}

export function RunPackModal({
  defaultEnvironment,
  defaultReleaseLabel,
  onSubmit,
}: RunPackModalProps) {
  const form = useForm({
    resolver: zodResolver(runPackSchema),
    defaultValues: {
      environment: defaultEnvironment ?? '',
      releaseLabel: defaultReleaseLabel ?? '',
    },
    mode: 'onBlur',
  })

  async function handleSubmit(data: z.infer<typeof runPackSchema>) {
    await onSubmit({
      environment: data.environment,
      releaseLabel: data.releaseLabel || undefined,
    })
  }

  const environmentError = form.formState.errors.environment

  return (
    <BetterDialogContent
      title="Run Test Pack"
      description="Execute all test cases in this pack for the specified environment."
      footerSubmit="Run Pack"
      footerSubmitLoading={form.formState.isSubmitting}
      onFooterSubmitClick={form.handleSubmit(handleSubmit)}
      footerCancel="Cancel"
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="environment" className="text-sm font-normal">
            Environment
          </Label>
          <Controller
            name="environment"
            control={form.control}
            render={({ field }) => (
              <Input
                id="environment"
                placeholder="e.g. staging, production, dev"
                autoCorrect="off"
                autoComplete="off"
                autoCapitalize="off"
                className={cn(
                  'h-[56px] rounded-[16px] border border-[#E5E7E9] bg-white px-6 focus:outline-none',
                  environmentError && 'border-red-500'
                )}
                {...field}
              />
            )}
          />
          {environmentError && (
            <p className="text-sm text-red-500">{environmentError.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="releaseLabel" className="text-sm font-normal">
            Release Label{' '}
            <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Controller
            name="releaseLabel"
            control={form.control}
            render={({ field }) => (
              <Input
                id="releaseLabel"
                placeholder="e.g. v1.2.3, release-2024-01"
                autoCorrect="off"
                autoComplete="off"
                autoCapitalize="off"
                className="h-[56px] rounded-[16px] border border-[#E5E7E9] bg-white px-6 focus:outline-none"
                {...field}
              />
            )}
          />
        </div>
      </form>
    </BetterDialogContent>
  )
}

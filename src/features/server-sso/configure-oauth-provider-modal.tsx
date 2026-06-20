'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
  providerName: z
    .string()
    .min(1, 'Provider slug is required')
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and dashes only'),
  displayName: z.string().min(1, 'Display name is required'),
  clientId: z.string().min(1, 'Client ID is required'),
  clientSecret: z.string(),
  authUrl: z.url('Enter a valid URL'),
  tokenUrl: z.url('Enter a valid URL'),
  userinfoUrl: z.url('Enter a valid URL'),
  scopes: z.string(),
  allowedDomains: z.string(),
  allowSignUp: z.boolean(),
  emailClaim: z.string(),
  nameClaim: z.string(),
  subClaim: z.string(),
})

export type OAuthProviderFormValues = z.infer<typeof schema>

const inputClassName =
  'h-[48px] rounded-[12px] border border-[#E5E7E9] bg-white px-4'

function Field({
  label,
  message,
  children,
}: {
  label: string
  message?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-[#111110]">{label}</Label>
      {children}
      {message && <p className="text-destructive text-sm">{message}</p>}
    </div>
  )
}

export function ConfigureOAuthProviderModal({
  mode,
  defaultValues,
  onSubmit,
}: {
  mode: 'create' | 'edit'
  defaultValues?: Partial<OAuthProviderFormValues>
  onSubmit: SubmitHandler<OAuthProviderFormValues>
}) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      providerName: '',
      displayName: '',
      clientId: '',
      clientSecret: '',
      authUrl: '',
      tokenUrl: '',
      userinfoUrl: '',
      scopes: 'openid email profile',
      allowedDomains: '',
      allowSignUp: true,
      emailClaim: 'email',
      nameClaim: 'name',
      subClaim: 'sub',
      ...defaultValues,
    },
  })

  const errors = form.formState.errors

  return (
    <BetterDialogContent
      title={mode === 'create' ? 'Add OAuth Provider' : 'Edit OAuth Provider'}
      description="Configure an OpenID Connect / OAuth2 identity provider."
      footerSubmit={mode === 'create' ? 'Add Provider' : 'Save Changes'}
      footerSubmitLoading={form.formState.isSubmitting}
      onFooterSubmitClick={form.handleSubmit(onSubmit)}
      footerCancel
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <Controller
          name="providerName"
          control={form.control}
          render={({ field }) => (
            <Field label="Provider Slug" message={errors.providerName?.message}>
              <Input
                {...field}
                disabled={mode === 'edit'}
                placeholder="e.g. acme-okta"
                className={inputClassName}
                autoComplete="off"
              />
            </Field>
          )}
        />

        <Controller
          name="displayName"
          control={form.control}
          render={({ field }) => (
            <Field label="Display Name" message={errors.displayName?.message}>
              <Input
                {...field}
                placeholder="Shown on the login page"
                className={inputClassName}
              />
            </Field>
          )}
        />

        <Controller
          name="clientId"
          control={form.control}
          render={({ field }) => (
            <Field label="Client ID" message={errors.clientId?.message}>
              <Input {...field} className={inputClassName} autoComplete="off" />
            </Field>
          )}
        />

        <Controller
          name="clientSecret"
          control={form.control}
          render={({ field }) => (
            <Field
              label="Client Secret"
              message={
                mode === 'edit'
                  ? 'Leave blank to keep the existing secret'
                  : errors.clientSecret?.message
              }
            >
              <Input
                {...field}
                type="password"
                className={inputClassName}
                autoComplete="new-password"
              />
            </Field>
          )}
        />

        <Controller
          name="authUrl"
          control={form.control}
          render={({ field }) => (
            <Field label="Authorization URL" message={errors.authUrl?.message}>
              <Input {...field} className={inputClassName} autoComplete="off" />
            </Field>
          )}
        />

        <Controller
          name="tokenUrl"
          control={form.control}
          render={({ field }) => (
            <Field label="Token URL" message={errors.tokenUrl?.message}>
              <Input {...field} className={inputClassName} autoComplete="off" />
            </Field>
          )}
        />

        <Controller
          name="userinfoUrl"
          control={form.control}
          render={({ field }) => (
            <Field label="Userinfo URL" message={errors.userinfoUrl?.message}>
              <Input {...field} className={inputClassName} autoComplete="off" />
            </Field>
          )}
        />

        <Controller
          name="scopes"
          control={form.control}
          render={({ field }) => (
            <Field label="Scopes" message={errors.scopes?.message}>
              <Input {...field} className={inputClassName} autoComplete="off" />
            </Field>
          )}
        />

        <Controller
          name="allowedDomains"
          control={form.control}
          render={({ field }) => (
            <Field
              label="Allowed Email Domains"
              message={errors.allowedDomains?.message}
            >
              <Input
                {...field}
                placeholder="comma-separated, optional"
                className={inputClassName}
                autoComplete="off"
              />
            </Field>
          )}
        />

        <Controller
          name="allowSignUp"
          control={form.control}
          render={({ field }) => (
            <div className="flex items-center justify-between rounded-[12px] border border-[#E5E7E9] px-4 py-3">
              <Label className="text-sm font-medium text-[#111110]">
                Allow new users to sign up
              </Label>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )}
        />
      </form>
    </BetterDialogContent>
  )
}

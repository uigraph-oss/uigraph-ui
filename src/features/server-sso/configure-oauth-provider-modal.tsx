'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImageIcon, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'sonner'
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
  'h-[48px] rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4'

function Field({
  label,
  message,
  hint,
  children,
}: {
  label: string
  message?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-[#D2D9E6]">{label}</Label>
      {children}
      {message && <p className="text-destructive text-sm">{message}</p>}
      {!message && hint && <p className="text-sm text-[#828DA3]">{hint}</p>}
    </div>
  )
}

function IconUploadField({
  iconUrl,
  displayName,
  onUploadIcon,
  onRemoveIcon,
}: {
  iconUrl?: string | null
  displayName: string
  onUploadIcon: (file: File) => Promise<void>
  onRemoveIcon: () => Promise<void>
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isBusy, setIsBusy] = useState(false)

  async function handleSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setIsBusy(true)
    try {
      await onUploadIcon(file)
      toast.success('Icon updated')
    } catch {
      toast.error('Failed to upload icon')
    } finally {
      setIsBusy(false)
    }
  }

  async function handleRemove() {
    setIsBusy(true)
    try {
      await onRemoveIcon()
      toast.success('Icon removed')
    } catch {
      toast.error('Failed to remove icon')
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-[16px] border border-[#2A3242] bg-[#161C28] px-4 py-6">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isBusy}
        className="group relative flex size-24 items-center justify-center overflow-hidden rounded-full border border-[#2A3242] bg-[#1E2533] transition-colors hover:border-[#015AEB] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {iconUrl ? (
          <img
            src={iconUrl}
            alt={displayName}
            className="size-full object-cover"
          />
        ) : (
          <ImageIcon className="size-8 text-[#828DA3]" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <Upload className="size-5 text-white" />
        </div>
      </button>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isBusy}
          className="flex h-9 items-center gap-2 rounded-[10px] border border-[#2A3242] bg-[#1E2533] px-4 text-sm font-medium text-[#D2D9E6] transition-colors hover:border-[#3A4252] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Upload className="size-4" />
          {iconUrl ? 'Replace' : 'Upload'}
        </button>
        {iconUrl && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={isBusy}
            className="flex h-9 items-center gap-1.5 rounded-[10px] px-2 text-sm text-red-600 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-400"
          >
            <Trash2 className="size-3.5" />
            Remove
          </button>
        )}
      </div>

      <p className="text-sm text-[#828DA3]">Logo shown on the login button</p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSelected}
      />
    </div>
  )
}

export function ConfigureOAuthProviderModal({
  mode,
  defaultValues,
  iconUrl,
  onSubmit,
  onUploadIcon,
  onRemoveIcon,
}: {
  mode: 'create' | 'edit'
  defaultValues?: Partial<OAuthProviderFormValues>
  iconUrl?: string | null
  onSubmit: SubmitHandler<OAuthProviderFormValues>
  onUploadIcon?: (file: File) => Promise<void>
  onRemoveIcon?: () => Promise<void>
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
        {mode === 'edit' && onUploadIcon && onRemoveIcon && (
          <IconUploadField
            iconUrl={iconUrl}
            displayName={form.watch('displayName')}
            onUploadIcon={onUploadIcon}
            onRemoveIcon={onRemoveIcon}
          />
        )}

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
              <Input
                {...field}
                placeholder="Client ID from your identity provider"
                className={inputClassName}
                autoComplete="off"
              />
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
                mode === 'edit' ? undefined : errors.clientSecret?.message
              }
              hint={
                mode === 'edit'
                  ? 'Leave blank to keep the existing secret'
                  : undefined
              }
            >
              <Input
                {...field}
                type="password"
                placeholder="Client secret from your identity provider"
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
              <Input
                {...field}
                placeholder="https://idp.example.com/oauth2/authorize"
                className={inputClassName}
                autoComplete="off"
              />
            </Field>
          )}
        />

        <Controller
          name="tokenUrl"
          control={form.control}
          render={({ field }) => (
            <Field label="Token URL" message={errors.tokenUrl?.message}>
              <Input
                {...field}
                placeholder="https://idp.example.com/oauth2/token"
                className={inputClassName}
                autoComplete="off"
              />
            </Field>
          )}
        />

        <Controller
          name="userinfoUrl"
          control={form.control}
          render={({ field }) => (
            <Field label="Userinfo URL" message={errors.userinfoUrl?.message}>
              <Input
                {...field}
                placeholder="https://idp.example.com/oauth2/userinfo"
                className={inputClassName}
                autoComplete="off"
              />
            </Field>
          )}
        />

        <Controller
          name="scopes"
          control={form.control}
          render={({ field }) => (
            <Field label="Scopes" message={errors.scopes?.message}>
              <Input
                {...field}
                placeholder="openid email profile"
                className={inputClassName}
                autoComplete="off"
              />
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
            <div className="flex items-center justify-between rounded-[12px] border border-[#2A3242] px-4 py-3">
              <Label className="text-sm font-medium text-[#D2D9E6]">
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

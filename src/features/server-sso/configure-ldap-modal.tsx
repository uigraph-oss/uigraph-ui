'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z.coerce
    .number()
    .int('Port must be a whole number')
    .min(1, 'Port must be between 1 and 65535')
    .max(65535, 'Port must be between 1 and 65535'),
  useSsl: z.boolean(),
  startTls: z.boolean(),
  skipTlsVerify: z.boolean(),
  bindDn: z.string(),
  bindPassword: z.string(),
  searchBaseDn: z.string().min(1, 'Search base DN is required'),
  searchFilter: z.string().min(1, 'Search filter is required'),
  usernameAttribute: z.string().min(1, 'Username attribute is required'),
  emailAttribute: z.string().min(1, 'Email attribute is required'),
  nameAttribute: z.string().min(1, 'Name attribute is required'),
  memberOfAttribute: z.string().min(1, 'Member-of attribute is required'),
  allowSignUp: z.boolean(),
})

export type LdapFormValues = z.infer<typeof schema>

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

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between rounded-[12px] border border-[#2A3242] px-4 py-3">
      <Label className="text-sm font-medium text-[#D2D9E6]">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

export function ConfigureLdapModal({
  mode,
  defaultValues,
  onSubmit,
}: {
  mode: 'create' | 'edit'
  defaultValues?: Partial<LdapFormValues>
  onSubmit: SubmitHandler<LdapFormValues>
}) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      host: '',
      port: 389,
      useSsl: false,
      startTls: false,
      skipTlsVerify: false,
      bindDn: '',
      bindPassword: '',
      searchBaseDn: '',
      searchFilter: '(uid=%s)',
      usernameAttribute: 'uid',
      emailAttribute: 'mail',
      nameAttribute: 'cn',
      memberOfAttribute: 'memberOf',
      allowSignUp: true,
      ...defaultValues,
    },
  })

  const errors = form.formState.errors

  return (
    <BetterDialogContent
      title={mode === 'create' ? 'Configure LDAP' : 'Edit LDAP'}
      description="Connect a directory server for username and password sign-in."
      footerSubmit={mode === 'create' ? 'Save LDAP' : 'Save Changes'}
      footerSubmitLoading={form.formState.isSubmitting}
      onFooterSubmitClick={form.handleSubmit(onSubmit)}
      footerCancel
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-[1fr_140px] gap-4">
          <Controller
            name="host"
            control={form.control}
            render={({ field }) => (
              <Field label="Host" message={errors.host?.message}>
                <Input
                  {...field}
                  placeholder="ldap.example.com"
                  className={inputClassName}
                  autoComplete="off"
                />
              </Field>
            )}
          />
          <Controller
            name="port"
            control={form.control}
            render={({ field }) => (
              <Field label="Port" message={errors.port?.message}>
                <Input
                  type="number"
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value as number}
                  onChange={field.onChange}
                  className={inputClassName}
                  autoComplete="off"
                />
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Controller
            name="useSsl"
            control={form.control}
            render={({ field }) => (
              <ToggleField
                label="Use SSL"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="startTls"
            control={form.control}
            render={({ field }) => (
              <ToggleField
                label="StartTLS"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="skipTlsVerify"
            control={form.control}
            render={({ field }) => (
              <ToggleField
                label="Skip TLS verify"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <Controller
          name="bindDn"
          control={form.control}
          render={({ field }) => (
            <Field
              label="Bind DN"
              message={errors.bindDn?.message}
              hint="Service account used to search the directory (optional for anonymous bind)"
            >
              <Input
                {...field}
                placeholder="cn=admin,dc=example,dc=com"
                className={inputClassName}
                autoComplete="off"
              />
            </Field>
          )}
        />

        <Controller
          name="bindPassword"
          control={form.control}
          render={({ field }) => (
            <Field
              label="Bind Password"
              hint={
                mode === 'edit'
                  ? 'Leave blank to keep the existing password'
                  : undefined
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
          name="searchBaseDn"
          control={form.control}
          render={({ field }) => (
            <Field
              label="Search Base DN"
              message={errors.searchBaseDn?.message}
            >
              <Input
                {...field}
                placeholder="ou=people,dc=example,dc=com"
                className={inputClassName}
                autoComplete="off"
              />
            </Field>
          )}
        />

        <Controller
          name="searchFilter"
          control={form.control}
          render={({ field }) => (
            <Field
              label="Search Filter"
              message={errors.searchFilter?.message}
              hint="Use %s as the placeholder for the entered username"
            >
              <Input
                {...field}
                placeholder="(uid=%s)"
                className={inputClassName}
                autoComplete="off"
              />
            </Field>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="usernameAttribute"
            control={form.control}
            render={({ field }) => (
              <Field
                label="Username Attribute"
                message={errors.usernameAttribute?.message}
              >
                <Input
                  {...field}
                  className={inputClassName}
                  autoComplete="off"
                />
              </Field>
            )}
          />
          <Controller
            name="emailAttribute"
            control={form.control}
            render={({ field }) => (
              <Field
                label="Email Attribute"
                message={errors.emailAttribute?.message}
              >
                <Input
                  {...field}
                  className={inputClassName}
                  autoComplete="off"
                />
              </Field>
            )}
          />
          <Controller
            name="nameAttribute"
            control={form.control}
            render={({ field }) => (
              <Field
                label="Name Attribute"
                message={errors.nameAttribute?.message}
              >
                <Input
                  {...field}
                  className={inputClassName}
                  autoComplete="off"
                />
              </Field>
            )}
          />
          <Controller
            name="memberOfAttribute"
            control={form.control}
            render={({ field }) => (
              <Field
                label="Member-of Attribute"
                message={errors.memberOfAttribute?.message}
              >
                <Input
                  {...field}
                  className={inputClassName}
                  autoComplete="off"
                />
              </Field>
            )}
          />
        </div>

        <Controller
          name="allowSignUp"
          control={form.control}
          render={({ field }) => (
            <ToggleField
              label="Allow new users to sign up"
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </form>
    </BetterDialogContent>
  )
}

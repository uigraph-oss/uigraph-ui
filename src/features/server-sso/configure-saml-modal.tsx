'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z
  .object({
    spEntityId: z.string().min(1, 'Service provider entity ID is required'),
    idpMetadataUrl: z.string(),
    idpMetadataXml: z.string(),
    nameIdFormat: z.string().min(1, 'Name ID format is required'),
    loginAttribute: z.string().min(1, 'Login attribute is required'),
    emailAttribute: z.string().min(1, 'Email attribute is required'),
    nameAttribute: z.string().min(1, 'Name attribute is required'),
    groupsAttribute: z.string(),
    signRequests: z.boolean(),
    allowSignUp: z.boolean(),
  })
  .refine(
    (values) =>
      values.idpMetadataUrl.trim().length > 0 ||
      values.idpMetadataXml.trim().length > 0,
    {
      message: 'Provide either an IdP metadata URL or metadata XML',
      path: ['idpMetadataUrl'],
    }
  )

export type SamlFormValues = z.infer<typeof schema>

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

export function ConfigureSamlModal({
  mode,
  defaultValues,
  spCert,
  onSubmit,
}: {
  mode: 'create' | 'edit'
  defaultValues?: Partial<SamlFormValues>
  spCert?: string
  onSubmit: SubmitHandler<SamlFormValues>
}) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      spEntityId: '',
      idpMetadataUrl: '',
      idpMetadataXml: '',
      nameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
      loginAttribute: 'nameID',
      emailAttribute: 'email',
      nameAttribute: 'displayName',
      groupsAttribute: '',
      signRequests: false,
      allowSignUp: true,
      ...defaultValues,
    },
  })

  const errors = form.formState.errors

  return (
    <BetterDialogContent
      title={mode === 'create' ? 'Configure SAML' : 'Edit SAML'}
      description="Connect a SAML 2.0 identity provider for enterprise sign-in."
      footerSubmit={mode === 'create' ? 'Save SAML' : 'Save Changes'}
      footerSubmitLoading={form.formState.isSubmitting}
      onFooterSubmitClick={form.handleSubmit(onSubmit)}
      footerCancel
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <Controller
          name="spEntityId"
          control={form.control}
          render={({ field }) => (
            <Field
              label="Service Provider Entity ID"
              message={errors.spEntityId?.message}
              hint="Identifier this server presents to the IdP (e.g. https://your-app/saml)"
            >
              <Input {...field} className={inputClassName} autoComplete="off" />
            </Field>
          )}
        />

        {mode === 'edit' && spCert && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#D2D9E6]">
              Service Provider Certificate
            </Label>
            <Textarea
              readOnly
              value={spCert}
              className="min-h-24 rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4 py-3 font-mono text-xs"
            />
            <p className="text-sm text-[#828DA3]">
              Upload this certificate to your IdP when it requires signed
              requests.
            </p>
          </div>
        )}

        <Controller
          name="idpMetadataUrl"
          control={form.control}
          render={({ field }) => (
            <Field
              label="IdP Metadata URL"
              message={errors.idpMetadataUrl?.message}
              hint="The identity provider's metadata endpoint"
            >
              <Input
                {...field}
                placeholder="https://idp.example.com/metadata"
                className={inputClassName}
                autoComplete="off"
              />
            </Field>
          )}
        />

        <Controller
          name="idpMetadataXml"
          control={form.control}
          render={({ field }) => (
            <Field
              label="IdP Metadata XML"
              message={errors.idpMetadataXml?.message}
              hint="Paste the raw metadata XML if a URL is not available"
            >
              <Textarea
                {...field}
                placeholder="<EntityDescriptor ...>"
                className="min-h-32 rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4 py-3 font-mono text-xs"
              />
            </Field>
          )}
        />

        <Controller
          name="nameIdFormat"
          control={form.control}
          render={({ field }) => (
            <Field
              label="Name ID Format"
              message={errors.nameIdFormat?.message}
            >
              <Input {...field} className={inputClassName} autoComplete="off" />
            </Field>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="loginAttribute"
            control={form.control}
            render={({ field }) => (
              <Field
                label="Login Attribute"
                message={errors.loginAttribute?.message}
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
            name="groupsAttribute"
            control={form.control}
            render={({ field }) => (
              <Field
                label="Groups Attribute"
                message={errors.groupsAttribute?.message}
                hint="Optional"
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
          name="signRequests"
          control={form.control}
          render={({ field }) => (
            <ToggleField
              label="Sign authentication requests"
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />

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

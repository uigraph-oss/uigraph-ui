'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Controller, type UseFormReturn } from 'react-hook-form'
import {
  Field,
  TextField,
  ToggleField,
  type AuthProviderFormValues,
} from './provider-form-fields'

export function ProviderConnectionFields({
  form,
  mode,
}: {
  form: UseFormReturn<AuthProviderFormValues>
  mode: 'create' | 'edit'
}) {
  const errors = form.formState.errors
  const kind = form.watch('kind')
  const type = form.watch('type')

  if (kind === 'oidc') {
    return (
      <div className="space-y-5">
        <Controller
          name="type"
          control={form.control}
          render={({ field }) => (
            <Field label="Provider Type">
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-[48px] w-full rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="generic">Generic OIDC</SelectItem>
                  <SelectItem value="entra">Microsoft Entra ID</SelectItem>
                  <SelectItem value="okta">Okta</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        {type !== 'generic' && (
          <Controller
            name="apiUrl"
            control={form.control}
            render={({ field }) => (
              <TextField
                label={
                  type === 'entra' ? 'Directory (Tenant) ID' : 'Okta Domain'
                }
                message={errors.apiUrl?.message}
                placeholder={
                  type === 'entra'
                    ? '00000000-0000-0000-0000-000000000000'
                    : 'your-org.okta.com'
                }
                field={field}
              />
            )}
          />
        )}

        <Controller
          name="clientId"
          control={form.control}
          render={({ field }) => (
            <TextField
              label="Client ID"
              message={errors.clientId?.message}
              placeholder="Client ID from your identity provider"
              field={field}
            />
          )}
        />

        <Controller
          name="clientSecret"
          control={form.control}
          render={({ field }) => (
            <TextField
              label="Client Secret"
              message={errors.clientSecret?.message}
              hint={
                mode === 'edit'
                  ? 'Leave blank to keep the existing secret'
                  : undefined
              }
              type="password"
              placeholder="Client secret from your identity provider"
              field={field}
            />
          )}
        />

        {type !== 'generic' && (
          <p className="text-sm text-[#828DA3]">
            The three endpoints below are derived from the{' '}
            {type === 'entra' ? 'Directory (Tenant) ID' : 'Okta domain'} when
            all three are blank. Fill in all three to override.
          </p>
        )}

        <Controller
          name="authUrl"
          control={form.control}
          render={({ field }) => (
            <TextField
              label="Authorization URL"
              message={errors.authUrl?.message}
              placeholder="https://idp.example.com/oauth2/authorize"
              field={field}
            />
          )}
        />

        <Controller
          name="tokenUrl"
          control={form.control}
          render={({ field }) => (
            <TextField
              label="Token URL"
              message={errors.tokenUrl?.message}
              placeholder="https://idp.example.com/oauth2/token"
              field={field}
            />
          )}
        />

        <Controller
          name="userinfoUrl"
          control={form.control}
          render={({ field }) => (
            <TextField
              label="Userinfo URL"
              message={errors.userinfoUrl?.message}
              placeholder="https://idp.example.com/oauth2/userinfo"
              field={field}
            />
          )}
        />

        <Controller
          name="scopes"
          control={form.control}
          render={({ field }) => (
            <TextField
              label="Scopes"
              message={errors.scopes?.message}
              placeholder="openid email profile"
              field={field}
            />
          )}
        />
      </div>
    )
  }

  if (kind === 'saml') {
    return (
      <div className="space-y-5">
        <Controller
          name="idpMetadataUrl"
          control={form.control}
          render={({ field }) => (
            <TextField
              label="IdP Metadata URL"
              message={errors.idpMetadataUrl?.message}
              hint="The identity provider's metadata endpoint. Read once when you save."
              placeholder="https://idp.example.com/metadata"
              field={field}
            />
          )}
        />

        <Controller
          name="idpMetadataXml"
          control={form.control}
          render={({ field }) => (
            <Field
              label="IdP Metadata XML"
              message={errors.idpMetadataXml?.message}
              hint="Paste the raw metadata document if a URL is not available"
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
          name="idpEntityId"
          control={form.control}
          render={({ field }) => (
            <TextField
              label="IdP Entity ID"
              message={errors.idpEntityId?.message}
              hint="Optional — read from metadata when blank"
              field={field}
            />
          )}
        />

        <Controller
          name="idpSsoUrl"
          control={form.control}
          render={({ field }) => (
            <TextField
              label="IdP SSO URL"
              message={errors.idpSsoUrl?.message}
              hint="Optional — read from metadata when blank"
              placeholder="https://idp.example.com/sso/saml"
              field={field}
            />
          )}
        />

        <Controller
          name="idpCert"
          control={form.control}
          render={({ field }) => (
            <Field
              label="IdP Signing Certificate"
              message={errors.idpCert?.message}
              hint="Optional — read from metadata when blank"
            >
              <Textarea
                {...field}
                placeholder="-----BEGIN CERTIFICATE-----"
                className="min-h-24 rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4 py-3 font-mono text-xs"
              />
            </Field>
          )}
        />

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
      </div>
    )
  }

  throw new Error(`unknown provider kind ${kind}`)
}

export function ProviderAttributeFields({
  form,
}: {
  form: UseFormReturn<AuthProviderFormValues>
}) {
  const errors = form.formState.errors
  const kind = form.watch('kind')

  if (kind === 'oidc') {
    return (
      <div className="space-y-5">
        <Controller
          name="emailClaim"
          control={form.control}
          render={({ field }) => (
            <TextField
              label="Email Claim"
              hint="The account key. Sign-in fails when the token carries no email. Defaults to email when blank."
              placeholder="email"
              field={field}
            />
          )}
        />
        <Controller
          name="nameClaim"
          control={form.control}
          render={({ field }) => (
            <TextField
              label="Name Claim"
              hint="Falls back to the email address when the token carries no name. Defaults to name when blank."
              placeholder="name"
              field={field}
            />
          )}
        />
        <Controller
          name="subClaim"
          control={form.control}
          render={({ field }) => (
            <TextField
              label="Subject Claim"
              hint="The stable identifier that links an account to this provider. Defaults to sub when blank."
              placeholder="sub"
              field={field}
            />
          )}
        />
      </div>
    )
  }

  if (kind === 'saml') {
    return (
      <div className="space-y-5">
        <Controller
          name="emailAttribute"
          control={form.control}
          render={({ field }) => (
            <TextField
              label="Email Attribute"
              hint="The account key. Sign-in fails when the assertion carries no email. Defaults to email when blank."
              placeholder="email"
              field={field}
            />
          )}
        />
        <Controller
          name="nameAttribute"
          control={form.control}
          render={({ field }) => (
            <TextField
              label="Name Attribute"
              hint="Falls back to the email address when the assertion carries no name. Defaults to displayName when blank."
              placeholder="displayName"
              field={field}
            />
          )}
        />
        <Controller
          name="nameIdFormat"
          control={form.control}
          render={({ field }) => (
            <TextField
              label="Name ID Format"
              message={errors.nameIdFormat?.message}
              hint="The format we ask your identity provider to send the Name ID in. The Name ID becomes each person's stable identifier here."
              field={field}
            />
          )}
        />
      </div>
    )
  }

  throw new Error(`unknown provider kind ${kind}`)
}

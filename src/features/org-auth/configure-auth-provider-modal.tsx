'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useQuery } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Copy, ImageIcon, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { AUTH_PROVIDER_SAML_METADATA } from './api/org-auth'

// The slug is what every auth URL is built from, including the redirect URI and
// Entity ID the admin registers at their IdP. It is checked exactly as typed and
// never normalised, so what they enter is what they will have to register.
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

const schema = z
  .object({
    slug: z.string(),
    kind: z.enum(['oidc', 'saml']),
    type: z.enum(['generic', 'entra', 'okta']),
    displayName: z.string().min(1, 'Display name is required'),
    enabled: z.boolean(),
    allowSignUp: z.boolean(),
    allowedDomains: z.string(),
    defaultRole: z.enum(['admin', 'editor', 'viewer']),

    clientId: z.string(),
    clientSecret: z.string(),
    authUrl: z.string(),
    tokenUrl: z.string(),
    userinfoUrl: z.string(),
    apiUrl: z.string(),
    scopes: z.string(),
    emailClaim: z.string(),
    nameClaim: z.string(),
    subClaim: z.string(),
    groupsClaim: z.string(),

    idpMetadataUrl: z.string(),
    idpMetadataXml: z.string(),
    idpEntityId: z.string(),
    idpSsoUrl: z.string(),
    idpCert: z.string(),
    signRequests: z.boolean(),
    nameIdFormat: z.string(),
    emailAttribute: z.string(),
    nameAttribute: z.string(),
    groupsAttribute: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.slug.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['slug'],
        message: 'Slug is required',
      })
    } else if (values.slug.length < 2 || values.slug.length > 63) {
      ctx.addIssue({
        code: 'custom',
        path: ['slug'],
        message: 'Slug must be between 2 and 63 characters',
      })
    } else if (!SLUG_PATTERN.test(values.slug)) {
      ctx.addIssue({
        code: 'custom',
        path: ['slug'],
        message:
          'Slug can only use lowercase letters, digits and single hyphens between them, e.g. acme-okta',
      })
    }

    if (values.kind === 'oidc') {
      if (values.clientId.trim().length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['clientId'],
          message: 'Client ID is required',
        })
      }
      if (values.type === 'entra' && values.apiUrl.trim().length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['apiUrl'],
          message: 'Directory (tenant) ID is required for Microsoft Entra ID',
        })
      }
      if (values.type === 'okta' && values.apiUrl.trim().length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['apiUrl'],
          message: 'Okta domain is required',
        })
      }
      if (values.type === 'generic' && values.authUrl.trim().length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['authUrl'],
          message: 'Authorization URL is required',
        })
      }
      if (values.type === 'generic' && values.tokenUrl.trim().length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['tokenUrl'],
          message: 'Token URL is required',
        })
      }
      return
    }

    if (values.kind === 'saml') {
      const hasMetadata =
        values.idpMetadataUrl.trim().length > 0 ||
        values.idpMetadataXml.trim().length > 0
      const hasExplicit =
        values.idpSsoUrl.trim().length > 0 && values.idpCert.trim().length > 0
      if (!hasMetadata && !hasExplicit) {
        ctx.addIssue({
          code: 'custom',
          path: ['idpMetadataUrl'],
          message:
            'Provide IdP metadata, or fill in the SSO URL and signing certificate below',
        })
      }
      return
    }

    throw new Error(`unknown provider kind`)
  })

export type AuthProviderFormValues = z.infer<typeof schema>

export const AUTH_PROVIDER_DEFAULTS: AuthProviderFormValues = {
  slug: '',
  kind: 'oidc',
  type: 'generic',
  displayName: '',
  enabled: true,
  allowSignUp: true,
  allowedDomains: '',
  defaultRole: 'viewer',

  clientId: '',
  clientSecret: '',
  authUrl: '',
  tokenUrl: '',
  userinfoUrl: '',
  apiUrl: '',
  scopes: 'openid email profile',
  emailClaim: 'email',
  nameClaim: 'name',
  subClaim: 'sub',
  groupsClaim: 'groups',

  idpMetadataUrl: '',
  idpMetadataXml: '',
  idpEntityId: '',
  idpSsoUrl: '',
  idpCert: '',
  signRequests: false,
  nameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
  emailAttribute: 'email',
  nameAttribute: 'displayName',
  groupsAttribute: 'groups',
}

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

function TextField({
  label,
  message,
  hint,
  placeholder,
  type,
  readOnly,
  field,
}: {
  label: string
  message?: string
  hint?: string
  placeholder?: string
  type?: string
  readOnly?: boolean
  field: { value: string; onChange: (value: unknown) => void; name: string }
}) {
  return (
    <Field label={label} message={message} hint={hint}>
      <Input
        name={field.name}
        value={field.value}
        onChange={field.onChange}
        type={type}
        placeholder={placeholder}
        readOnly={readOnly}
        className={cn(
          'h-[48px] rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4',
          readOnly && 'text-[#828DA3]'
        )}
        autoComplete="off"
      />
    </Field>
  )
}

function ToggleField({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint?: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between rounded-[12px] border border-[#2A3242] px-4 py-3">
      <div>
        <Label className="text-sm font-medium text-[#D2D9E6]">{label}</Label>
        {hint && <p className="mt-1 text-sm text-[#828DA3]">{hint}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-[#D2D9E6]">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          readOnly
          value={value}
          className="h-[48px] rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4 font-mono text-xs"
        />
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          }}
          className="flex size-[48px] shrink-0 items-center justify-center rounded-[12px] border border-[#2A3242] bg-[#1E2533] text-[#D2D9E6] transition-colors hover:border-[#3A4252]"
        >
          {copied ? (
            <Check className="size-4 text-green-400" />
          ) : (
            <Copy className="size-4" />
          )}
        </button>
      </div>
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

function SamlServiceProviderPanel({
  orgId,
  slug,
}: {
  orgId: string
  slug: string
}) {
  const { data, loading, error } = useQuery(AUTH_PROVIDER_SAML_METADATA, {
    variables: { orgId, slug },
  })

  if (loading) {
    return (
      <p className="rounded-[12px] border border-[#2A3242] px-4 py-3 text-sm text-[#828DA3]">
        Loading service provider details…
      </p>
    )
  }

  if (error) {
    return (
      <p className="rounded-[12px] border border-[#2A3242] px-4 py-3 text-sm text-red-400">
        {error.message}
      </p>
    )
  }

  const metadata = data!.authProviderSamlMetadata

  return (
    <div className="space-y-4 rounded-[16px] border border-[#2A3242] bg-[#161C28] px-4 py-5">
      <div>
        <p className="text-sm font-semibold text-[#F4F7FC]">
          Service provider details
        </p>
        <p className="mt-1 text-sm text-[#828DA3]">
          Register these in your identity provider.
        </p>
      </div>
      <CopyRow label="Entity ID (Audience)" value={metadata.entityId} />
      <CopyRow label="ACS URL (Reply URL)" value={metadata.acsUrl} />
      <CopyRow label="Metadata URL" value={metadata.metadataUrl} />
    </div>
  )
}

export function ConfigureAuthProviderModal({
  mode,
  orgId,
  providerSlug,
  defaultValues,
  iconUrl,
  onSubmit,
  onUploadIcon,
  onRemoveIcon,
}: {
  mode: 'create' | 'edit'
  orgId: string
  providerSlug?: string
  defaultValues?: Partial<AuthProviderFormValues>
  iconUrl?: string | null
  onSubmit: SubmitHandler<AuthProviderFormValues>
  onUploadIcon?: (file: File) => Promise<void>
  onRemoveIcon?: () => Promise<void>
}) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { ...AUTH_PROVIDER_DEFAULTS, ...defaultValues },
  })

  const errors = form.formState.errors
  const kind = form.watch('kind')
  const type = form.watch('type')

  return (
    <BetterDialogContent
      title={mode === 'create' ? 'Add Identity Provider' : 'Edit Provider'}
      description="Members of this organization sign in through the providers configured here."
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

        {mode === 'create' && (
          <Controller
            name="kind"
            control={form.control}
            render={({ field }) => (
              <Field label="Protocol">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => field.onChange('oidc')}
                    className={
                      field.value === 'oidc'
                        ? 'rounded-[12px] border border-[#015AEB] bg-[#015AEB]/10 px-4 py-3 text-sm font-medium text-[#F4F7FC]'
                        : 'rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4 py-3 text-sm font-medium text-[#828DA3] transition-colors hover:border-[#3A4252]'
                    }
                  >
                    OpenID Connect
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange('saml')}
                    className={
                      field.value === 'saml'
                        ? 'rounded-[12px] border border-[#015AEB] bg-[#015AEB]/10 px-4 py-3 text-sm font-medium text-[#F4F7FC]'
                        : 'rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4 py-3 text-sm font-medium text-[#828DA3] transition-colors hover:border-[#3A4252]'
                    }
                  >
                    SAML 2.0
                  </button>
                </div>
              </Field>
            )}
          />
        )}

        <Controller
          name="displayName"
          control={form.control}
          render={({ field }) => (
            <TextField
              label="Display Name"
              message={errors.displayName?.message}
              placeholder="Shown on the sign-in button"
              field={field}
            />
          )}
        />

        <Controller
          name="slug"
          control={form.control}
          render={({ field }) => (
            <TextField
              label="Slug"
              message={errors.slug?.message}
              hint={
                mode === 'edit'
                  ? 'The slug cannot be changed: it is part of the URLs registered with your identity provider.'
                  : `Sign-in URL: /api/v1/auth/orgs/${orgId}/login/${field.value || '<slug>'}`
              }
              placeholder="acme-okta"
              readOnly={mode === 'edit'}
              field={field}
            />
          )}
        />

        <Controller
          name="defaultRole"
          control={form.control}
          render={({ field }) => (
            <Field
              label="Default Role"
              hint="Applied when no mapping rule matches."
            >
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-[48px] w-full rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        {kind === 'oidc' && (
          <>
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
                    hint="Endpoints below are derived from this when left blank."
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

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="emailClaim"
                control={form.control}
                render={({ field }) => (
                  <TextField label="Email Claim" field={field} />
                )}
              />
              <Controller
                name="nameClaim"
                control={form.control}
                render={({ field }) => (
                  <TextField label="Name Claim" field={field} />
                )}
              />
              <Controller
                name="subClaim"
                control={form.control}
                render={({ field }) => (
                  <TextField label="Subject Claim" field={field} />
                )}
              />
              <Controller
                name="groupsClaim"
                control={form.control}
                render={({ field }) => (
                  <TextField
                    label="Groups Claim"
                    hint="Used by role mapping rules"
                    field={field}
                  />
                )}
              />
            </div>
          </>
        )}

        {kind === 'saml' && (
          <>
            {mode === 'edit' && providerSlug && (
              <SamlServiceProviderPanel orgId={orgId} slug={providerSlug} />
            )}

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
              name="nameIdFormat"
              control={form.control}
              render={({ field }) => (
                <TextField
                  label="Name ID Format"
                  message={errors.nameIdFormat?.message}
                  field={field}
                />
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="emailAttribute"
                control={form.control}
                render={({ field }) => (
                  <TextField label="Email Attribute" field={field} />
                )}
              />
              <Controller
                name="nameAttribute"
                control={form.control}
                render={({ field }) => (
                  <TextField label="Name Attribute" field={field} />
                )}
              />
              <Controller
                name="groupsAttribute"
                control={form.control}
                render={({ field }) => (
                  <TextField
                    label="Groups Attribute"
                    hint="Used by role mapping rules"
                    field={field}
                  />
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
          </>
        )}

        <Controller
          name="allowedDomains"
          control={form.control}
          render={({ field }) => (
            <TextField
              label="Allowed Email Domains"
              message={errors.allowedDomains?.message}
              hint="Comma-separated. Leave blank to accept any domain."
              field={field}
            />
          )}
        />

        <Controller
          name="allowSignUp"
          control={form.control}
          render={({ field }) => (
            <ToggleField
              label="Allow new users to sign up"
              hint="When off, only people who already have an account can sign in."
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          name="enabled"
          control={form.control}
          render={({ field }) => (
            <ToggleField
              label="Enabled"
              hint="Disabled providers are hidden from the sign-in page."
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </form>
    </BetterDialogContent>
  )
}

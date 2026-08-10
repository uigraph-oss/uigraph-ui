'use client'

import { CopyButton } from '@/components/copy-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useQuery } from '@apollo/client'
import { ImageIcon, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { AUTH_PROVIDER_SAML_METADATA, type AuthProvider } from './api/org-auth'

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

export const schema = z
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

export function toFormValues(
  provider: AuthProvider
): Partial<AuthProviderFormValues> {
  return {
    slug: provider.slug,
    kind: provider.kind === 'saml' ? 'saml' : 'oidc',
    type:
      provider.type === 'entra' || provider.type === 'okta'
        ? provider.type
        : 'generic',
    displayName: provider.displayName,
    enabled: provider.enabled,
    allowSignUp: provider.allowSignUp,
    allowedDomains: provider.allowedDomains,
    defaultRole:
      provider.defaultRole === 'admin' || provider.defaultRole === 'editor'
        ? provider.defaultRole
        : 'viewer',

    clientId: provider.clientId,
    clientSecret: '',
    authUrl: provider.authUrl,
    tokenUrl: provider.tokenUrl,
    userinfoUrl: provider.userinfoUrl,
    apiUrl: provider.apiUrl,
    scopes: provider.scopes,
    emailClaim: provider.emailClaim,
    nameClaim: provider.nameClaim,
    subClaim: provider.subClaim,
    groupsClaim: provider.groupsClaim,

    idpMetadataUrl: provider.idpMetadataUrl,
    idpMetadataXml: provider.idpMetadataXml,
    idpEntityId: provider.idpEntityId,
    idpSsoUrl: provider.idpSsoUrl,
    idpCert: provider.idpCert,
    signRequests: provider.signRequests,
    nameIdFormat: provider.nameIdFormat,
    emailAttribute: provider.emailAttribute,
    nameAttribute: provider.nameAttribute,
    groupsAttribute: provider.groupsAttribute,
  }
}

export function toInput(values: AuthProviderFormValues) {
  return {
    slug: values.slug,
    kind: values.kind,
    type: values.type,
    displayName: values.displayName,
    enabled: values.enabled,
    allowSignUp: values.allowSignUp,
    allowedDomains: values.allowedDomains,
    defaultRole: values.defaultRole,

    clientId: values.clientId,
    clientSecret: values.clientSecret,
    authUrl: values.authUrl,
    tokenUrl: values.tokenUrl,
    userinfoUrl: values.userinfoUrl,
    apiUrl: values.apiUrl,
    scopes: values.scopes,
    emailClaim: values.emailClaim,
    nameClaim: values.nameClaim,
    subClaim: values.subClaim,
    groupsClaim: values.groupsClaim,

    idpMetadataUrl: values.idpMetadataUrl,
    idpMetadataXml: values.idpMetadataXml,
    idpEntityId: values.idpEntityId,
    idpSsoUrl: values.idpSsoUrl,
    idpCert: values.idpCert,
    signRequests: values.signRequests,
    nameIdFormat: values.nameIdFormat,
    emailAttribute: values.emailAttribute,
    nameAttribute: values.nameAttribute,
    groupsAttribute: values.groupsAttribute,
  }
}

export function signInUrl(orgId: string, slug: string) {
  return `${window.location.origin}/api/v1/auth/orgs/${orgId}/login/${slug}`
}

export function oidcRedirectUri(orgId: string, slug: string) {
  return `${window.location.origin}/api/v1/auth/orgs/${orgId}/callback/${slug}`
}

export function samlAcsUrl(orgId: string, slug: string) {
  return `${window.location.origin}/api/v1/auth/orgs/${orgId}/saml/${slug}/acs`
}

export function samlMetadataUrl(orgId: string, slug: string) {
  return `${window.location.origin}/api/v1/auth/orgs/${orgId}/saml/${slug}/metadata`
}

export function Field({
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

export function TextField({
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

export function ToggleField({
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

export function CopyRow({
  label,
  hint,
  value,
}: {
  label: string
  hint?: string
  value: string
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-[#D2D9E6]">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          readOnly
          value={value}
          className="h-[48px] rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4 font-mono text-xs"
        />
        <CopyButton
          text={value}
          className="size-[48px] shrink-0 rounded-[12px] border border-[#2A3242] bg-[#1E2533] text-[#D2D9E6] hover:border-[#3A4252] hover:bg-[#1E2533]"
        />
      </div>
      {hint && <p className="text-sm text-[#828DA3]">{hint}</p>}
    </div>
  )
}

export function IconUploadField({
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

export function SamlServiceProviderPanel({
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
    <div className="space-y-4">
      <CopyRow label="Entity ID (Audience)" value={metadata.entityId} />
      <CopyRow label="ACS URL (Reply URL)" value={metadata.acsUrl} />
      <CopyRow label="Metadata URL" value={metadata.metadataUrl} />
    </div>
  )
}

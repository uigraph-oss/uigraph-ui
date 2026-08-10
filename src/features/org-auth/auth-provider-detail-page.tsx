'use client'

import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { CopyButton } from '@/components/copy-button'
import { SectionLoader } from '@/components/section-loader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useSearchParamsState } from '@/hooks/use-search-params-state'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  CircleHelp,
  ImageIcon,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  AUTH_PROVIDER,
  AUTH_PROVIDER_SAML_METADATA,
  AUTH_PROVIDERS,
  DELETE_AUTH_PROVIDER,
  removeAuthProviderIcon,
  setAuthProviderIcon,
  UPDATE_AUTH_PROVIDER,
  type AuthProvider,
} from './api/org-auth'
import { RoleMappingsPanel } from './components/role-mappings-panel'
import {
  oidcRedirectUri,
  schema,
  signInUrl,
  toFormValues,
  toInput,
  type AuthProviderFormValues,
} from './helpers/provider-form'

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'configuration', label: 'Configuration' },
  { id: 'attributes', label: 'Attributes' },
  { id: 'users', label: 'User Management' },
]

const TAB_FIELDS: Record<string, string[]> = {
  general: ['displayName', 'slug', 'enabled', 'allowedDomains'],
  configuration: [
    'kind',
    'type',
    'apiUrl',
    'clientId',
    'clientSecret',
    'authUrl',
    'tokenUrl',
    'userinfoUrl',
    'scopes',
    'idpMetadataUrl',
    'idpMetadataXml',
    'idpEntityId',
    'idpSsoUrl',
    'idpCert',
    'signRequests',
  ],
  attributes: [
    'emailClaim',
    'nameClaim',
    'subClaim',
    'emailAttribute',
    'nameAttribute',
    'nameIdFormat',
    'groupsClaim',
    'groupsAttribute',
  ],
  users: ['allowSignUp', 'defaultRole'],
}

const labelClass = 'text-sm font-medium text-[#D2D9E6]'
const inputClass =
  'h-[48px] rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4'
const readOnlyInputClass =
  'h-[48px] rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4 font-mono text-xs'
const copyButtonClass =
  'size-[48px] shrink-0 rounded-[12px] border border-[#2A3242] bg-[#1E2533] text-[#D2D9E6] hover:border-[#3A4252] hover:bg-[#1E2533] [&_svg]:size-4!'
const textareaClass =
  'rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4 py-3 font-mono text-xs'
const toggleRowClass =
  'flex items-center justify-between rounded-[12px] border border-[#2A3242] px-4 py-3'
const errorClass = 'text-destructive text-sm'
const hintIconClass = 'text-[#586378] transition-colors hover:text-[#D2D9E6]'

export function AuthProviderDetailPage() {
  const orgId = useCurrentOrganization()?.id as string
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const providerQuery = useQuery(AUTH_PROVIDER, {
    variables: { orgId, slug: slug as string },
    skip: !orgId || !slug,
    onError: (error) => toast.error(error.message),
  })

  if (providerQuery.loading && !providerQuery.data) {
    return <SectionLoader label="Loading provider..." />
  }

  const provider = providerQuery.data?.authProvider as AuthProvider | undefined

  if (!provider) {
    return (
      <div className="px-6 py-6">
        <Button preset="outline" onClick={() => navigate('/settings/sso')}>
          <ArrowLeft className="size-4" />
          Back to SSO
        </Button>
        <p className="text-muted-foreground mt-6 text-sm">
          This identity provider no longer exists.
        </p>
      </div>
    )
  }

  return (
    <ProviderDetail
      key={provider.id}
      orgId={orgId}
      provider={provider}
      onSaved={async () => {
        const { data } = await providerQuery.refetch()
        return data.authProvider as AuthProvider
      }}
    />
  )
}

function ProviderDetail({
  orgId,
  provider,
  onSaved,
}: {
  orgId: string
  provider: AuthProvider
  onSaved: () => Promise<AuthProvider>
}) {
  const navigate = useNavigate()
  const [{ tab }, setSearchParams] = useSearchParamsState('tab')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [iconBusy, setIconBusy] = useState(false)
  const iconInputRef = useRef<HTMLInputElement>(null)

  const activeTab = TABS.find((item) => item.id === tab)?.id ?? 'general'

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(provider),
  })

  const errors = form.formState.errors
  const type = form.watch('type')
  const derivedPlaceholder = `Derived from the ${type === 'entra' ? 'directory ID' : 'Okta domain'}`

  const samlMetadata = useQuery(AUTH_PROVIDER_SAML_METADATA, {
    variables: { orgId, slug: provider.slug },
    skip: provider.kind !== 'saml',
  })

  const [updateProvider] = useMutation(UPDATE_AUTH_PROVIDER, {
    awaitRefetchQueries: true,
    refetchQueries: [{ query: AUTH_PROVIDERS, variables: { orgId } }],
  })
  const [deleteProvider] = useMutation(DELETE_AUTH_PROVIDER, {
    awaitRefetchQueries: true,
    refetchQueries: [{ query: AUTH_PROVIDERS, variables: { orgId } }],
  })

  async function handleSave(values: AuthProviderFormValues) {
    try {
      await updateProvider({
        variables: { orgId, slug: provider.slug, input: toInput(values) },
      })
      const updated = await onSaved()
      form.reset(toFormValues(updated))
      toast.success('Provider updated')
    } catch (error) {
      const message = (error as Error).message

      if (message === 'conflict') {
        form.setError('displayName', {
          message: 'Another provider already uses this name',
        })
        setSearchParams({ tab: 'general' }, true)
        return
      }

      toast.error(message)
    }
  }

  function handleInvalid() {
    const errored = Object.keys(form.formState.errors)

    for (const item of TABS) {
      if (errored.some((field) => TAB_FIELDS[item.id].includes(field))) {
        setSearchParams({ tab: item.id }, true)
        toast.error('Check the highlighted fields before saving')
        return
      }
    }

    throw new Error(`no tab owns the invalid fields ${errored.join(', ')}`)
  }

  async function handleDelete() {
    try {
      await deleteProvider({ variables: { orgId, slug: provider.slug } })
      toast.success('Provider removed')
      await navigate('/settings/sso')
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  async function handleIconSelected(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setIconBusy(true)
    try {
      await setAuthProviderIcon(orgId, provider.slug, file)
      await onSaved()
      toast.success('Logo updated')
    } catch {
      toast.error('Failed to upload the logo')
    } finally {
      setIconBusy(false)
    }
  }

  async function handleIconRemove() {
    setIconBusy(true)
    try {
      await removeAuthProviderIcon(orgId, provider.slug)
      await onSaved()
      toast.success('Logo removed')
    } catch {
      toast.error('Failed to remove the logo')
    } finally {
      setIconBusy(false)
    }
  }

  return (
    <>
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            {provider.iconUrl ? (
              <img
                src={provider.iconUrl}
                alt=""
                className="size-12 shrink-0 rounded-[12px] object-contain"
              />
            ) : (
              <div className="flex size-12 shrink-0 items-center justify-center rounded-[12px] border border-[#2A3242] bg-[#1E2533] text-[#828DA3]">
                <ShieldCheck className="size-5" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h2 className="truncate text-[1rem] leading-[1.33] font-semibold text-[#F4F7FC]">
                  {provider.displayName}
                </h2>
                {provider.enabled ? (
                  <Badge
                    variant="secondary"
                    className="h-6 rounded-md border border-green-500/30 bg-green-500/10 px-2.5 text-xs font-medium text-green-400"
                  >
                    Enabled
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="h-6 rounded-md border border-[#2A3242] bg-[#1E2533] px-2.5 text-xs font-medium text-[#D2D9E6]"
                  >
                    Disabled
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-[#828DA3]">
                {provider.kind === 'saml' ? 'SAML 2.0' : 'OpenID Connect'}
                {provider.kind === 'oidc' && ` · ${provider.type}`} ·{' '}
                <span className="font-mono">{provider.slug}</span>
              </p>
            </div>
          </div>

          <Button
            preset="outline"
            className="shrink-0"
            onClick={() => navigate('/settings/sso')}
          >
            <ArrowLeft className="size-4" />
            Back to SSO
          </Button>
        </div>
      </div>

      <div className="border-stock mt-6 flex items-center overflow-x-auto border-b px-3">
        {TABS.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={cn(
              'h-auto items-center rounded-none bg-transparent px-6! pt-0 pb-3 text-[#828DA3] hover:bg-transparent',
              activeTab === item.id &&
                'text-[#F4F7FC] shadow-[inset_0_-2px_0_0_var(--color-primary)]'
            )}
            onClick={() => setSearchParams({ tab: item.id }, true)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <div className="px-6 py-6">
        {activeTab === 'general' && (
          <div className="space-y-8">
            <div className="space-y-5">
              <div className="flex items-center gap-5 rounded-[16px] border border-[#2A3242] bg-[#161C28] px-4 py-4">
                <button
                  type="button"
                  onClick={() => iconInputRef.current?.click()}
                  disabled={iconBusy}
                  className="group relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-[#2A3242] bg-[#1E2533] transition-colors hover:border-[#015AEB] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {provider.iconUrl ? (
                    <img
                      src={provider.iconUrl}
                      alt=""
                      className="size-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="size-6 text-[#828DA3]" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Upload className="size-4 text-white" />
                  </div>
                </button>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#D2D9E6]">Logo</p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    type="button"
                    preset="outline"
                    disabled={iconBusy}
                    onClick={() => iconInputRef.current?.click()}
                  >
                    {provider.iconUrl ? 'Replace' : 'Upload'}
                  </Button>
                  {provider.iconUrl && (
                    <Button
                      type="button"
                      preset="ghost"
                      disabled={iconBusy}
                      className="text-red-500 hover:bg-red-500/10 hover:text-red-500"
                      onClick={() => void handleIconRemove()}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>

                <input
                  ref={iconInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleIconSelected}
                />
              </div>

              <div className="space-y-2">
                <Label className={labelClass}>Display Name</Label>
                <Input
                  {...form.register('displayName')}
                  className={inputClass}
                  autoComplete="off"
                />
                {errors.displayName && (
                  <p className={errorClass}>{errors.displayName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className={labelClass}>Sign-in URL</Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={signInUrl(orgId, provider.slug)}
                    className={readOnlyInputClass}
                  />
                  <CopyButton
                    text={signInUrl(orgId, provider.slug)}
                    className={copyButtonClass}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label className={labelClass}>Allowed Email Domains</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className={hintIconClass}>
                        <CircleHelp className="size-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      Comma-separated. Only these domains may sign in through
                      this provider; leave blank to accept any. It is not the
                      organization&apos;s email domain list.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  {...form.register('allowedDomains')}
                  placeholder="acme.com, acme.co.uk"
                  className={inputClass}
                  autoComplete="off"
                />
              </div>

              <Controller
                name="enabled"
                control={form.control}
                render={({ field }) => (
                  <div className={toggleRowClass}>
                    <Label className={labelClass}>
                      Show on the sign-in page
                    </Label>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                )}
              />
            </div>

            <section className="flex items-center justify-between gap-4 rounded-[16px] border border-red-500/30 px-4 py-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#D2D9E6]">
                  Remove this provider
                </p>
                <p className="mt-1 text-sm text-[#828DA3]">
                  Members can no longer sign in through it.
                </p>
              </div>
              <Button
                type="button"
                preset="outline"
                className="shrink-0 border-red-500/30 text-red-500 hover:border-red-500/40 hover:bg-red-500/10"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-4" />
                Remove
              </Button>
            </section>
          </div>
        )}

        {activeTab === 'configuration' && (
          <div className="space-y-5">
            {provider.kind === 'saml' && samlMetadata.loading && (
              <p className="text-sm text-[#828DA3]">Loading…</p>
            )}

            {provider.kind === 'saml' && samlMetadata.error && (
              <p className="text-sm text-red-400">
                {samlMetadata.error.message}
              </p>
            )}

            {provider.kind === 'saml' && samlMetadata.data && (
              <>
                <div className="space-y-2">
                  <Label className={labelClass}>Entity ID (Audience)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={
                        samlMetadata.data.authProviderSamlMetadata.entityId
                      }
                      className={readOnlyInputClass}
                    />
                    <CopyButton
                      text={samlMetadata.data.authProviderSamlMetadata.entityId}
                      className={copyButtonClass}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={labelClass}>ACS URL (Reply URL)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={samlMetadata.data.authProviderSamlMetadata.acsUrl}
                      className={readOnlyInputClass}
                    />
                    <CopyButton
                      text={samlMetadata.data.authProviderSamlMetadata.acsUrl}
                      className={copyButtonClass}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={labelClass}>Metadata URL</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={
                        samlMetadata.data.authProviderSamlMetadata.metadataUrl
                      }
                      className={readOnlyInputClass}
                    />
                    <CopyButton
                      text={
                        samlMetadata.data.authProviderSamlMetadata.metadataUrl
                      }
                      className={copyButtonClass}
                    />
                  </div>
                </div>
              </>
            )}

            {provider.kind === 'oidc' && (
              <div className="space-y-2">
                <Label className={labelClass}>
                  Redirect URI (Callback URL)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={oidcRedirectUri(orgId, provider.slug)}
                    className={readOnlyInputClass}
                  />
                  <CopyButton
                    text={oidcRedirectUri(orgId, provider.slug)}
                    className={copyButtonClass}
                  />
                </div>
              </div>
            )}
            {provider.kind === 'oidc' && (
              <>
                <Controller
                  name="type"
                  control={form.control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label className={labelClass}>Provider Type</Label>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className={cn(inputClass, 'w-full')}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="generic">Generic OIDC</SelectItem>
                          <SelectItem value="entra">
                            Microsoft Entra ID
                          </SelectItem>
                          <SelectItem value="okta">Okta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />

                {type !== 'generic' && (
                  <div className="space-y-2">
                    <Label className={labelClass}>
                      {type === 'entra'
                        ? 'Directory (Tenant) ID'
                        : 'Okta Domain'}
                    </Label>
                    <Input
                      {...form.register('apiUrl')}
                      placeholder={
                        type === 'entra'
                          ? '00000000-0000-0000-0000-000000000000'
                          : 'your-org.okta.com'
                      }
                      className={inputClass}
                      autoComplete="off"
                    />
                    {errors.apiUrl && (
                      <p className={errorClass}>{errors.apiUrl.message}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label className={labelClass}>Client ID</Label>
                  <Input
                    {...form.register('clientId')}
                    className={inputClass}
                    autoComplete="off"
                  />
                  {errors.clientId && (
                    <p className={errorClass}>{errors.clientId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className={labelClass}>Client Secret</Label>
                  <Input
                    {...form.register('clientSecret')}
                    type="password"
                    placeholder="Leave blank to keep the current secret"
                    className={inputClass}
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-2">
                  <Label className={labelClass}>Authorization URL</Label>
                  <Input
                    {...form.register('authUrl')}
                    placeholder={
                      type === 'generic'
                        ? 'https://idp.example.com/oauth2/authorize'
                        : derivedPlaceholder
                    }
                    className={inputClass}
                    autoComplete="off"
                  />
                  {errors.authUrl && (
                    <p className={errorClass}>{errors.authUrl.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className={labelClass}>Token URL</Label>
                  <Input
                    {...form.register('tokenUrl')}
                    placeholder={
                      type === 'generic'
                        ? 'https://idp.example.com/oauth2/token'
                        : derivedPlaceholder
                    }
                    className={inputClass}
                    autoComplete="off"
                  />
                  {errors.tokenUrl && (
                    <p className={errorClass}>{errors.tokenUrl.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className={labelClass}>Userinfo URL</Label>
                  <Input
                    {...form.register('userinfoUrl')}
                    placeholder={
                      type === 'generic'
                        ? 'https://idp.example.com/oauth2/userinfo'
                        : derivedPlaceholder
                    }
                    className={inputClass}
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-2">
                  <Label className={labelClass}>Scopes</Label>
                  <Input
                    {...form.register('scopes')}
                    placeholder="openid email profile"
                    className={inputClass}
                    autoComplete="off"
                  />
                </div>
              </>
            )}

            {provider.kind === 'saml' && (
              <>
                <div className="space-y-2">
                  <Label className={labelClass}>IdP Metadata URL</Label>
                  <Input
                    {...form.register('idpMetadataUrl')}
                    placeholder="https://idp.example.com/metadata"
                    className={inputClass}
                    autoComplete="off"
                  />
                  {errors.idpMetadataUrl && (
                    <p className={errorClass}>
                      {errors.idpMetadataUrl.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className={labelClass}>IdP Metadata XML</Label>
                  <Textarea
                    {...form.register('idpMetadataXml')}
                    placeholder="<EntityDescriptor ...>"
                    className={cn(textareaClass, 'min-h-32')}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={labelClass}>IdP Entity ID</Label>
                  <Input
                    {...form.register('idpEntityId')}
                    placeholder="Read from the metadata when blank"
                    className={inputClass}
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-2">
                  <Label className={labelClass}>IdP SSO URL</Label>
                  <Input
                    {...form.register('idpSsoUrl')}
                    placeholder="Read from the metadata when blank"
                    className={inputClass}
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-2">
                  <Label className={labelClass}>IdP Signing Certificate</Label>
                  <Textarea
                    {...form.register('idpCert')}
                    placeholder="Read from the metadata when blank"
                    className={cn(textareaClass, 'min-h-24')}
                  />
                </div>

                <Controller
                  name="signRequests"
                  control={form.control}
                  render={({ field }) => (
                    <div className={toggleRowClass}>
                      <Label className={labelClass}>
                        Sign authentication requests
                      </Label>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  )}
                />
              </>
            )}
          </div>
        )}

        {activeTab === 'attributes' && (
          <div className="space-y-5">
            {provider.kind === 'oidc' && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label className={labelClass}>Email Claim</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className={hintIconClass}>
                          <CircleHelp className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        The account key. Sign-in fails when this claim is
                        missing from the token.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    {...form.register('emailClaim')}
                    placeholder="email"
                    className={inputClass}
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-2">
                  <Label className={labelClass}>Name Claim</Label>
                  <Input
                    {...form.register('nameClaim')}
                    placeholder="name"
                    className={inputClass}
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label className={labelClass}>Subject Claim</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className={hintIconClass}>
                          <CircleHelp className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        The stable identifier that keeps an account linked to
                        this provider. Changing it relinks everyone.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    {...form.register('subClaim')}
                    placeholder="sub"
                    className={inputClass}
                    autoComplete="off"
                  />
                </div>
              </>
            )}

            {provider.kind === 'saml' && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label className={labelClass}>Email Attribute</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className={hintIconClass}>
                          <CircleHelp className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        The account key. Sign-in fails when this attribute is
                        missing from the assertion.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    {...form.register('emailAttribute')}
                    placeholder="email"
                    className={inputClass}
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-2">
                  <Label className={labelClass}>Name Attribute</Label>
                  <Input
                    {...form.register('nameAttribute')}
                    placeholder="displayName"
                    className={inputClass}
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label className={labelClass}>Name ID Format</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className={hintIconClass}>
                          <CircleHelp className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        The format we ask for the Name ID in. The Name ID is
                        what keeps an account linked to this provider.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    {...form.register('nameIdFormat')}
                    className={cn(inputClass, 'font-mono text-xs')}
                    autoComplete="off"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-5">
            <Controller
              name="allowSignUp"
              control={form.control}
              render={({ field }) => (
                <div className={toggleRowClass}>
                  <Label className={labelClass}>
                    Allow new users to sign up
                  </Label>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </div>
              )}
            />

            <Controller
              name="defaultRole"
              control={form.control}
              render={({ field }) => (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label className={labelClass}>Default Role</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className={hintIconClass}>
                          <CircleHelp className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        Applies when no role mapping rule below matches.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={cn(inputClass, 'w-full')}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

            <RoleMappingsPanel orgId={orgId} provider={provider} />
          </div>
        )}

        {form.formState.isDirty && (
          <div className="bg-card sticky bottom-0 -mx-6 mt-8 flex items-center justify-between gap-4 px-6 py-4">
            <p className="text-sm text-[#828DA3]">You have unsaved changes.</p>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                preset="outline"
                onClick={() => form.reset(toFormValues(provider))}
              >
                Discard
              </Button>
              <Button
                type="button"
                disabled={form.formState.isSubmitting}
                onClick={() =>
                  void form.handleSubmit(handleSave, handleInvalid)()
                }
              >
                Save changes
              </Button>
            </div>
          </div>
        )}
      </div>

      <BetterDeleteConfirmationModal
        open={deleteOpen}
        onOpenChange={(open) => !open && setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Remove this identity provider?"
        description="Its role mapping rules are removed with it, and members can no longer sign in through it."
        deleteButtonText="Remove Provider"
        cancelButtonText="Cancel"
      />
    </>
  )
}

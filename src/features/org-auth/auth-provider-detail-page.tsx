'use client'

import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { SectionLoader } from '@/components/section-loader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSearchParamsState } from '@/hooks/use-search-params-state'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ShieldCheck, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  AUTH_PROVIDER,
  AUTH_PROVIDERS,
  DELETE_AUTH_PROVIDER,
  removeAuthProviderIcon,
  setAuthProviderIcon,
  UPDATE_AUTH_PROVIDER,
  type AuthProvider,
} from './api/org-auth'
import {
  ProviderAttributeFields,
  ProviderConnectionFields,
} from './provider-field-groups'
import {
  CopyRow,
  Field,
  IconUploadField,
  oidcRedirectUri,
  SamlServiceProviderPanel,
  schema,
  signInUrl,
  TextField,
  toFormValues,
  ToggleField,
  toInput,
  type AuthProviderFormValues,
} from './provider-form-fields'
import { RoleMappingsPanel } from './role-mappings-panel'

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

  const activeTab = TABS.find((item) => item.id === tab)?.id ?? 'general'

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(provider) as AuthProviderFormValues,
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
      form.reset(toFormValues(updated) as AuthProviderFormValues)
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

  async function handleUploadIcon(file: File) {
    await setAuthProviderIcon(orgId, provider.slug, file)
    await onSaved()
  }

  async function handleRemoveIcon() {
    await removeAuthProviderIcon(orgId, provider.slug)
    await onSaved()
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
          <div className="max-w-2xl space-y-8">
            <div className="space-y-5">
              <IconUploadField
                iconUrl={provider.iconUrl}
                displayName={provider.displayName}
                onUploadIcon={handleUploadIcon}
                onRemoveIcon={handleRemoveIcon}
              />

              <Controller
                name="displayName"
                control={form.control}
                render={({ field }) => (
                  <TextField
                    label="Display Name"
                    message={form.formState.errors.displayName?.message}
                    hint="Shown on the sign-in button."
                    field={field}
                  />
                )}
              />

              <CopyRow
                label="Sign-in URL"
                hint="Send members here to sign in through this provider. The slug in this URL is fixed — your identity provider is already configured with it."
                value={signInUrl(orgId, provider.slug)}
              />

              <Controller
                name="enabled"
                control={form.control}
                render={({ field }) => (
                  <ToggleField
                    label="Enabled"
                    hint="When off, this provider is hidden from the sign-in page."
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              <Controller
                name="allowedDomains"
                control={form.control}
                render={({ field }) => (
                  <TextField
                    label="Allowed Email Domains"
                    message={form.formState.errors.allowedDomains?.message}
                    hint="Comma-separated. Leave blank to accept any domain. This only restricts who may sign in through this provider — it is not the organization's email domain list."
                    field={field}
                  />
                )}
              />
            </div>

            <section className="space-y-4 rounded-[16px] border border-red-500/30 px-4 py-5">
              <div>
                <p className="text-sm font-semibold text-[#F4F7FC]">
                  Remove this provider
                </p>
                <p className="mt-1 text-sm text-[#828DA3]">
                  Its role mapping rules are removed with it, and members can no
                  longer sign in through it.
                </p>
              </div>
              <Button
                type="button"
                preset="outline"
                className="border-red-500/30 text-red-500 hover:border-red-500/40 hover:bg-red-500/10"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-4" />
                Remove provider
              </Button>
            </section>
          </div>
        )}

        {activeTab === 'configuration' && (
          <div className="max-w-2xl space-y-8">
            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[#D2D9E6]">
                  Give these to your identity provider
                </h3>
                <p className="mt-1 text-sm text-[#828DA3]">
                  Register them there, then fill in what it gives you back.
                </p>
              </div>

              {provider.kind === 'saml' && (
                <SamlServiceProviderPanel orgId={orgId} slug={provider.slug} />
              )}

              {provider.kind === 'oidc' && (
                <CopyRow
                  label="Redirect URI (Callback URL)"
                  hint="Add this to the allowed redirect URIs of your OIDC application."
                  value={oidcRedirectUri(orgId, provider.slug)}
                />
              )}
            </section>

            <section className="space-y-4 border-t border-[#2A3242] pt-8">
              <div>
                <h3 className="text-sm font-semibold text-[#D2D9E6]">
                  What your identity provider gave you
                </h3>
                <p className="mt-1 text-sm text-[#828DA3]">
                  The credentials and endpoints we use to reach it.
                </p>
              </div>

              <ProviderConnectionFields form={form} mode="edit" />
            </section>
          </div>
        )}

        {activeTab === 'attributes' && (
          <div className="max-w-2xl space-y-5">
            <p className="text-sm text-[#828DA3]">
              Where each person&apos;s details come from in what your identity
              provider sends back.
            </p>

            <ProviderAttributeFields form={form} />
          </div>
        )}

        {activeTab === 'users' && (
          <div className="max-w-2xl space-y-8">
            <div className="space-y-5">
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
                name="defaultRole"
                control={form.control}
                render={({ field }) => (
                  <Field
                    label="Default Role"
                    hint="The role everyone gets, unless a rule below matches."
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
            </div>

            <section className="space-y-4 border-t border-[#2A3242] pt-8">
              <h3 className="text-sm font-semibold text-[#D2D9E6]">
                Role mapping
              </h3>

              <RoleMappingsPanel orgId={orgId} provider={provider} />
            </section>
          </div>
        )}

        {form.formState.isDirty && (
          <div className="bg-card sticky bottom-0 -mx-6 mt-8 flex items-center justify-between gap-4 border-t border-[#2A3242] px-6 py-4">
            <p className="text-sm text-[#828DA3]">You have unsaved changes.</p>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                preset="outline"
                onClick={() =>
                  form.reset(toFormValues(provider) as AuthProviderFormValues)
                }
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

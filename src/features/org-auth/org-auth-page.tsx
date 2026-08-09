'use client'

import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { BetterDialogProvider } from '@/components/better-dialog'
import { SectionLoader } from '@/components/section-loader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SettingsHeader } from '@/features/dashboard-settings/components/settings-header'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { Plus, ShieldCheck, SlidersHorizontal, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  AUTH_PROVIDERS,
  CREATE_AUTH_PROVIDER,
  CREATE_ORG_DOMAIN,
  DELETE_AUTH_PROVIDER,
  DELETE_ORG_DOMAIN,
  ORG_DOMAINS,
  removeAuthProviderIcon,
  setAuthProviderIcon,
  UPDATE_AUTH_PROVIDER,
  type AuthProvider,
} from './api/org-auth'
import {
  ConfigureAuthProviderModal,
  type AuthProviderFormValues,
} from './configure-auth-provider-modal'
import { RoleMappingsModal } from './role-mappings-modal'

export function OrgAuthPage() {
  const orgId = useCurrentOrganization()?.id as string

  const providersQuery = useQuery(AUTH_PROVIDERS, {
    variables: { orgId },
    skip: !orgId,
    onError: (error) => toast.error(error.message),
  })
  const domainsQuery = useQuery(ORG_DOMAINS, {
    variables: { orgId },
    skip: !orgId,
    onError: (error) => toast.error(error.message),
  })

  const providerRefetch = {
    awaitRefetchQueries: true,
    refetchQueries: [{ query: AUTH_PROVIDERS, variables: { orgId } }],
  }
  const domainRefetch = {
    awaitRefetchQueries: true,
    refetchQueries: [{ query: ORG_DOMAINS, variables: { orgId } }],
  }

  const [createProvider] = useMutation(CREATE_AUTH_PROVIDER, providerRefetch)
  const [updateProvider] = useMutation(UPDATE_AUTH_PROVIDER, providerRefetch)
  const [deleteProvider] = useMutation(DELETE_AUTH_PROVIDER, providerRefetch)
  const [createDomain] = useMutation(CREATE_ORG_DOMAIN, domainRefetch)
  const [deleteDomain] = useMutation(DELETE_ORG_DOMAIN, domainRefetch)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editProvider, setEditProvider] = useState<AuthProvider | null>(null)
  const [mappingProvider, setMappingProvider] = useState<AuthProvider | null>(
    null
  )
  const [deleteTarget, setDeleteTarget] = useState<AuthProvider | null>(null)
  const [newDomain, setNewDomain] = useState('')

  const providers = (providersQuery.data?.authProviders ?? []) as AuthProvider[]
  const domains = domainsQuery.data?.orgDomains ?? []

  async function handleAddDomain() {
    if (newDomain.trim().length === 0) {
      toast.error('Enter a domain')
      return
    }
    try {
      await createDomain({
        variables: { orgId, domain: newDomain.trim().toLowerCase() },
      })
      setNewDomain('')
      toast.success('Domain added')
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <>
      <SettingsHeader
        title="Authentication"
        description="Identity providers, role mapping, and the email domains that lead here."
        cta={
          <Button
            className="h-11 rounded-[0.75rem] px-6 text-sm"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="mr-0.5 h-4 w-4" />
            Add Provider
          </Button>
        }
      />

      {providersQuery.loading && !providersQuery.data ? (
        <SectionLoader label="Loading authentication settings..." />
      ) : (
        <div className="space-y-8 px-6 py-6">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-[#D2D9E6]">
              Identity Providers
            </h3>

            {providers.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-[#2A3242] px-6 py-10 text-center text-sm text-[#828DA3]">
                No identity providers configured yet.
              </div>
            ) : (
              <ul className="space-y-3">
                {providers.map((provider) => (
                  <li
                    key={provider.id}
                    className="flex items-center justify-between rounded-[12px] border border-[#2A3242] px-6 py-4"
                  >
                    <div className="flex items-center gap-3">
                      {provider.iconUrl ? (
                        <img
                          src={provider.iconUrl}
                          alt=""
                          className="size-9 shrink-0 rounded-md object-contain"
                        />
                      ) : (
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-[#2A3242] bg-[#1E2533] text-[#828DA3]">
                          <ShieldCheck className="size-4" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-[#F4F7FC]">
                          {provider.displayName}
                        </p>
                        <p className="text-xs text-[#828DA3]">
                          {provider.kind === 'saml'
                            ? 'SAML 2.0'
                            : 'OpenID Connect'}
                          {provider.kind === 'oidc' && ` · ${provider.type}`} ·
                          default role {provider.defaultRole}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {!provider.enabled && (
                        <Badge
                          variant="secondary"
                          className="h-6 rounded-md border border-[#2A3242] bg-[#1E2533] px-2.5 text-xs font-medium text-[#D2D9E6]"
                        >
                          Disabled
                        </Badge>
                      )}
                      <button
                        className="flex items-center gap-1.5 text-sm text-blue-600 transition-colors hover:text-blue-700"
                        onClick={() => setMappingProvider(provider)}
                      >
                        <SlidersHorizontal className="size-3.5" />
                        Rules
                      </button>
                      <button
                        className="text-sm text-blue-600 transition-colors hover:text-blue-700"
                        onClick={() => setEditProvider(provider)}
                      >
                        Edit
                      </button>
                      <button
                        className="flex size-8 items-center justify-center rounded-md border border-red-500/30 text-red-600 transition-colors hover:border-red-500/40 hover:bg-red-500/10"
                        onClick={() => setDeleteTarget(provider)}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[#D2D9E6]">
                Email Domains
              </h3>
              <p className="mt-1 text-sm text-[#828DA3]">
                Anyone signing in with an address at these domains is offered
                this organization. Domains are not verified, and the same domain
                may belong to several organizations.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Input
                value={newDomain}
                onChange={(event) => setNewDomain(event.target.value)}
                placeholder="example.com"
                className="h-[48px] max-w-sm rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4"
                autoComplete="off"
              />
              <Button
                className="h-[48px] rounded-[0.75rem] px-6 text-sm"
                onClick={() => void handleAddDomain()}
              >
                Add Domain
              </Button>
            </div>

            {domains.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-[#2A3242] px-6 py-8 text-center text-sm text-[#828DA3]">
                No domains yet. Members can still reach this organization
                through an existing membership.
              </div>
            ) : (
              <ul className="space-y-2">
                {domains.map((domain) => (
                  <li
                    key={domain.id}
                    className="flex items-center justify-between rounded-[12px] border border-[#2A3242] px-6 py-3"
                  >
                    <p className="font-mono text-sm text-[#F4F7FC]">
                      {domain.domain}
                    </p>
                    <button
                      className="flex size-8 items-center justify-center rounded-md border border-red-500/30 text-red-600 transition-colors hover:border-red-500/40 hover:bg-red-500/10"
                      onClick={async () => {
                        try {
                          await deleteDomain({
                            variables: { orgId, domainId: domain.id },
                          })
                          toast.success('Domain removed')
                        } catch (error) {
                          toast.error((error as Error).message)
                        }
                      }}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-[#D2D9E6]">
              Directory Sync
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <ComingSoonCard
                label="LDAP"
                note="Authenticate against a directory server."
              />
              <ComingSoonCard
                label="SCIM"
                note="Provision and deprovision users automatically."
              />
            </div>
          </section>
        </div>
      )}

      <BetterDialogProvider open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        {isCreateOpen && (
          <ConfigureAuthProviderModal
            mode="create"
            orgId={orgId}
            onSubmit={async (values) => {
              try {
                await createProvider({
                  variables: { orgId, input: toInput(values) },
                })
                setIsCreateOpen(false)
                toast.success('Provider added')
              } catch (error) {
                toast.error((error as Error).message)
              }
            }}
          />
        )}
      </BetterDialogProvider>

      <BetterDialogProvider
        open={editProvider !== null}
        onOpenChange={(open) => {
          if (!open) setEditProvider(null)
        }}
      >
        {editProvider && (
          <ConfigureAuthProviderModal
            mode="edit"
            orgId={orgId}
            providerSlug={editProvider.slug}
            iconUrl={editProvider.iconUrl}
            onUploadIcon={async (file) => {
              await setAuthProviderIcon(orgId, editProvider.slug, file)
              const { data } = await providersQuery.refetch()
              const updated = data?.authProviders.find(
                (p) => p.id === editProvider.id
              )
              if (updated) setEditProvider(updated as AuthProvider)
            }}
            onRemoveIcon={async () => {
              await removeAuthProviderIcon(orgId, editProvider.slug)
              const { data } = await providersQuery.refetch()
              const updated = data?.authProviders.find(
                (p) => p.id === editProvider.id
              )
              if (updated) setEditProvider(updated as AuthProvider)
            }}
            defaultValues={toFormValues(editProvider)}
            onSubmit={async (values) => {
              try {
                await updateProvider({
                  variables: {
                    orgId,
                    slug: editProvider.slug,
                    input: toInput(values),
                  },
                })
                setEditProvider(null)
                toast.success('Provider updated')
              } catch (error) {
                toast.error((error as Error).message)
              }
            }}
          />
        )}
      </BetterDialogProvider>

      <BetterDialogProvider
        open={mappingProvider !== null}
        onOpenChange={(open) => {
          if (!open) setMappingProvider(null)
        }}
      >
        {mappingProvider && (
          <RoleMappingsModal orgId={orgId} provider={mappingProvider} />
        )}
      </BetterDialogProvider>

      <BetterDeleteConfirmationModal
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            await deleteProvider({
              variables: { orgId, slug: deleteTarget.slug },
            })
            setDeleteTarget(null)
            toast.success('Provider removed')
          } catch (error) {
            toast.error((error as Error).message)
          }
        }}
        title="Remove this identity provider?"
        description="Its role mapping rules are removed with it, and members can no longer sign in through it."
        deleteButtonText="Remove Provider"
        cancelButtonText="Cancel"
      />
    </>
  )
}

// The stored secret reads back as a mask; sending it unchanged would be
// meaningless, so the field starts empty and blank means "keep what is there".
function toFormValues(provider: AuthProvider): Partial<AuthProviderFormValues> {
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

function toInput(values: AuthProviderFormValues) {
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

function ComingSoonCard({ label, note }: { label: string; note: string }) {
  return (
    <div className="flex flex-col rounded-[12px] border border-[#2A3242] px-6 py-5 opacity-60">
      <div className="flex items-center justify-between">
        <p className="font-medium text-[#F4F7FC]">{label}</p>
        <Badge
          variant="secondary"
          className="h-6 rounded-md border border-[#2A3242] bg-[#1E2533] px-2.5 text-xs font-medium text-[#D2D9E6]"
        >
          Coming soon
        </Badge>
      </div>
      <p className="mt-4 border-t border-[#2A3242] pt-4 text-xs text-[#828DA3]">
        {note}
      </p>
    </div>
  )
}

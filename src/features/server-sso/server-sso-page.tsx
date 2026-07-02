'use client'

import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { BetterDialogProvider } from '@/components/better-dialog'
import { SectionLoader } from '@/components/section-loader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ServerSectionHeader } from '@/features/server-dashboard/server-section-header'
import { useMutation, useQuery } from '@apollo/client'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  DELETE_LDAP,
  DELETE_OAUTH_PROVIDER,
  LDAP_CONFIG,
  OAUTH_PROVIDERS,
  removeOAuthProviderIcon,
  SAML_CONFIG,
  SCIM_STATUS,
  setOAuthProviderIcon,
  UPSERT_LDAP,
  UPSERT_OAUTH_PROVIDER,
  UPSERT_SAML,
  type OAuthProvider,
  type ProviderStatus,
} from './api/server-sso'
import { ConfigureLdapModal } from './configure-ldap-modal'
import {
  ConfigureOAuthProviderModal,
  type OAuthProviderFormValues,
} from './configure-oauth-provider-modal'
import { ConfigureSamlModal } from './configure-saml-modal'

export function ServerSSOPage() {
  const providersQuery = useQuery(OAUTH_PROVIDERS)
  const ldapQuery = useQuery(LDAP_CONFIG)
  const samlQuery = useQuery(SAML_CONFIG)
  const scimQuery = useQuery(SCIM_STATUS)

  const refetchQueries = [{ query: OAUTH_PROVIDERS }]
  const [upsertProvider] = useMutation(UPSERT_OAUTH_PROVIDER, {
    awaitRefetchQueries: true,
    refetchQueries,
  })
  const [deleteProvider] = useMutation(DELETE_OAUTH_PROVIDER, {
    awaitRefetchQueries: true,
    refetchQueries,
  })
  const [upsertLdap] = useMutation(UPSERT_LDAP, {
    awaitRefetchQueries: true,
    refetchQueries: [{ query: LDAP_CONFIG }],
  })
  const [deleteLdap] = useMutation(DELETE_LDAP, {
    awaitRefetchQueries: true,
    refetchQueries: [{ query: LDAP_CONFIG }],
  })
  const [upsertSaml] = useMutation(UPSERT_SAML, {
    awaitRefetchQueries: true,
    refetchQueries: [{ query: SAML_CONFIG }],
  })

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editProvider, setEditProvider] = useState<OAuthProvider | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<OAuthProvider | null>(null)
  const [isLdapOpen, setIsLdapOpen] = useState(false)
  const [isSamlOpen, setIsSamlOpen] = useState(false)
  const [isLdapDeleteOpen, setIsLdapDeleteOpen] = useState(false)

  const providers = providersQuery.data?.oauthProviders ?? []
  const ldap = ldapQuery.data?.ldap ?? null
  const saml = samlQuery.data?.saml ?? null
  const statuses = {
    ldap: ldap ? 'configured' : 'not-configured',
    saml: saml ? 'configured' : 'not-configured',
    scim: scimQuery.data?.scim ? 'configured' : 'not-configured',
  } as const

  const error =
    providersQuery.error ??
    ldapQuery.error ??
    samlQuery.error ??
    scimQuery.error ??
    null
  const isLoading =
    providersQuery.loading ||
    ldapQuery.loading ||
    samlQuery.loading ||
    scimQuery.loading

  useEffect(() => {
    if (error) {
      toast.error(error.message)
    }
  }, [error])

  return (
    <>
      <ServerSectionHeader
        title="Single Sign-On"
        description="Configure identity providers for this server"
        cta={
          <Button
            className="h-11 rounded-[0.75rem] px-6 text-sm"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="mr-0.5 h-4 w-4" />
            Add OAuth Provider
          </Button>
        }
      />

      {isLoading ? (
        <SectionLoader label="Loading SSO configuration..." />
      ) : (
        <div className="space-y-8 px-6 py-6">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-[#D2D9E6]">
              OAuth / OpenID Connect Providers
            </h3>

            {providers.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-[#2A3242] px-6 py-10 text-center text-sm text-[#828DA3]">
                No OAuth providers configured yet.
              </div>
            ) : (
              <ul className="space-y-3">
                {providers.map((provider) => (
                  <li
                    key={provider.providerName}
                    className="flex items-center justify-between rounded-[12px] border border-[#2A3242] px-6 py-4"
                  >
                    <div className="flex items-center gap-3">
                      {provider.iconUrl && (
                        <img
                          src={provider.iconUrl}
                          alt=""
                          className="size-9 shrink-0 rounded-md object-contain"
                        />
                      )}
                      <div>
                        <p className="font-medium text-[#F4F7FC]">
                          {provider.displayName || provider.providerName}
                        </p>
                        <p className="text-xs text-[#828DA3]">
                          {provider.providerName} · {provider.type || 'generic'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
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
            <h3 className="text-sm font-semibold text-[#D2D9E6]">
              Directory & Enterprise SSO
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <StatusCard
                label="LDAP"
                status={statuses.ldap}
                actions={
                  <>
                    <button
                      className="text-sm text-blue-600 transition-colors hover:text-blue-700"
                      onClick={() => setIsLdapOpen(true)}
                    >
                      {ldap ? 'Edit' : 'Configure'}
                    </button>
                    {ldap && (
                      <button
                        className="text-sm text-red-600 transition-colors hover:text-red-700"
                        onClick={() => setIsLdapDeleteOpen(true)}
                      >
                        Remove
                      </button>
                    )}
                  </>
                }
              />
              <StatusCard
                label="SAML"
                status={statuses.saml}
                actions={
                  <button
                    className="text-sm text-blue-600 transition-colors hover:text-blue-700"
                    onClick={() => setIsSamlOpen(true)}
                  >
                    {saml ? 'Edit' : 'Configure'}
                  </button>
                }
              />
              <StatusCard
                label="SCIM"
                status={statuses.scim}
                note="Provisioned via server configuration"
              />
            </div>
          </section>
        </div>
      )}

      <BetterDialogProvider open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <ConfigureOAuthProviderModal
          mode="create"
          onSubmit={async (values) => {
            try {
              await upsertProvider({
                variables: {
                  provider: values.providerName,
                  input: toInput(values),
                },
              })
              setIsCreateOpen(false)
              toast.success('Provider added')
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? error.message
                  : 'Failed to add provider'
              )
            }
          }}
        />
      </BetterDialogProvider>

      <BetterDialogProvider
        open={editProvider !== null}
        onOpenChange={(open) => {
          if (!open) setEditProvider(null)
        }}
      >
        {editProvider && (
          <ConfigureOAuthProviderModal
            mode="edit"
            iconUrl={editProvider.iconUrl}
            onUploadIcon={async (file) => {
              await setOAuthProviderIcon(editProvider.providerName, file)
              const { data } = await providersQuery.refetch()
              const updated = data?.oauthProviders.find(
                (p) => p.providerName === editProvider.providerName
              )
              if (updated) setEditProvider(updated)
            }}
            onRemoveIcon={async () => {
              await removeOAuthProviderIcon(editProvider.providerName)
              const { data } = await providersQuery.refetch()
              const updated = data?.oauthProviders.find(
                (p) => p.providerName === editProvider.providerName
              )
              if (updated) setEditProvider(updated)
            }}
            defaultValues={{
              providerName: editProvider.providerName,
              displayName: editProvider.displayName,
              clientId: editProvider.clientId,
              clientSecret: '',
              authUrl: editProvider.authUrl,
              tokenUrl: editProvider.tokenUrl,
              userinfoUrl: editProvider.userinfoUrl,
              scopes: editProvider.scopes,
              allowedDomains: editProvider.allowedDomains,
              allowSignUp: editProvider.allowSignUp,
              emailClaim: editProvider.emailClaim,
              nameClaim: editProvider.nameClaim,
              subClaim: editProvider.subClaim,
            }}
            onSubmit={async (values) => {
              try {
                await upsertProvider({
                  variables: {
                    provider: editProvider.providerName,
                    input: toInput(values),
                  },
                })
                setEditProvider(null)
                toast.success('Provider updated')
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : 'Failed to update provider'
                )
              }
            }}
          />
        )}
      </BetterDialogProvider>

      <BetterDialogProvider open={isLdapOpen} onOpenChange={setIsLdapOpen}>
        {isLdapOpen && (
          <ConfigureLdapModal
            mode={ldap ? 'edit' : 'create'}
            defaultValues={
              ldap
                ? {
                    host: ldap.host,
                    port: ldap.port,
                    useSsl: ldap.useSsl,
                    startTls: ldap.startTls,
                    skipTlsVerify: ldap.skipTlsVerify,
                    bindDn: ldap.bindDn,
                    bindPassword: '',
                    searchBaseDn: ldap.searchBaseDn,
                    searchFilter: ldap.searchFilter,
                    usernameAttribute: ldap.usernameAttribute,
                    emailAttribute: ldap.emailAttribute,
                    nameAttribute: ldap.nameAttribute,
                    memberOfAttribute: ldap.memberOfAttribute,
                    allowSignUp: ldap.allowSignUp,
                  }
                : undefined
            }
            onSubmit={async (values) => {
              try {
                await upsertLdap({ variables: { input: values } })
                setIsLdapOpen(false)
                toast.success('LDAP saved')
              } catch (error) {
                toast.error(
                  error instanceof Error ? error.message : 'Failed to save LDAP'
                )
              }
            }}
          />
        )}
      </BetterDialogProvider>

      <BetterDialogProvider open={isSamlOpen} onOpenChange={setIsSamlOpen}>
        {isSamlOpen && (
          <ConfigureSamlModal
            mode={saml ? 'edit' : 'create'}
            spCert={saml?.spCert}
            defaultValues={
              saml
                ? {
                    spEntityId: saml.spEntityId,
                    idpMetadataUrl: saml.idpMetadataUrl,
                    idpMetadataXml: saml.idpMetadataXml,
                    nameIdFormat: saml.nameIdFormat,
                    loginAttribute: saml.loginAttribute,
                    emailAttribute: saml.emailAttribute,
                    nameAttribute: saml.nameAttribute,
                    groupsAttribute: saml.groupsAttribute,
                    signRequests: saml.signRequests,
                    allowSignUp: saml.allowSignUp,
                  }
                : undefined
            }
            onSubmit={async (values) => {
              try {
                await upsertSaml({ variables: { input: values } })
                setIsSamlOpen(false)
                toast.success('SAML saved')
              } catch (error) {
                toast.error(
                  error instanceof Error ? error.message : 'Failed to save SAML'
                )
              }
            }}
          />
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
              variables: { provider: deleteTarget.providerName },
            })
            setDeleteTarget(null)
            toast.success('Provider removed')
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : 'Failed to remove provider'
            )
          }
        }}
        title="Remove this OAuth provider?"
        description="Users will no longer be able to sign in through this provider."
        deleteButtonText="Remove Provider"
        cancelButtonText="Cancel"
      />

      <BetterDeleteConfirmationModal
        open={isLdapDeleteOpen}
        onOpenChange={setIsLdapDeleteOpen}
        onConfirm={async () => {
          try {
            await deleteLdap()
            setIsLdapDeleteOpen(false)
            toast.success('LDAP removed')
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : 'Failed to remove LDAP'
            )
          }
        }}
        title="Remove LDAP configuration?"
        description="Users will no longer be able to sign in through LDAP."
        deleteButtonText="Remove LDAP"
        cancelButtonText="Cancel"
      />
    </>
  )
}

function toInput(values: OAuthProviderFormValues) {
  return {
    type: 'generic',
    displayName: values.displayName,
    clientId: values.clientId,
    clientSecret: values.clientSecret,
    authUrl: values.authUrl,
    tokenUrl: values.tokenUrl,
    userinfoUrl: values.userinfoUrl,
    scopes: values.scopes,
    allowedDomains: values.allowedDomains,
    allowSignUp: values.allowSignUp,
    emailClaim: values.emailClaim,
    nameClaim: values.nameClaim,
    subClaim: values.subClaim,
  }
}

function StatusCard({
  label,
  status,
  actions,
  note,
}: {
  label: string
  status: ProviderStatus | null
  actions?: React.ReactNode
  note?: string
}) {
  const isConfigured = status === 'configured'
  return (
    <div className="flex flex-col rounded-[12px] border border-[#2A3242] px-6 py-5">
      <div className="flex items-center justify-between">
        <p className="font-medium text-[#F4F7FC]">{label}</p>
        {isConfigured ? (
          <Badge
            variant="secondary"
            className="h-6 rounded-md border border-green-500/30 bg-green-500/10 px-2.5 text-xs font-medium text-green-400"
          >
            Configured
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="h-6 rounded-md border border-[#2A3242] bg-[#1E2533] px-2.5 text-xs font-medium text-[#D2D9E6]"
          >
            Not configured
          </Badge>
        )}
      </div>

      {actions && (
        <div className="mt-4 flex items-center gap-4 border-t border-[#2A3242] pt-4">
          {actions}
        </div>
      )}

      {!actions && note && (
        <p className="mt-4 border-t border-[#2A3242] pt-4 text-xs text-[#828DA3]">
          {note}
        </p>
      )}
    </div>
  )
}

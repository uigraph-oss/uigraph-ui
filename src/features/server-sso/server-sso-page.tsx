'use client'

import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { BetterDialogProvider } from '@/components/better-dialog'
import { SectionLoader } from '@/components/section-loader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ServerSectionHeader } from '@/features/server-dashboard/server-section-header'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  deleteOAuthProvider,
  getLdapStatus,
  getSamlStatus,
  getScimStatus,
  listOAuthProviders,
  upsertOAuthProvider,
  type OAuthProvider,
  type ProviderStatus,
} from './api/server-sso'
import {
  ConfigureOAuthProviderModal,
  type OAuthProviderFormValues,
} from './configure-oauth-provider-modal'

type Statuses = {
  ldap: ProviderStatus | null
  saml: ProviderStatus | null
  scim: ProviderStatus | null
}

export function ServerSSOPage() {
  const [providers, setProviders] = useState<OAuthProvider[]>([])
  const [statuses, setStatuses] = useState<Statuses>({
    ldap: null,
    saml: null,
    scim: null,
  })
  const [isLoading, setIsLoading] = useState(true)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editProvider, setEditProvider] = useState<OAuthProvider | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<OAuthProvider | null>(null)

  async function refresh() {
    setIsLoading(true)
    try {
      const [list, ldap, saml, scim] = await Promise.all([
        listOAuthProviders(),
        getLdapStatus(),
        getSamlStatus(),
        getScimStatus(),
      ])
      setProviders(list)
      setStatuses({ ldap, saml, scim })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to load SSO config'
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

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
            <h3 className="text-sm font-semibold text-gray-700">
              OAuth / OpenID Connect Providers
            </h3>

            {providers.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-[#E5E7E9] px-6 py-10 text-center text-sm text-gray-500">
                No OAuth providers configured yet.
              </div>
            ) : (
              <ul className="space-y-3">
                {providers.map((provider) => (
                  <li
                    key={provider.providerName}
                    className="flex items-center justify-between rounded-[12px] border border-[#E5E7E9] px-6 py-4"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {provider.displayName || provider.providerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {provider.providerName} · {provider.type || 'generic'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        className="text-sm text-blue-600 transition-colors hover:text-blue-700"
                        onClick={() => setEditProvider(provider)}
                      >
                        Edit
                      </button>
                      <button
                        className="flex size-8 items-center justify-center rounded-md border border-red-200 text-red-600 transition-colors hover:border-red-300 hover:bg-red-50"
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
            <h3 className="text-sm font-semibold text-gray-700">
              Directory & Enterprise SSO
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <StatusCard label="LDAP" status={statuses.ldap} />
              <StatusCard label="SAML" status={statuses.saml} />
              <StatusCard label="SCIM" status={statuses.scim} />
            </div>
          </section>
        </div>
      )}

      <BetterDialogProvider open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <ConfigureOAuthProviderModal
          mode="create"
          onSubmit={async (values) => {
            try {
              await upsertOAuthProvider(values.providerName, toInput(values))
              setIsCreateOpen(false)
              toast.success('Provider added')
              await refresh()
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
                await upsertOAuthProvider(
                  editProvider.providerName,
                  toInput(values)
                )
                setEditProvider(null)
                toast.success('Provider updated')
                await refresh()
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

      <BetterDeleteConfirmationModal
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            await deleteOAuthProvider(deleteTarget.providerName)
            setDeleteTarget(null)
            toast.success('Provider removed')
            await refresh()
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
}: {
  label: string
  status: ProviderStatus | null
}) {
  const isConfigured = status === 'configured'
  return (
    <div className="rounded-[12px] border border-[#E5E7E9] px-6 py-5">
      <div className="flex items-center justify-between">
        <p className="font-medium text-gray-800">{label}</p>
        {isConfigured ? (
          <Badge
            variant="secondary"
            className="h-6 rounded-md border border-green-200 bg-green-50 px-2.5 text-xs font-medium text-green-700"
          >
            Configured
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="h-6 rounded-md border border-gray-200 bg-gray-50 px-2.5 text-xs font-medium text-gray-600"
          >
            Not configured
          </Badge>
        )}
      </div>
    </div>
  )
}

'use client'

import { BetterDialogProvider } from '@/components/better-dialog'
import { SectionLoader } from '@/components/section-loader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SettingsHeader } from '@/features/dashboard-settings/components/settings-header'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { ChevronRight, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  AUTH_PROVIDERS,
  CREATE_ORG_DOMAIN,
  DELETE_ORG_DOMAIN,
  ORG_DOMAINS,
  type AuthProvider,
} from './api/org-auth'
import { CreateAuthProviderModal } from './components/create-auth-provider-modal'

export function OrgAuthPage() {
  const orgId = useCurrentOrganization()?.id as string
  const navigate = useNavigate()

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

  const domainRefetch = {
    awaitRefetchQueries: true,
    refetchQueries: [{ query: ORG_DOMAINS, variables: { orgId } }],
  }

  const [createDomain] = useMutation(CREATE_ORG_DOMAIN, domainRefetch)
  const [deleteDomain] = useMutation(DELETE_ORG_DOMAIN, domainRefetch)

  const [newDomain, setNewDomain] = useState('')
  const [createOpen, setCreateOpen] = useState(false)

  const providers = (providersQuery.data?.authProviders ?? []) as AuthProvider[]
  const domains = domainsQuery.data?.orgDomains ?? []

  async function handleAddDomain(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

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
        title="SSO"
        description="Manage sign-in providers and email domains for your organization."
        cta={
          <Button
            className="h-11 rounded-[0.75rem] px-6 text-sm"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="mr-0.5 h-4 w-4" />
            Add provider
          </Button>
        }
      />

      {providersQuery.loading && !providersQuery.data ? (
        <SectionLoader label="Loading SSO settings..." />
      ) : (
        <div className="space-y-7 px-6 py-6">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-[#D2D9E6]">
              Identity providers
            </h3>

            {providers.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-[#2A3242] px-6 py-10 text-center text-sm text-[#828DA3]">
                No identity providers added yet.
              </div>
            ) : (
              <ul className="space-y-3">
                {providers.map((provider) => (
                  <li key={provider.id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/settings/sso/${provider.slug}`)}
                      className="flex w-full items-center justify-between rounded-[12px] border border-[#2A3242] px-6 py-4 text-left transition-colors hover:border-[#3A4252]"
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
                            {provider.kind === 'oidc' && ` · ${provider.type}`}
                            {' · '}
                            {provider.defaultRole} by default
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
                        <ChevronRight className="size-4 text-[#586378]" />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[#D2D9E6]">
                Email domains
              </h3>
              <p className="mt-1 text-sm text-[#828DA3]">
                People with an email address at these domains can find this
                organization when signing in.
              </p>
            </div>

            <form
              className="flex max-w-xl flex-col gap-3 sm:flex-row sm:items-center"
              onSubmit={handleAddDomain}
            >
              <Input
                value={newDomain}
                onChange={(event) => setNewDomain(event.target.value)}
                placeholder="example.com"
                aria-label="Email domain"
                className="h-11 rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4 sm:max-w-sm"
                autoComplete="off"
              />
              <Button
                type="submit"
                className="h-11 rounded-[0.75rem] px-6 text-sm"
              >
                Add domain
              </Button>
            </form>

            {domains.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-[#2A3242] px-6 py-8 text-center text-sm text-[#828DA3]">
                No email domains added yet.
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
                      type="button"
                      aria-label={`Remove ${domain.domain}`}
                      title={`Remove ${domain.domain}`}
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
              Directory sync
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      <BetterDialogProvider
        open={createOpen}
        onOpenChange={setCreateOpen}
        className="sm:max-w-[48rem]"
      >
        {createOpen && <CreateAuthProviderModal />}
      </BetterDialogProvider>
    </>
  )
}

function ComingSoonCard({ label, note }: { label: string; note: string }) {
  return (
    <div className="flex flex-col rounded-[12px] border border-[#2A3242] bg-[#171D29] px-6 py-5">
      <div className="flex items-center justify-between">
        <p className="font-medium text-[#828DA3]">{label}</p>
        <Badge
          variant="secondary"
          className="h-6 rounded-md border border-[#2A3242] bg-[#1E2533] px-2.5 text-xs font-medium text-[#D2D9E6]"
        >
          Coming soon
        </Badge>
      </div>
      <p className="mt-4 border-t border-[#2A3242] pt-4 text-xs text-[#6F7A90]">
        {note}
      </p>
    </div>
  )
}

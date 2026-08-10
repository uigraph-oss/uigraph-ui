'use client'

import { SectionLoader } from '@/components/section-loader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SettingsHeader } from '@/features/dashboard-settings/components/settings-header'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { ChevronRight, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  AUTH_PROVIDERS,
  CREATE_ORG_DOMAIN,
  DELETE_ORG_DOMAIN,
  ORG_DOMAINS,
  type AuthProvider,
} from './api/org-auth'

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
        title="SSO"
        description="Identity providers, role mapping, and the email domains that lead here."
        cta={
          <Button
            className="h-11 rounded-[0.75rem] px-6 text-sm"
            onClick={() => navigate('/settings/sso/new')}
          >
            <Plus className="mr-0.5 h-4 w-4" />
            Add Provider
          </Button>
        }
      />

      {providersQuery.loading && !providersQuery.data ? (
        <SectionLoader label="Loading SSO settings..." />
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
                            {provider.kind === 'oidc' && ` · ${provider.type}`}{' '}
                            · default role {provider.defaultRole}
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
    </>
  )
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

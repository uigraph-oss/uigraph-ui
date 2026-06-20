'use client'

import { clientV2 } from '@/api/client'
import { BetterDialogProvider } from '@/components/better-dialog'
import { SectionLoader } from '@/components/section-loader'
import { SectionNotFound } from '@/components/section-not-found'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DashboardSectionContent,
  DashboardSectionHeader,
} from '@/features/dashboard'
import {
  API_GROUPS,
  CREATE_API_GROUP,
  DELETE_API_GROUP,
  SYNC_API_GROUP,
  UPDATE_API_GROUP,
  protocolToV2,
  readSpecFile,
} from '@/features/services/api/api-endpoints'
import { apiGroupToLegacy } from '@/features/services/api/api-v2-adapters'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { CirclePlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useServiceContext } from '../../contexts/service-context'
import { ConfigureApiGroupModal } from './modals/configure-api-group-modal'
import { ServiceApiEndpointGroupCard } from './service-api-group-card'

export function DashboardServiceApis() {
  const { serviceId } = useServiceContext()
  const orgId = useCurrentOrganization().id
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeProtocol, setActiveProtocol] = useState<string | null>(null)

  const listVars = { orgId: orgId!, serviceId }

  const { data, loading } = useQuery(API_GROUPS, {
    client: clientV2,
    fetchPolicy: 'cache-first',
    skip: !orgId,
    variables: listVars,
  })

  const [createServiceApiGroup] = useMutation(CREATE_API_GROUP, {
    client: clientV2,
    awaitRefetchQueries: true,
    refetchQueries: [{ query: API_GROUPS, variables: listVars }],
  })

  const [updateServiceApiGroup] = useMutation(UPDATE_API_GROUP, {
    client: clientV2,
    awaitRefetchQueries: true,
    refetchQueries: [{ query: API_GROUPS, variables: listVars }],
  })

  const [syncAPIGroup] = useMutation(SYNC_API_GROUP, {
    client: clientV2,
    awaitRefetchQueries: true,
    refetchQueries: [{ query: API_GROUPS, variables: listVars }],
  })

  const [deleteServiceApiGroup] = useMutation(DELETE_API_GROUP, {
    client: clientV2,
    awaitRefetchQueries: true,
    refetchQueries: [{ query: API_GROUPS, variables: listVars }],
  })

  const isServiceApiGroupsLoading = loading && !data?.apiGroups
  const serviceApiGroups = useMemo(
    () => arrayNonNullable(data?.apiGroups).map(apiGroupToLegacy),
    [data?.apiGroups]
  )

  const protocols = useMemo(() => {
    const seen = new Set<string>()
    for (const g of serviceApiGroups) {
      const p = g.protocol?.toLowerCase()
      if (p) seen.add(p)
    }
    return Array.from(seen)
  }, [serviceApiGroups])

  const filtered = useMemo(() => {
    return serviceApiGroups.filter((g) => {
      const matchesSearch =
        !searchQuery ||
        (g.name ?? g.version ?? '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      const matchesProtocol =
        !activeProtocol || g.protocol?.toLowerCase() === activeProtocol
      return matchesSearch && matchesProtocol
    })
  }, [serviceApiGroups, searchQuery, activeProtocol])

  return (
    <div className="flex h-full flex-col">
      <DashboardSectionHeader
        title="API & Behavior"
        description="Manage API groups, versions, endpoints, business logic, request/response samples, and test cases."
      >
        <Button preset="primary" onClick={() => setIsAddGroupModalOpen(true)}>
          <CirclePlus className="h-4 w-4" />
          Add API Group
        </Button>

        <BetterDialogProvider
          open={isAddGroupModalOpen}
          onOpenChange={setIsAddGroupModalOpen}
        >
          <ConfigureApiGroupModal
            mode="create"
            onSubmit={async (data) => {
              const protocol = protocolToV2(data.importSource ?? 'openapi')
              if (data.specFile) {
                const spec = await readSpecFile(data.specFile)
                await syncAPIGroup({
                  variables: {
                    orgId: orgId!,
                    serviceId,
                    input: {
                      name: data.name,
                      protocol,
                      spec,
                    },
                  },
                })
              } else {
                await createServiceApiGroup({
                  variables: {
                    orgId: orgId!,
                    serviceId,
                    input: {
                      name: data.name,
                      protocol,
                    },
                  },
                })
              }

              toast.success('API Group created successfully')
              setIsAddGroupModalOpen(false)
            }}
          />
        </BetterDialogProvider>
      </DashboardSectionHeader>

      <DashboardSectionContent noPadding>
        {isServiceApiGroupsLoading ? (
          <SectionLoader label="Loading API groups..." />
        ) : serviceApiGroups.length === 0 ? (
          <SectionNotFound plain label="No API groups found" />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3 border-b border-[#F1F5F9] px-6 py-3">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search groups..."
                className="h-8 w-48 rounded-lg border-[#E2E8F0] bg-white text-[13px] shadow-none focus-visible:bg-white"
              />
              {protocols.length > 1 && (
                <div className="flex items-center gap-0.5 rounded-lg bg-[#F8FAFC] p-0.5 ring-1 ring-[#E2E8F0]">
                  <ProtocolPill
                    label="All"
                    active={activeProtocol === null}
                    onClick={() => setActiveProtocol(null)}
                  />
                  {protocols.map((p) => (
                    <ProtocolPill
                      key={p}
                      label={
                        p === 'grpc'
                          ? 'gRPC'
                          : p === 'graphql'
                            ? 'GraphQL'
                            : p.toUpperCase()
                      }
                      active={activeProtocol === p}
                      onClick={() =>
                        setActiveProtocol(activeProtocol === p ? null : p)
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            <div
              className="grid gap-4 p-6"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              }}
            >
              {filtered.length === 0 ? (
                <div className="col-span-full">
                  <SectionNotFound plain label="No groups match your search." />
                </div>
              ) : (
                filtered.map((group) => (
                  <ServiceApiEndpointGroupCard
                    key={group.serviceApiGroupId}
                    group={group}
                    deleteGroup={() =>
                      deleteServiceApiGroup({
                        variables: {
                          orgId: orgId!,
                          serviceId,
                          id: group.serviceApiGroupId ?? '',
                        },
                      })
                    }
                    updateGroup={async (input) => {
                      if (input.specFile) {
                        const spec = await readSpecFile(input.specFile)
                        await syncAPIGroup({
                          variables: {
                            orgId: orgId!,
                            serviceId,
                            input: {
                              apiGroupId: group.serviceApiGroupId,
                              name: input.name ?? group.name ?? '',
                              protocol: protocolToV2(
                                input.importSource ?? 'openapi'
                              ),
                              spec,
                            },
                          },
                        })
                      } else {
                        await updateServiceApiGroup({
                          variables: {
                            orgId: orgId!,
                            serviceId,
                            id: group.serviceApiGroupId ?? '',
                            input: {
                              name: input.name,
                            },
                          },
                        })
                      }
                    }}
                  />
                ))
              )}
            </div>
          </>
        )}
      </DashboardSectionContent>
    </div>
  )
}

function ProtocolPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-7 items-center rounded-md px-3 text-[12px] font-medium transition-all duration-150',
        active
          ? 'bg-[#0F172A] text-white'
          : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
      )}
    >
      {label}
    </button>
  )
}

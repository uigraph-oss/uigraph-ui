'use client'

import { BetterDialogProvider } from '@/components/better-dialog'
import { SectionLoader } from '@/components/section-loader'
import { SectionNotFound } from '@/components/section-not-found'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useOrganizationContext } from '@/contexts'
import {
  DashboardSectionContent,
  DashboardSectionHeader,
} from '@/features/dashboard'
import { cn } from '@/lib/utils'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { CirclePlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  CREATE_SERVICE_API_GROUP_MUTATION,
  DELETE_SERVICE_API_GROUP_MUTATION,
  GET_SERVICE_API_GROUPS_QUERY,
  UPDATE_SERVICE_API_GROUP_MUTATION,
} from '../../api/api-endpoints'
import { useServiceContext } from '../../contexts/service-context'
import { ConfigureApiGroupModal } from './modals/configure-api-group-modal'
import { ServiceApiEndpointGroupCard } from './service-api-group-card'

export function DashboardServiceApis() {
  const { serviceId } = useServiceContext()
  const { organizationId } = useOrganizationContext()
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeProtocol, setActiveProtocol] = useState<string | null>(null)

  const { data, loading } = useQuery(GET_SERVICE_API_GROUPS_QUERY, {
    fetchPolicy: 'cache-first',
    variables: { serviceId },
  })

  const [createServiceApiGroup] = useMutation(
    CREATE_SERVICE_API_GROUP_MUTATION,
    {
      awaitRefetchQueries: true,
      refetchQueries: [GET_SERVICE_API_GROUPS_QUERY],
    }
  )

  const [updateServiceApiGroup] = useMutation(
    UPDATE_SERVICE_API_GROUP_MUTATION,
    {
      awaitRefetchQueries: true,
      refetchQueries: [GET_SERVICE_API_GROUPS_QUERY],
    }
  )

  const [deleteServiceApiGroup] = useMutation(
    DELETE_SERVICE_API_GROUP_MUTATION,
    {
      awaitRefetchQueries: true,
      refetchQueries: [GET_SERVICE_API_GROUPS_QUERY],
    }
  )

  const isServiceApiGroupsLoading = loading && !data?.v1GetServiceAPIGroups
  const serviceApiGroups = useMemo(
    () => arrayNonNullable(data?.v1GetServiceAPIGroups),
    [data?.v1GetServiceAPIGroups]
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
              await createServiceApiGroup({
                variables: {
                  input: {
                    serviceId,
                    name: data.name,
                    openApiSpecFileId: data.openApiSpecFileId ?? undefined,
                    swaggerSpecFileId: data.swaggerSpecFileId ?? undefined,
                    graphqlSpecFileIds: data.graphqlSpecFileIds ?? undefined,
                    grpcSpecFileIds: data.grpcSpecFileIds ?? undefined,
                  },
                },
              })

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
            {/* Toolbar */}
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
                          organizationId: organizationId,
                          serviceApiGroupId: group.serviceApiGroupId ?? '',
                        },
                      })
                    }
                    updateGroup={(input) =>
                      updateServiceApiGroup({
                        variables: {
                          serviceApiGroupId: group.serviceApiGroupId ?? '',
                          input,
                        },
                      })
                    }
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

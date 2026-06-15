import { clientV2 } from '@/api-v2/client'
import { GET_DIAGRAM_ORG_USERS } from '@/features/dashboard-diagrams/api/teams'
import { TEAMS_V2 } from '@/features/dashboard-diagrams/api/teams-v2'
import {
  SERVICE_STATS_V2,
  type ServiceStatsRow,
} from '@/features/services/api/service-stats-v2'
import {
  CREATE_SERVICE_V2,
  DELETE_SERVICE_V2,
  SERVICES_V2,
  UPDATE_SERVICE_V2,
} from '@/features/services/api/services-v2'
import { useCurrentOrganization, useAuthenticatedUser } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useMemo, useState } from 'react'

export function useDashboardServicesList(serviceId?: string) {
  const organization = useCurrentOrganization()
  const orgId = organization.id
  const accountId = useAuthenticatedUser().userId

  const servicesVariables = { orgId: orgId! }

  const { data, loading } = useQuery(SERVICES_V2, {
    client: clientV2,
    variables: servicesVariables,
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
  })

  const { data: statsData, loading: statsLoading } = useQuery(SERVICE_STATS_V2, {
    client: clientV2,
    variables: { orgId: orgId!, serviceId },
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
    errorPolicy: 'ignore',
  })

  const statsByServiceId = useMemo(() => {
    const m = new Map<string, ServiceStatsRow>()
    for (const row of arrayNonNullable(statsData?.serviceStats)) {
      if (row?.serviceId) {
        m.set(row.serviceId, row)
      }
    }
    return m
  }, [statsData?.serviceStats])

  const teamsData = useQuery(TEAMS_V2, {
    client: clientV2,
    fetchPolicy: 'cache-first',
    variables: { orgId: orgId! },
    skip: !orgId,
  })

  const orgUsersData = useQuery(GET_DIAGRAM_ORG_USERS, {
    fetchPolicy: 'cache-first',
    variables: { organizationId: orgId },
    skip: !orgId,
  })

  const teams = useMemo(
    () => arrayNonNullable(teamsData.data?.teams ?? []),
    [teamsData.data?.teams]
  )

  const orgUsers = useMemo(
    () => arrayNonNullable(orgUsersData.data?.GetOrganizationUsers ?? []),
    [orgUsersData.data?.GetOrganizationUsers]
  )

  const currentUserTeamId = useMemo(() => {
    const me = orgUsers.find((u) => u.userId === accountId)
    return me?.teamId ?? null
  }, [orgUsers, accountId])

  const [selectedTeamId, setSelectedTeamId] = useState<
    string | null | undefined
  >(undefined)

  const resolvedTeamId = useMemo(() => {
    if (selectedTeamId !== undefined) return selectedTeamId
    if (orgUsersData.loading) return undefined
    return currentUserTeamId
  }, [selectedTeamId, currentUserTeamId, orgUsersData.loading])

  const [createService] = useMutation(CREATE_SERVICE_V2, {
    client: clientV2,
    awaitRefetchQueries: true,
    refetchQueries: [{ query: SERVICES_V2, variables: servicesVariables }],
  })

  const [updateService] = useMutation(UPDATE_SERVICE_V2, {
    client: clientV2,
    awaitRefetchQueries: true,
    refetchQueries: [{ query: SERVICES_V2, variables: servicesVariables }],
  })

  const [deleteService] = useMutation(DELETE_SERVICE_V2, {
    client: clientV2,
    awaitRefetchQueries: true,
    refetchQueries: [{ query: SERVICES_V2, variables: servicesVariables }],
  })

  const allServices = useMemo(
    () => arrayNonNullable(data?.services),
    [data?.services]
  )

  const services = useMemo(() => {
    if (!resolvedTeamId) return allServices
    return allServices.filter((s) => s.teamId === resolvedTeamId)
  }, [allServices, resolvedTeamId])

  return {
    orgId,
    isServicesLoading: loading && !data?.services,
    isStatsLoading: statsLoading && !statsData?.serviceStats,
    services,
    allServices,
    statsByServiceId,

    teams,
    selectedTeamId: resolvedTeamId,
    setSelectedTeamId,

    createService,
    updateService,
    deleteService,
  }
}

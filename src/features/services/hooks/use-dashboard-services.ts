import { useOrganizationContext } from '@/contexts'
import {
  GET_DIAGRAM_ORG_USERS,
  GET_DIAGRAM_TEAMS,
} from '@/features/dashboard-diagrams/api/teams'
import {
  GET_SERVICE_STATS_QUERY,
  type ServiceStatsRow,
} from '@/features/services/api/service-stats'
import {
  CREATE_SERVICE_MUTATION,
  DELETE_SERVICE_MUTATION,
  GET_SERVICES_QUERY,
  UPDATE_SERVICE_MUTATION,
} from '@/features/services/api/services'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useMemo, useState } from 'react'

export function useDashboardServicesList(serviceId?: string) {
  const { organizationId, accountId } = useOrganizationContext()

  const { data, loading } = useQuery(GET_SERVICES_QUERY, {
    variables: { organizationId, serviceId },
    fetchPolicy: 'cache-and-network',
  })

  const { data: statsData, loading: statsLoading } = useQuery(
    GET_SERVICE_STATS_QUERY,
    {
      variables: { organizationId, serviceId },
      fetchPolicy: 'cache-and-network',
      skip: !organizationId,
      // Safe rollout if `v1GetServiceStats` is not on the API yet — cards show zeros.
      errorPolicy: 'ignore',
    }
  )

  const statsByServiceId = useMemo(() => {
    const m = new Map<string, ServiceStatsRow>()
    for (const row of arrayNonNullable(statsData?.v1GetServiceStats)) {
      if (row?.serviceId) {
        m.set(row.serviceId, row)
      }
    }
    return m
  }, [statsData?.v1GetServiceStats])

  const teamsData = useQuery(GET_DIAGRAM_TEAMS, {
    fetchPolicy: 'cache-first',
    variables: { organizationId: organizationId! },
    skip: !organizationId,
  })

  const orgUsersData = useQuery(GET_DIAGRAM_ORG_USERS, {
    fetchPolicy: 'cache-first',
    variables: { organizationId: organizationId! },
    skip: !organizationId,
  })

  const teams = useMemo(
    () => arrayNonNullable(teamsData.data?.GetTeam ?? []),
    [teamsData.data?.GetTeam]
  )

  const orgUsers = useMemo(
    () => arrayNonNullable(orgUsersData.data?.GetOrganizationUsers ?? []),
    [orgUsersData.data?.GetOrganizationUsers]
  )

  const currentUserTeamId = useMemo(() => {
    const me = orgUsers.find((u) => u.userId === accountId)
    return me?.teamId ?? null
  }, [orgUsers, accountId])

  // undefined = not yet initialised, null = All Teams, string = specific team
  const [selectedTeamId, setSelectedTeamId] = useState<
    string | null | undefined
  >(undefined)

  const resolvedTeamId = useMemo(() => {
    if (selectedTeamId !== undefined) return selectedTeamId
    if (orgUsersData.loading) return undefined
    return currentUserTeamId
  }, [selectedTeamId, currentUserTeamId, orgUsersData.loading])

  const [createService] = useMutation(CREATE_SERVICE_MUTATION, {
    awaitRefetchQueries: true,
    refetchQueries: [GET_SERVICES_QUERY, GET_SERVICE_STATS_QUERY],
  })

  const [updateService] = useMutation(UPDATE_SERVICE_MUTATION, {
    awaitRefetchQueries: true,
    refetchQueries: [GET_SERVICES_QUERY, GET_SERVICE_STATS_QUERY],
  })

  const [deleteService] = useMutation(DELETE_SERVICE_MUTATION, {
    awaitRefetchQueries: true,
    refetchQueries: [GET_SERVICES_QUERY, GET_SERVICE_STATS_QUERY],
  })

  const allServices = useMemo(
    () => arrayNonNullable(data?.v1GetServices),
    [data?.v1GetServices]
  )

  const services = useMemo(() => {
    if (!resolvedTeamId) return allServices
    return allServices.filter((s) => s.teamId === resolvedTeamId)
  }, [allServices, resolvedTeamId])

  return {
    isServicesLoading: loading && !data?.v1GetServices,
    isStatsLoading: statsLoading && !statsData?.v1GetServiceStats,
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

import { clientV2 } from '@/api/client'
import { TEAMS } from '@/features/dashboard-diagrams/api/teams'
import { MEMBERS } from '@/features/dashboard-settings/api/members'
import {
  SERVICE_STATS,
  type ServiceStatsRow,
} from '@/features/services/api/service-stats'
import {
  CREATE_SERVICE,
  DELETE_SERVICE,
  SERVICES,
  UPDATE_SERVICE,
} from '@/features/services/api/services'
import {
  useAuthenticatedUser,
  useCurrentOrganization,
} from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useMemo, useState } from 'react'

export function useDashboardServicesList(serviceId?: string) {
  const organization = useCurrentOrganization()
  const orgId = organization.id
  const accountId = useAuthenticatedUser().userId

  const servicesVariables = { orgId: orgId! }

  const { data, loading } = useQuery(SERVICES, {
    client: clientV2,
    variables: servicesVariables,
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
  })

  const { data: statsData, loading: statsLoading } = useQuery(
    SERVICE_STATS,
    {
      client: clientV2,
      variables: { orgId: orgId!, serviceId },
      fetchPolicy: 'cache-and-network',
      skip: !orgId,
      errorPolicy: 'ignore',
    }
  )

  const statsByServiceId = useMemo(() => {
    const m = new Map<string, ServiceStatsRow>()
    for (const row of arrayNonNullable(statsData?.serviceStats)) {
      if (row?.serviceId) {
        m.set(row.serviceId, row)
      }
    }
    return m
  }, [statsData?.serviceStats])

  const teamsData = useQuery(TEAMS, {
    client: clientV2,
    fetchPolicy: 'cache-first',
    variables: { orgId: orgId! },
    skip: !orgId,
  })

  const orgUsersData = useQuery(MEMBERS, {
    client: clientV2,
    fetchPolicy: 'cache-first',
    variables: { orgId: orgId! },
    skip: !orgId,
  })

  const teams = useMemo(
    () => arrayNonNullable(teamsData.data?.teams ?? []),
    [teamsData.data?.teams]
  )

  const orgUsers = useMemo(
    () => arrayNonNullable(orgUsersData.data?.members ?? []),
    [orgUsersData.data?.members]
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

  const [createService] = useMutation(CREATE_SERVICE, {
    client: clientV2,
    awaitRefetchQueries: true,
    refetchQueries: [{ query: SERVICES, variables: servicesVariables }],
  })

  const [updateService] = useMutation(UPDATE_SERVICE, {
    client: clientV2,
    awaitRefetchQueries: true,
    refetchQueries: [{ query: SERVICES, variables: servicesVariables }],
  })

  const [deleteService] = useMutation(DELETE_SERVICE, {
    client: clientV2,
    awaitRefetchQueries: true,
    refetchQueries: [{ query: SERVICES, variables: servicesVariables }],
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

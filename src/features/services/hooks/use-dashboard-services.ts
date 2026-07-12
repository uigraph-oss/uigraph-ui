import { TEAMS } from '@/features/dashboard-diagrams/api/teams'
import { MEMBERS } from '@/features/dashboard-settings/api/members'
import {
  CREATE_SERVICE,
  DELETE_SERVICE,
  SERVICES,
  type ServiceStats,
  UPDATE_SERVICE,
} from '@/features/services/api/services'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useScopedStorage } from '@/hooks/use-scoped-storage'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useMemo, useState } from 'react'

export function useDashboardServicesList() {
  const organization = useCurrentOrganization()
  const orgId = organization.id

  const [selectedTeamId, setSelectedTeamId] = useScopedStorage<string | null>(
    'services:team',
    null
  )
  const [sortBy, setSortBy] = useScopedStorage('services:sort', 'name')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const sortDir = sortBy === 'name' ? 'asc' : 'desc'

  const servicesVariables = {
    orgId: orgId!,
    teamId: selectedTeamId,
    search: debouncedSearch || null,
    sortBy,
    sortDir,
  }

  const { data, loading } = useQuery(SERVICES, {
    variables: servicesVariables,
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
  })

  const statsByServiceId = useMemo(() => {
    const m = new Map<string, ServiceStats>()
    for (const item of arrayNonNullable(data?.services.items)) {
      if (item?.stats?.serviceId) {
        m.set(item.stats.serviceId, item.stats)
      }
    }
    return m
  }, [data?.services.items])

  const teamsData = useQuery(TEAMS, {
    fetchPolicy: 'cache-first',
    variables: { orgId: orgId! },
    skip: !orgId,
  })

  const orgUsersData = useQuery(MEMBERS, {
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

  const [createService] = useMutation(CREATE_SERVICE, {
    awaitRefetchQueries: true,
    refetchQueries: [{ query: SERVICES, variables: servicesVariables }],
  })

  const [updateService] = useMutation(UPDATE_SERVICE, {
    awaitRefetchQueries: true,
    refetchQueries: [{ query: SERVICES, variables: servicesVariables }],
  })

  const [deleteService] = useMutation(DELETE_SERVICE, {
    awaitRefetchQueries: true,
    refetchQueries: [{ query: SERVICES, variables: servicesVariables }],
  })

  const services = useMemo(
    () => arrayNonNullable(data?.services.items),
    [data?.services.items]
  )

  return {
    orgId,
    isServicesLoading: loading && !data?.services,
    isStatsLoading: loading && !data?.services,
    services,
    totalCount: data?.services.totalCount ?? 0,
    statsByServiceId,
    orgUsers,

    teams,
    selectedTeamId,
    setSelectedTeamId,
    sortBy,
    setSortBy,
    search,
    setSearch,

    createService,
    updateService,
    deleteService,
  }
}

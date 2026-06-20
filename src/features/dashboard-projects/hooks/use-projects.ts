import { clientV2 } from '@/api/client'
import { TEAMS_V2 } from '@/features/dashboard-diagrams/api/teams-v2'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useMemo } from 'react'
import { CREATE_MAP_V2, MAPS_V2 } from '../api'

export function useProjects() {
  const organizationId = useCurrentOrganization()?.id
  const { data: mapsData, loading: mapsLoading } = useQuery(MAPS_V2, {
    client: clientV2,
    fetchPolicy: 'cache-first',
    variables: { orgId: organizationId! },
    skip: !organizationId,
  })

  const teamsData = useQuery(TEAMS_V2, {
    client: clientV2,
    fetchPolicy: 'cache-first',
    variables: { orgId: organizationId! },
    skip: !organizationId,
  })

  const teams = useMemo(
    () => arrayNonNullable(teamsData.data?.teams ?? []),
    [teamsData.data?.teams]
  )

  const [createProject] = useMutation(CREATE_MAP_V2, {
    client: clientV2,
    awaitRefetchQueries: true,
    refetchQueries: [{ query: MAPS_V2, variables: { orgId: organizationId! } }],
  })

  return {
    projectsLoading: mapsLoading && !mapsData?.maps,
    projects: arrayNonNullable(mapsData?.maps),
    teams,
    createProject,
  }
}

import { apolloClientGQL } from '@/api/client'
import { TEAMS } from '@/features/dashboard-diagrams/api/teams'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useMemo } from 'react'
import { CREATE_MAP, MAPS } from '../api'

export function useProjects() {
  const organizationId = useCurrentOrganization()?.id
  const { data: mapsData, loading: mapsLoading } = useQuery(MAPS, {
    client: apolloClientGQL,
    fetchPolicy: 'cache-first',
    variables: { orgId: organizationId! },
    skip: !organizationId,
  })

  const teamsData = useQuery(TEAMS, {
    client: apolloClientGQL,
    fetchPolicy: 'cache-first',
    variables: { orgId: organizationId! },
    skip: !organizationId,
  })

  const teams = useMemo(
    () => arrayNonNullable(teamsData.data?.teams ?? []),
    [teamsData.data?.teams]
  )

  const [createProject] = useMutation(CREATE_MAP, {
    client: apolloClientGQL,
    awaitRefetchQueries: true,
    refetchQueries: [{ query: MAPS, variables: { orgId: organizationId! } }],
  })

  return {
    projectsLoading: mapsLoading && !mapsData?.maps,
    projects: arrayNonNullable(mapsData?.maps),
    teams,
    createProject,
  }
}

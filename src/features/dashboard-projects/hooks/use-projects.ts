import { useOrganizationContext } from '@/contexts'
import { GET_DIAGRAM_TEAMS } from '@/features/dashboard-diagrams/api/teams'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useMemo } from 'react'
import { CREATE_PROJECT, GET_PROJECT } from '../api'

export function useProjects() {
  const { organizationId } = useOrganizationContext()
  const { data: projectsData, loading: projectsLoading } = useQuery(
    GET_PROJECT,
    {
      fetchPolicy: 'cache-first',
      variables: { organizationId },
    }
  )

  const teamsData = useQuery(GET_DIAGRAM_TEAMS, {
    fetchPolicy: 'cache-first',
    variables: { organizationId: organizationId! },
    skip: !organizationId,
  })

  const teams = useMemo(
    () => arrayNonNullable(teamsData.data?.GetTeam ?? []),
    [teamsData.data?.GetTeam]
  )

  const [createProject] = useMutation(CREATE_PROJECT, {
    awaitRefetchQueries: true,
    refetchQueries: [GET_PROJECT],
  })

  return {
    projectsLoading: projectsLoading && !projectsData?.v1GetProject,
    projects: arrayNonNullable(projectsData?.v1GetProject),
    teams,
    createProject,
  }
}

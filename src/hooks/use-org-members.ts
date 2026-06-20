import { clientV2 } from '@/api/client'
import { TEAMS_V2 } from '@/features/dashboard-diagrams/api/teams-v2'
import { MEMBERS_V2 } from '@/features/dashboard-settings/api/members-v2'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { arrayNonNullable, objectPick } from 'daily-code'
import { useMemo } from 'react'

export function useOrgMembers() {
  const org = useCurrentOrganization()

  const membersQuery = useQuery(MEMBERS_V2, {
    client: clientV2,
    fetchPolicy: 'cache-first',
    variables: { orgId: org.id },
  })

  const teamsQuery = useQuery(TEAMS_V2, {
    client: clientV2,
    fetchPolicy: 'cache-first',
    variables: { orgId: org.id },
  })

  const members = useMemo(
    () =>
      arrayNonNullable(membersQuery.data?.members).map((m) =>
        objectPick(m, ['userId', 'email', 'name', 'role'])
      ),
    [membersQuery.data?.members]
  )

  const teams = useMemo(() => {
    return arrayNonNullable(teamsQuery.data?.teams).map((t) => ({
      ...t,
      members: arrayNonNullable(
        membersQuery.data?.members
          .filter((m) => m.teamId === t.id)
          .map((m) => objectPick(m, ['userId', 'email', 'name', 'role']))
      ),
    }))
  }, [teamsQuery.data?.teams, membersQuery.data?.members])

  return {
    teams,
    members,
    isLoading:
      (membersQuery.loading && !membersQuery.data) ||
      (teamsQuery.loading && !teamsQuery.data),
  }
}

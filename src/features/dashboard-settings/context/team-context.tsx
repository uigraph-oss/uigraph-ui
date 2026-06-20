'use client'

import { clientV2 } from '@/api/client'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { createContext } from 'daily-code/react'
import { useMemo } from 'react'
import {
  CREATE_INVITATION_V2,
  MEMBERS_V2,
  REMOVE_MEMBER_V2,
  UPDATE_MEMBER_ROLE_V2,
} from '../api/members-v2'
import {
  CREATE_TEAM_V2,
  DELETE_TEAM_V2,
  SETTINGS_TEAMS_V2,
  UPDATE_TEAM_V2,
  type SettingsTeam,
} from '../api/teams-v2'

export const [TeamContextProvider, useTeamContext] = createContext(() => {
  const orgId = useCurrentOrganization()?.id

  const teamsData = useQuery(SETTINGS_TEAMS_V2, {
    client: clientV2,
    variables: { orgId: orgId! },
    skip: !orgId,
    fetchPolicy: 'cache-first',
  })

  const teamRefetch = [
    { query: SETTINGS_TEAMS_V2, variables: { orgId: orgId! } },
  ]
  const memberRefetch = [MEMBERS_V2]

  const [createTeam] = useMutation(CREATE_TEAM_V2, {
    client: clientV2,
    refetchQueries: teamRefetch,
    awaitRefetchQueries: true,
  })

  const [updateTeam] = useMutation(UPDATE_TEAM_V2, {
    client: clientV2,
    refetchQueries: teamRefetch,
    awaitRefetchQueries: true,
  })

  const [deleteTeam] = useMutation(DELETE_TEAM_V2, {
    client: clientV2,
    refetchQueries: teamRefetch,
    awaitRefetchQueries: true,
  })

  const [createInvitation] = useMutation(CREATE_INVITATION_V2, {
    client: clientV2,
    refetchQueries: memberRefetch,
    awaitRefetchQueries: true,
  })

  const [updateMemberRole] = useMutation(UPDATE_MEMBER_ROLE_V2, {
    client: clientV2,
    refetchQueries: memberRefetch,
    awaitRefetchQueries: true,
  })

  const [removeMember] = useMutation(REMOVE_MEMBER_V2, {
    client: clientV2,
    refetchQueries: memberRefetch,
    awaitRefetchQueries: true,
  })

  const teams = useMemo<SettingsTeam[]>(() => {
    return arrayNonNullable(teamsData.data?.teams).map((t) => ({
      teamId: t.id,
      teamName: t.name,
      memberCount: t.memberCount,
      description: '',
    }))
  }, [teamsData.data?.teams])

  return {
    teams,
    isTeamsLoading: teamsData.loading && !teamsData.data?.teams,

    createTeam(teamInput: { teamName?: string; description?: string }) {
      return createTeam({
        variables: { orgId: orgId!, input: { name: teamInput.teamName ?? '' } },
      })
    },

    updateTeam(
      teamId: string,
      teamInput: { teamName?: string; description?: string }
    ) {
      return updateTeam({
        variables: {
          orgId: orgId!,
          teamId,
          input: { name: teamInput.teamName },
        },
      })
    },

    deleteTeam(teamId: string) {
      return deleteTeam({ variables: { orgId: orgId!, teamId } })
    },

    createTeamMember(userInput: { email: string; role: string }) {
      return createInvitation({
        variables: {
          orgId: orgId!,
          input: { email: userInput.email, role: userInput.role },
        },
      })
    },

    updateTeamMember(userId: string, userInput: { role?: string }) {
      return updateMemberRole({
        variables: { orgId: orgId!, userId, role: userInput.role ?? '' },
      })
    },

    deleteTeamMember(userId: string) {
      return removeMember({ variables: { orgId: orgId!, userId } })
    },
  }
})

'use client'

import { clientV2 } from '@/api/client'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { createContext } from 'daily-code/react'
import { useMemo } from 'react'
import {
  ADD_MEMBER,
  MEMBERS,
  REMOVE_MEMBER,
  UPDATE_MEMBER_ROLE,
} from '../api/members'
import {
  CREATE_TEAM,
  DELETE_TEAM,
  SETTINGS_TEAMS,
  UPDATE_TEAM,
  type SettingsTeam,
} from '../api/teams'

export const [TeamContextProvider, useTeamContext] = createContext(() => {
  const orgId = useCurrentOrganization()?.id

  const teamsData = useQuery(SETTINGS_TEAMS, {
    client: clientV2,
    variables: { orgId: orgId! },
    skip: !orgId,
    fetchPolicy: 'cache-first',
  })

  const teamRefetch = [{ query: SETTINGS_TEAMS, variables: { orgId: orgId! } }]
  const memberRefetch = [MEMBERS]

  const [createTeam] = useMutation(CREATE_TEAM, {
    client: clientV2,
    refetchQueries: teamRefetch,
    awaitRefetchQueries: true,
  })

  const [updateTeam] = useMutation(UPDATE_TEAM, {
    client: clientV2,
    refetchQueries: teamRefetch,
    awaitRefetchQueries: true,
  })

  const [deleteTeam] = useMutation(DELETE_TEAM, {
    client: clientV2,
    refetchQueries: teamRefetch,
    awaitRefetchQueries: true,
  })

  const [addMember] = useMutation(ADD_MEMBER, {
    client: clientV2,
    refetchQueries: memberRefetch,
    awaitRefetchQueries: true,
  })

  const [updateMemberRole] = useMutation(UPDATE_MEMBER_ROLE, {
    client: clientV2,
    refetchQueries: memberRefetch,
    awaitRefetchQueries: true,
  })

  const [removeMember] = useMutation(REMOVE_MEMBER, {
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

    createTeamMember(userInput: {
      name: string
      email: string
      password: string
      role: string
    }) {
      return addMember({
        variables: {
          orgId: orgId!,
          input: {
            name: userInput.name,
            email: userInput.email,
            password: userInput.password,
            role: userInput.role,
          },
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

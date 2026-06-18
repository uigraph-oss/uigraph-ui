'use client'

import { GT } from '@/api'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { createContext } from 'daily-code/react'
import { useMemo } from 'react'
import {
  CREATE_NEW_TEAM,
  DELETE_TEAM,
  GET_TEAM,
  UPDATE_TEAM,
} from '../api/team'
import {
  CREATE_USER,
  GET_ORGANIZATION_USERS,
  GET_USERS_BY_TEAM,
  REMOVE_USER,
  UPDATE_USER,
} from '../api/users'

export const [TeamContextProvider, useTeamContext] = createContext(() => {
  const organizationId = useCurrentOrganization()?.id

  const teamsData = useQuery(GET_TEAM, {
    variables: { organizationId },
    fetchPolicy: 'cache-first',
  })

  const [createTeam] = useMutation(CREATE_NEW_TEAM, {
    refetchQueries: [GET_TEAM],
    awaitRefetchQueries: true,
  })

  const [updateTeam] = useMutation(UPDATE_TEAM, {
    refetchQueries: [GET_TEAM],
    awaitRefetchQueries: true,
  })

  const [deleteTeam] = useMutation(DELETE_TEAM, {
    refetchQueries: [GET_TEAM],
    awaitRefetchQueries: true,
  })

  const [createTeamMember] = useMutation(CREATE_USER, {
    refetchQueries: [GET_USERS_BY_TEAM, GET_ORGANIZATION_USERS],
    awaitRefetchQueries: true,
  })

  const [updateTeamMember] = useMutation(UPDATE_USER, {
    refetchQueries: [GET_USERS_BY_TEAM, GET_ORGANIZATION_USERS],
    awaitRefetchQueries: true,
  })

  const [deleteTeamMember] = useMutation(REMOVE_USER, {
    refetchQueries: [GET_USERS_BY_TEAM, GET_ORGANIZATION_USERS],
    awaitRefetchQueries: true,
  })

  const teams = useMemo(() => {
    return arrayNonNullable(teamsData.data?.GetTeam)
  }, [teamsData.data?.GetTeam])

  return {
    teams,
    isTeamsLoading: teamsData.loading && !teamsData.data?.GetTeam,

    createTeam(teamInput: Omit<GT.CreateTeamInput, 'organizationId'>) {
      return createTeam({
        variables: { input: { organizationId, ...teamInput } },
      })
    },

    updateTeam(
      teamId: string,
      teamInput: Omit<GT.UpdateTeamInput, 'organizationId' | 'teamId'>
    ) {
      return updateTeam({
        variables: {
          teamId,
          organizationId,
          input: { ...teamInput },
        },
      })
    },

    deleteTeam(teamId: string) {
      return deleteTeam({
        variables: { organizationId, teamId },
      })
    },

    createTeamMember(userInput: Omit<GT.CreateUserInput, 'organizationId'>) {
      return createTeamMember({
        variables: {
          input: {
            organizationId,
            ...userInput,
          },
        },
      })
    },

    updateTeamMember(
      userId: string,
      userInput: Omit<GT.UpdateUserInput, 'organizationId'>
    ) {
      return updateTeamMember({
        variables: {
          userId,
          input: {
            organizationId,
            ...userInput,
          },
        },
      })
    },

    deleteTeamMember(userId: string) {
      return deleteTeamMember({
        variables: { organizationId, userId },
      })
    },
  }
})

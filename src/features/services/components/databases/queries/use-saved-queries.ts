import { SavedQueryScope as GqlSavedQueryScope } from '@/api/.gql/graphql'
import {
  CREATE_SAVED_QUERY,
  CREATE_SAVED_QUERY_FOLDER,
  DELETE_SAVED_QUERY,
  DELETE_SAVED_QUERY_FOLDER,
  SAVED_QUERIES,
  SAVED_QUERY_FOLDERS,
  UPDATE_SAVED_QUERY,
  toCreateSavedQueryFolderInput,
  toCreateSavedQueryInput,
  toSavedQuery,
  toSavedQueryFolder,
  toUpdateSavedQueryInput,
} from '@/features/services/api/saved-queries'
import { useCurrentOrganization } from '@/store/auth-store/use-auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useCallback, useMemo } from 'react'
import { SaveQueryInput, SavedQueryScope } from './types'

// Callers only depend on this hook's return shape (team/personal lists,
// team/personalFolders, and the CRUD functions below) — the GraphQL wiring
// is entirely internal.
export function useSavedQueries({
  serviceId,
  serviceDbId,
}: {
  serviceId: string
  serviceDbId: string
}) {
  const orgId = useCurrentOrganization()?.id
  const skip = !orgId || !serviceId || !serviceDbId

  const personalVars = {
    orgId: orgId!,
    serviceId,
    serviceDbId,
    scope: GqlSavedQueryScope.Personal,
  }
  const teamVars = {
    orgId: orgId!,
    serviceId,
    serviceDbId,
    scope: GqlSavedQueryScope.Team,
  }

  const { data: personalData } = useQuery(SAVED_QUERIES, {
    fetchPolicy: 'cache-first',
    variables: personalVars,
    skip,
  })
  const { data: teamData } = useQuery(SAVED_QUERIES, {
    fetchPolicy: 'cache-first',
    variables: teamVars,
    skip,
  })
  const { data: personalFoldersData } = useQuery(SAVED_QUERY_FOLDERS, {
    fetchPolicy: 'cache-first',
    variables: personalVars,
    skip,
  })
  const { data: teamFoldersData } = useQuery(SAVED_QUERY_FOLDERS, {
    fetchPolicy: 'cache-first',
    variables: teamVars,
    skip,
  })

  const personal = useMemo(
    () => arrayNonNullable(personalData?.savedQueries).map(toSavedQuery),
    [personalData]
  )
  const team = useMemo(
    () => arrayNonNullable(teamData?.savedQueries).map(toSavedQuery),
    [teamData]
  )
  const personalFolders = useMemo(
    () =>
      arrayNonNullable(personalFoldersData?.savedQueryFolders).map(
        toSavedQueryFolder
      ),
    [personalFoldersData]
  )
  const teamFolders = useMemo(
    () =>
      arrayNonNullable(teamFoldersData?.savedQueryFolders).map(
        toSavedQueryFolder
      ),
    [teamFoldersData]
  )

  const refetchQueries = [
    { query: SAVED_QUERIES, variables: personalVars },
    { query: SAVED_QUERIES, variables: teamVars },
    { query: SAVED_QUERY_FOLDERS, variables: personalVars },
    { query: SAVED_QUERY_FOLDERS, variables: teamVars },
  ]

  const [createSavedQueryMutation] = useMutation(CREATE_SAVED_QUERY, {
    awaitRefetchQueries: true,
    refetchQueries,
  })
  const [updateSavedQueryMutation] = useMutation(UPDATE_SAVED_QUERY, {
    awaitRefetchQueries: true,
    refetchQueries,
  })
  const [deleteSavedQueryMutation] = useMutation(DELETE_SAVED_QUERY, {
    awaitRefetchQueries: true,
    refetchQueries,
  })
  const [createSavedQueryFolderMutation] = useMutation(
    CREATE_SAVED_QUERY_FOLDER,
    { awaitRefetchQueries: true, refetchQueries }
  )
  const [deleteSavedQueryFolderMutation] = useMutation(
    DELETE_SAVED_QUERY_FOLDER,
    { awaitRefetchQueries: true, refetchQueries }
  )

  const createQuery = useCallback(
    async (scope: SavedQueryScope, input: SaveQueryInput) => {
      await createSavedQueryMutation({
        variables: {
          orgId: orgId!,
          serviceId,
          serviceDbId,
          input: toCreateSavedQueryInput(scope, input),
        },
      })
    },
    [createSavedQueryMutation, orgId, serviceId, serviceDbId]
  )

  const updateQuery = useCallback(
    async (_scope: SavedQueryScope, id: string, input: SaveQueryInput) => {
      await updateSavedQueryMutation({
        variables: {
          orgId: orgId!,
          serviceId,
          serviceDbId,
          id,
          input: toUpdateSavedQueryInput(input),
        },
      })
    },
    [updateSavedQueryMutation, orgId, serviceId, serviceDbId]
  )

  const deleteQuery = useCallback(
    async (_scope: SavedQueryScope, id: string) => {
      await deleteSavedQueryMutation({
        variables: { orgId: orgId!, serviceId, serviceDbId, id },
      })
    },
    [deleteSavedQueryMutation, orgId, serviceId, serviceDbId]
  )

  const createFolder = useCallback(
    async (scope: SavedQueryScope, name: string) => {
      await createSavedQueryFolderMutation({
        variables: {
          orgId: orgId!,
          serviceId,
          serviceDbId,
          input: toCreateSavedQueryFolderInput(scope, name),
        },
      })
    },
    [createSavedQueryFolderMutation, orgId, serviceId, serviceDbId]
  )

  const deleteFolder = useCallback(
    async (_scope: SavedQueryScope, id: string) => {
      await deleteSavedQueryFolderMutation({
        variables: { orgId: orgId!, serviceId, serviceDbId, id },
      })
    },
    [deleteSavedQueryFolderMutation, orgId, serviceId, serviceDbId]
  )

  return {
    team,
    personal,
    teamFolders,
    personalFolders,
    createQuery,
    updateQuery,
    deleteQuery,
    createFolder,
    deleteFolder,
  }
}

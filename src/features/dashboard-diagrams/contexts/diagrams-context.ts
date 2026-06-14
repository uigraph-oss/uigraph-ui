import { clientV2 } from '@/api-v2/client'
import { useOrganizationContext } from '@/contexts'
import { useSearchParamsState } from '@/hooks/use-search-params-state'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { createContext } from 'daily-code/react'
import { useMemo, useState } from 'react'
import { GET_FOLDER_AND_DIAGRAMS } from '../api/diagrams'
import {
  CREATE_DIAGRAM_V2,
  DELETE_DIAGRAM_V2,
  DIAGRAMS_V2,
  UPDATE_DIAGRAM_META_V2,
} from '../api/diagrams-v2'
import {
  CREATE_DIAGRAM_FOLDER,
  DELETE_DIAGRAM_FOLDER,
  GET_DIAGRAM_FOLDER,
  UPDATE_DIAGRAM_FOLDER,
} from '../api/folders'
import { GET_DIAGRAM_ORG_USERS, GET_DIAGRAM_TEAMS } from '../api/teams'

export const [DiagramsContextProvider, useDiagramsContext] = createContext(
  () => {
    const { organizationId, accountId } = useOrganizationContext()

    const [searchParams, setSearchParams] = useSearchParamsState(
      'folder',
      'parent'
    )

    const folderAndDiagramsData = useQuery(GET_FOLDER_AND_DIAGRAMS, {
      fetchPolicy: 'cache-and-network',
      variables: {
        organizationId: organizationId!,
        folderId: searchParams.folder,
      },
    })

    const diagramsV2Query = useQuery(DIAGRAMS_V2, {
      client: clientV2,
      fetchPolicy: 'cache-and-network',
      skip: !organizationId,
      variables: {
        orgId: organizationId!,
        folderId: searchParams.folder,
      },
    })

    const folderData = useQuery(GET_DIAGRAM_FOLDER, {
      fetchPolicy: 'cache-first',
      variables: { folderId: searchParams.folder! },
      skip: !searchParams.folder,
    })

    const selectedFolder = useMemo(
      () => folderData.data?.v1GetFolder ?? null,
      [folderData.data?.v1GetFolder]
    )

    const selectedFolderParentId = selectedFolder?.parentId
    const parentFolderData = useQuery(GET_DIAGRAM_FOLDER, {
      fetchPolicy: 'cache-first',
      variables: { folderId: selectedFolderParentId! },
      skip: !selectedFolderParentId,
    })

    const teamsData = useQuery(GET_DIAGRAM_TEAMS, {
      fetchPolicy: 'cache-first',
      variables: { organizationId: organizationId! },
      skip: !organizationId,
    })

    const orgUsersData = useQuery(GET_DIAGRAM_ORG_USERS, {
      fetchPolicy: 'cache-first',
      variables: { organizationId: organizationId! },
      skip: !organizationId,
    })

    const teams = useMemo(
      () => arrayNonNullable(teamsData.data?.GetTeam ?? []),
      [teamsData.data?.GetTeam]
    )

    const orgUsers = useMemo(
      () => arrayNonNullable(orgUsersData.data?.GetOrganizationUsers ?? []),
      [orgUsersData.data?.GetOrganizationUsers]
    )

    // Find current user's teamId to set as default filter
    const currentUserTeamId = useMemo(() => {
      const me = orgUsers.find((u) => u.userId === accountId)
      return me?.teamId ?? null
    }, [orgUsers, accountId])

    const [selectedTeamId, setSelectedTeamId] = useState<
      string | null | undefined
    >(undefined)

    // undefined = not yet initialised (wait for users to load)
    // null = "All Teams" (user explicitly cleared it)
    // string = specific team
    const resolvedTeamId = useMemo(() => {
      if (selectedTeamId !== undefined) return selectedTeamId
      // Default to the current user's team once users have loaded
      if (orgUsersData.loading) return undefined
      return currentUserTeamId
    }, [selectedTeamId, currentUserTeamId, orgUsersData.loading])

    const [createFolder] = useMutation(CREATE_DIAGRAM_FOLDER, {
      refetchQueries: [GET_FOLDER_AND_DIAGRAMS],
      awaitRefetchQueries: true,
    })

    const [updateFolder] = useMutation(UPDATE_DIAGRAM_FOLDER, {
      refetchQueries: [GET_FOLDER_AND_DIAGRAMS],
      awaitRefetchQueries: true,
    })

    const [deleteFolder] = useMutation(DELETE_DIAGRAM_FOLDER, {
      refetchQueries: [GET_FOLDER_AND_DIAGRAMS],
      awaitRefetchQueries: true,
    })

    function refetchDiagrams() {
      return diagramsV2Query.refetch()
    }

    const [createDiagram] = useMutation(CREATE_DIAGRAM_V2, {
      client: clientV2,
      onCompleted: refetchDiagrams,
    })

    const [updateDiagram] = useMutation(UPDATE_DIAGRAM_META_V2, {
      client: clientV2,
      onCompleted: refetchDiagrams,
    })

    const [deleteDiagram] = useMutation(DELETE_DIAGRAM_V2, {
      client: clientV2,
      onCompleted: refetchDiagrams,
    })

    const folders = useMemo(
      () => arrayNonNullable(folderAndDiagramsData.data?.v1GetFolders ?? []),
      [folderAndDiagramsData.data?.v1GetFolders]
    )

    const parentFolder = useMemo(
      () => parentFolderData.data?.v1GetFolder ?? null,
      [parentFolderData.data?.v1GetFolder]
    )

    const diagrams = useMemo(
      () => arrayNonNullable(diagramsV2Query.data?.diagrams ?? []),
      [diagramsV2Query.data?.diagrams]
    )

    const isFolderDataLoading =
      folderData.loading && !folderData.data?.v1GetFolder

    const isFolderAndDiagramsDataLoading =
      (folderAndDiagramsData.loading &&
        !folderAndDiagramsData.data?.v1GetFolders) ||
      (diagramsV2Query.loading && !diagramsV2Query.data?.diagrams)

    const teamFilteredDiagrams = useMemo(() => {
      if (!resolvedTeamId) return diagrams
      return diagrams.filter((d) => d.teamId === resolvedTeamId)
    }, [diagrams, resolvedTeamId])

    return {
      folders,
      diagrams: teamFilteredDiagrams,
      allDiagrams: diagrams,
      isLoading: isFolderDataLoading || isFolderAndDiagramsDataLoading,

      selectedFolder,
      parentFolder,
      selectedFolderId: searchParams.folder,
      setSelectedFolderId: (folderId: string | null) => {
        setSearchParams({ folder: folderId })
      },

      teams,
      orgUsers,
      selectedTeamId: resolvedTeamId,
      setSelectedTeamId,

      createFolder,
      updateFolder,
      deleteFolder,
      createDiagram,
      updateDiagram,
      deleteDiagram,
      refetchDiagrams,
    }
  }
)

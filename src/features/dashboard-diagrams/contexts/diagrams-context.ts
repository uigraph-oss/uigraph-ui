import { clientV2 } from '@/api/client'
import { MEMBERS_V2 } from '@/features/dashboard-settings/api/members-v2'
import { useSearchParamsState } from '@/hooks/use-search-params-state'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { createContext } from 'daily-code/react'
import { useMemo } from 'react'
import {
  CREATE_DIAGRAM_V2,
  DELETE_DIAGRAM_V2,
  DIAGRAMS_V2,
  UPDATE_DIAGRAM_META_V2,
} from '../api/diagrams-v2'
import {
  CREATE_FOLDER_V2,
  DELETE_FOLDER_V2,
  FOLDER_V2,
  FOLDERS_V2,
  UPDATE_FOLDER_V2,
} from '../api/folders-v2'
import { TEAMS_V2 } from '../api/teams-v2'

export const [DiagramsContextProvider, useDiagramsContext] = createContext(
  () => {
    const organization = useCurrentOrganization()
    const orgId = organization.id

    const [searchParams, setSearchParams] = useSearchParamsState(
      'folder',
      'parent',
      'team'
    )

    const selectedFolderId = searchParams.folder
    const selectedTeamId = searchParams.team

    const foldersQuery = useQuery(FOLDERS_V2, {
      client: clientV2,
      fetchPolicy: 'cache-and-network',
      skip: !orgId,
      variables: { orgId: orgId!, type: 'diagram' },
    })

    const diagramsV2Query = useQuery(DIAGRAMS_V2, {
      client: clientV2,
      fetchPolicy: 'cache-and-network',
      skip: !orgId,
      variables: {
        orgId: orgId!,
        folderId: selectedFolderId,
      },
    })

    const folderData = useQuery(FOLDER_V2, {
      client: clientV2,
      fetchPolicy: 'cache-first',
      variables: { orgId: orgId!, id: selectedFolderId! },
      skip: !orgId || !selectedFolderId,
    })

    const selectedFolder = useMemo(
      () => folderData.data?.folder ?? null,
      [folderData.data?.folder]
    )

    const selectedFolderParentId = selectedFolder?.parentId
    const parentFolderData = useQuery(FOLDER_V2, {
      client: clientV2,
      fetchPolicy: 'cache-first',
      variables: { orgId: orgId!, id: selectedFolderParentId! },
      skip: !orgId || !selectedFolderParentId,
    })

    const teamsData = useQuery(TEAMS_V2, {
      client: clientV2,
      fetchPolicy: 'cache-first',
      variables: { orgId: orgId! },
      skip: !orgId,
    })

    const orgUsersData = useQuery(MEMBERS_V2, {
      client: clientV2,
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

    const folderListVariables = { orgId: orgId!, type: 'diagram' as const }

    const [createFolder] = useMutation(CREATE_FOLDER_V2, {
      client: clientV2,
      refetchQueries: [{ query: FOLDERS_V2, variables: folderListVariables }],
      awaitRefetchQueries: true,
    })

    const [updateFolder] = useMutation(UPDATE_FOLDER_V2, {
      client: clientV2,
      refetchQueries: [{ query: FOLDERS_V2, variables: folderListVariables }],
      awaitRefetchQueries: true,
    })

    const [deleteFolder] = useMutation(DELETE_FOLDER_V2, {
      client: clientV2,
      refetchQueries: [{ query: FOLDERS_V2, variables: folderListVariables }],
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

    const allFolders = useMemo(
      () => arrayNonNullable(foldersQuery.data?.folders),
      [foldersQuery.data?.folders]
    )

    const teamScopedFolders = useMemo(() => {
      if (!selectedTeamId) return allFolders
      return allFolders.filter((f) => !f.teamId || f.teamId === selectedTeamId)
    }, [allFolders, selectedTeamId])

    const folders = useMemo(() => {
      if (selectedFolderId) {
        return teamScopedFolders.filter((f) => f.parentId === selectedFolderId)
      }
      return teamScopedFolders.filter((f) => !f.parentId)
    }, [teamScopedFolders, selectedFolderId])

    const parentFolder = useMemo(
      () => parentFolderData.data?.folder ?? null,
      [parentFolderData.data?.folder]
    )

    const allDiagrams = useMemo(
      () => arrayNonNullable(diagramsV2Query.data?.diagrams ?? []),
      [diagramsV2Query.data?.diagrams]
    )

    const diagrams = useMemo(() => {
      if (!selectedTeamId) return allDiagrams
      return allDiagrams.filter((d) => d.teamId === selectedTeamId)
    }, [allDiagrams, selectedTeamId])

    const isFolderDataLoading =
      folderData.loading && !folderData.data?.folder && !!selectedFolderId

    const isFolderAndDiagramsDataLoading =
      (foldersQuery.loading && !foldersQuery.data?.folders) ||
      (diagramsV2Query.loading && !diagramsV2Query.data?.diagrams)

    return {
      folders,
      allFolders,
      diagrams,
      isLoading: isFolderDataLoading || isFolderAndDiagramsDataLoading,

      selectedFolder,
      parentFolder,
      selectedFolderId,
      setSelectedFolderId: (folderId: string | null) => {
        setSearchParams({ folder: folderId })
      },

      selectedTeamId,
      setSelectedTeamId: (teamId: string | null) => {
        setSearchParams({ team: teamId })
      },

      teams,
      orgUsers,

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

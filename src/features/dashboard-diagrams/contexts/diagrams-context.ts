import { MEMBERS } from '@/features/dashboard-settings/api/members'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useScopedStorage } from '@/hooks/use-scoped-storage'
import { useSearchParamsState } from '@/hooks/use-search-params-state'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { createContext } from 'daily-code/react'
import { useEffect, useMemo, useState } from 'react'
import {
  CREATE_DIAGRAM,
  DELETE_DIAGRAM,
  DIAGRAMS,
  UPDATE_DIAGRAM_META,
} from '../api/diagrams'
import {
  CREATE_FOLDER,
  DELETE_FOLDER,
  FOLDER,
  FOLDERS,
  UPDATE_FOLDER,
} from '../api/folders'
import { TEAMS } from '../api/teams'

const PAGE_SIZE = 24

export const [DiagramsContextProvider, useDiagramsContext] = createContext(
  () => {
    const organization = useCurrentOrganization()
    const orgId = organization.id

    const [searchParams, setSearchParams] = useSearchParamsState(
      'folder',
      'parent'
    )

    const selectedFolderId = searchParams.folder

    const [selectedTeamId, setSelectedTeamId] = useScopedStorage<string | null>(
      'diagrams:team',
      null
    )
    const [sortBy, setSortBy] = useScopedStorage('diagrams:sort', 'created')
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebouncedValue(search)
    const [page, setPage] = useState(0)
    const sortDir = sortBy === 'name' ? 'asc' : 'desc'

    useEffect(() => {
      setPage(0)
    }, [selectedTeamId, sortBy, debouncedSearch, selectedFolderId])

    const foldersQuery = useQuery(FOLDERS, {
      fetchPolicy: 'cache-and-network',
      skip: !orgId,
      variables: { orgId: orgId!, type: 'diagram' },
    })

    const diagramsQuery = useQuery(DIAGRAMS, {
      fetchPolicy: 'cache-and-network',
      skip: !orgId,
      variables: {
        orgId: orgId!,
        folderId: selectedFolderId,
        teamId: selectedTeamId,
        search: debouncedSearch || null,
        sortBy,
        sortDir,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      },
    })

    const folderData = useQuery(FOLDER, {
      fetchPolicy: 'cache-first',
      variables: { orgId: orgId!, id: selectedFolderId! },
      skip: !orgId || !selectedFolderId,
    })

    const selectedFolder = useMemo(
      () => folderData.data?.folder ?? null,
      [folderData.data?.folder]
    )

    const selectedFolderParentId = selectedFolder?.parentId
    const parentFolderData = useQuery(FOLDER, {
      fetchPolicy: 'cache-first',
      variables: { orgId: orgId!, id: selectedFolderParentId! },
      skip: !orgId || !selectedFolderParentId,
    })

    const teamsData = useQuery(TEAMS, {
      fetchPolicy: 'cache-first',
      variables: { orgId: orgId! },
      skip: !orgId,
    })

    const orgUsersData = useQuery(MEMBERS, {
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

    const [createFolder] = useMutation(CREATE_FOLDER, {
      refetchQueries: [{ query: FOLDERS, variables: folderListVariables }],
      awaitRefetchQueries: true,
    })

    const [updateFolder] = useMutation(UPDATE_FOLDER, {
      refetchQueries: [{ query: FOLDERS, variables: folderListVariables }],
      awaitRefetchQueries: true,
    })

    const [deleteFolder] = useMutation(DELETE_FOLDER, {
      refetchQueries: [{ query: FOLDERS, variables: folderListVariables }],
      awaitRefetchQueries: true,
    })

    function refetchDiagrams() {
      return diagramsQuery.refetch()
    }

    const [createDiagram] = useMutation(CREATE_DIAGRAM, {
      onCompleted: refetchDiagrams,
    })

    const [updateDiagram] = useMutation(UPDATE_DIAGRAM_META, {
      onCompleted: refetchDiagrams,
    })

    const [deleteDiagram] = useMutation(DELETE_DIAGRAM, {
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

    const diagrams = useMemo(
      () => arrayNonNullable(diagramsQuery.data?.diagrams.items ?? []),
      [diagramsQuery.data?.diagrams.items]
    )

    const totalCount = diagramsQuery.data?.diagrams.totalCount ?? 0

    const isFolderDataLoading =
      folderData.loading && !folderData.data?.folder && !!selectedFolderId

    const isFoldersLoading = foldersQuery.loading && !foldersQuery.data?.folders

    const isDiagramsLoading =
      diagramsQuery.loading && !diagramsQuery.data?.diagrams

    return {
      folders,
      allFolders,
      diagrams,
      totalCount,
      pageSize: PAGE_SIZE,
      page,
      setPage,
      isLoading: isFolderDataLoading || isFoldersLoading || isDiagramsLoading,

      selectedFolder,
      parentFolder,
      selectedFolderId,
      setSelectedFolderId: (folderId: string | null) => {
        setSearchParams({ folder: folderId })
      },

      selectedTeamId,
      setSelectedTeamId,

      sortBy,
      setSortBy,
      search,
      setSearch,

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

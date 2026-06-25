import {
  CREATE_FOLDER,
  DELETE_FOLDER,
  FOLDER,
  FOLDERS,
  UPDATE_FOLDER,
} from '@/features/dashboard-diagrams/api/folders'
import { TEAMS } from '@/features/dashboard-diagrams/api/teams'
import { MEMBERS } from '@/features/dashboard-settings/api/members'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useScopedStorage } from '@/hooks/use-scoped-storage'
import { useSearchParamsState } from '@/hooks/use-search-params-state'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { createContext } from 'daily-code/react'
import { useEffect, useMemo, useState } from 'react'
import { CREATE_DOC, DELETE_DOC, DOCS, UPDATE_DOC } from '../api/docs'

const PAGE_SIZE = 24

export const [DocsContextProvider, useDocsContext] = createContext(() => {
  const organization = useCurrentOrganization()
  const orgId = organization.id

  const [searchParams, setSearchParams] = useSearchParamsState(
    'folder',
    'parent'
  )

  const selectedFolderId = searchParams.folder

  const [selectedTeamId, setSelectedTeamId] = useScopedStorage<string | null>(
    'docs:team',
    null
  )
  const [sortBy, setSortBy] = useScopedStorage('docs:sort', 'created')
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
    variables: { orgId: orgId!, type: 'doc' },
  })

  const docsQuery = useQuery(DOCS, {
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

  const folderListVariables = { orgId: orgId!, type: 'doc' as const }

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

  function refetchDocs() {
    return docsQuery.refetch()
  }

  const [createDoc] = useMutation(CREATE_DOC, {
    onCompleted: refetchDocs,
  })

  const [updateDoc] = useMutation(UPDATE_DOC, {
    onCompleted: refetchDocs,
  })

  const [deleteDoc] = useMutation(DELETE_DOC, {
    onCompleted: refetchDocs,
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

  const docs = useMemo(
    () => arrayNonNullable(docsQuery.data?.docs.items ?? []),
    [docsQuery.data?.docs.items]
  )

  const totalCount = docsQuery.data?.docs.totalCount ?? 0

  const isFolderDataLoading =
    folderData.loading && !folderData.data?.folder && !!selectedFolderId

  const isFolderAndDocsDataLoading =
    (foldersQuery.loading && !foldersQuery.data?.folders) ||
    (docsQuery.loading && !docsQuery.data?.docs)

  return {
    folders,
    allFolders,
    docs,
    totalCount,
    pageSize: PAGE_SIZE,
    page,
    setPage,
    isLoading: isFolderDataLoading || isFolderAndDocsDataLoading,

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
    createDoc,
    updateDoc,
    deleteDoc,
    refetchDocs,
  }
})

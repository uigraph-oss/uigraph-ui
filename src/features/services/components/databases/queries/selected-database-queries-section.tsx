'use client'

import { ActorAvatar } from '@/components/actor-avatar'
import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import {
  BetterDialogContent,
  BetterDialogProvider,
} from '@/components/better-dialog'
import { CodeMirrorRaw } from '@/components/code-mirror'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Folder,
  KeyRound,
  LayoutGrid,
  Plus,
  Search,
  Users,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { FiEdit3 } from 'react-icons/fi'
import { HiOutlineTrash } from 'react-icons/hi2'
import { toast } from 'sonner'
import { ServiceDbSchema } from '../../../api/service-db'
import { DbTypeBadge } from '../components/db-type-badge'
import {
  SaveQueryInput,
  SavedQuery,
  SavedQueryFolder,
  SavedQueryScope,
} from './types'
import { useSavedQueries } from './use-saved-queries'

type EditState = {
  mode: 'create' | 'update'
  id?: string
}

export function SelectedDatabaseQueriesSection({
  db,
}: {
  db: ServiceDbSchema
}) {
  const serviceDbId = db.serviceDBId ?? 'unknown'
  const {
    team,
    personal,
    teamFolders,
    personalFolders,
    createQuery,
    updateQuery,
    deleteQuery,
    createFolder,
    deleteFolder,
  } = useSavedQueries({ serviceId: db.serviceId ?? 'unknown', serviceDbId })

  const [activeScope, setActiveScope] = useState<SavedQueryScope>('personal')
  const [activeFolderId, setActiveFolderId] = useState<string>('all')
  const [editState, setEditState] = useState<EditState | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [draft, setDraft] = useState<SaveQueryInput>(emptyDraft())
  const [search, setSearch] = useState('')

  const scopedQueries = activeScope === 'team' ? team : personal
  const scopedFolders = activeScope === 'team' ? teamFolders : personalFolders

  const folderFilteredQueries = useMemo(
    () =>
      activeFolderId === 'all'
        ? scopedQueries
        : scopedQueries.filter((query) => query.folderId === activeFolderId),
    [scopedQueries, activeFolderId]
  )
  const activeQueries = useMemo(
    () => filterQueries(folderFilteredQueries, search),
    [folderFilteredQueries, search]
  )

  const countsByFolderId = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const query of scopedQueries) {
      if (query.folderId) {
        counts[query.folderId] = (counts[query.folderId] ?? 0) + 1
      }
    }
    return counts
  }, [scopedQueries])

  const folderNameById = useMemo(
    () => new Map(scopedFolders.map((folder) => [folder.id, folder.name])),
    [scopedFolders]
  )

  function handleScopeChange(scope: SavedQueryScope) {
    setActiveScope(scope)
    setActiveFolderId('all')
  }

  function startCreate() {
    setDraft({
      ...emptyDraft(),
      folderId: activeFolderId === 'all' ? null : activeFolderId,
    })
    setEditState({ mode: 'create' })
  }

  function startUpdate(query: SavedQuery) {
    setDraft({
      title: query.title,
      description: query.description ?? '',
      queryText: query.queryText,
      tags: query.tags,
      folderId: query.folderId,
    })
    setEditState({ mode: 'update', id: query.id })
  }

  function closeEditModal() {
    setEditState(null)
    setDraft(emptyDraft())
  }

  async function handleSave() {
    if (!draft.title.trim()) {
      toast.error('Enter a title for this query')
      return
    }
    if (!draft.queryText.trim()) {
      toast.error('Enter a query before saving')
      return
    }

    try {
      if (editState?.mode === 'update' && editState.id) {
        await updateQuery(activeScope, editState.id, draft)
        toast.success('Query updated')
      } else {
        await createQuery(activeScope, draft)
        toast.success(
          activeScope === 'team' ? 'Query shared with team' : 'Query saved'
        )
      }
      closeEditModal()
    } catch {
      toast.error('Failed to save query')
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteQuery(activeScope, deleteId)
      setDeleteId(null)
      toast.success('Query deleted')
    } catch {
      toast.error('Failed to delete query')
    }
  }

  async function handleCopy(query: SavedQuery) {
    await navigator.clipboard.writeText(query.queryText)
    toast.success('Query copied to clipboard')
  }

  async function handleCreateFolder(name: string) {
    try {
      await createFolder(activeScope, name)
      toast.success('Folder created')
    } catch {
      toast.error('Failed to create folder')
    }
  }

  async function handleDeleteFolder(id: string) {
    try {
      await deleteFolder(activeScope, id)
      if (activeFolderId === id) setActiveFolderId('all')
      toast.success('Folder deleted')
    } catch {
      toast.error('Failed to delete folder')
    }
  }

  return (
    <div className="m-0 space-y-4 pt-5 pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <QueryScopeTabBar
          activeScope={activeScope}
          personalCount={personal.length}
          teamCount={team.length}
          onScopeChange={handleScopeChange}
        />

        <div className="flex items-center gap-2">
          <DbTypeBadge type={db.dbType ?? db.dialect} />
          <Button type="button" preset="outline" onClick={startCreate}>
            <Plus className="h-4 w-4" />
            New Query
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#2A3242] bg-[#141925]/60 px-3 py-2.5">
        <FolderChipBar
          folders={scopedFolders}
          activeFolderId={activeFolderId}
          countsByFolderId={countsByFolderId}
          totalCount={scopedQueries.length}
          onSelectFolder={setActiveFolderId}
          onCreateFolder={handleCreateFolder}
          onDeleteFolder={handleDeleteFolder}
        />

        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#828DA3]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search queries by title, tag, or text"
            className="h-8 border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="space-y-3">
        {activeQueries.length === 0 ? (
          <QueryEmptyState
            scope={activeScope}
            onAdd={startCreate}
            isFiltered={scopedQueries.length > 0}
          />
        ) : (
          activeQueries.map((query) => (
            <QueryCard
              key={query.id}
              query={query}
              folderName={
                query.folderId ? folderNameById.get(query.folderId) : undefined
              }
              onCopy={() => handleCopy(query)}
              onEdit={() => startUpdate(query)}
              onDelete={() => setDeleteId(query.id)}
            />
          ))
        )}
      </div>

      <SaveQueryModal
        open={editState !== null}
        title={
          editState?.mode === 'create'
            ? activeScope === 'team'
              ? 'Share Query with Team'
              : 'Save Query'
            : 'Edit Query'
        }
        draft={draft}
        folders={scopedFolders}
        onDraftChange={setDraft}
        onSave={handleSave}
        onCancel={closeEditModal}
      />

      <BetterDeleteConfirmationModal
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete this query?"
        description="This action cannot be undone."
        onConfirm={async () => handleDelete()}
      />
    </div>
  )
}

function emptyDraft(): SaveQueryInput {
  return { title: '', description: '', queryText: '', tags: [], folderId: null }
}

function filterQueries(queries: SavedQuery[], search: string): SavedQuery[] {
  const term = search.trim().toLowerCase()
  if (!term) return queries

  return queries.filter((query) =>
    [query.title, query.description ?? '', query.queryText, ...query.tags]
      .join(' ')
      .toLowerCase()
      .includes(term)
  )
}

function QueryScopeTabBar({
  activeScope,
  personalCount,
  teamCount,
  onScopeChange,
}: {
  activeScope: SavedQueryScope
  personalCount: number
  teamCount: number
  onScopeChange: (scope: SavedQueryScope) => void
}) {
  const tabs: {
    id: SavedQueryScope
    label: string
    count: number
    Icon: typeof KeyRound
  }[] = [
    { id: 'personal', label: 'Personal', count: personalCount, Icon: KeyRound },
    { id: 'team', label: 'Team', count: teamCount, Icon: Users },
  ]

  return (
    <div
      className="flex gap-1 border-b border-[#2A3242]"
      role="tablist"
      aria-label="Query scope"
    >
      {tabs.map((tab) => {
        const isActive = activeScope === tab.id

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onScopeChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 px-3 py-2.5 text-sm transition-colors',
              isActive
                ? 'text-[#F4F7FC]'
                : 'text-[#828DA3] hover:text-[#C5CDDB]'
            )}
          >
            <tab.Icon className="h-3.5 w-3.5" />
            {tab.label}
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[11px] font-medium tabular-nums',
                isActive
                  ? 'bg-primary/20 text-primary-foreground'
                  : 'bg-[#2A3242] text-[#828DA3]'
              )}
            >
              {tab.count}
            </span>
            {isActive && (
              <span className="bg-primary absolute right-3 bottom-0 left-3 h-0.5 rounded-full" />
            )}
          </button>
        )
      })}
    </div>
  )
}

const VISIBLE_FOLDER_LIMIT = 4

function FolderChipBar({
  folders,
  activeFolderId,
  countsByFolderId,
  totalCount,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
}: {
  folders: SavedQueryFolder[]
  activeFolderId: string
  countsByFolderId: Record<string, number>
  totalCount: number
  onSelectFolder: (folderId: string) => void
  onCreateFolder: (name: string) => void
  onDeleteFolder: (folderId: string) => void
}) {
  const [isCreating, setIsCreating] = useState(false)
  const [draftName, setDraftName] = useState('')

  const visibleFolders = folders.slice(0, VISIBLE_FOLDER_LIMIT)
  const overflowFolders = folders.slice(VISIBLE_FOLDER_LIMIT)

  function submitCreate() {
    const name = draftName.trim()
    setIsCreating(false)
    setDraftName('')
    if (name) onCreateFolder(name)
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <FolderChip
        label="All"
        icon={LayoutGrid}
        count={totalCount}
        isActive={activeFolderId === 'all'}
        onClick={() => onSelectFolder('all')}
      />

      {visibleFolders.map((folder) => (
        <FolderChip
          key={folder.id}
          label={folder.name}
          count={countsByFolderId[folder.id] ?? 0}
          isActive={activeFolderId === folder.id}
          onClick={() => onSelectFolder(folder.id)}
          onDelete={() => onDeleteFolder(folder.id)}
        />
      ))}

      {overflowFolders.length > 0 ? (
        <FolderOverflowMenu
          folders={overflowFolders}
          activeFolderId={activeFolderId}
          countsByFolderId={countsByFolderId}
          onSelectFolder={onSelectFolder}
          onCreateFolder={onCreateFolder}
          onDeleteFolder={onDeleteFolder}
        />
      ) : isCreating ? (
        <Input
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              submitCreate()
            }
            if (e.key === 'Escape') {
              setIsCreating(false)
              setDraftName('')
            }
          }}
          onBlur={submitCreate}
          placeholder="Folder name"
          className="h-7 w-32 text-xs"
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="flex shrink-0 items-center gap-1 rounded-full border border-dashed border-[#2A3242] px-2.5 py-1 text-xs text-[#828DA3] transition-colors hover:border-[#3A4356] hover:text-[#C5CDDB]"
        >
          <Plus className="h-3 w-3" />
          Folder
        </button>
      )}
    </div>
  )
}

function FolderOverflowMenu({
  folders,
  activeFolderId,
  countsByFolderId,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
}: {
  folders: SavedQueryFolder[]
  activeFolderId: string
  countsByFolderId: Record<string, number>
  onSelectFolder: (folderId: string) => void
  onCreateFolder: (name: string) => void
  onDeleteFolder: (folderId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [draftName, setDraftName] = useState('')

  const activeFolder = folders.find((folder) => folder.id === activeFolderId)

  function submitCreate() {
    const name = draftName.trim()
    setIsCreating(false)
    setDraftName('')
    if (name) onCreateFolder(name)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          setIsCreating(false)
          setDraftName('')
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors',
            activeFolder
              ? 'border-primary/40 bg-primary/15 text-[#F4F7FC]'
              : 'border-[#2A3242] bg-[#1A2030]/60 text-[#828DA3] hover:text-[#C5CDDB]'
          )}
        >
          <Folder className="h-3 w-3" />
          {activeFolder ? activeFolder.name : 'More'}
          {activeFolder && (
            <CountBadge
              count={countsByFolderId[activeFolder.id] ?? 0}
              isActive
            />
          )}
          <ChevronDown className="h-3 w-3" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-56 p-1.5">
        <div className="max-h-60 space-y-0.5 overflow-y-auto">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm hover:bg-[#1E2533]"
            >
              <button
                type="button"
                onClick={() => {
                  onSelectFolder(folder.id)
                  setOpen(false)
                }}
                className={cn(
                  'flex flex-1 items-center gap-2 text-left',
                  folder.id === activeFolderId
                    ? 'text-[#F4F7FC]'
                    : 'text-[#C5CDDB]'
                )}
              >
                <Folder className="h-3.5 w-3.5 text-[#828DA3]" />
                <span className="flex-1 truncate">{folder.name}</span>
                <span className="text-xs text-[#828DA3] tabular-nums">
                  {countsByFolderId[folder.id] ?? 0}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onDeleteFolder(folder.id)}
                aria-label={`Delete ${folder.name} folder`}
                className="hidden text-[#828DA3] group-hover:inline-flex hover:text-red-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-1 border-t border-[#2A3242] pt-1.5">
          {isCreating ? (
            <Input
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  submitCreate()
                }
                if (e.key === 'Escape') {
                  setIsCreating(false)
                  setDraftName('')
                }
              }}
              onBlur={submitCreate}
              placeholder="Folder name"
              className="h-7 text-xs"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-[#828DA3] hover:bg-[#1E2533] hover:text-[#C5CDDB]"
            >
              <Plus className="h-3.5 w-3.5" />
              New folder
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function CountBadge({ count, isActive }: { count: number; isActive: boolean }) {
  return (
    <span
      className={cn(
        'rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums',
        isActive
          ? 'bg-primary/20 text-primary-foreground'
          : 'bg-[#2A3242] text-[#828DA3]'
      )}
    >
      {count}
    </span>
  )
}

function FolderChip({
  label,
  icon = Folder,
  count,
  isActive,
  onClick,
  onDelete,
}: {
  label: string
  icon?: typeof Folder
  count: number
  isActive: boolean
  onClick: () => void
  onDelete?: () => void
}) {
  const Icon = icon

  return (
    <span
      className={cn(
        'group inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors',
        isActive
          ? 'border-primary/40 bg-primary/15 text-[#F4F7FC]'
          : 'border-[#2A3242] bg-[#1A2030]/60 text-[#828DA3] hover:text-[#C5CDDB]'
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-1.5"
      >
        <Icon className="h-3 w-3" />
        {label}
        <CountBadge count={count} isActive={isActive} />
      </button>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${label} folder`}
          className="hidden text-[#828DA3] group-hover:inline-flex hover:text-red-400"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  )
}

function QueryEmptyState({
  scope,
  onAdd,
  isFiltered,
}: {
  scope: SavedQueryScope
  onAdd: () => void
  isFiltered: boolean
}) {
  if (isFiltered) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-[16px] border border-dashed border-[#2A3242] bg-[#1A2030]/40 px-6 py-10 text-center">
        <Search className="h-10 w-10 text-[#828DA3]" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-[#F4F7FC]">
            No queries match your filters
          </p>
          <p className="max-w-md text-sm text-[#828DA3]">
            Try a different folder, search term, or tag.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-[16px] border border-dashed border-[#2A3242] bg-[#1A2030]/40 px-6 py-10 text-center">
      {scope === 'team' ? (
        <Users className="h-10 w-10 text-[#828DA3]" />
      ) : (
        <KeyRound className="h-10 w-10 text-[#828DA3]" />
      )}
      <div className="space-y-1">
        <p className="text-sm font-medium text-[#F4F7FC]">
          No {scope === 'team' ? 'team' : 'personal'} queries yet
        </p>
        <p className="max-w-md text-sm text-[#828DA3]">
          {scope === 'team'
            ? 'Queries you share here are visible to everyone in your organization.'
            : 'Save queries here for your own quick reference. Only you can see these.'}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-primary hover:text-primary mt-1 gap-1.5"
        onClick={onAdd}
      >
        Save your first query
      </Button>
    </div>
  )
}

const COLLAPSED_LINE_THRESHOLD = 8

function QueryCard({
  query,
  folderName,
  onCopy,
  onEdit,
  onDelete,
}: {
  query: SavedQuery
  folderName?: string
  onCopy: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const lineCount = query.queryText.split('\n').length
  const isLong = lineCount > COLLAPSED_LINE_THRESHOLD

  return (
    <article className="overflow-hidden rounded-[16px] border border-[#2A3242] bg-[#1A2030]/60 shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-[#2A3242] px-4 py-2.5">
        <div className="min-w-0">
          <h4 className="truncate text-sm font-medium text-[#F4F7FC]">
            {query.title}
          </h4>
          {query.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-[#828DA3]">
              {query.description}
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-[#828DA3]">
            {query.scope === 'team' && (
              <span className="inline-flex items-center gap-1">
                <ActorAvatar
                  actor={{
                    name: query.createdByName,
                    avatarUrl: query.createdByAvatarUrl,
                  }}
                  className="size-4"
                  title={false}
                />
                {query.createdByName ?? 'Unknown'}
              </span>
            )}
            <span>
              Updated{' '}
              {formatDistanceToNow(new Date(query.updatedAt), {
                addSuffix: true,
              })}
            </span>
            {folderName && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#2A3242] px-1.5 py-0.5 text-[#C5CDDB]">
                <Folder className="h-2.5 w-2.5" />
                {folderName}
              </span>
            )}
            {query.tags.map((tag) => (
              <span
                key={tag}
                className="border-primary/30 bg-primary/10 text-primary-foreground rounded-full border px-1.5 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-[#C5CDDB] hover:text-[#F4F7FC]"
            aria-label={`Copy ${query.title}`}
            onClick={onCopy}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-[#C5CDDB] hover:text-[#F4F7FC]"
            aria-label={`Edit ${query.title}`}
            onClick={onEdit}
          >
            <FiEdit3 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-400"
            aria-label={`Delete ${query.title}`}
            onClick={onDelete}
          >
            <HiOutlineTrash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden">
        <CodeMirrorRaw
          readOnly
          editable={false}
          value={query.queryText}
          maxHeight={expanded ? '480px' : '160px'}
        />
      </div>

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex w-full items-center justify-center gap-1 border-t border-[#2A3242] py-1.5 text-xs text-[#828DA3] transition-colors hover:text-[#C5CDDB]"
        >
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
          {expanded ? 'Show less' : `Show all ${lineCount} lines`}
        </button>
      )}
    </article>
  )
}

function SaveQueryModal({
  open,
  title,
  draft,
  folders,
  onDraftChange,
  onSave,
  onCancel,
}: {
  open: boolean
  title: string
  draft: SaveQueryInput
  folders: SavedQueryFolder[]
  onDraftChange: (draft: SaveQueryInput) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <BetterDialogProvider
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onCancel()
      }}
      className="[--width:42rem]"
    >
      <BetterDialogContent
        title={title}
        footerCancel
        footerSubmit="Save Query"
        onFooterSubmitClick={onSave}
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="save-query-title"
              className="text-sm font-medium text-[#D2D9E6]"
            >
              Title
            </Label>
            <Input
              id="save-query-title"
              value={draft.title}
              onChange={(e) =>
                onDraftChange({ ...draft, title: e.target.value })
              }
              placeholder="Query title"
              className="h-[48px] rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="save-query-description"
              className="text-sm font-medium text-[#D2D9E6]"
            >
              Description
            </Label>
            <Textarea
              id="save-query-description"
              value={draft.description}
              onChange={(e) =>
                onDraftChange({ ...draft, description: e.target.value })
              }
              placeholder="What is this query for? (optional)"
              className="min-h-24 resize-none rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4 py-3"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#D2D9E6]">Query</Label>
            <div className="overflow-hidden rounded-[12px] border border-[#2A3242]">
              <CodeMirrorRaw
                value={draft.queryText}
                minHeight="180px"
                maxHeight="280px"
                onChange={(value) =>
                  onDraftChange({ ...draft, queryText: value })
                }
                placeholder="Paste or write the query"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#D2D9E6]">
                Folder
              </Label>
              <Select
                value={draft.folderId ?? 'none'}
                onValueChange={(value) =>
                  onDraftChange({
                    ...draft,
                    folderId: value === 'none' ? null : value,
                  })
                }
              >
                <SelectTrigger className="h-[48px] w-full rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4">
                  <SelectValue placeholder="No folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No folder</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#D2D9E6]">Tags</Label>
              <TagsField
                tags={draft.tags}
                onChange={(tags) => onDraftChange({ ...draft, tags })}
              />
            </div>
          </div>
        </div>
      </BetterDialogContent>
    </BetterDialogProvider>
  )
}

function TagsField({
  tags,
  onChange,
}: {
  tags: string[]
  onChange: (tags: string[]) => void
}) {
  const [draftTag, setDraftTag] = useState('')

  function addTag() {
    const value = draftTag.trim()
    if (!value || tags.includes(value)) return
    onChange([...tags, value])
    setDraftTag('')
  }

  return (
    <div className="flex min-h-[48px] flex-wrap items-center gap-1.5 rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-3 py-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="bg-primary text-primary-foreground flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter((t) => t !== tag))}
            className="text-primary-foreground/80 hover:text-primary-foreground"
            aria-label={`Remove ${tag} tag`}
          >
            ×
          </button>
        </span>
      ))}
      <Input
        value={draftTag}
        onChange={(e) => setDraftTag(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            addTag()
          }
        }}
        onBlur={addTag}
        placeholder={tags.length === 0 ? 'Add tags (press Enter)' : ''}
        className="h-6 min-w-[100px] flex-1 border-0 bg-transparent p-0 text-sm shadow-none outline-none focus-visible:ring-0"
      />
    </div>
  )
}

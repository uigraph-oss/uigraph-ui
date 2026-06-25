'use client'

import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { BetterDialogProvider } from '@/components/better-dialog'
import { SuperCircleLoader } from '@/components/loader'
import { SectionLoader } from '@/components/section-loader'
import { SectionNotFound } from '@/components/section-not-found'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { Folder, FolderOpen, MoreHorizontal } from 'lucide-react'
import { useEffect, useState } from 'react'
import { IoArrowBack } from 'react-icons/io5'
import { toast } from 'sonner'
import { useFuse } from '../diagram-portal/hooks/use-fuse'
import { DashboardDiagram } from './api/diagrams'
import { DashboardFolder } from './api/folders'
import { ConfigureFolderModal } from './configure-folder-modal'
import { useDiagramsContext } from './contexts/diagrams-context'
import { FlowDiagramCard } from './flow-diagram-card'
import { getDragData } from './helpers/dnd-handler'

export function DiagramsFolder() {
  const organization = useCurrentOrganization()
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)

  const {
    folders,
    diagrams,
    totalCount,
    pageSize,
    page,
    setPage,
    isLoading,
    selectedFolder,
    parentFolder,
    selectedFolderId,
    setSelectedFolderId,
    selectedTeamId,
    setSelectedTeamId,
    sortBy,
    setSortBy,
    search,
    setSearch,
    teams,
    createFolder,
  } = useDiagramsContext()

  const filteredFolders = useFuse(folders, search, {
    keys: ['name'],
  })

  if (isLoading) {
    return <SectionLoader label="Loading folders..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search folders and flows"
          className="h-11 max-w-sm flex-1 rounded-[16px] border-[#2A3242] bg-transparent px-6 text-sm text-[#F4F7FC] shadow-none placeholder:text-[#586378] focus-visible:border-[#5C84FF]"
        />

        <Select
          value={selectedTeamId ?? '__all__'}
          onValueChange={(v) => setSelectedTeamId(v === '__all__' ? null : v)}
        >
          <SelectTrigger className="h-11 w-40 shrink-0 rounded-[16px] border-[#2A3242] bg-transparent px-6 text-sm text-[#D2D9E6] shadow-none">
            <SelectValue placeholder="All Teams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Teams</SelectItem>
            {teams.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="h-11 w-40 shrink-0 rounded-[16px] border-[#2A3242] bg-transparent px-6 text-sm text-[#D2D9E6] shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created">Newest</SelectItem>
            <SelectItem value="updated">Recently updated</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>

        {selectedFolderId && (
          <Button
            preset="outline"
            className="h-9 shrink-0 text-sm"
            onClick={() =>
              setSelectedFolderId(selectedFolder?.parentId ?? null)
            }
          >
            <IoArrowBack className="size-3.5" />
            {parentFolder?.name ?? 'All Flows'}
          </Button>
        )}
      </div>

      {Boolean(folders.length > 0 || selectedFolderId) && (
        <div className="space-y-3">
          <div className="folder-scroll-row flex items-center gap-3 overflow-x-auto pb-1">
            {!selectedFolderId && <AllFlowsCard diagramsCount={totalCount} />}
            {selectedFolderId && selectedFolder && (
              <AllFlowsCard
                diagramsCount={totalCount}
                folder={selectedFolder}
              />
            )}

            {filteredFolders.map((folder) => (
              <FolderChip key={folder.id} folder={folder} />
            ))}

            {!selectedFolderId && filteredFolders.length === 0 && search && (
              <span className="text-sm text-[#586378]">No folders found</span>
            )}
          </div>
        </div>
      )}

      <div>
        {diagrams.length > 0 ? (
          <DiagramGrid
            diagrams={diagrams}
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={setPage}
          />
        ) : (
          <SectionNotFound
            label={
              search || selectedTeamId
                ? 'No flows match your filters.'
                : selectedFolder
                  ? 'No diagrams in this folder yet.'
                  : 'No diagrams yet.'
            }
          />
        )}
      </div>

      <BetterDialogProvider
        open={isCreateFolderOpen}
        onOpenChange={setIsCreateFolderOpen}
        className="[--width:36rem]"
      >
        <ConfigureFolderModal
          mode="create"
          teams={teams}
          defaultTeamId={selectedTeamId}
          onSubmit={async (data) => {
            try {
              await createFolder({
                variables: {
                  orgId: organization.id,
                  input: {
                    name: data.name,
                    type: 'diagram',
                    parentId: selectedFolderId ?? undefined,
                    teamId: data.teamId,
                    order: 1,
                  },
                },
              })
              toast.success('Folder created')
              setIsCreateFolderOpen(false)
            } catch {
              toast.error('Failed to create folder')
            }
          }}
        />
      </BetterDialogProvider>
    </div>
  )
}

/** Returns up to 5 page indices (0-based) with '...' placeholders when needed. */
function getPageWindow(current: number, total: number): (number | '...')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i)

  const pages: (number | '...')[] = []

  pages.push(0)

  const windowStart = Math.max(1, current - 1)
  const windowEnd = Math.min(total - 2, current + 1)

  if (windowStart > 1) pages.push('...')

  for (let i = windowStart; i <= windowEnd; i++) pages.push(i)

  if (windowEnd < total - 2) pages.push('...')

  pages.push(total - 1)

  return pages
}

function DiagramGrid({
  diagrams,
  page,
  pageSize,
  totalCount,
  onPageChange,
}: {
  diagrams: DashboardDiagram[]
  page: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number) => void
}) {
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-4">
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
      >
        {diagrams.map((diagram) => (
          <FlowDiagramCard key={diagram.id} diagram={diagram} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            preset="outline"
            className="h-8 px-3 text-sm"
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {getPageWindow(page, totalPages).map((entry, i) =>
              entry === '...' ? (
                <span
                  key={`ellipsis-${i}`}
                  className="flex h-8 w-8 items-center justify-center text-sm text-[#586378]"
                >
                  …
                </span>
              ) : (
                <button
                  key={entry}
                  onClick={() => onPageChange(entry as number)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors',
                    entry === page
                      ? 'bg-primary text-white'
                      : 'text-[#828DA3] hover:bg-[#2A3242]'
                  )}
                >
                  {(entry as number) + 1}
                </button>
              )
            )}
          </div>

          <Button
            preset="outline"
            className="h-8 px-3 text-sm"
            disabled={page === totalPages - 1}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

/** The special "All Flows" primary card — visually distinct from regular folders */
function AllFlowsCard({
  diagramsCount,
  folder,
}: {
  diagramsCount: number
  folder?: DashboardFolder
}) {
  const organizationId = useCurrentOrganization().id
  const { setSelectedFolderId, updateDiagram } = useDiagramsContext()
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [isUpdatingDiagram, setIsUpdatingDiagram] = useState(false)

  useEffect(() => {
    if (!isDraggingOver) return
    function handleDragEnd() {
      setIsDraggingOver(false)
    }
    document.addEventListener('dragend', handleDragEnd)
    return () => document.removeEventListener('dragend', handleDragEnd)
  }, [isDraggingOver])

  async function handleDrop(diagramId: string) {
    try {
      setIsUpdatingDiagram(true)
      await updateDiagram({
        variables: {
          orgId: organizationId!,
          id: diagramId,
          input: { folderId: folder?.id },
        },
      })
      toast.success('Diagram moved')
    } catch {
      toast.error('Failed to move diagram')
    } finally {
      setIsUpdatingDiagram(false)
    }
  }

  return (
    <button
      type="button"
      disabled={isUpdatingDiagram}
      className={cn(
        'border-primary bg-primary/8 relative flex h-16 shrink-0 cursor-default items-center gap-3 rounded-2xl border-2 px-4 text-left transition-all',
        isDraggingOver && 'border-primary bg-primary/15 scale-[1.02]'
      )}
      onClick={() => setSelectedFolderId(folder?.id ?? null)}
      onDragLeave={() => setIsDraggingOver(false)}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDraggingOver(true)
      }}
      onDrop={(e) => {
        e.preventDefault()
        const diagramId = getDragData(e)
        if (!diagramId) return toast.error('Failed to move diagram')
        handleDrop(diagramId).catch(() => toast.error('Failed to move diagram'))
      }}
    >
      <div className="bg-primary flex size-9 shrink-0 items-center justify-center rounded-xl">
        {isUpdatingDiagram ? (
          <SuperCircleLoader className="size-5 text-white" />
        ) : (
          <FolderOpen strokeWidth={1.75} className="size-5 text-white" />
        )}
      </div>

      <div className="flex flex-col">
        <span className="text-primary text-sm font-semibold">
          {folder?.name ?? 'All Flows'}
        </span>
        <span className="text-primary/60 text-xs">
          {diagramsCount} {diagramsCount === 1 ? 'flow' : 'flows'}
        </span>
      </div>
    </button>
  )
}

/** Regular folder chip */
function FolderChip({ folder }: { folder: DashboardFolder }) {
  const organizationId = useCurrentOrganization().id
  const {
    selectedFolderId,
    setSelectedFolderId,
    updateDiagram,
    updateFolder,
    deleteFolder,
  } = useDiagramsContext()

  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [isUpdatingDiagram, setIsUpdatingDiagram] = useState(false)
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isSelected = selectedFolderId === folder.id

  useEffect(() => {
    if (!isDraggingOver) return
    function handleDragEnd() {
      setIsDraggingOver(false)
    }
    document.addEventListener('dragend', handleDragEnd)
    return () => document.removeEventListener('dragend', handleDragEnd)
  }, [isDraggingOver])

  async function handleDrop(diagramId: string) {
    try {
      setIsUpdatingDiagram(true)
      await updateDiagram({
        variables: {
          orgId: organizationId!,
          id: diagramId,
          input: { folderId: folder.id },
        },
      })
      toast.success('Diagram moved')
    } catch {
      toast.error('Failed to move diagram')
    } finally {
      setIsUpdatingDiagram(false)
    }
  }

  return (
    <>
      <div className="group relative shrink-0">
        <button
          type="button"
          disabled={isUpdatingDiagram}
          className={cn(
            'flex h-16 shrink-0 items-center gap-2 rounded-2xl border bg-[#141925] pr-8 pl-4 text-left text-sm font-semibold transition-all duration-150',
            isDraggingOver
              ? 'border-primary/50 ring-primary/20 ring-2'
              : isSelected
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-[#2A3242] bg-[#141925] text-[#D2D9E6] hover:border-[#3B4658] hover:bg-[#1E2533]'
          )}
          onClick={() => setSelectedFolderId(folder.id ?? null)}
          onDragLeave={() => setIsDraggingOver(false)}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDraggingOver(true)
          }}
          onDrop={(e) => {
            e.preventDefault()
            const diagramId = getDragData(e)
            if (!diagramId) return toast.error('Failed to move diagram')
            handleDrop(diagramId).catch(() =>
              toast.error('Failed to move diagram')
            )
          }}
        >
          {isUpdatingDiagram ? (
            <SuperCircleLoader className="size-4" />
          ) : (
            <Folder
              strokeWidth={1.5}
              className={cn(
                'size-4',
                isSelected ? 'text-primary' : 'text-[#999]'
              )}
            />
          )}
          <span className="max-w-[140px] truncate">{folder.name}</span>
        </button>

        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md transition-opacity',
                isMenuOpen
                  ? 'opacity-100'
                  : 'opacity-0 group-hover:opacity-100',
                isSelected
                  ? 'text-primary hover:bg-primary/10'
                  : 'text-[#586378] hover:bg-[#2A3242]'
              )}
            >
              <MoreHorizontal className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => setIsRenameOpen(true)}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setIsDeleteOpen(true)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <BetterDialogProvider
        open={isRenameOpen}
        onOpenChange={setIsRenameOpen}
        className="[--width:36rem]"
      >
        <ConfigureFolderModal
          mode="update"
          defaultValues={{ name: folder.name ?? '' }}
          onSubmit={async (data) => {
            try {
              await updateFolder({
                variables: {
                  orgId: organizationId!,
                  id: folder.id,
                  input: { name: data.name },
                },
              })
              toast.success('Folder renamed')
              setIsRenameOpen(false)
            } catch {
              toast.error('Failed to rename folder')
            }
          }}
        />
      </BetterDialogProvider>

      <BetterDeleteConfirmationModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete this folder?"
        description="The folder will be deleted. Flows inside it will not be deleted — they will become unorganised."
        onConfirm={async () => {
          await deleteFolder({
            variables: {
              orgId: organizationId!,
              id: folder.id,
            },
          })
          if (selectedFolderId === folder.id) {
            setSelectedFolderId(null)
          }
          toast.success('Folder deleted')
          setIsDeleteOpen(false)
        }}
      />
    </>
  )
}

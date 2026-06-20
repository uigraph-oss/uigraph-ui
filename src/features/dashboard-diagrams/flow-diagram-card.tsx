import { MoreVerticalIcon } from '@/assets/svgs'
import { ActorAvatar } from '@/components/actor-avatar'
import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { BetterDialogProvider } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { format } from 'date-fns'
import { Calendar } from 'lucide-react'
import { useState } from 'react'
import { LuCloudUpload } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { DashboardDiagram } from './api/diagrams'
import { ConfigureDiagramModal } from './configure-diagram-modal'
import { useDiagramsContext } from './contexts/diagrams-context'
import { DiagramMoveToFolderModal } from './diagram-move-to-folder-modal'
import { setDragData } from './helpers/dnd-handler'

type FlowDiagramCardProps = {
  diagram: DashboardDiagram
}

export function FlowDiagramCard({ diagram }: FlowDiagramCardProps) {
  const organizationId = useCurrentOrganization()?.id
  const { updateDiagram, deleteDiagram } = useDiagramsContext()

  const [moveToFolderOpen, setMoveToFolderOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const portalLink = diagram.id ? `/diagram/${diagram.id}` : '#'

  // Images with ratio < 1.4 (portrait or near-square) fill via cover+pan.
  // Only clearly wide/landscape images (ratio >= 1.4) use contain.
  const [isPortraitImage, setIsPortraitImage] = useState(true)
  const [imageError, setImageError] = useState(false)

  const previewSrc = diagram.previewImageUrl ?? undefined

  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth, naturalHeight } = e.currentTarget
    if (naturalHeight > 0) {
      setIsPortraitImage(naturalWidth / naturalHeight < 1.4)
    }
  }

  const updatedDate = diagram.updatedAt
    ? new Date(diagram.updatedAt)
    : diagram.createdAt
      ? new Date(diagram.createdAt)
      : null

  return (
    <div
      draggable
      className="group relative"
      onDragStart={(e) => setDragData(e, diagram.id ?? '')}
    >
      <Link
        target="_blank"
        to={portalLink}
        draggable={false}
        className="relative block cursor-pointer overflow-hidden rounded-[1.4525rem] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.07),0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-[#E2E4E6] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_0_3px_rgba(1,90,235,0.18),0_8px_24px_rgba(0,0,0,0.10)] hover:ring-2 hover:ring-[#015AEB]"
      >
        {/* Preview area — flush to card edges, clipped by overflow-hidden */}
        <div
          className={cn(
            'relative aspect-[16/10] w-full transition-colors duration-300',
            previewSrc ? 'bg-[#F5F6F8] group-hover:bg-white' : 'bg-[#EDEEF1]'
          )}
        >
          {previewSrc && !imageError ? (
            <img
              src={previewSrc}
              alt={diagram.name ?? ''}
              onLoad={handleImageLoad}
              onError={() => setImageError(true)}
              className={cn(
                'h-full w-full',
                isPortraitImage
                  ? 'object-cover object-top group-hover:object-bottom'
                  : 'object-contain'
              )}
              style={
                isPortraitImage
                  ? { transition: 'object-position 2.5s ease-in-out' }
                  : undefined
              }
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-full bg-white/70">
                <LuCloudUpload className="size-4 text-[#AAAAB0]" />
              </div>
              <span className="text-[11px] font-medium text-[#AAAAB0]">
                Publish to get preview
              </span>
            </div>
          )}
          {/* Bottom fade for smooth transition into content */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white/30 to-transparent" />
        </div>

        {/* Thin divider */}
        <div className="h-px bg-[#EBEBED]" />

        {/* Content */}
        <div className="px-4 py-3">
          <h4 className="line-clamp-1 text-sm font-semibold text-[#111111]">
            {diagram.name ? (
              diagram.name.charAt(0).toUpperCase() + diagram.name.slice(1)
            ) : (
              <span className="text-[#B0B0B2]">Blank Diagram</span>
            )}
          </h4>

          <div className="mt-2 flex min-h-[1.75rem] items-center justify-between gap-2">
            {updatedDate ? (
              <div className="flex min-w-0 items-center gap-1.5 text-[#B4B4B6]">
                <Calendar className="h-3 w-3 shrink-0" />
                <span className="text-[11px]">
                  {format(updatedDate, 'dd MMM yyyy')}
                </span>
              </div>
            ) : (
              <span />
            )}

            <ActorAvatar
              actor={diagram.updatedByActor ?? diagram.createdByActor}
              className="shrink-0"
            />
          </div>
        </div>
      </Link>

      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              'absolute top-2 right-2 h-7 w-7 rounded-lg bg-white/70 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-white',
              isDropdownOpen && 'opacity-100'
            )}
          >
            <MoreVerticalIcon className="h-3.5 w-3.5 text-[#555]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setRenameOpen(true)}>
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setMoveToFolderOpen(true)}>
            Move
          </DropdownMenuItem>

          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <BetterDialogProvider open={renameOpen} onOpenChange={setRenameOpen}>
        <ConfigureDiagramModal
          mode="update"
          open={renameOpen}
          defaultName={diagram.name ?? ''}
          onSubmit={async (data) => {
            if (!diagram.id) return

            try {
              await updateDiagram({
                variables: {
                  orgId: organizationId!,
                  id: diagram.id,
                  input: {
                    name: data.name,
                  },
                },
              })
              toast.success('Diagram updated')
              setRenameOpen(false)
            } catch (error) {
              console.error('Failed to update diagram:', error)
              toast.error('Failed to update diagram')
            }
          }}
        />
      </BetterDialogProvider>

      <BetterDeleteConfirmationModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Do you want to delete this flow diagram?"
        description="Deleting this flow diagram is a permanent action and cannot be undone. Please think carefully before proceeding."
        onConfirm={async () => {
          if (!diagram.id) return

          try {
            await deleteDiagram({
              variables: { orgId: organizationId!, id: diagram.id },
            })
            toast.success('Diagram deleted')
            setDeleteOpen(false)
          } catch (error) {
            console.error('Failed to delete diagram:', error)
            toast.error('Failed to delete diagram')
          }
        }}
      />

      <BetterDialogProvider
        open={moveToFolderOpen}
        onOpenChange={setMoveToFolderOpen}
      >
        <DiagramMoveToFolderModal
          diagramId={diagram.id ?? ''}
          onClose={() => setMoveToFolderOpen(false)}
        />
      </BetterDialogProvider>
    </div>
  )
}

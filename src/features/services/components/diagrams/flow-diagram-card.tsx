import { MoreVerticalIcon } from '@/assets/svgs'
import { ActorAvatar } from '@/components/actor-avatar'
import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { serviceDiagramToLegacyWithMeta } from '@/features/services/api/service-diagram'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation } from '@apollo/client'
import { format } from 'date-fns'
import { Calendar } from 'lucide-react'
import { useState } from 'react'
import { LuCloudUpload } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  DELETE_SERVICE_DIAGRAM,
  SERVICE_DIAGRAMS,
} from '../../api/service-diagram'
import { useServiceContext } from '../../contexts/service-context'

type ServiceDiagramWithMeta = ReturnType<typeof serviceDiagramToLegacyWithMeta>

export function FlowDiagramCard({
  diagram,
  serviceDiagram,
}: {
  diagram: NonNullable<ServiceDiagramWithMeta['diagram']>
  serviceDiagram: ServiceDiagramWithMeta['serviceDiagram']
}) {
  const { serviceId } = useServiceContext()
  const orgId = useCurrentOrganization().id

  const listVars = { orgId: orgId!, serviceId }

  const [deleteServiceDiagram] = useMutation(DELETE_SERVICE_DIAGRAM, {
    refetchQueries: [{ query: SERVICE_DIAGRAMS, variables: listVars }],
    awaitRefetchQueries: true,
  })

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false)
  const [isPortraitImage, setIsPortraitImage] = useState(true)
  const [imageError, setImageError] = useState(false)

  const previewSrc =
    'previewImageUrl' in diagram
      ? ((diagram.previewImageUrl as string | null | undefined) ?? undefined)
      : undefined

  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth, naturalHeight } = e.currentTarget
    if (naturalHeight > 0) {
      setIsPortraitImage(naturalWidth / naturalHeight < 1.4)
    }
  }

  const updatedDate = serviceDiagram.updatedAt
    ? new Date(serviceDiagram.updatedAt)
    : null

  const actor =
    ('updatedByActor' in diagram
      ? (diagram.updatedByActor as
          | { name?: string | null; avatarUrl?: string | null }
          | null
          | undefined)
      : undefined) ??
    ('createdByActor' in diagram
      ? (diagram.createdByActor as
          | { name?: string | null; avatarUrl?: string | null }
          | null
          | undefined)
      : undefined)

  return (
    <div className="group relative">
      <Link
        target="_blank"
        to={`/diagram/${diagram.diagramId}`}
        className="relative block cursor-pointer overflow-hidden rounded-[1.4525rem] bg-[#141925] shadow-[0_1px_3px_rgba(0,0,0,0.07),0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-[#2A3242] transition-all duration-300 hover:shadow-[0_0_0_3px_rgba(1,90,235,0.18),0_8px_24px_rgba(0,0,0,0.10)] hover:ring-2 hover:ring-[#015AEB]"
      >
        {/* Preview area */}
        <div
          className={cn(
            'relative aspect-[16/10] w-full transition-colors duration-300',
            diagram.previewImageFileId
              ? 'bg-[#1E2533] group-hover:bg-[#141925]'
              : 'bg-[#1E2533]'
          )}
        >
          {previewSrc && !imageError ? (
            <img
              src={previewSrc}
              alt={diagram.componentFlowDiagramName ?? ''}
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
              <div className="flex size-10 items-center justify-center rounded-full bg-[#2A3242]">
                <LuCloudUpload className="size-4 text-[#586378]" />
              </div>
              <span className="text-[11px] font-medium text-[#586378]">
                Publish to get preview
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        <div className="h-px bg-[#1E2533]" />

        <div className="px-4 py-3">
          <h4 className="line-clamp-1 text-sm font-semibold text-[#F4F7FC]">
            {diagram.componentFlowDiagramName ? (
              diagram.componentFlowDiagramName.charAt(0).toUpperCase() +
              diagram.componentFlowDiagramName.slice(1)
            ) : (
              <span className="text-[#B0B0B2]">Blank Diagram</span>
            )}
          </h4>

          <div className="mt-2 flex min-h-[1.75rem] items-center justify-between gap-2">
            {updatedDate ? (
              <div className="flex min-w-0 items-center gap-1.5 text-[#828DA3]">
                <Calendar className="h-3 w-3 shrink-0" />
                <span className="text-[11px]">
                  {format(updatedDate, 'dd MMM yyyy')}
                </span>
              </div>
            ) : (
              <span />
            )}

            <ActorAvatar actor={actor} className="shrink-0" />
          </div>
        </div>
      </Link>

      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              'absolute top-2 right-2 h-7 w-7 rounded-lg bg-[#1E2533]/80 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-[#141925]',
              isDropdownOpen && 'opacity-100'
            )}
          >
            <MoreVerticalIcon className="h-3.5 w-3.5 text-[#555]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setIsDeleteConfirmationOpen(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <BetterDeleteConfirmationModal
        open={isDeleteConfirmationOpen}
        onOpenChange={setIsDeleteConfirmationOpen}
        title="Do you want to delete this flow diagram?"
        description="Deleting this flow diagram is a permanent action and cannot be undone. Please think carefully before proceeding."
        onConfirm={async () => {
          try {
            await deleteServiceDiagram({
              variables: {
                orgId: orgId!,
                serviceId,
                diagramId: serviceDiagram.serviceDiagramDiagramId || '',
              },
            })
            setIsDeleteConfirmationOpen(false)
            toast.success('Flow diagram deleted successfully')
          } catch {
            toast.error('Failed to delete flow diagram')
          }
        }}
      />
    </div>
  )
}

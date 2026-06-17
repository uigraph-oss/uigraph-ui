import { clientV2 } from '@/api-v2/client'
import { Diagram, ServiceDiagram } from '@/api/.gql/graphql'
import { MoreVerticalIcon } from '@/assets/svgs'
import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  DELETE_SERVICE_DIAGRAM_V2,
  SERVICE_DIAGRAMS_V2,
} from '../../api/service-diagram-v2'
import { useServiceContext } from '../../contexts/service-context'

export function FlowDiagramCard({
  diagram,
  serviceDiagram,
}: {
  diagram: Diagram
  serviceDiagram: ServiceDiagram
}) {
  const { serviceId } = useServiceContext()
  const orgId = useCurrentOrganization().id

  const listVars = { orgId: orgId!, serviceId }

  const [deleteServiceDiagram] = useMutation(DELETE_SERVICE_DIAGRAM_V2, {
    client: clientV2,
    refetchQueries: [{ query: SERVICE_DIAGRAMS_V2, variables: listVars }],
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

  const creatorUrl = diagram.createdByProfileImgUrl?.trim()
  const actorProfileImageUrls = creatorUrl ? [creatorUrl] : []

  return (
    <div className="group relative">
      <Link
        target="_blank"
        to={`/diagram/${diagram.diagramId}`}
        className="relative block cursor-pointer overflow-hidden rounded-[1.4525rem] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.07),0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-[#E2E4E6] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_0_3px_rgba(1,90,235,0.18),0_8px_24px_rgba(0,0,0,0.10)] hover:ring-2 hover:ring-[#015AEB]"
      >
        {/* Preview area */}
        <div
          className={cn(
            'relative aspect-[16/10] w-full transition-colors duration-300',
            diagram.previewImageFileId
              ? 'bg-[#F5F6F8] group-hover:bg-white'
              : 'bg-[#EDEEF1]'
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
              <div className="flex size-10 items-center justify-center rounded-full bg-white/70">
                <LuCloudUpload className="size-4 text-[#AAAAB0]" />
              </div>
              <span className="text-[11px] font-medium text-[#AAAAB0]">
                Publish to get preview
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white/30 to-transparent" />
        </div>

        <div className="h-px bg-[#EBEBED]" />

        <div className="px-4 py-3">
          <h4 className="line-clamp-1 text-sm font-semibold text-[#111111]">
            {diagram.componentFlowDiagramName ? (
              diagram.componentFlowDiagramName.charAt(0).toUpperCase() +
              diagram.componentFlowDiagramName.slice(1)
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

            {actorProfileImageUrls.length > 0 && (
              <div className="flex shrink-0 items-center">
                {actorProfileImageUrls.map((url, i) => (
                  <Avatar
                    key={url}
                    className={cn(
                      'pointer-events-none size-7 border-2 border-white bg-[#F0F0F2] shadow-sm',
                      i > 0 && '-ml-2'
                    )}
                  >
                    <AvatarImage src={url} alt="" className="object-cover" />
                    <AvatarFallback className="text-[9px] font-medium text-[#A0A0A2]" />
                  </Avatar>
                ))}
              </div>
            )}
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

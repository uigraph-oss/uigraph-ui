import { GT } from '@/api'
import {
  CloudflareWorkerIcon,
  MoreVerticalIcon,
  OpenApiIcon,
  SwaggerIcon,
} from '@/assets/svgs'
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
import { formatDistanceToNow } from 'date-fns'
import { Network, Share2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ConfigureApiGroupModal } from './modals/configure-api-group-modal'

// Protocol → accent color
const PROTOCOL_COLORS: Record<
  string,
  { border: string; badge: string; text: string }
> = {
  rest: { border: '#2563EB', badge: '#EFF6FF', text: '#2563EB' },
  graphql: { border: '#DB2777', badge: '#FDF2F8', text: '#DB2777' },
  grpc: { border: '#0D9488', badge: '#F0FDFA', text: '#0D9488' },
  serverless: { border: '#EA580C', badge: '#FFF7ED', text: '#EA580C' },
}
const DEFAULT_PROTOCOL_COLOR = {
  border: '#94A3B8',
  badge: '#F8FAFC',
  text: '#64748B',
}

function getProtocolColor(protocol: string | null) {
  if (!protocol) return DEFAULT_PROTOCOL_COLOR
  return PROTOCOL_COLORS[protocol.toLowerCase()] ?? DEFAULT_PROTOCOL_COLOR
}

function getProtocolLabel(protocol: string) {
  if (protocol === 'grpc') return 'gRPC'
  if (protocol === 'graphql') return 'GraphQL'
  if (protocol === 'rest') return 'REST'
  if (protocol === 'serverless') return 'Serverless'
  return protocol.toUpperCase()
}

interface ServiceApiEndpointGroupCardProps {
  group: GT.ServiceApiGroup
  deleteGroup: () => Promise<unknown>
  updateGroup: (input: GT.UpdateServiceApiGroupInput) => Promise<unknown>
}

export function ServiceApiEndpointGroupCard({
  group,
  deleteGroup,
  updateGroup,
}: ServiceApiEndpointGroupCardProps) {
  const { serviceId } = useParams() as { serviceId: string }
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const availableFiles = useMemo(() => {
    const files: { icon: React.ReactNode; label: string }[] = []

    if (group.openApiSpecFileId) {
      files.push({
        icon: <OpenApiIcon className="h-3 w-3" />,
        label: 'OpenAPI',
      })
    }
    if (group.swaggerSpecFileId) {
      files.push({
        icon: <SwaggerIcon className="h-3 w-3" />,
        label: 'Swagger',
      })
    }
    if (group.graphqlSpecFileIds && group.graphqlSpecFileIds.length > 0) {
      files.push({
        icon: <Share2 className="h-3 w-3" />,
        label: `GraphQL${group.graphqlSpecFileIds.length > 1 ? ` (${group.graphqlSpecFileIds.length})` : ''}`,
      })
    }
    if (group.grpcSpecFileIds && group.grpcSpecFileIds.length > 0) {
      files.push({
        icon: <Network className="h-3 w-3" />,
        label: `gRPC${group.grpcSpecFileIds.length > 1 ? ` (${group.grpcSpecFileIds.length})` : ''}`,
      })
    }
    if (group.serverlessFunctionsFileId) {
      files.push({
        icon: <CloudflareWorkerIcon className="h-3 w-3" />,
        label: 'Serverless',
      })
    }

    return files
  }, [group])

  const protocol = useMemo(() => {
    // Use the protocol field if available, otherwise fall back to inferring from spec files
    if (group.protocol) {
      return group.protocol.toLowerCase()
    }
    // Fallback logic for backwards compatibility
    if (group.graphqlSpecFileIds && group.graphqlSpecFileIds.length > 0)
      return 'graphql'
    if (group.grpcSpecFileIds && group.grpcSpecFileIds.length > 0) return 'grpc'
    if (group.openApiSpecFileId || group.swaggerSpecFileId) return 'rest'
    return null
  }, [group])

  function handleCardClick() {
    navigate(`/services/${serviceId}/apis/${group.serviceApiGroupId}`)
  }

  const colors = getProtocolColor(protocol)

  return (
    <div className="group relative">
      <div
        onClick={handleCardClick}
        key={group.serviceApiGroupId}
        className="h-full cursor-pointer overflow-hidden rounded-[16px] bg-white ring-1 ring-[#E5E7E9] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_0_0_2px_rgba(37,99,235,0.2),0_6px_20px_rgba(0,0,0,0.08)] hover:ring-[#015AEB]"
      >
        <div className="p-5">
          <div className="mb-3 flex items-start justify-between gap-2 pr-6">
            <h3 className="text-[14px] leading-snug font-semibold tracking-tight text-[#0F172A]">
              {group.name ?? group.version ?? '—'}
            </h3>
            {protocol && (
              <span
                className="mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold"
                style={{ backgroundColor: colors.badge, color: colors.text }}
              >
                {getProtocolLabel(protocol)}
              </span>
            )}
          </div>

          {group.updatedAt && (
            <p className="text-[12px] text-[#94A3B8]">
              Updated{' '}
              {formatDistanceToNow(new Date(group.updatedAt), {
                addSuffix: true,
              })}
            </p>
          )}

          {availableFiles.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5 border-t border-[#F1F5F9] pt-3">
              {availableFiles.map((file) => (
                <div
                  key={file.label}
                  className="flex items-center gap-1 rounded-md bg-[#F8FAFC] px-2 py-1 ring-1 ring-[#E2E8F0]"
                >
                  {file.icon}
                  <span className="text-[11px] font-medium text-[#64748B]">
                    {file.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {!protocol && availableFiles.length === 0 && (
            <p className="mt-4 text-[12px] text-[#CBD5E1]">
              No files configured
            </p>
          )}
        </div>
      </div>

      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            preset="outline"
            className={cn(
              'absolute top-2 right-2 size-8 opacity-0 group-hover:opacity-100',
              isDropdownOpen && 'opacity-100'
            )}
          >
            <MoreVerticalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="bg-white">
          <DropdownMenuItem onClick={() => setIsUpdateModalOpen(true)}>
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setIsDeleteModalOpen(true)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <BetterDeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Do you want to delete this API group?"
        description="Deleting this API group is a permanent action and cannot be undone. Please think carefully before proceeding."
        onConfirm={async () => {
          await deleteGroup()
          toast.success('API group deleted successfully')
        }}
      />

      <BetterDialogProvider
        open={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
      >
        <ConfigureApiGroupModal
          mode="update"
          defaultValues={{
            name: group.name ?? group.version ?? '',
            openApiSpecFileId: group.openApiSpecFileId || undefined,
            swaggerSpecFileId: group.swaggerSpecFileId || undefined,
            graphqlSpecFileIds:
              group.graphqlSpecFileIds?.filter(
                (id): id is string => id != null
              ) || undefined,
            grpcSpecFileIds:
              group.grpcSpecFileIds?.filter((id): id is string => id != null) ||
              undefined,
          }}
          onSubmit={async (data) => {
            await updateGroup({
              serviceId: group.serviceId ?? '',
              name: data.name,
              openApiSpecFileId: data.openApiSpecFileId ?? undefined,
              swaggerSpecFileId: data.swaggerSpecFileId ?? undefined,
              graphqlSpecFileIds: data.graphqlSpecFileIds ?? undefined,
              grpcSpecFileIds: data.grpcSpecFileIds ?? undefined,
            })

            toast.success('API Group updated successfully')
            setIsUpdateModalOpen(false)
          }}
        />
      </BetterDialogProvider>
    </div>
  )
}

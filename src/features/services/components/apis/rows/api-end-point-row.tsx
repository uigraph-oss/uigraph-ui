'use client'

import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { BetterDialogProvider } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LegacyApiEndpoint,
  LegacyComponentMeta,
} from '@/features/services/api/api-v2-adapters'
import { useCurrentOrganization } from '@/store/auth-store'
import { MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useServiceApiEndpointsContext } from '../../../contexts/service-api-endpoints'
import { ViewApiEndpointModal } from '../modals/view-api-endpoint-modal'
import { ApiEndPointRowCore } from './api-end-point-row-core'

export function ApiEndPointRow({
  endpoint,
  componentMeta,
  readonly = false,
}: {
  endpoint: LegacyApiEndpoint
  componentMeta: LegacyComponentMeta
  readonly?: boolean
}) {
  const organizationId = useCurrentOrganization()?.id
  const { deleteServiceApiEndpoint } = useServiceApiEndpointsContext()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const [isViewOpen, setIsViewOpen] = useState(false)

  return (
    <ApiEndPointRowCore
      componentMeta={componentMeta}
      onViewOpen={() => setIsViewOpen(true)}
      actionsCell={
        !readonly && (
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0"
                aria-label="More actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#141925]">
              <DropdownMenuItem
                onClick={() => {
                  setIsDropdownOpen(false)
                  setIsViewOpen(true)
                }}
              >
                View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setIsDropdownOpen(false)
                  setIsDeleteModalOpen(true)
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
      additionalContent={
        <>
          <BetterDialogProvider open={isViewOpen} onOpenChange={setIsViewOpen}>
            <ViewApiEndpointModal
              endpoint={endpoint}
              componentMeta={componentMeta}
              readonly={readonly}
            />
          </BetterDialogProvider>

          <BetterDeleteConfirmationModal
            open={isDeleteModalOpen}
            onOpenChange={setIsDeleteModalOpen}
            title="Do you want to delete this API endpoint?"
            description="Deleting this API endpoint is a permanent action and cannot be undone. Please think carefully before proceeding."
            onConfirm={async () => {
              await deleteServiceApiEndpoint({
                variables: {
                  organizationId: organizationId,
                  apiEndpointId: endpoint.apiEndpointId ?? '',
                },
              })

              toast.success('API endpoint deleted successfully')
            }}
          />
        </>
      }
    />
  )
}

export function ApiEndPointRowReadonly({
  endpoint,
  componentMeta,
  onSelect,
}: {
  endpoint: LegacyApiEndpoint
  componentMeta: LegacyComponentMeta
  onSelect: (endpoint: LegacyApiEndpoint) => void
}) {
  return (
    <ApiEndPointRowCore
      componentMeta={componentMeta}
      onViewOpen={() => onSelect(endpoint)}
    />
  )
}

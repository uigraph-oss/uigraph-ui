'use client'

import { GT } from '@/api'
import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { GrpcMethodRowCore } from './grpc-method-row-core'

export type GrpcMethodItem = {
  apiEndpoint: GT.ApiEndpoint
  componentMeta: GT.ComponentMeta
}

export function GrpcMethodRow({
  method: methodData,
  selected = false,
  onSelect,
}: {
  method: GrpcMethodItem
  selected?: boolean
  onSelect?: () => void
}) {
  const componentMeta = methodData.componentMeta

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  return (
    <GrpcMethodRowCore
      componentMeta={componentMeta}
      selected={selected}
      onViewOpen={() => onSelect?.()}
      actionsCell={
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
          <DropdownMenuContent align="end" className="bg-white">
            <DropdownMenuItem
              onClick={() => {
                setIsDropdownOpen(false)
                onSelect?.()
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
      }
      additionalContent={
        <>
          <BetterDeleteConfirmationModal
            open={isDeleteModalOpen}
            onOpenChange={setIsDeleteModalOpen}
            title="Do you want to delete this gRPC method?"
            description="Deleting this method is a permanent action and cannot be undone. Please think carefully before proceeding."
            onConfirm={async () => {
              // TODO: Implement delete for gRPC methods
              toast.success('gRPC method deleted successfully')
            }}
          />
        </>
      }
    />
  )
}

export function GrpcMethodRowReadonly({
  method,
  componentMeta,
  onSelect,
}: {
  method: GrpcMethodItem
  componentMeta: GT.ComponentMeta
  onSelect: (method: GrpcMethodItem) => void
}) {
  return (
    <GrpcMethodRowCore
      componentMeta={componentMeta}
      onViewOpen={() => onSelect(method)}
    />
  )
}

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
import { GraphQLOperationRowCore } from './graphql-operation-row-core'

export type GraphQLOperationItem = {
  apiEndpoint: GT.ApiEndpoint
  componentMeta: GT.ComponentMeta
}

export function GraphQLOperationRow({
  operation: operationData,
  selected = false,
  onSelect,
}: {
  operation: GraphQLOperationItem
  selected?: boolean
  onSelect?: () => void
}) {
  const componentMeta = operationData.componentMeta

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  return (
    <GraphQLOperationRowCore
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
            title="Do you want to delete this GraphQL operation?"
            description="Deleting this operation is a permanent action and cannot be undone. Please think carefully before proceeding."
            onConfirm={async () => {
              // TODO: Implement delete for GraphQL operations
              toast.success('GraphQL operation deleted successfully')
            }}
          />
        </>
      }
    />
  )
}

export function GraphQLOperationRowReadonly({
  operation,
  componentMeta,
  onSelect,
}: {
  operation: GraphQLOperationItem
  componentMeta: GT.ComponentMeta
  onSelect: (operation: GraphQLOperationItem) => void
}) {
  return (
    <GraphQLOperationRowCore
      componentMeta={componentMeta}
      onViewOpen={() => onSelect(operation)}
    />
  )
}

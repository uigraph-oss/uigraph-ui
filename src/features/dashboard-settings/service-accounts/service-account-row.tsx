'use client'

import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { BetterDialogProvider } from '@/components/better-dialog'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { KeyRound, Pencil, Trash2 } from 'lucide-react'
import { Fragment, useState } from 'react'
import { toast } from 'sonner'
import {
  deleteServiceAccount,
  updateServiceAccount,
  type ServiceAccount,
} from './api'
import {
  ServiceAccountModal,
  type ServiceAccountFormValues,
} from './service-account-modal'
import { ServiceAccountTokensModal } from './service-account-tokens-modal'

const COLLAPSED_SCOPE_COUNT = 8

function ScopesCell({ scopes }: { scopes: string[] }) {
  const [expanded, setExpanded] = useState(false)

  if (scopes.length === 0) {
    return <span className="text-xs text-gray-400">No permissions</span>
  }

  const visibleScopes = expanded
    ? scopes
    : scopes.slice(0, COLLAPSED_SCOPE_COUNT)
  const hiddenCount = scopes.length - visibleScopes.length

  return (
    <div className="flex max-w-2xl flex-wrap items-center gap-1">
      {visibleScopes.map((scope) => (
        <Badge
          key={scope}
          variant="secondary"
          className="h-6 rounded-md border border-gray-200 bg-gray-50 px-2 font-mono text-xs font-medium text-gray-600"
        >
          {scope}
        </Badge>
      ))}
      {hiddenCount > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="h-6 rounded-md border border-blue-200 bg-blue-50 px-2 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
        >
          +{hiddenCount} more
        </button>
      )}
      {expanded && scopes.length > COLLAPSED_SCOPE_COUNT && (
        <button
          onClick={() => setExpanded(false)}
          className="h-6 rounded-md px-2 text-xs font-medium text-gray-500 transition-colors hover:text-gray-700"
        >
          Show less
        </button>
      )}
    </div>
  )
}

export function ServiceAccountRow({
  account,
  orgId,
  availableScopes,
  onChanged,
}: {
  account: ServiceAccount
  orgId: string
  availableScopes: string[]
  onChanged: () => Promise<void> | void
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [tokensOpen, setTokensOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  async function handleEdit(values: ServiceAccountFormValues) {
    try {
      await updateServiceAccount(orgId, account.id, {
        ...values,
        disabled: account.disabled,
      })
      setEditOpen(false)
      await onChanged()
      toast.success('Service account updated')
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  async function handleDelete() {
    try {
      await deleteServiceAccount(orgId, account.id)
      setDeleteOpen(false)
      await onChanged()
      toast.success('Service account deleted')
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <Fragment>
      <tr className="group border-b border-gray-100 transition-colors hover:bg-gray-50">
        <td className="w-56 px-6 py-4 align-top">
          <div className="font-medium break-words text-gray-700">
            {account.name}
          </div>
          {account.description && (
            <div className="mt-0.5 text-xs leading-snug text-gray-500">
              {account.description}
            </div>
          )}
        </td>
        <td className="px-6 py-4 align-top">
          <ScopesCell scopes={account.scopes} />
        </td>
        <td className="px-6 py-4 align-top">
          <Badge
            variant="secondary"
            className={
              account.disabled
                ? 'h-6 rounded-md border border-red-200 bg-red-50 px-2.5 text-xs font-medium text-red-700'
                : 'h-6 rounded-md border border-green-200 bg-green-50 px-2.5 text-xs font-medium text-green-700'
            }
          >
            {account.disabled ? 'Disabled' : 'Active'}
          </Badge>
        </td>
        <td className="w-32 px-6 py-4 align-top">
          <div className="flex items-center gap-[10px]">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="text-blue-600 transition-colors hover:text-blue-700"
                  onClick={() => setTokensOpen(true)}
                >
                  <KeyRound className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Manage Tokens</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="text-gray-600 transition-colors hover:text-gray-900"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="flex size-8 items-center justify-center rounded-md border border-red-200 text-red-600 transition-colors hover:border-red-300 hover:bg-red-50"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        </td>
      </tr>

      <BetterDialogProvider
        open={editOpen}
        onOpenChange={(open) => !open && setEditOpen(false)}
      >
        <ServiceAccountModal
          account={account}
          availableScopes={availableScopes}
          onSubmit={handleEdit}
        />
      </BetterDialogProvider>

      <BetterDialogProvider
        open={tokensOpen}
        onOpenChange={(open) => !open && setTokensOpen(false)}
      >
        <ServiceAccountTokensModal orgId={orgId} account={account} />
      </BetterDialogProvider>

      <BetterDeleteConfirmationModal
        open={deleteOpen}
        onOpenChange={(open) => !open && setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Service Account?"
        description="This permanently revokes all of its tokens. This action cannot be undone."
        deleteButtonText="Delete"
        cancelButtonText="Cancel"
      />
    </Fragment>
  )
}

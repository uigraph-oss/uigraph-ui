'use client'

import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { BetterDialogProvider } from '@/components/better-dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ChevronDown, KeyRound, Pencil, Trash2 } from 'lucide-react'
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

function groupScopesByResource(scopes: string[]) {
  const groups = new Map<string, string[]>()
  for (const scope of scopes) {
    const resource = scope.split(':')[0]
    const actions = groups.get(resource) ?? []
    actions.push(scope.split(':')[1] ?? scope)
    groups.set(resource, actions)
  }
  return [...groups.entries()]
}

function ScopesCell({ scopes }: { scopes: string[] }) {
  if (scopes.length === 0) {
    return <span className="text-xs text-gray-400">No permissions</span>
  }

  const groups = groupScopesByResource(scopes)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="inline-flex h-6 items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 text-xs font-medium whitespace-nowrap text-gray-600 transition-colors hover:bg-gray-100">
          {scopes.length} {scopes.length === 1 ? 'permission' : 'permissions'}
          <ChevronDown className="size-3.5 shrink-0 text-gray-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <div className="border-b border-gray-100 px-3 py-2 text-xs font-semibold text-gray-700">
          {scopes.length} permissions
        </div>
        <div className="max-h-72 space-y-3 overflow-y-auto p-3">
          {groups.map(([resource, actions]) => (
            <div key={resource} className="space-y-1.5">
              <p className="text-[0.6875rem] font-semibold tracking-wide text-gray-400 uppercase">
                {resource}
              </p>
              <div className="flex flex-wrap gap-1">
                {actions.map((action) => (
                  <span
                    key={action}
                    className="rounded-md bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-600"
                  >
                    {action}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
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
        <td className="w-48 px-6 py-4 align-top">
          <div className="font-medium break-words text-gray-700">
            {account.name}
          </div>
        </td>
        <td className="px-6 py-4 align-top">
          {account.description ? (
            <span className="text-sm leading-snug text-gray-500">
              {account.description}
            </span>
          ) : (
            <span className="text-sm text-gray-300">—</span>
          )}
        </td>
        <td className="w-40 px-6 py-4 align-top">
          <ScopesCell scopes={account.scopes} />
        </td>
        <td className="w-32 px-6 py-4 align-top">
          <div className="flex items-center justify-end gap-[10px]">
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

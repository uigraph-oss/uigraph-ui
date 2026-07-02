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
import { useMutation } from '@apollo/client'
import { ChevronDown, KeyRound, Pencil, Trash2 } from 'lucide-react'
import { Fragment, useState } from 'react'
import { toast } from 'sonner'
import {
  DELETE_SERVICE_ACCOUNT,
  SERVICE_ACCOUNTS,
  UPDATE_SERVICE_ACCOUNT,
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
    return <span className="text-xs text-[#586378]">No permissions</span>
  }

  const groups = groupScopesByResource(scopes)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="inline-flex h-7 items-center gap-1 rounded-md border border-[#2A3242] bg-[#1E2533] px-2 text-xs font-medium whitespace-nowrap text-[#A0AABB] transition-colors hover:bg-[#1E2533]">
          {scopes.length} {scopes.length === 1 ? 'Permission' : 'Permissions'}
          <ChevronDown className="size-3.5 shrink-0 text-[#586378]" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <div className="border-b border-[#2A3242] px-3 py-2 text-xs font-semibold text-[#D2D9E6]">
          {scopes.length} permissions
        </div>
        <div className="max-h-72 space-y-3 overflow-y-auto p-3">
          {groups.map(([resource, actions]) => (
            <div key={resource} className="space-y-1.5">
              <p className="text-[0.6875rem] font-semibold tracking-wide text-[#586378] uppercase">
                {resource}
              </p>
              <div className="flex flex-wrap gap-1">
                {actions.map((action) => (
                  <span
                    key={action}
                    className="rounded-md bg-[#2A3242] px-1.5 py-0.5 font-mono text-xs text-[#A0AABB]"
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
}: {
  account: ServiceAccount
  orgId: string
  availableScopes: string[]
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [tokensOpen, setTokensOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const refetchAccounts = {
    refetchQueries: [{ query: SERVICE_ACCOUNTS, variables: { orgId } }],
    awaitRefetchQueries: true,
  }
  const [updateServiceAccount] = useMutation(
    UPDATE_SERVICE_ACCOUNT,
    refetchAccounts
  )
  const [deleteServiceAccount] = useMutation(
    DELETE_SERVICE_ACCOUNT,
    refetchAccounts
  )

  async function handleEdit(values: ServiceAccountFormValues) {
    try {
      await updateServiceAccount({
        variables: {
          orgId,
          id: account.id,
          input: { ...values, disabled: account.disabled },
        },
      })
      setEditOpen(false)
      toast.success('Service account updated')
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  async function handleDelete() {
    try {
      await deleteServiceAccount({ variables: { orgId, id: account.id } })
      setDeleteOpen(false)
      toast.success('Service account deleted')
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  if (account.isInternal) {
    return (
      <tr className="border-b border-[#2A3242]">
        <td className="w-48 px-6 py-4 align-top">
          <div className="font-medium break-words text-[#D2D9E6]">
            {account.name}
          </div>
        </td>
        <td className="px-6 py-4 align-top">
          <span className="text-sm leading-snug text-[#828DA3]">
            This account is managed by UIGraph for its internal tasks and is
            read only.
          </span>
        </td>
        <td className="w-40 px-6 py-4 align-top">
          <ScopesCell scopes={account.scopes} />
        </td>
        <td className="w-32 px-6 py-4 align-top" />
      </tr>
    )
  }

  return (
    <Fragment>
      <tr className="group border-b border-[#2A3242] transition-colors hover:bg-[#1E2533]">
        <td className="w-48 px-6 py-4 align-top">
          <div className="font-medium break-words text-[#D2D9E6]">
            {account.name}
          </div>
        </td>
        <td className="px-6 py-4 align-top">
          {account.description ? (
            <span className="text-sm leading-snug text-[#828DA3]">
              {account.description}
            </span>
          ) : (
            <span className="text-sm text-[#586378]">—</span>
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
                  className="text-[#A0AABB] transition-colors hover:text-[#F4F7FC]"
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
                  className="flex size-8 items-center justify-center rounded-md border border-red-500/30 text-red-600 transition-colors hover:border-red-500/40 hover:bg-red-500/10"
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

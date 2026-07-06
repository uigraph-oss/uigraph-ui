'use client'

import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { BetterDialogProvider } from '@/components/better-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useMutation } from '@apollo/client'
import { Pencil, Trash2 } from 'lucide-react'
import { Fragment, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  DELETE_SERVICE_ACCOUNT,
  SERVICE_ACCOUNTS,
  UPDATE_SERVICE_ACCOUNT,
  type ServiceAccount,
} from './api'
import { ScopesCell } from './scopes-cell'
import {
  ServiceAccountModal,
  type ServiceAccountFormValues,
} from './service-account-modal'

export function ServiceAccountRow({
  account,
  orgId,
  availableScopes,
}: {
  account: ServiceAccount
  orgId: string
  availableScopes: string[]
}) {
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
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
      <tr
        className="group cursor-pointer border-b border-[#2A3242] transition-colors hover:bg-[#1E2533]"
        onClick={() => navigate(`/settings/service-accounts/${account.id}`)}
      >
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
                  className="text-[#A0AABB] transition-colors hover:text-[#F4F7FC]"
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditOpen(true)
                  }}
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
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteOpen(true)
                  }}
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

'use client'

import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { KeyRound, Pencil, Trash2 } from 'lucide-react'
import type { ServiceAccount } from './api'

export function ServiceAccountTable({
  accounts,
  onManageTokens,
  onEdit,
  onDelete,
}: {
  accounts: ServiceAccount[]
  onManageTokens: (account: ServiceAccount) => void
  onEdit: (account: ServiceAccount) => void
  onDelete: (account: ServiceAccount) => void
}) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-stock bg-background/50 border-b">
          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">
            Name
          </th>
          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">
            Permissions
          </th>
          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">
            Status
          </th>
          <th className="w-32 px-6 py-4 text-left text-xs font-medium text-gray-500">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {accounts.length === 0 && (
          <tr>
            <td colSpan={4} className="h-32 py-4 text-center text-gray-500">
              No service accounts found
            </td>
          </tr>
        )}
        {accounts.map((account) => (
          <tr
            key={account.id}
            className="group border-b border-gray-100 transition-colors hover:bg-gray-50"
          >
            <td className="px-6 py-4 align-middle">
              <div className="font-medium text-gray-700">{account.name}</div>
              {account.description && (
                <div className="text-xs text-gray-500">
                  {account.description}
                </div>
              )}
            </td>
            <td className="px-6 py-4 align-middle">
              {account.scopes.length === 0 ? (
                <span className="text-xs text-gray-400">No permissions</span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {account.scopes.map((scope) => (
                    <Badge
                      key={scope}
                      variant="secondary"
                      className="h-6 rounded-md border border-gray-200 bg-gray-50 px-2 text-xs font-medium text-gray-600"
                    >
                      {scope}
                    </Badge>
                  ))}
                </div>
              )}
            </td>
            <td className="px-6 py-4 align-middle">
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
            <td className="w-32 px-6 py-4 align-middle">
              <div className="flex items-center gap-[10px]">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="text-blue-600 transition-colors hover:text-blue-700"
                      onClick={() => onManageTokens(account)}
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
                      onClick={() => onEdit(account)}
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
                      onClick={() => onDelete(account)}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

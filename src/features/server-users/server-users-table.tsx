'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAuthStore } from '@/store/auth-store'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import type { ServerUser } from './api/server-users'

function getInitials(value: string | null | undefined): string {
  if (!value) return 'U'
  return value.charAt(0).toUpperCase()
}

function ServerUserRowActions({
  user,
  onEdit,
  onDelete,
}: {
  user: ServerUser
  onEdit: (user: ServerUser) => void
  onDelete: (user: ServerUser) => void
}) {
  const currentUser = useAuthStore((state) => state.user)
  const isSelf = user.email === currentUser?.email

  const actionsTrigger = (
    <div className="flex items-center gap-[10px]">
      <button
        disabled={isSelf}
        className="text-sm text-blue-600 transition-colors hover:text-blue-700 disabled:cursor-not-allowed disabled:text-gray-400"
        onClick={() => onEdit(user)}
      >
        Edit
      </button>
      <button
        disabled={isSelf}
        className="flex size-8 items-center justify-center rounded-md border border-red-200 text-red-600 transition-colors hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 disabled:hover:border-gray-200 disabled:hover:bg-transparent"
        onClick={() => onDelete(user)}
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  )

  if (isSelf) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{actionsTrigger}</TooltipTrigger>
        <TooltipContent>You cannot edit your own account</TooltipContent>
      </Tooltip>
    )
  }
  return actionsTrigger
}

const columnHelper = createColumnHelper<ServerUser>()

function buildColumns(
  onEdit: (user: ServerUser) => void,
  onDelete: (user: ServerUser) => void
) {
  return [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="bg-blue-100 text-xs font-medium text-blue-700">
              {getInitials(row.original.name || row.original.email)}
            </AvatarFallback>
          </Avatar>
          <span className="text-gray-700">{row.original.name}</span>
        </div>
      ),
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-700">{getValue()}</span>
      ),
    }),
    columnHelper.accessor('role', {
      header: 'Role',
      cell: ({ getValue }) => (
        <Badge
          variant="secondary"
          className="h-6 rounded-md border border-gray-200 bg-gray-50 px-2.5 text-xs font-medium text-gray-700"
        >
          {getValue() === 'server_admin' ? 'Server Admin' : 'User'}
        </Badge>
      ),
    }),
    columnHelper.accessor('disabled', {
      header: 'Status',
      cell: ({ getValue }) => {
        const disabled = getValue()
        if (disabled) {
          return (
            <Badge
              variant="secondary"
              className="h-6 rounded-md border border-gray-200 bg-gray-50 px-2.5 text-xs font-medium text-gray-700"
            >
              Disabled
            </Badge>
          )
        }
        return (
          <Badge
            variant="secondary"
            className="h-6 rounded-md border border-green-200 bg-green-50 px-2.5 text-xs font-medium text-green-700"
          >
            Active
          </Badge>
        )
      },
    }),
    columnHelper.display({
      id: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <ServerUserRowActions
          user={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    }),
  ]
}

export function ServerUsersTable({
  users,
  onEdit,
  onDelete,
}: {
  users: ServerUser[]
  onEdit: (user: ServerUser) => void
  onDelete: (user: ServerUser) => void
}) {
  const table = useReactTable({
    data: users,
    columns: buildColumns(onEdit, onDelete),
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <table className="w-full">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr
            key={headerGroup.id}
            className="border-stock bg-background/50 border-b"
          >
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                className="px-6 py-4 text-left text-xs font-medium tracking-tight text-gray-500"
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowCount() === 0 && (
          <tr>
            <td
              colSpan={table.getAllColumns().length}
              className="h-32 py-4 text-center"
            >
              No users found
            </td>
          </tr>
        )}

        {table.getRowModel().rows.map((row) => (
          <tr
            key={row.id}
            className="group border-b border-gray-100 transition-colors hover:bg-gray-50"
          >
            {row.getVisibleCells().map((cell) => {
              const cellClassName =
                cell.column.id === 'action' ? 'w-32 px-6 py-4' : 'px-6 py-4'
              return (
                <td key={cell.id} className={`${cellClassName} align-middle`}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

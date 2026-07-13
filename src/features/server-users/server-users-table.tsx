'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
        className="text-sm text-blue-600 transition-colors hover:text-blue-700 disabled:cursor-not-allowed disabled:text-[#586378]"
        onClick={() => onEdit(user)}
      >
        Edit
      </button>
      <button
        disabled={isSelf}
        className="flex size-8 items-center justify-center rounded-md border border-red-500/30 text-red-600 transition-colors hover:border-red-500/40 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:border-[#2A3242] disabled:text-[#586378] disabled:hover:border-[#2A3242] disabled:hover:bg-transparent"
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
            {row.original.avatarUrl && (
              <AvatarImage
                src={row.original.avatarUrl}
                alt={row.original.name || row.original.email}
              />
            )}
            <AvatarFallback className="bg-blue-500/20 text-xs font-medium text-blue-300">
              {getInitials(row.original.name || row.original.email)}
            </AvatarFallback>
          </Avatar>
          <span className="text-[#F4F7FC]">{row.original.name}</span>
        </div>
      ),
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: ({ getValue }) => (
        <span className="text-sm text-[#828DA3]">{getValue()}</span>
      ),
    }),
    columnHelper.accessor('role', {
      header: 'Role',
      cell: ({ getValue }) => (
        <Badge
          variant="secondary"
          className="h-6 rounded-md border border-[#2A3242] bg-[#1E2533] px-2.5 text-xs font-medium text-[#D2D9E6]"
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
              className="h-6 rounded-md border border-[#2A3242] bg-[#1E2533] px-2.5 text-xs font-medium text-[#D2D9E6]"
            >
              Disabled
            </Badge>
          )
        }
        return (
          <Badge
            variant="secondary"
            className="h-6 rounded-md border border-green-500/30 bg-green-500/10 px-2.5 text-xs font-medium text-green-400"
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
                className="px-6 py-4 text-left text-xs font-medium tracking-tight text-[#828DA3]"
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
            className="group border-b border-[#2A3242] transition-colors hover:bg-[#1E2533]"
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

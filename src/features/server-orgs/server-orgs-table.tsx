'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import type { ServerOrg } from './api/server-orgs'

function getInitials(value: string | null | undefined): string {
  if (!value) return 'O'
  return value.charAt(0).toUpperCase()
}

function ServerOrgRowActions({
  org,
  onEdit,
  onDelete,
}: {
  org: ServerOrg
  onEdit: (org: ServerOrg) => void
  onDelete: (org: ServerOrg) => void
}) {
  return (
    <div className="flex items-center gap-[10px]">
      <button
        className="text-sm text-blue-600 transition-colors hover:text-blue-700"
        onClick={() => onEdit(org)}
      >
        Edit
      </button>
      <button
        className="flex size-8 items-center justify-center rounded-md border border-red-500/30 text-red-600 transition-colors hover:border-red-500/40 hover:bg-red-500/10"
        onClick={() => onDelete(org)}
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  )
}

const columnHelper = createColumnHelper<ServerOrg>()

function buildColumns(
  onEdit: (org: ServerOrg) => void,
  onDelete: (org: ServerOrg) => void
) {
  return [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            {row.original.logoUrl && (
              <AvatarImage src={row.original.logoUrl} alt={row.original.name} />
            )}
            <AvatarFallback className="bg-blue-500/20 text-xs font-medium text-blue-300">
              {getInitials(row.original.name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-[#F4F7FC]">{row.original.name}</span>
        </div>
      ),
    }),
    columnHelper.accessor('autoJoin', {
      header: 'Auto Join',
      cell: ({ getValue }) => {
        if (getValue()) {
          return (
            <Badge
              variant="secondary"
              className="h-6 rounded-md border border-blue-500/30 bg-blue-500/10 px-2.5 text-xs font-medium text-blue-400"
            >
              Enabled
            </Badge>
          )
        }
        return (
          <Badge
            variant="secondary"
            className="h-6 rounded-md border border-[#2A3242] bg-[#1E2533] px-2.5 text-xs font-medium text-[#D2D9E6]"
          >
            Disabled
          </Badge>
        )
      },
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
        <ServerOrgRowActions
          org={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    }),
  ]
}

export function ServerOrgsTable({
  orgs,
  onEdit,
  onDelete,
}: {
  orgs: ServerOrg[]
  onEdit: (org: ServerOrg) => void
  onDelete: (org: ServerOrg) => void
}) {
  const table = useReactTable({
    data: orgs,
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
              No organizations found
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

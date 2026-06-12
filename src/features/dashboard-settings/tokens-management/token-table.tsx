'use client'

import { GT } from '@/api'
import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { BetterDialogProvider } from '@/components/better-dialog'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { RotateCcw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { RotateTokenModal } from './rotate-token-modal'

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

function formatFingerprint(fingerprint: string | null | undefined): string {
  if (!fingerprint) return '-'
  return fingerprint.length > 8 ? `...${fingerprint.slice(-6)}` : fingerprint
}

function TokenRowActions({
  token,
  onRevoke,
  onRotate,
}: {
  token: GT.TokenListItem
  onRevoke: (tokenId: string) => Promise<void>
  onRotate: (tokenId: string) => Promise<{ plaintext: string } | null>
}) {
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false)
  const [isRotateModalOpen, setIsRotateModalOpen] = useState(false)

  const isRevoked = token.revoked ?? false

  return (
    <>
      <div className="flex items-center gap-[10px]">
        {!isRevoked && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="text-sm text-blue-600 transition-colors hover:text-blue-700"
                  onClick={() => setIsRotateModalOpen(true)}
                >
                  <RotateCcw className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Rotate Token</TooltipContent>
            </Tooltip>
          </>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              disabled={isRevoked}
              className="flex size-8 items-center justify-center rounded-md border border-red-200 text-red-600 transition-colors hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 disabled:hover:border-gray-200 disabled:hover:bg-transparent"
              onClick={() => setIsRevokeModalOpen(true)}
            >
              <Trash2 className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {isRevoked ? 'Token already revoked' : 'Revoke Token'}
          </TooltipContent>
        </Tooltip>
      </div>

      <BetterDeleteConfirmationModal
        open={isRevokeModalOpen}
        onOpenChange={setIsRevokeModalOpen}
        onConfirm={async () => {
          await onRevoke(token.tokenId!)
          setIsRevokeModalOpen(false)
        }}
        title="Revoke API Token?"
        description="This action cannot be undone. The token will immediately stop working."
        deleteButtonText="Revoke Token"
        cancelButtonText="Cancel"
      />

      <BetterDialogProvider
        open={isRotateModalOpen}
        onOpenChange={setIsRotateModalOpen}
      >
        <RotateTokenModal
          token={token}
          onClose={() => setIsRotateModalOpen(false)}
          onRotate={onRotate}
        />
      </BetterDialogProvider>
    </>
  )
}

const columnHelper = createColumnHelper<GT.TokenListItem>()

const tokenColumns = [
  columnHelper.accessor('name', {
    header: 'Name',
    cell: ({ getValue }) => {
      const name = getValue()
      return <span className="font-medium text-gray-700">{name || '-'}</span>
    },
  }),
  columnHelper.accessor('fingerprint', {
    header: 'Fingerprint',
    cell: ({ getValue }) => {
      const fingerprint = getValue()
      return (
        <code className="rounded bg-gray-50 px-2 py-1 text-xs text-gray-600">
          {formatFingerprint(fingerprint)}
        </code>
      )
    },
  }),
  columnHelper.accessor('createdAt', {
    header: 'Created',
    cell: ({ getValue }) => {
      const createdAt = getValue()
      return (
        <span className="text-sm text-gray-600">{formatDate(createdAt)}</span>
      )
    },
  }),
  columnHelper.accessor('expiresAt', {
    header: 'Expires',
    cell: ({ getValue }) => {
      const expiresAt = getValue()
      return (
        <span className="text-sm text-gray-600">
          {expiresAt ? formatDate(expiresAt) : 'Never'}
        </span>
      )
    },
  }),
  columnHelper.accessor('lastUsedAt', {
    header: 'Last Used',
    cell: ({ getValue }) => {
      const lastUsedAt = getValue()
      return (
        <span className="text-sm text-gray-600">
          {lastUsedAt ? formatDate(lastUsedAt) : 'Never'}
        </span>
      )
    },
  }),
  columnHelper.accessor('revoked', {
    header: 'Status',
    cell: ({ getValue }) => {
      const revoked = getValue() ?? false
      return (
        <Badge
          variant="secondary"
          className={
            revoked
              ? 'h-6 rounded-md border border-red-200 bg-red-50 px-2.5 text-xs font-medium text-red-700'
              : 'h-6 rounded-md border border-green-200 bg-green-50 px-2.5 text-xs font-medium text-green-700'
          }
        >
          {revoked ? 'Revoked' : 'Active'}
        </Badge>
      )
    },
  }),
  columnHelper.display({
    id: 'action',
    header: 'Action',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onRevoke: (tokenId: string) => Promise<void>
        onRotate: (tokenId: string) => Promise<{ plaintext: string } | null>
      }
      return (
        <TokenRowActions
          token={row.original}
          onRevoke={meta.onRevoke}
          onRotate={meta.onRotate}
        />
      )
    },
  }),
]

export function TokenTable({
  tokens,
  onRevoke,
  onRotate,
}: {
  tokens: GT.TokenListItem[]
  onRevoke: (tokenId: string) => Promise<void>
  onRotate: (tokenId: string) => Promise<{ plaintext: string } | null>
}) {
  const table = useReactTable({
    data: tokens,
    columns: tokenColumns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      onRevoke,
      onRotate,
    },
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
              No tokens found
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

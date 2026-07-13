'use client'

import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { BetterDialogProvider } from '@/components/better-dialog'
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
import { useState } from 'react'
import { toast } from 'sonner'
import type { OrgMemberRow } from '../api/members'
import { useTeamContext } from '../context/team-context'
import { ConfigureTeamMemberModal } from './configure-team-member-modal'

function getInitials(value: string | null | undefined): string {
  if (!value) return 'U'
  const firstLetter = value.charAt(0).toUpperCase()
  return firstLetter
}

function UserRowActions({ user }: { user: OrgMemberRow }) {
  const currentUser = useAuthStore((state) => state.user)
  const { updateTeamMember, deleteTeamMember } = useTeamContext()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const actionsTrigger = (
    <div className="flex items-center gap-[10px]">
      <button
        disabled={user.email === currentUser?.email}
        className="text-sm text-blue-600 transition-colors hover:text-blue-700 disabled:cursor-not-allowed disabled:text-[#586378]"
        onClick={() => setIsEditModalOpen(true)}
      >
        Edit
      </button>
      <button
        disabled={user.email === currentUser?.email}
        className="flex size-8 items-center justify-center rounded-md border border-red-500/30 text-red-600 transition-colors hover:border-red-500/40 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:border-[#2A3242] disabled:text-[#586378] disabled:hover:border-[#2A3242] disabled:hover:bg-transparent"
        onClick={() => setIsDeleteModalOpen(true)}
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  )

  return (
    <>
      {user.email === currentUser?.email ? (
        <Tooltip>
          <TooltipTrigger asChild>{actionsTrigger}</TooltipTrigger>
          <TooltipContent>You cannot edit your own details</TooltipContent>
        </Tooltip>
      ) : (
        actionsTrigger
      )}

      <BetterDialogProvider
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      >
        <ConfigureTeamMemberModal
          mode="edit"
          defaultValues={{
            name: user.name ?? '',
            email: user.email ?? '',
            role: user.role ?? '',
            teamId: user.teamId ?? '',
          }}
          onSubmit={async (values) => {
            try {
              await updateTeamMember(user.userId, {
                name: values.name,
                email: values.email,
                role: values.role,
                teamId: values.teamId,
              })

              setIsEditModalOpen(false)
              toast.success('User updated successfully')
            } catch {
              toast.error('Failed to update user')
            }
          }}
        />
      </BetterDialogProvider>

      <BetterDeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={async () => {
          await deleteTeamMember(user.userId)
          setIsDeleteModalOpen(false)
        }}
        title="Do you want to delete this user?"
        description="Deleting a user removes their access permanently."
        deleteButtonText="Permanently Delete"
        cancelButtonText="Cancel"
      />
    </>
  )
}

const columnHelper = createColumnHelper<OrgMemberRow>()

const userColumns = [
  columnHelper.accessor('email', {
    header: 'User',
    cell: ({ row }) => {
      const { name, email, avatarUrl } = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={name || email} />}
            <AvatarFallback className="bg-blue-500/20 text-xs font-medium text-blue-300">
              {getInitials(name || email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            {name && (
              <span className="text-sm font-medium text-[#F4F7FC]">{name}</span>
            )}
            <span className="text-sm text-[#828DA3]">{email}</span>
          </div>
        </div>
      )
    },
  }),
  columnHelper.accessor('teamName', {
    header: 'Team',
    cell: ({ row }) => {
      const teamName = row.original.teamName
      const isEmpty = !teamName || teamName.trim() === ''
      return (
        <span
          className={`text-sm ${isEmpty ? 'text-[#586378]' : 'text-textPrimary'}`}
        >
          {teamName || '  -  '}
        </span>
      )
    },
  }),
  columnHelper.accessor('role', {
    header: 'Role',
    cell: ({ getValue }) => {
      const role = getValue()
      return (
        <Badge
          variant="secondary"
          className="h-6 rounded-md border border-[#2A3242] bg-[#1E2533] px-2.5 text-xs font-medium text-[#D2D9E6] capitalize"
        >
          {role}
        </Badge>
      )
    },
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue()
      const statusLower = status?.toLowerCase() || ''

      let badgeClassName = 'h-6 rounded-md px-2.5 text-xs font-medium'

      if (statusLower === 'active') {
        badgeClassName +=
          ' border border-green-500/30 bg-green-500/10 text-green-400'
      } else if (statusLower === 'pending') {
        badgeClassName +=
          ' border border-amber-500/30 bg-amber-500/10 text-amber-400'
      } else {
        badgeClassName += ' border border-[#2A3242] bg-[#1E2533] text-[#D2D9E6]'
      }

      return (
        <Badge variant="secondary" className={badgeClassName}>
          {status}
        </Badge>
      )
    },
  }),
  columnHelper.display({
    id: 'action',
    header: 'Action',
    cell: ({ row }) => <UserRowActions user={row.original} />,
  }),
]

export function UserTable({ users }: { users: OrgMemberRow[] }) {
  const table = useReactTable({
    data: users,
    columns: userColumns,
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

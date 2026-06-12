'use client'

import { GT } from '@/api'
import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { BetterDialogProvider } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'
import { FiChevronRight, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useTeamContext } from '../context/team-context'
import { ConfigureTeamModal } from './configure-team-modal'

const columnHelper = createColumnHelper<GT.TeamInfo>()

function TeamRowActions({ team }: { team: GT.TeamInfo }) {
  const navigate = useNavigate()
  const { deleteTeam, updateTeam } = useTeamContext()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between space-x-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-[68px] rounded-[8px] bg-[#20BFED33] px-2 text-xs hover:bg-[#20BFED33]"
          onClick={() => setIsEditModalOpen(true)}
        >
          <FiEdit2 />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-[82px] rounded-[8px] bg-[#E92A1933] px-2 text-xs hover:bg-[#E92A1933]"
          onClick={() => setIsDeleteModalOpen(true)}
        >
          <FiTrash2 />
          Delete
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate(`?team=${team.teamId}`)}
          className="flex h-8 items-center justify-center rounded-[8px] bg-[#F6F6F6] px-2 text-xs"
        >
          <FiChevronRight />
        </Button>
      </div>
      <BetterDialogProvider
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      >
        <ConfigureTeamModal
          mode="edit"
          defaultValues={{
            teamName: team.teamName ?? '',
            description: team.description ?? '',
          }}
          onSubmit={async (values) => {
            await updateTeam(team.teamId!, {
              teamName: values.teamName,
              description: values.description ?? '',
            })
            setIsEditModalOpen(false)
          }}
        />
      </BetterDialogProvider>
      <BetterDeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={async () => {
          await deleteTeam(team.teamId!)
        }}
        title="Do you want to delete this team?"
        description="Deleting a team removes all associated users and data permanently."
        deleteButtonText="Permanently Delete"
        cancelButtonText="Cancel"
      />
    </>
  )
}

const teamColumns = [
  columnHelper.accessor('teamName', {
    header: 'Name',
    cell: ({ getValue }) => (
      <div className="text-textPrimary text-sm leading-[1.33] font-normal">
        {getValue() ?? ''}
      </div>
    ),
  }),
  columnHelper.accessor('description', {
    header: 'Description',
    cell: ({ getValue }) => {
      const value = getValue() ?? ''
      const truncatedValue =
        value.slice(0, 40) + (value.length && value.length > 40 ? '...' : '')

      return (
        <div className="text-textPrimary text-sm leading-[1.33] font-normal">
          {truncatedValue}
        </div>
      )
    },
  }),
  columnHelper.display({
    id: 'members',
    header: 'Members',
    cell: ({ row }) => {
      const memberCount = row.original.memberCount ?? 0
      return (
        <div className="text-textPrimary text-sm leading-[1.33] font-normal">
          {memberCount}
        </div>
      )
    },
  }),
  columnHelper.display({
    id: 'action',
    header: 'Action',
    cell: ({ row }) => <TeamRowActions team={row.original} />,
  }),
]

export function TeamTable({ teams }: { teams: GT.TeamInfo[] }) {
  const table = useReactTable({
    data: teams,
    columns: teamColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <table className="w-full">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr
            key={headerGroup.id}
            className="text-paragraph border-stock bg-background/50 border-b"
          >
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                className="text-textSecondary px-6 py-4 text-left text-sm font-normal"
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
              No teams found
            </td>
          </tr>
        )}

        {table.getRowModel().rows.map((row) => (
          <tr
            key={row.id}
            className="group border-b border-gray-100 hover:bg-gray-50"
          >
            {row.getVisibleCells().map((cell) => {
              const cellClassName =
                cell.column.id === 'action' ? 'w-32 px-6 py-4' : 'px-6 py-4'

              return (
                <td key={cell.id} className={cellClassName}>
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

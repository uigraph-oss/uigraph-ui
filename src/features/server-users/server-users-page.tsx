'use client'

import { apolloClientGQL } from '@/api/client'
import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { BetterDialogProvider } from '@/components/better-dialog'
import { FunctionalPagination } from '@/components/common/functional-pagination'
import { SectionLoader } from '@/components/section-loader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ServerSectionHeader } from '@/features/server-dashboard/server-section-header'
import { useMutation, useQuery } from '@apollo/client'
import Fuse from 'fuse.js'
import { Plus, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  CREATE_SERVER_USER,
  DISABLE_SERVER_USER,
  SERVER_USERS,
  UPDATE_SERVER_USER,
  type ServerUser,
} from './api/server-users'
import { ConfigureServerUserModal } from './configure-server-user-modal'
import { ServerUsersTable } from './server-users-table'

export function ServerUsersPage() {
  const { data, loading, error } = useQuery(SERVER_USERS, {
    client: apolloClientGQL,
  })

  const refetchQueries = [{ query: SERVER_USERS }]

  const [createUser] = useMutation(CREATE_SERVER_USER, {
    client: apolloClientGQL,
    awaitRefetchQueries: true,
    refetchQueries,
  })
  const [updateUser] = useMutation(UPDATE_SERVER_USER, {
    client: apolloClientGQL,
    awaitRefetchQueries: true,
    refetchQueries,
  })
  const [disableUser] = useMutation(DISABLE_SERVER_USER, {
    client: apolloClientGQL,
    awaitRefetchQueries: true,
    refetchQueries,
  })

  const users = useMemo<ServerUser[]>(() => data?.users ?? [], [data])

  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState<ServerUser | null>(null)
  const [deleteUser, setDeleteUser] = useState<ServerUser | null>(null)

  useEffect(() => {
    if (error) {
      toast.error(error.message)
    }
  }, [error])

  const fuse = useMemo(
    () => new Fuse(users, { keys: ['name', 'email', 'role'] }),
    [users]
  )

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users
    return fuse.search(searchTerm.toLowerCase()).map((result) => result.item)
  }, [users, fuse, searchTerm])

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    return filteredUsers.slice(startIndex, startIndex + rowsPerPage)
  }, [filteredUsers, currentPage, rowsPerPage])

  useEffect(() => {
    setCurrentPage((prev) => {
      const maxPage = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage))
      return Math.min(prev, maxPage)
    })
  }, [filteredUsers.length, rowsPerPage])

  return (
    <>
      <ServerSectionHeader
        title="User Management"
        description="Manage all accounts on this server"
        cta={
          <Button
            className="h-11 rounded-[0.75rem] px-6 text-sm"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="mr-0.5 h-4 w-4" />
            Add User
          </Button>
        }
      />

      <div className="px-6 pt-4">
        <div className="space-y-6 rounded-[12px] border border-[#2A3242]">
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div className="relative max-w-[420px]">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-[#828DA3]" />
              <Input
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-11 w-full rounded-[12px] border-[#2A3242] bg-[#1E2533] pt-3 pb-3 pl-10"
              />
            </div>

            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <span>Show per page:</span>
              <Select
                value={String(rowsPerPage)}
                onValueChange={(value) => {
                  setRowsPerPage(Number(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="h-12 w-[120px] rounded-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 rows</SelectItem>
                  <SelectItem value="10">10 rows</SelectItem>
                  <SelectItem value="20">20 rows</SelectItem>
                  <SelectItem value="50">50 rows</SelectItem>
                  <SelectItem value="100">100 rows</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-stock overflow-x-auto border-t">
            {loading ? (
              <SectionLoader label="Loading users..." />
            ) : (
              <ServerUsersTable
                users={paginatedUsers}
                onEdit={setEditUser}
                onDelete={setDeleteUser}
              />
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between px-6">
        <div className="text-muted-foreground text-sm">
          Total{' '}
          <span className="font-medium text-[#F4F7FC]">{users.length}</span>{' '}
          users
        </div>

        <FunctionalPagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={Math.max(
            1,
            Math.ceil(filteredUsers.length / rowsPerPage)
          )}
        />
      </div>

      <BetterDialogProvider open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <ConfigureServerUserModal
          mode="create"
          onSubmit={async (values) => {
            try {
              await createUser({ variables: { input: values } })
              setIsCreateOpen(false)
              toast.success('User created successfully')
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : 'Failed to create user'
              )
            }
          }}
        />
      </BetterDialogProvider>

      <BetterDialogProvider
        open={editUser !== null}
        onOpenChange={(open) => {
          if (!open) setEditUser(null)
        }}
      >
        {editUser && (
          <ConfigureServerUserModal
            mode="edit"
            defaultValues={{
              name: editUser.name,
              email: editUser.email,
              role: editUser.role === 'server_admin' ? 'server_admin' : 'user',
              disabled: editUser.disabled,
            }}
            onSubmit={async (values) => {
              try {
                await updateUser({
                  variables: {
                    id: editUser.id,
                    input: {
                      name: values.name,
                      role: values.role,
                      disabled: values.disabled,
                    },
                  },
                })
                setEditUser(null)
                toast.success('User updated successfully')
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : 'Failed to update user'
                )
              }
            }}
          />
        )}
      </BetterDialogProvider>

      <BetterDeleteConfirmationModal
        open={deleteUser !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteUser(null)
        }}
        onConfirm={async () => {
          if (!deleteUser) return
          try {
            await disableUser({ variables: { id: deleteUser.id } })
            setDeleteUser(null)
            toast.success('User disabled')
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : 'Failed to disable user'
            )
          }
        }}
        title="Do you want to disable this user?"
        description="Disabling a user revokes their access to this server."
        deleteButtonText="Disable User"
        cancelButtonText="Cancel"
      />
    </>
  )
}

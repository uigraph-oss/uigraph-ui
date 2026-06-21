'use client'

import { clientV2 } from '@/api/client'
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
  CREATE_SERVER_ORG,
  DELETE_SERVER_ORG,
  removeServerOrgLogo,
  SERVER_ORGS,
  setServerOrgLogo,
  UPDATE_SERVER_ORG,
  type ServerOrg,
} from './api/server-orgs'
import { ConfigureServerOrgModal } from './configure-server-org-modal'
import { ServerOrgsTable } from './server-orgs-table'

export function ServerOrgsPage() {
  const { data, loading, error, refetch } = useQuery(SERVER_ORGS, {
    client: clientV2,
  })

  const refetchQueries = [{ query: SERVER_ORGS }]

  const [createOrg] = useMutation(CREATE_SERVER_ORG, {
    client: clientV2,
    awaitRefetchQueries: true,
    refetchQueries,
  })
  const [updateOrg] = useMutation(UPDATE_SERVER_ORG, {
    client: clientV2,
    awaitRefetchQueries: true,
    refetchQueries,
  })
  const [deleteOrg] = useMutation(DELETE_SERVER_ORG, {
    client: clientV2,
    awaitRefetchQueries: true,
    refetchQueries,
  })

  const orgs = useMemo<ServerOrg[]>(() => data?.serverOrgs ?? [], [data])

  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editOrg, setEditOrg] = useState<ServerOrg | null>(null)
  const [removeOrg, setRemoveOrg] = useState<ServerOrg | null>(null)

  useEffect(() => {
    if (error) {
      toast.error(error.message)
    }
  }, [error])

  const fuse = useMemo(() => new Fuse(orgs, { keys: ['name'] }), [orgs])

  const filteredOrgs = useMemo(() => {
    if (!searchTerm.trim()) return orgs
    return fuse.search(searchTerm.toLowerCase()).map((result) => result.item)
  }, [orgs, fuse, searchTerm])

  const paginatedOrgs = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    return filteredOrgs.slice(startIndex, startIndex + rowsPerPage)
  }, [filteredOrgs, currentPage, rowsPerPage])

  useEffect(() => {
    setCurrentPage((prev) => {
      const maxPage = Math.max(1, Math.ceil(filteredOrgs.length / rowsPerPage))
      return Math.min(prev, maxPage)
    })
  }, [filteredOrgs.length, rowsPerPage])

  return (
    <>
      <ServerSectionHeader
        title="Organization Management"
        description="Manage all organizations on this server"
        cta={
          <Button
            className="h-11 rounded-[0.75rem] px-6 text-sm"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="mr-0.5 h-4 w-4" />
            Add Organization
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
              <SectionLoader label="Loading organizations..." />
            ) : (
              <ServerOrgsTable
                orgs={paginatedOrgs}
                onEdit={setEditOrg}
                onDelete={setRemoveOrg}
              />
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between px-6">
        <div className="text-muted-foreground text-sm">
          Total{' '}
          <span className="font-medium text-[#F4F7FC]">{orgs.length}</span>{' '}
          organizations
        </div>

        <FunctionalPagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={Math.max(1, Math.ceil(filteredOrgs.length / rowsPerPage))}
        />
      </div>

      <BetterDialogProvider open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <ConfigureServerOrgModal
          mode="create"
          onSubmit={async (values) => {
            try {
              await createOrg({ variables: { input: values } })
              setIsCreateOpen(false)
              toast.success('Organization created successfully')
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? error.message
                  : 'Failed to create organization'
              )
            }
          }}
        />
      </BetterDialogProvider>

      <BetterDialogProvider
        open={editOrg !== null}
        onOpenChange={(open) => {
          if (!open) setEditOrg(null)
        }}
      >
        {editOrg && (
          <ConfigureServerOrgModal
            mode="edit"
            logoUrl={editOrg.logoUrl}
            defaultValues={{
              name: editOrg.name,
              autoJoin: editOrg.autoJoin,
              disabled: editOrg.disabled,
            }}
            onUploadLogo={async (file) => {
              await setServerOrgLogo(editOrg.id, file)
              const { data } = await refetch()
              const updated = data.serverOrgs.find((o) => o.id === editOrg.id)
              if (updated) setEditOrg(updated)
            }}
            onRemoveLogo={async () => {
              await removeServerOrgLogo(editOrg.id)
              const { data } = await refetch()
              const updated = data.serverOrgs.find((o) => o.id === editOrg.id)
              if (updated) setEditOrg(updated)
            }}
            onSubmit={async (values) => {
              try {
                await updateOrg({
                  variables: {
                    id: editOrg.id,
                    input: {
                      name: values.name,
                      autoJoin: values.autoJoin,
                      disabled: values.disabled,
                    },
                  },
                })
                setEditOrg(null)
                toast.success('Organization updated successfully')
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : 'Failed to update organization'
                )
              }
            }}
          />
        )}
      </BetterDialogProvider>

      <BetterDeleteConfirmationModal
        open={removeOrg !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveOrg(null)
        }}
        onConfirm={async () => {
          if (!removeOrg) return
          try {
            await deleteOrg({ variables: { id: removeOrg.id } })
            setRemoveOrg(null)
            toast.success('Organization deleted')
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : 'Failed to delete organization'
            )
          }
        }}
        title="Do you want to delete this organization?"
        description="Deleting an organization permanently removes it and all of its data."
        deleteButtonText="Delete Organization"
        cancelButtonText="Cancel"
      />
    </>
  )
}

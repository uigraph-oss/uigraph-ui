'use client'

import { clientV2 } from '@/api/client'
import { FunctionalPagination } from '@/components/common/functional-pagination'
import { SectionLoader } from '@/components/section-loader'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import Fuse from 'fuse.js'
import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { MEMBERS, type OrgMemberRow } from '../api/members'
import { SETTINGS_TEAMS } from '../api/teams'
import { UserTable } from './user-table'

export function UsersList({ teamId }: { teamId?: string }) {
  const organizationId = useCurrentOrganization()?.id

  const membersQuery = useQuery(MEMBERS, {
    client: clientV2,
    fetchPolicy: 'cache-first',
    variables: { orgId: organizationId! },
    skip: !organizationId,
  })

  const teamsQuery = useQuery(SETTINGS_TEAMS, {
    client: clientV2,
    fetchPolicy: 'cache-first',
    variables: { orgId: organizationId! },
    skip: !organizationId,
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)

  const isTeamMembersLoading = membersQuery.loading && !membersQuery.data

  const teamNameById = useMemo(() => {
    const map = new Map<string, string>()
    arrayNonNullable(teamsQuery.data?.teams).forEach((t) =>
      map.set(t.id, t.name)
    )
    return map
  }, [teamsQuery.data?.teams])

  const allMembers = useMemo<OrgMemberRow[]>(() => {
    return arrayNonNullable(membersQuery.data?.members).map((m) => ({
      userId: m.userId,
      email: m.email,
      name: m.name,
      role: m.role,
      status: 'Active',
      teamId: m.teamId,
      teamName: m.teamId ? (teamNameById.get(m.teamId) ?? null) : null,
    }))
  }, [membersQuery.data?.members, teamNameById])

  const usersFuse = useMemo(() => {
    const users = teamId
      ? allMembers.filter((m) => m.teamId === teamId)
      : allMembers

    const fuse = new Fuse(users, {
      keys: ['email', 'teamName', 'teamId'],
    })

    return { users, fuse }
  }, [teamId, allMembers])

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return usersFuse.users

    const term = searchTerm.toLowerCase()
    return usersFuse.fuse.search(term).map((result) => result.item)
  }, [usersFuse, searchTerm])

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    return filteredUsers.slice(startIndex, endIndex)
  }, [filteredUsers, currentPage, rowsPerPage])

  useEffect(() => {
    setCurrentPage((prev) => {
      const maxPage = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage))
      return Math.min(prev, maxPage)
    })
  }, [filteredUsers.length, rowsPerPage])

  return (
    <>
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
            {isTeamMembersLoading ? (
              <SectionLoader label="Loading users..." />
            ) : (
              <UserTable users={paginatedUsers} />
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between px-6">
        <div className="text-muted-foreground text-sm">
          Total{' '}
          <span className="font-medium text-[#F4F7FC]">
            {allMembers.length}
          </span>{' '}
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
    </>
  )
}

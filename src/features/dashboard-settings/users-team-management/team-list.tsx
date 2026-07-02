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
import Fuse from 'fuse.js'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTeamContext } from '../context/team-context'
import { TeamTable } from './team-table'

export function TeamList() {
  const { isTeamsLoading, teams } = useTeamContext()

  const [searchQuery, setSearchQuery] = useState('')
  const [showPerPage, setShowPerPage] = useState(5)
  const [selectedPage, setSelectedPage] = useState(1)

  const teamsFuse = useMemo(() => {
    return new Fuse(teams, {
      keys: ['teamName', 'description'],
    })
  }, [teams])

  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return teams
    return teamsFuse
      .search(searchQuery.toLowerCase())
      .map((result) => result.item)
  }, [teams, teamsFuse, searchQuery])

  const paginatedTeams = useMemo(() => {
    const startIndex = (selectedPage - 1) * showPerPage
    const endIndex = startIndex + showPerPage
    return filteredTeams.slice(startIndex, endIndex)
  }, [filteredTeams, selectedPage, showPerPage])

  return (
    <>
      <div className="px-6 pt-4">
        <div className="space-y-6 overflow-hidden rounded-[12px] border border-[#2A3242]">
          <div className="flex justify-between px-6 pt-6">
            <div className="relative w-80">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-[#586378]" />
              <Input
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 min-w-[440px] rounded-[12px] border-[#2A3242] bg-transparent pl-10"
              />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <span>Show per page:</span>
              <Select
                value={String(showPerPage)}
                onValueChange={(value) => {
                  setShowPerPage(Number(value))
                  setSelectedPage(1)
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
            {isTeamsLoading ? (
              <SectionLoader label="Loading teams..." />
            ) : (
              <TeamTable teams={paginatedTeams} />
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between px-6">
        <p className="text-sm text-[#828DA3]">
          Total <span className="font-medium">{filteredTeams.length}</span>{' '}
          users
        </p>

        <FunctionalPagination
          currentPage={selectedPage}
          setCurrentPage={setSelectedPage}
          totalPages={Math.ceil(filteredTeams.length / showPerPage)}
        />
      </div>
    </>
  )
}

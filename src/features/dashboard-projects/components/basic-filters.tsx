import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FILTER_OPTIONS } from '@/constants'
import type { DashboardTeam } from '@/features/dashboard-diagrams/api/teams'

interface BasicFilterInputProps {
  teams?: DashboardTeam[]
  selectedTeamId?: string | null
  setSelectedTeamId?: (teamId: string | null) => void

  sortBy: string
  setSortBy: (sortBy: string) => void
}

export function BasicFilterInput({
  teams = [],
  selectedTeamId,
  setSelectedTeamId,
  sortBy,
  setSortBy,
}: BasicFilterInputProps) {
  return (
    <div className="flex items-center space-x-4">
      {teams.length > 0 && (
        <Select
          value={selectedTeamId ?? '__all__'}
          onValueChange={(v) => setSelectedTeamId?.(v === '__all__' ? null : v)}
        >
          <SelectTrigger className="!h-[37.8789px] w-[130px] rounded-[35.4px] border-[1.18px] border-[#E5E7E9] bg-white px-4 py-[9.44px] text-sm font-normal text-[#6E6E6E] outline-none">
            <SelectValue placeholder="All Teams" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="__all__">All Teams</SelectItem>
            {teams.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select
        value={sortBy}
        onValueChange={(value) => setSortBy(value === 'none' ? '' : value)}
      >
        <SelectTrigger className="!h-[37.8789px] w-[114.19723510742188px] rounded-[35.4px] border-[1.18px] border-[#E5E7E9] bg-white px-4 py-[9.44px] text-sm font-normal text-[#6E6E6E] outline-none">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="none">Default</SelectItem>
          {FILTER_OPTIONS.SORT.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

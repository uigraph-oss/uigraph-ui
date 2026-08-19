import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SETTINGS_TEAMS } from '@/features/dashboard-settings/api/teams'
import { useQuery } from '@apollo/client'
import { Loader2, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../context/onboarding-context'

export function OnboardingTeamChip() {
  const navigate = useNavigate()
  const { orgID, progress, save } = useOnboarding()
  const teamID = progress.teamId ?? ''

  const teamsQuery = useQuery(SETTINGS_TEAMS, { variables: { orgId: orgID } })
  const teams = teamsQuery.data?.teams ?? []

  function pick(id: string) {
    void save({ teamId: id })
  }

  const isKnown = teams.some((team) => team.id === teamID)

  if (teamID === '' || (!teamsQuery.loading && !isKnown)) {
    return (
      <Dialog open>
        <DialogOverlay className="bg-transparent backdrop-blur-sm" />
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Pick a team</DialogTitle>
            <DialogDescription>Where this repo belongs.</DialogDescription>
          </DialogHeader>

          {teamsQuery.loading && (
            <p className="text-paragraph flex items-center gap-2 py-2 text-sm">
              <Loader2 className="size-4 animate-spin" /> Loading your teams
            </p>
          )}

          {!teamsQuery.loading && teams.length > 0 && (
            <div className="border-stock overflow-hidden rounded-xl border">
              <ul className="better-scrollbar divide-stock max-h-64 divide-y overflow-y-auto">
                {teams.map((team) => (
                  <li key={team.id}>
                    <button
                      type="button"
                      className="hover:bg-shading flex w-full items-center px-4 py-3 text-left text-sm transition"
                      onClick={() => pick(team.id)}
                    >
                      <span className="truncate">{team.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!teamsQuery.loading && teams.length === 0 && (
            <Button preset="primary" onClick={() => navigate('/get-started')}>
              Create a team
            </Button>
          )}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Select value={teamID} onValueChange={pick}>
      <SelectTrigger
        size="sm"
        className="border-stock text-paragraph hidden h-8 max-w-44 rounded-md font-mono text-[0.6875rem] lg:flex"
      >
        <Users className="size-3.5 shrink-0" />
        <SelectValue placeholder="Select team" />
      </SelectTrigger>
      <SelectContent>
        {teams.map((team) => (
          <SelectItem
            key={team.id}
            value={team.id}
            className="font-mono text-[0.6875rem]"
          >
            {team.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

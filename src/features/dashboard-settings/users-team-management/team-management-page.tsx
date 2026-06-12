'use client'

import { BetterDialogProvider } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SettingsHeader } from '../components/settings-header'
import { TeamContextProvider, useTeamContext } from '../context/team-context'
import { ConfigureTeamModal } from './configure-team-modal'
import { TeamDetails } from './team-details'
import { TeamList } from './team-list'
import { UsersList } from './users-list'

export function TeamManagementPage() {
  return (
    <TeamContextProvider>
      <TeamManagementContent />
    </TeamContextProvider>
  )
}

function TeamManagementContent() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const selectedTeamId = searchParams.get('team')

  const { teams, createTeam } = useTeamContext()
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false)

  const selectedTeam = useMemo(
    () => teams.find((team) => team.teamId === selectedTeamId),
    [teams, selectedTeamId]
  )

  if (selectedTeam) {
    return (
      <>
        <SettingsHeader
          title="Team Management"
          description="Manage teams and their members across your organization"
          cta={
            <Button
              className="h-11 rounded-[0.75rem] px-6 text-sm"
              onClick={() => navigate('?')}
            >
              Back to Teams
            </Button>
          }
        />

        <TeamDetails team={selectedTeam} />
        <UsersList teamId={selectedTeam.teamId ?? undefined} />
      </>
    )
  }

  return (
    <>
      <SettingsHeader
        title="Team Management"
        description="Manage teams and their members across your organization"
        cta={
          <Button
            className="h-11 rounded-[0.75rem] px-6 text-sm"
            onClick={() => setIsTeamModalOpen(true)}
          >
            <Plus className="mr-0.5 h-4 w-4" />
            Add Team
          </Button>
        }
      />

      <TeamList />

      <BetterDialogProvider
        open={isTeamModalOpen}
        onOpenChange={setIsTeamModalOpen}
      >
        <ConfigureTeamModal
          mode="create"
          onSubmit={async (values) => {
            await createTeam({
              teamName: values.teamName,
              description: values.description ?? '',
            })

            setIsTeamModalOpen(false)
          }}
        />
      </BetterDialogProvider>
    </>
  )
}

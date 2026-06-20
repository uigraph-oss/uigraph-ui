'use client'

'use client'

import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { BetterDialogProvider } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import type { SettingsTeam } from '../api/teams'
import { useTeamContext } from '../context/team-context'
import { ConfigureTeamModal } from './configure-team-modal'

export function TeamDetails({ team }: { team: SettingsTeam }) {
  const { deleteTeam, updateTeam } = useTeamContext()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  return (
    <section className="rounded-[12px] border border-[#E5E7E9] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm">Team overview</p>
        <h2 className="text-textPrimary text-2xl font-semibold">
          Team details
        </h2>
      </div>

      <article className="mt-6 flex flex-col gap-4 rounded-[16px] border border-[#E5E7E9] bg-[#FAFBFC] p-5">
        <div className="space-y-1">
          <p className="text-xs tracking-wide text-[#6B7480] uppercase">
            Team ID: {team.teamId}
          </p>
          <h3 className="text-textPrimary text-xl font-semibold">
            {team.teamName}
          </h3>
          <p className="text-textSecondary text-sm">
            {team.description || 'No description added yet.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-textPrimary text-sm font-medium">
            Members:{' '}
            <span className="text-[#6157FF]">{team.memberCount ?? 0}</span>
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditOpen(true)
              }}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setIsDeleteOpen(true)
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </article>

      <BetterDialogProvider open={isEditOpen} onOpenChange={setIsEditOpen}>
        <ConfigureTeamModal
          mode="edit"
          defaultValues={{
            teamName: team.teamName ?? '',
            description: team.description ?? '',
          }}
          onSubmit={async (values) => {
            await updateTeam(team.teamId, {
              teamName: values.teamName,
              description: values.description ?? '',
            })
            setIsEditOpen(false)
          }}
        />
      </BetterDialogProvider>

      <BetterDeleteConfirmationModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={async () => {
          await deleteTeam(team.teamId)
        }}
        title="Do you want to delete this team?"
        description="Deleting a team removes all associated users and data permanently."
      />
    </section>
  )
}

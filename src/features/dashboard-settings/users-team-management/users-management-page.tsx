'use client'

import { BetterDialogProvider } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import { SettingsHeader } from '../components/settings-header'
import { TeamContextProvider, useTeamContext } from '../context/team-context'
import { ConfigureTeamMemberModal } from './configure-team-member-modal'
import { UsersList } from './users-list'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

export function UsersManagementPage() {
  return (
    <TeamContextProvider>
      <UsersManagementContent />
    </TeamContextProvider>
  )
}

function UsersManagementContent() {
  const { createTeamMember } = useTeamContext()
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)

  return (
    <>
      <SettingsHeader
        title="User Management"
        description="Manage user accounts and permissions"
        cta={
          <Button
            className="h-11 rounded-[0.75rem] px-6 text-sm"
            onClick={() => setIsUserModalOpen(true)}
          >
            <Plus className="mr-0.5 h-4 w-4" />
            Add User
          </Button>
        }
      />

      <UsersList />

      <BetterDialogProvider
        open={isUserModalOpen}
        onOpenChange={setIsUserModalOpen}
      >
        <ConfigureTeamMemberModal
          mode="create"
          onSubmit={async (values) => {
            try {
              await createTeamMember({
                teamId: values.teamId,
                email: values.email,
                role: values.role,
              })

              setIsUserModalOpen(false)
              toast.success('User created successfully')
            } catch {
              toast.error('Failed to create user')
            }
          }}
        />
      </BetterDialogProvider>
    </>
  )
}

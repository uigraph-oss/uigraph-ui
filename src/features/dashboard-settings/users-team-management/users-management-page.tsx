'use client'

import { BetterDialogProvider } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import { env } from '@/env'
import { useAuthStore } from '@/store/auth-store'
import { ApolloError } from '@apollo/client'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { SettingsHeader } from '../components/settings-header'
import { TeamContextProvider, useTeamContext } from '../context/team-context'
import { ConfigureTeamMemberModal } from './configure-team-member-modal'
import { UsersList } from './users-list'

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
  const currentOrganizationId = useAuthStore(
    (state) => state.currentOrganizationId
  )

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
                name: values.name,
                email: values.email,
                password: values.password ?? '',
                role: values.role,
              })

              setIsUserModalOpen(false)
              toast.success('User added successfully')
            } catch (err) {
              const code =
                err instanceof ApolloError
                  ? err.graphQLErrors[0]?.extensions?.code
                  : undefined

              if (code === 'seat_limit_reached') {
                const message =
                  err instanceof ApolloError
                    ? err.graphQLErrors[0]?.message
                    : undefined
                const billingURL =
                  env.VITE_FEATURE_ENABLE_BILLING && env.VITE_BILLING_URL
                    ? env.VITE_BILLING_URL
                    : undefined
                toast.error(
                  message ?? 'Your organization has reached its seat limit.',
                  {
                    action: billingURL
                      ? {
                          label: 'Upgrade',
                          onClick: () => {
                            window.location.href = currentOrganizationId
                              ? `${billingURL}?orgId=${currentOrganizationId}`
                              : billingURL
                          },
                        }
                      : undefined,
                  }
                )
              } else {
                toast.error('Failed to add user')
              }
            }
          }}
        />
      </BetterDialogProvider>
    </>
  )
}

'use client'

import { clientV2 } from '@/api/client'
import { BetterDialogProvider } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { SettingsHeader } from '../components/settings-header'
import {
  CREATE_SERVICE_ACCOUNT,
  SERVICE_ACCOUNT_SCOPES,
  SERVICE_ACCOUNTS,
  type ServiceAccount,
} from './api'
import {
  ServiceAccountModal,
  type ServiceAccountFormValues,
} from './service-account-modal'
import { ServiceAccountTable } from './service-account-table'

export function ServiceAccountsPage() {
  const organizationId = useCurrentOrganization()?.id as string
  const [createOpen, setCreateOpen] = useState(false)

  const accountsQuery = useQuery(SERVICE_ACCOUNTS, {
    client: clientV2,
    variables: { orgId: organizationId },
    skip: !organizationId,
    onError: (error) => toast.error(error.message),
  })
  const scopesQuery = useQuery(SERVICE_ACCOUNT_SCOPES, {
    client: clientV2,
    variables: { orgId: organizationId },
    skip: !organizationId,
    onError: (error) => toast.error(error.message),
  })

  const [createServiceAccount] = useMutation(CREATE_SERVICE_ACCOUNT, {
    client: clientV2,
    refetchQueries: [
      { query: SERVICE_ACCOUNTS, variables: { orgId: organizationId } },
    ],
    awaitRefetchQueries: true,
  })

  const accounts = (accountsQuery.data?.serviceAccounts ??
    []) as ServiceAccount[]
  const scopes = scopesQuery.data?.serviceAccountScopes ?? []

  async function handleCreate(values: ServiceAccountFormValues) {
    try {
      await createServiceAccount({
        variables: { orgId: organizationId, input: values },
      })
      setCreateOpen(false)
      toast.success('Service account created')
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <>
      <SettingsHeader
        title="Service Accounts"
        description="Non-human identities for CI/CD and scripts, authenticated with scoped API tokens."
        cta={
          <Button
            className="h-11 rounded-[0.75rem] px-6 text-sm"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="mr-0.5 h-4 w-4" />
            Create Service Account
          </Button>
        }
      />

      <div className="px-6 pt-4">
        <div className="overflow-x-auto rounded-[12px] border border-[#2A3242]">
          {accountsQuery.loading && !accountsQuery.data ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Loading…
            </p>
          ) : (
            <ServiceAccountTable
              accounts={accounts}
              orgId={organizationId}
              availableScopes={scopes}
            />
          )}
        </div>
      </div>

      <BetterDialogProvider open={createOpen} onOpenChange={setCreateOpen}>
        {createOpen && (
          <ServiceAccountModal
            availableScopes={scopes}
            onSubmit={handleCreate}
          />
        )}
      </BetterDialogProvider>
    </>
  )
}

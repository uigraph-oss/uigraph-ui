'use client'

import { BetterDialogProvider } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import { useCurrentOrganization } from '@/store/auth-store'
import { Plus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { SettingsHeader } from '../components/settings-header'
import {
  createServiceAccount,
  listScopes,
  listServiceAccounts,
  type ServiceAccount,
} from './api'
import {
  ServiceAccountModal,
  type ServiceAccountFormValues,
} from './service-account-modal'
import { ServiceAccountTable } from './service-account-table'

export function ServiceAccountsPage() {
  const organizationId = useCurrentOrganization()?.id as string
  const [accounts, setAccounts] = useState<ServiceAccount[]>([])
  const [scopes, setScopes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const [createOpen, setCreateOpen] = useState(false)

  const refresh = useCallback(async () => {
    if (!organizationId) return
    try {
      const [sa, sc] = await Promise.all([
        listServiceAccounts(organizationId),
        listScopes(organizationId),
      ])
      setAccounts(sa)
      setScopes(sc)
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }, [organizationId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function handleCreate(values: ServiceAccountFormValues) {
    try {
      await createServiceAccount(organizationId, values)
      setCreateOpen(false)
      await refresh()
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
        <div className="overflow-x-auto rounded-[12px] border border-[#E5E7E9]">
          {loading ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Loading…
            </p>
          ) : (
            <ServiceAccountTable
              accounts={accounts}
              orgId={organizationId}
              availableScopes={scopes}
              onChanged={refresh}
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

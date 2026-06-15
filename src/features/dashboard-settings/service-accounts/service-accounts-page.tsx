'use client'

import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { BetterDialogProvider } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import { useCurrentOrganization } from '@/store/auth-store'
import { Plus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { SettingsHeader } from '../components/settings-header'
import {
  createServiceAccount,
  deleteServiceAccount,
  listScopes,
  listServiceAccounts,
  updateServiceAccount,
  type ServiceAccount,
} from './api'
import {
  ServiceAccountModal,
  type ServiceAccountFormValues,
} from './service-account-modal'
import { ServiceAccountTable } from './service-account-table'
import { ServiceAccountTokensModal } from './service-account-tokens-modal'

export function ServiceAccountsPage() {
  const organizationId = useCurrentOrganization()?.id as string
  const [accounts, setAccounts] = useState<ServiceAccount[]>([])
  const [scopes, setScopes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<ServiceAccount | null>(null)
  const [managingTokens, setManagingTokens] = useState<ServiceAccount | null>(
    null
  )
  const [deleting, setDeleting] = useState<ServiceAccount | null>(null)

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

  async function handleEdit(values: ServiceAccountFormValues) {
    if (!editing) return
    try {
      await updateServiceAccount(organizationId, editing.id, {
        ...values,
        disabled: editing.disabled,
      })
      setEditing(null)
      await refresh()
      toast.success('Service account updated')
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await deleteServiceAccount(organizationId, deleting.id)
      setDeleting(null)
      await refresh()
      toast.success('Service account deleted')
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
              onManageTokens={setManagingTokens}
              onEdit={setEditing}
              onDelete={setDeleting}
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

      <BetterDialogProvider
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        {editing && (
          <ServiceAccountModal
            account={editing}
            availableScopes={scopes}
            onSubmit={handleEdit}
          />
        )}
      </BetterDialogProvider>

      <BetterDialogProvider
        open={!!managingTokens}
        onOpenChange={(open) => !open && setManagingTokens(null)}
      >
        {managingTokens && (
          <ServiceAccountTokensModal
            orgId={organizationId}
            account={managingTokens}
          />
        )}
      </BetterDialogProvider>

      <BetterDeleteConfirmationModal
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Service Account?"
        description="This permanently revokes all of its tokens. This action cannot be undone."
        deleteButtonText="Delete"
        cancelButtonText="Cancel"
      />
    </>
  )
}

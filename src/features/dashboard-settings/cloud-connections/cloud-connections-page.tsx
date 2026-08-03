'use client'

import { BetterDialogProvider } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { SettingsHeader } from '../components/settings-header'
import {
  CLOUD_CONNECTIONS,
  CREATE_CLOUD_CONNECTION,
  DELETE_CLOUD_CONNECTION,
  TEST_CLOUD_CONNECTION,
} from './api'
import {
  CloudConnectionModal,
  type CloudConnectionFormValues,
} from './cloud-connection-modal'
import { CloudConnectionRow } from './cloud-connection-row'

export function CloudConnectionsPage() {
  const orgId = useCurrentOrganization()?.id as string
  const [createOpen, setCreateOpen] = useState(false)

  const listVars = { orgId }
  const connectionsQuery = useQuery(CLOUD_CONNECTIONS, {
    variables: listVars,
    skip: !orgId,
    onError: (error) => toast.error(error.message),
  })

  const [createConnection] = useMutation(CREATE_CLOUD_CONNECTION, {
    refetchQueries: [{ query: CLOUD_CONNECTIONS, variables: listVars }],
    awaitRefetchQueries: true,
  })
  const [testConnection] = useMutation(TEST_CLOUD_CONNECTION, {
    refetchQueries: [{ query: CLOUD_CONNECTIONS, variables: listVars }],
    awaitRefetchQueries: true,
  })
  const [deleteConnection] = useMutation(DELETE_CLOUD_CONNECTION, {
    refetchQueries: [{ query: CLOUD_CONNECTIONS, variables: listVars }],
    awaitRefetchQueries: true,
  })

  const connections = connectionsQuery.data?.cloudConnections ?? []

  async function handleCreate(values: CloudConnectionFormValues) {
    try {
      await createConnection({ variables: { orgId, input: values } })
      setCreateOpen(false)
      toast.success('Cloud account connected')
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  async function handleTest(connectionId: string) {
    try {
      const { data } = await testConnection({
        variables: { orgId, connectionId },
      })
      if (data?.testCloudConnection.ok) {
        toast.success('Connection verified')
      } else {
        toast.error(data?.testCloudConnection.error ?? 'Connection failed')
      }
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  async function handleDelete(connectionId: string) {
    try {
      await deleteConnection({ variables: { orgId, connectionId } })
      toast.success('Connection removed')
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <>
      <SettingsHeader
        title="Cloud Connections"
        description="Connect AWS, Azure, or GCP billing accounts so services can show real cloud spend, matched by resource tag."
        cta={
          <Button
            className="h-11 rounded-[0.75rem] px-6 text-sm"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="mr-0.5 h-4 w-4" />
            Connect Cloud Account
          </Button>
        }
      />

      <div className="px-6 pt-4">
        <div className="overflow-x-auto rounded-[12px] border border-[#2A3242]">
          {connectionsQuery.loading && !connectionsQuery.data ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Loading…
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-stock bg-background/50 border-b">
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#828DA3]">
                    Name
                  </th>
                  <th className="w-32 px-6 py-4 text-left text-xs font-medium text-[#828DA3]">
                    Provider
                  </th>
                  <th className="w-48 px-6 py-4 text-left text-xs font-medium text-[#828DA3]">
                    Status
                  </th>
                  <th className="w-40 px-6 py-4" />
                </tr>
              </thead>
              <tbody>
                {connections.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="h-32 py-4 text-center text-[#828DA3]"
                    >
                      No cloud accounts connected yet
                    </td>
                  </tr>
                )}
                {connections.map((connection) => (
                  <CloudConnectionRow
                    key={connection.id}
                    connection={connection}
                    onTest={handleTest}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <BetterDialogProvider open={createOpen} onOpenChange={setCreateOpen}>
        {createOpen && <CloudConnectionModal onSubmit={handleCreate} />}
      </BetterDialogProvider>
    </>
  )
}

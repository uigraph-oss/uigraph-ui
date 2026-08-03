'use client'

import type { GT } from '@/api'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'

type CloudConnectionRowData = Pick<
  GT.CloudConnection,
  | 'id'
  | 'provider'
  | 'displayName'
  | 'status'
  | 'statusMessage'
  | 'lastVerifiedAt'
>

const STATUS_STYLES: Record<GT.CloudConnectionStatus, string> = {
  CONNECTED: 'bg-success/10 text-success',
  PENDING: 'bg-muted/40 text-paragraph',
  ERROR: 'bg-destructive/10 text-destructive',
}

const PROVIDER_LABELS: Record<GT.CloudProvider, string> = {
  AWS: 'AWS',
  AZURE: 'Azure',
  GCP: 'GCP',
}

export function CloudConnectionRow({
  connection,
  onTest,
  onDelete,
}: {
  connection: CloudConnectionRowData
  onTest: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [testing, setTesting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  return (
    <tr className="border-stock border-b last:border-b-0">
      <td className="px-6 py-4 text-sm font-medium">
        {connection.displayName}
      </td>
      <td className="px-6 py-4 text-sm">
        {PROVIDER_LABELS[connection.provider]}
      </td>
      <td className="px-6 py-4">
        <span
          className={cn(
            'inline-flex w-fit items-center rounded-md px-2 py-0.5 text-xs font-medium',
            STATUS_STYLES[connection.status]
          )}
        >
          {connection.status.charAt(0) +
            connection.status.slice(1).toLowerCase()}
        </span>
        {connection.statusMessage && (
          <p className="text-paragraph mt-1 max-w-xs truncate text-xs">
            {connection.statusMessage}
          </p>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2">
          <Button
            preset="outline"
            className="h-8 px-3 text-xs"
            disabled={testing}
            onClick={async () => {
              setTesting(true)
              try {
                await onTest(connection.id)
              } finally {
                setTesting(false)
              }
            }}
          >
            {testing ? 'Testing…' : 'Test'}
          </Button>
          <Button
            preset="outline"
            className="text-destructive h-8 px-3 text-xs"
            disabled={deleting}
            onClick={async () => {
              setDeleting(true)
              try {
                await onDelete(connection.id)
              } finally {
                setDeleting(false)
              }
            }}
          >
            {deleting ? 'Removing…' : 'Remove'}
          </Button>
        </div>
      </td>
    </tr>
  )
}

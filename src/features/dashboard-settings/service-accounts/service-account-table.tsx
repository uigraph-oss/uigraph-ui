'use client'

import type { ServiceAccount } from './api'
import { ServiceAccountRow } from './service-account-row'

export function ServiceAccountTable({
  accounts,
  orgId,
  availableScopes,
  onChanged,
}: {
  accounts: ServiceAccount[]
  orgId: string
  availableScopes: string[]
  onChanged: () => Promise<void> | void
}) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-stock bg-background/50 border-b">
          <th className="w-56 px-6 py-4 text-left text-xs font-medium text-gray-500">
            Name
          </th>
          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">
            Permissions
          </th>
          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">
            Status
          </th>
          <th className="w-32 px-6 py-4 text-left text-xs font-medium text-gray-500">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {accounts.length === 0 && (
          <tr>
            <td colSpan={4} className="h-32 py-4 text-center text-gray-500">
              No service accounts found
            </td>
          </tr>
        )}
        {accounts.map((account) => (
          <ServiceAccountRow
            key={account.id}
            account={account}
            orgId={orgId}
            availableScopes={availableScopes}
            onChanged={onChanged}
          />
        ))}
      </tbody>
    </table>
  )
}

'use client'

import type { ServiceAccount } from './api'
import { ServiceAccountRow } from './service-account-row'

export function ServiceAccountTable({
  accounts,
  orgId,
  availableScopes,
}: {
  accounts: ServiceAccount[]
  orgId: string
  availableScopes: string[]
}) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-stock bg-background/50 border-b">
          <th className="w-48 px-6 py-4 text-left text-xs font-medium text-[#828DA3]">
            Name
          </th>
          <th className="px-6 py-4 text-left text-xs font-medium text-[#828DA3]">
            Description
          </th>
          <th className="w-40 px-6 py-4 text-left text-xs font-medium text-[#828DA3]">
            Permissions
          </th>
          <th className="w-32 px-6 py-4" />
        </tr>
      </thead>
      <tbody>
        {accounts.length === 0 && (
          <tr>
            <td colSpan={4} className="h-32 py-4 text-center text-[#828DA3]">
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
          />
        ))}
      </tbody>
    </table>
  )
}

'use client'

import { clientV2 } from '@/api/client'
import { SectionLoader } from '@/components/section-loader'
import { useQuery } from '@apollo/client'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { SERVER_OVERVIEW_V2 } from './api/server-overview-v2'
import { ServerSectionHeader } from './server-section-header'

export function ServerOverviewPage() {
  const { data, loading, error } = useQuery(SERVER_OVERVIEW_V2, {
    client: clientV2,
  })

  useEffect(() => {
    if (error) {
      toast.error(error.message)
    }
  }, [error])

  const overview = data?.serverOverview

  return (
    <>
      <ServerSectionHeader
        title="Server Overview"
        description="Instance-wide statistics"
      />

      {loading ? (
        <SectionLoader label="Loading overview..." />
      ) : (
        <div className="grid grid-cols-3 gap-4 px-6 py-6">
          <StatCard label="Total Users" value={overview?.totalUsers ?? 0} />
          <StatCard label="Active Users" value={overview?.activeUsers ?? 0} />
          <StatCard
            label="Total Organizations"
            value={overview?.totalOrgs ?? 0}
          />
        </div>
      )}
    </>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[12px] border border-[#E5E7E9] px-6 py-6">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-gray-800">{value}</p>
    </div>
  )
}

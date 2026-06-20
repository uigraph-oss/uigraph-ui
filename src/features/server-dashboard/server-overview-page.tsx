'use client'

import { SectionLoader } from '@/components/section-loader'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ServerSectionHeader } from './server-section-header'

type ServerOverview = {
  totalUsers: number
  activeUsers: number
  totalOrgs: number
}

async function fetchOverview(): Promise<ServerOverview> {
  const res = await fetch('/api/v1/server/overview', { credentials: 'include' })
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`)
  }
  return (await res.json()) as ServerOverview
}

export function ServerOverviewPage() {
  const [overview, setOverview] = useState<ServerOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetchOverview()
      .then((data) => {
        if (active) setOverview(data)
      })
      .catch((error: unknown) => {
        toast.error(
          error instanceof Error ? error.message : 'Failed to load overview'
        )
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <ServerSectionHeader
        title="Server Overview"
        description="Instance-wide statistics"
      />

      {isLoading ? (
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

'use client'

import { SectionLoader } from '@/components/section-loader'
import { useQuery } from '@apollo/client'
import { SERVER_OVERVIEW } from './api/server-overview'
import { ServerSectionHeader } from './server-section-header'

export function ServerOverviewPage() {
  const { data, loading } = useQuery(SERVER_OVERVIEW)

  const overview = data?.serverOverview
  const config = data?.serverConfig

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

      <div className="px-6 pb-6">
        <h2 className="mb-1 text-lg font-semibold text-[#F4F7FC]">
          Server Configuration
        </h2>
        <p className="mb-4 text-sm text-[#828DA3]">
          Active storage, vector, and embedding providers
        </p>

        {loading ? (
          <SectionLoader label="Loading configuration..." />
        ) : (
          <div className="rounded-[12px] border border-[#2A3242]">
            <ConfigRow
              label="Storage Provider"
              value={config?.storageBackend ?? '—'}
            />
            <ConfigRow
              label="Storage Bucket"
              value={config?.storageBucket ?? '—'}
            />
            <ConfigRow
              label="Storage Endpoint"
              value={config?.storageEndpoint || '—'}
            />
            <ConfigRow
              label="Vector Store"
              value={config?.vectorBackend ?? '—'}
            />
            <ConfigRow
              label="Embedding Provider"
              value={config?.embeddingBackend ?? '—'}
            />
            <ConfigRow
              label="Embedding Model"
              value={config?.embeddingModel ?? '—'}
              last
            />
          </div>
        )}
      </div>
    </>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[12px] border border-[#2A3242] px-6 py-6">
      <p className="text-sm font-medium text-[#828DA3]">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-[#F4F7FC]">{value}</p>
    </div>
  )
}

function ConfigRow({
  label,
  value,
  last,
}: {
  label: string
  value: string
  last?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between px-6 py-4 ${
        last ? '' : 'border-b border-[#2A3242]'
      }`}
    >
      <p className="text-sm font-medium text-[#828DA3]">{label}</p>
      <p className="text-sm font-medium text-[#F4F7FC]">{value}</p>
    </div>
  )
}

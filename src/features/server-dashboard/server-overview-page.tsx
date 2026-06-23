'use client'

import { graphqlEndpoint } from '@/api/client'
import { SectionLoader } from '@/components/section-loader'
import { env } from '@/env'
import { cn } from '@/lib/utils'
import { useQuery } from '@apollo/client'
import {
  Boxes,
  Building2,
  Cpu,
  Database,
  Globe,
  HardDrive,
  Monitor,
  Server,
  Sparkles,
  UserCheck,
  Users,
  Webhook,
} from 'lucide-react'
import { ReactNode } from 'react'
import { SERVER_OVERVIEW } from './api/server-overview'
import { ServerSectionHeader } from './server-section-header'

export function ServerOverviewPage() {
  const { data, loading } = useQuery(SERVER_OVERVIEW)

  const overview = data?.serverOverview
  const config = data?.serverConfig

  const origin =
    typeof window !== 'undefined' ? window.location.origin : env.clientOrigin
  const graphqlUrl = new URL(graphqlEndpoint, origin).href
  const apiUrl = new URL(graphqlEndpoint, origin).origin

  return (
    <>
      <ServerSectionHeader
        title="Server Overview"
        description="Usage stats and active service providers across your instance"
      />

      {loading ? (
        <SectionLoader label="Loading overview..." />
      ) : (
        <div className="grid grid-cols-3 gap-4 px-6 py-6">
          <StatCard
            icon={<Users className="size-4" />}
            label="Total Users"
            value={overview?.totalUsers ?? 0}
          />
          <StatCard
            icon={<UserCheck className="size-4" />}
            label="Active Users"
            value={overview?.activeUsers ?? 0}
          />
          <StatCard
            icon={<Building2 className="size-4" />}
            label="Total Organizations"
            value={overview?.totalOrgs ?? 0}
          />
        </div>
      )}

      <div className="px-6 pb-6">
        {loading ? (
          <SectionLoader label="Loading configuration..." />
        ) : (
          <div className="border-stock overflow-hidden rounded-[12px] border">
            <ConfigRow
              icon={<Monitor className="size-4" />}
              label="Frontend URL"
              value={env.clientOrigin}
            />
            <ConfigRow
              icon={<Server className="size-4" />}
              label="API URL"
              value={apiUrl}
            />
            <ConfigRow
              icon={<Webhook className="size-4" />}
              label="GraphQL Endpoint"
              value={graphqlUrl}
            />
            <ConfigRow
              icon={<Database className="size-4" />}
              label="Storage Provider"
              value={config?.storageBackend ?? '—'}
            />
            <ConfigRow
              icon={<HardDrive className="size-4" />}
              label="Storage Bucket"
              value={config?.storageBucket ?? '—'}
            />
            <ConfigRow
              icon={<Globe className="size-4" />}
              label="Storage Endpoint"
              value={config?.storageEndpoint || '—'}
            />
            <ConfigRow
              icon={<Boxes className="size-4" />}
              label="Vector Store"
              value={config?.vectorBackend ?? '—'}
            />
            <ConfigRow
              icon={<Sparkles className="size-4" />}
              label="Embedding Provider"
              value={config?.embeddingBackend ?? '—'}
            />
            <ConfigRow
              icon={<Cpu className="size-4" />}
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

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: number
}) {
  return (
    <div className="border-stock rounded-[12px] border px-6 py-6">
      <div className="text-paragraph flex items-center gap-2">
        {icon}
        <p className="text-sm font-medium">{label}</p>
      </div>
      <p className="text-foreground mt-3 text-3xl font-semibold tracking-tight">
        {value.toLocaleString()}
      </p>
    </div>
  )
}

function ConfigRow({
  icon,
  label,
  value,
  last,
}: {
  icon: ReactNode
  label: string
  value: string
  last?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 px-6 py-4',
        last ? '' : 'border-stock border-b'
      )}
    >
      <div className="text-paragraph flex shrink-0 items-center gap-3">
        {icon}
        <p className="text-sm font-medium">{label}</p>
      </div>
      <p
        className="text-foreground min-w-0 truncate font-mono text-sm"
        title={value}
      >
        {value}
      </p>
    </div>
  )
}

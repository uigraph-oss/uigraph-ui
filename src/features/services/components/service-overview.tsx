'use client'

import { Paths } from '@/constants'
import { TEAMS } from '@/features/dashboard-diagrams/api/teams'
import {
  SERVICE_DEPENDENCIES,
  type ServiceDependenciesData,
} from '@/features/services/api/dependencies'
import { useServiceContext } from '@/features/services/contexts/service-context'
import { normalizeRepoUrl } from '@/lib/git'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { format } from 'date-fns'
import { useMemo } from 'react'
import { FaGithub, FaJira, FaSlack } from 'react-icons/fa'
import { Link } from 'react-router-dom'

// Shared color logic — must match service-card.tsx
const CATEGORY_COLORS: Record<string, string> = {
  backend: '#2563EB',
  frontend: '#16A34A',
  mobile: '#0891B2',
  database: '#D97706',
  worker: '#7C3AED',
  messaging: '#DB2777',
  cache: '#EA580C',
  gateway: '#0369A1',
  infrastructure: '#64748B',
  library: '#059669',
  other: '#374151',
}
const AVATAR_COLORS = [
  '#2563EB',
  '#0D9488',
  '#7C3AED',
  '#D97706',
  '#DB2777',
  '#0891B2',
  '#16A34A',
  '#9333EA',
  '#EA580C',
  '#0369A1',
  '#7E22CE',
  '#065F46',
]
function getCategoryColor(c?: string | null) {
  return c ? (CATEGORY_COLORS[c.toLowerCase()] ?? '#94A3B8') : '#94A3B8'
}
function getAvatarColor(id: string) {
  let h = 5381
  for (let i = 0; i < id.length; i++)
    h = ((h << 5) + h + id.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}
function getMonogram(name: string) {
  const w = name.trim().split(/\s+/)
  return w.length >= 2
    ? `${w[0][0]}${w[1][0]}`.toUpperCase()
    : name.substring(0, 2).toUpperCase()
}

export function ServiceOverview() {
  const { service } = useServiceContext()
  const orgId = useCurrentOrganization().id

  const teamsRes = useQuery(TEAMS, {
    fetchPolicy: 'cache-first',
    variables: { orgId: orgId! },
    skip: !orgId,
  })
  const teams = useMemo(
    () => arrayNonNullable(teamsRes.data?.teams ?? []),
    [teamsRes.data?.teams]
  )
  const dependenciesRes = useQuery<ServiceDependenciesData>(
    SERVICE_DEPENDENCIES,
    {
      fetchPolicy: 'cache-first',
      variables: {
        orgId: orgId!,
        serviceId: service?.id ?? '',
        direction: null,
        criticality: null,
      },
      skip: !orgId || !service?.id,
    }
  )

  if (!service) return null

  const teamName = service.teamId
    ? (teams.find((t) => t.id === service.teamId)?.name ?? null)
    : null

  const bandColor = getCategoryColor(service.category)
  const avatarColor = getAvatarColor(service.id || service.name || '')
  const repoHref = normalizeRepoUrl(service.gitRepoUrl as string | undefined)

  const labels =
    (service.labels as string[] | null | undefined)?.filter(Boolean) ?? []
  const dependencies = dependenciesRes.data?.dependencies ?? []
  const upstreamDependencies = dependencies.filter(
    (dependency) => dependency.direction === 'upstream'
  )
  const downstreamDependencies = dependencies.filter(
    (dependency) => dependency.direction === 'downstream'
  )

  const integrations = [
    repoHref && {
      icon: <FaGithub className="size-4 text-[#F4F7FC]" />,
      label: 'Repository',
      sub: 'View on GitHub',
      href: repoHref,
    },
    service.jiraProjectUrl && {
      icon: <FaJira className="size-4 text-[#0052CC]" />,
      label: 'Jira Project',
      sub: 'View Project',
      href: service.jiraProjectUrl,
    },
    service.slackChannelUrl && {
      icon: <FaSlack className="size-4 text-[#4A154B]" />,
      label: 'Slack Channel',
      sub: 'View Channel',
      href: service.slackChannelUrl,
    },
  ].filter(Boolean) as {
    icon: React.ReactNode
    label: string
    sub: string
    href: string
  }[]

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-[#2A3242] bg-[#141925] p-6">
        {/* Service identity header */}
        <div className="mb-5 flex items-center gap-4">
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-xl text-[14px] font-bold tracking-wide"
            style={{ backgroundColor: `${avatarColor}18`, color: avatarColor }}
          >
            {getMonogram(service.name || '')}
          </div>
          <div className="min-w-0">
            <h2 className="text-[18px] font-semibold tracking-tight text-[#F4F7FC]">
              {service.name}
            </h2>
            {service.description && (
              <p className="mt-0.5 text-[13px] text-[#828DA3]">
                {service.description}
              </p>
            )}
          </div>
        </div>

        {/* Category + label chips */}
        {(service.category || labels.length > 0) && (
          <div className="mb-6 flex flex-wrap gap-1.5">
            {service.category && (
              <span
                className="inline-flex items-center rounded-md px-2.5 py-1 text-[12px] font-medium"
                style={{ backgroundColor: `${bandColor}14`, color: bandColor }}
              >
                {service.category}
              </span>
            )}
            {labels.map((label) => (
              <span
                key={label}
                className="inline-flex items-center rounded-md bg-[#1E2533] px-2.5 py-1 text-[12px] font-medium text-[#D2D9E6]"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Metadata row */}
        <div className="grid grid-cols-2 gap-y-5 border-t border-[#2A3242] pt-5 sm:grid-cols-4">
          {[
            {
              label: 'Created',
              value: service.createdAt
                ? format(new Date(service.createdAt), 'MMM d, yyyy')
                : '—',
            },
            {
              label: 'Updated',
              value: service.updatedAt
                ? format(new Date(service.updatedAt), 'MMM d, yyyy')
                : '—',
            },
            {
              label: 'Last Commit',
              value: service.lastCommitSha
                ? service.lastCommitSha.slice(0, 7)
                : '—',
              mono: true,
            },
            { label: 'Team', value: teamName ?? '—' },
          ].map(({ label, value, mono }) => (
            <div key={label}>
              <p className="mb-1 text-[10px] font-semibold tracking-widest text-[#828DA3] uppercase">
                {label}
              </p>
              <p
                className={cn(
                  'text-[13px] font-medium text-[#F4F7FC]',
                  mono && 'font-mono'
                )}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-[#2A3242] pt-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-[13px] font-semibold text-[#F4F7FC]">
                Service dependencies
              </h4>
              <p className="mt-0.5 text-[11px] text-[#828DA3]">
                Declared in .uigraph.yaml, validated against synced specs
              </p>
            </div>
            <Link
              to={Paths.services.graph}
              className="shrink-0 text-[12px] font-medium text-[#5B9DF9] hover:text-[#7DB2FB]"
            >
              View full graph →
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              {
                heading: `↑ Upstream · depends on (${upstreamDependencies.length})`,
                dependencies: upstreamDependencies,
              },
              {
                heading: `↓ Downstream · depended on by (${downstreamDependencies.length})`,
                dependencies: downstreamDependencies,
              },
            ].map((summary) => (
              <Link
                key={summary.heading}
                to={Paths.services.dependencies(service.id)}
                className="rounded-xl border border-[#2A3242] bg-[#1E2533] px-4 py-3 transition-colors hover:border-[#3B4658] hover:bg-[#252E3E]"
              >
                <span className="text-[12px] font-semibold text-[#D2D9E6]">
                  {summary.heading}
                </span>
                {dependenciesRes.loading ? (
                  <p className="mt-2 text-[11px] text-[#828DA3]">Loading…</p>
                ) : summary.dependencies.length === 0 ? (
                  <p className="mt-2 text-[11px] text-[#828DA3]">
                    No dependencies
                  </p>
                ) : (
                  summary.dependencies.map((dependency) => (
                    <div
                      key={dependency.id}
                      className="mt-2 flex items-center justify-between gap-2 text-[12px]"
                    >
                      <span className="truncate text-[#F4F7FC]">
                        {dependency.direction === 'upstream'
                          ? (dependency.providerService?.name ??
                            dependency.providerName ??
                            dependency.name)
                          : (dependency.consumerService?.name ??
                            dependency.name)}
                      </span>
                      <span
                        className={cn(
                          'shrink-0 rounded-md px-2 py-0.5 text-[11px] capitalize',
                          dependency.criticality === 'hard'
                            ? 'bg-[#3A1D1D] text-[#F29B9B]'
                            : 'bg-[#232B3A] text-[#9AA6BC]'
                        )}
                      >
                        {dependency.criticality} · {dependency.type}
                      </span>
                    </div>
                  ))
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Integrations */}
        {integrations.length > 0 && (
          <>
            <h4 className="mt-6 mb-3 text-[13px] font-semibold text-[#F4F7FC]">
              Integrations
            </h4>
            <div
              className={cn(
                'grid gap-3',
                integrations.length === 1
                  ? 'max-w-xs grid-cols-1'
                  : 'sm:grid-cols-3'
              )}
            >
              {integrations.map(({ icon, label, sub, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  className="flex items-center gap-3 rounded-xl border border-[#2A3242] bg-[#1E2533] px-4 py-3 transition-colors hover:border-[#3B4658] hover:bg-[#2A3242]"
                  rel="noreferrer"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#2A3242] shadow-sm ring-1 ring-[#3B4658]">
                    {icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#F4F7FC]">
                      {label}
                    </p>
                    <p className="truncate font-mono text-[11px] text-[#828DA3]">
                      {sub}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

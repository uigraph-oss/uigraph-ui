'use client'

import { clientV2 } from '@/api-v2/client'
import { TEAMS_V2 } from '@/features/dashboard-diagrams/api/teams-v2'
import { useServiceContext } from '@/features/services/contexts/service-context'
import { useCurrentOrganization } from '@/store/auth-store'
import { cn } from '@/lib/utils'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { format } from 'date-fns'
import { useMemo } from 'react'
import { FaGithub, FaJira, FaSlack } from 'react-icons/fa'

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

function normalizeRepoUrl(url?: string | null): string | undefined {
  if (!url) return undefined
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (url.startsWith('https://gitlab.com:'))
      return url.replace('https://gitlab.com:', 'https://gitlab.com/')
    return url
  }
  if (url.startsWith('git@github.com:'))
    return `https://github.com/${url.replace('git@github.com:', '').replace(/\.git$/, '')}`
  if (url.startsWith('git@gitlab.com:'))
    return `https://gitlab.com/${url.replace('git@gitlab.com:', '').replace(/\.git$/, '')}`
  return url
}

export function ServiceOverview() {
  const { service } = useServiceContext()
  const orgId = useCurrentOrganization().id

  const teamsRes = useQuery(TEAMS_V2, {
    client: clientV2,
    fetchPolicy: 'cache-first',
    variables: { orgId: orgId! },
    skip: !orgId,
  })
  const teams = useMemo(
    () => arrayNonNullable(teamsRes.data?.teams ?? []),
    [teamsRes.data?.teams]
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

  const integrations = [
    repoHref && {
      icon: <FaGithub className="size-4 text-[#24292E]" />,
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
      <div className="rounded-2xl border border-[#E8EAEC] bg-white p-6">
        {/* Service identity header */}
        <div className="mb-5 flex items-center gap-4">
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-xl text-[14px] font-bold tracking-wide"
            style={{ backgroundColor: `${avatarColor}18`, color: avatarColor }}
          >
            {getMonogram(service.name || '')}
          </div>
          <div className="min-w-0">
            <h2 className="text-[18px] font-semibold tracking-tight text-[#0F172A]">
              {service.name}
            </h2>
            {service.description && (
              <p className="mt-0.5 text-[13px] text-[#64748B]">
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
                className="inline-flex items-center rounded-md bg-[#F1F5F9] px-2.5 py-1 text-[12px] font-medium text-[#475569]"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Metadata row */}
        <div className="grid grid-cols-2 gap-y-5 border-t border-[#F1F5F9] pt-5 sm:grid-cols-4">
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
              <p className="mb-1 text-[10px] font-semibold tracking-widest text-[#94A3B8] uppercase">
                {label}
              </p>
              <p
                className={cn(
                  'text-[13px] font-medium text-[#0F172A]',
                  mono && 'font-mono'
                )}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Integrations */}
        {integrations.length > 0 && (
          <>
            <h4 className="mt-6 mb-3 text-[13px] font-semibold text-[#0F172A]">
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
                  className="flex items-center gap-3 rounded-xl border border-[#E8EAEC] bg-[#FAFAFA] px-4 py-3 transition-colors hover:border-[#D0D5DD] hover:bg-white"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-[#E8EAEC]">
                    {icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#0F172A]">
                      {label}
                    </p>
                    <p className="truncate font-mono text-[11px] text-[#94A3B8]">
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

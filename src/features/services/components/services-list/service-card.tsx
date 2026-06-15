import type { ServiceStatsRow } from '@/features/services/api/service-stats'
import type { DashboardService } from '@/features/services/api/services-v2'
import { MoreVerticalIcon } from '@/assets/svgs'
import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { BetterDialogProvider } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { objectOmitNull } from 'daily-code'
import { format } from 'date-fns'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ConfigureServiceModal } from './configure-service-modal'

interface ServiceCardProps {
  service: DashboardService
  index?: number
  stats?: ServiceStatsRow
  statsLoading?: boolean
  deleteService: () => Promise<unknown>
  updateService: (data: {
    name: string
    category: string
    description: string
    teamId?: string
    labels?: string[]
    gitRepoUrl?: string
    jiraProjectUrl?: string
    slackChannelUrl?: string
  }) => Promise<unknown>
}

// Category → top band color: semantic, tells you what kind of service this is
const CATEGORY_COLORS: Record<string, string> = {
  backend: '#2563EB', // blue
  frontend: '#16A34A', // green
  mobile: '#0891B2', // cyan
  database: '#D97706', // amber
  worker: '#7C3AED', // violet
  messaging: '#DB2777', // pink
  cache: '#EA580C', // orange
  gateway: '#0369A1', // sky
  infrastructure: '#64748B', // slate
  library: '#059669', // emerald
  other: '#374151', // gray
}

function getCategoryColor(category: string | null | undefined): string {
  if (!category) return '#94A3B8'
  return CATEGORY_COLORS[category.toLowerCase()] ?? '#94A3B8'
}

// Avatar color: per-service identity so same-category cards stay visually distinct
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

function getAvatarColor(id: string): string {
  let hash = 5381
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) + hash + id.charCodeAt(i)) >>> 0
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function getMonogram(name: string) {
  const words = name.trim().split(/\s+/)
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase()
  return name.substring(0, 2).toUpperCase()
}

function getRepoHost(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '') + new URL(url).pathname
  } catch {
    return url
  }
}

function getSubtitle(service: DashboardService): string | null {
  if (service.gitRepoUrl) return getRepoHost(service.gitRepoUrl)
  if (service.jiraProjectUrl) return getRepoHost(service.jiraProjectUrl)
  if (service.slackChannelUrl) return service.slackChannelUrl
  return null
}

function isNonReadable(s: string): boolean {
  return (
    /^[0-9a-f-]{20,}$/i.test(s) ||
    /^[a-z]+_[0-9a-f-]{8,}/i.test(s) ||
    /^\{.+\}$/.test(s) ||
    /^[a-z]+_\{.+\}$/i.test(s)
  )
}

export function ServiceCard({
  service,
  index = 0,
  stats,
  statsLoading = false,
  deleteService,
  updateService,
}: ServiceCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)

  const bandColor = getCategoryColor(service.category)
  const avatarColor = getAvatarColor(service.id || service.name || '')
  const subtitle = getSubtitle(service)
  // Labels only — skip category (already shown via color) and unreadable values
  const labelChips = [
    ...(service.teamId && !isNonReadable(service.teamId)
      ? [service.teamId]
      : []),
    ...(service.labels || []).flatMap((l) =>
      l && !isNonReadable(l) ? [l] : []
    ),
  ]
  const seen = new Set<string>()
  const chips = labelChips.filter((chip) => {
    const key = chip.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  const visibleChips = chips.slice(0, 3)
  const overflowCount = chips.length - 3

  const endpointCount = stats?.endpointCount ?? 0
  const diagramCount = stats?.diagramCount ?? 0
  const tableCount = stats?.dbTableCount ?? 0
  const updatedDate = service.updatedAt ? new Date(service.updatedAt) : null

  return (
    <div
      className="group relative"
      style={{
        animation: 'serviceCardIn 0.35s ease both',
        animationDelay: `${index * 55}ms`,
      }}
    >
      <Link
        to={`/services/${service.id}`}
        className="relative flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-[#E8EAEC] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_0_0_2px_rgba(37,99,235,0.2),0_6px_20px_rgba(0,0,0,0.08)] hover:ring-[#015AEB]"
      >
        {/* Category band — semantic color (Backend=blue, Frontend=green, etc.) */}
        <div
          className="h-[2px] w-full shrink-0"
          style={{ backgroundColor: bandColor }}
        />

        <div className="flex flex-1 flex-col p-5">
          {/* Identity row */}
          <div
            className={cn(
              'mb-4 flex gap-3 pr-6',
              subtitle ? 'items-start' : 'items-center'
            )}
          >
            <div
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-xl text-[12px] font-bold tracking-wider',
                subtitle && 'mt-0.5'
              )}
              style={{
                backgroundColor: `${avatarColor}18`,
                color: avatarColor,
              }}
            >
              {getMonogram(service.name || '')}
            </div>
            <div className="min-w-0">
              <h3 className="text-[14px] leading-5 font-semibold tracking-[-0.01em] text-[#0F172A]">
                {service.name}
              </h3>
              {subtitle && (
                <p className="mt-0.5 truncate font-mono text-[11px] text-[#94A3B8]">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          {service.description && (
            <p className="mb-3 line-clamp-2 text-[13px] leading-[1.5] text-[#64748B]">
              {service.description}
            </p>
          )}

          {/* Labels */}
          {chips.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-1">
              {visibleChips.map((chip, idx) => (
                <span
                  key={idx}
                  className="inline-flex max-w-[120px] items-center truncate rounded-md px-2 py-0.5 text-[11px] font-medium"
                  style={
                    idx === 0
                      ? { backgroundColor: `${bandColor}14`, color: bandColor }
                      : { backgroundColor: '#F1F5F9', color: '#475569' }
                  }
                >
                  {chip}
                </span>
              ))}
              {overflowCount > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[11px] text-[#94A3B8]">
                        +{overflowCount}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex flex-col gap-1">
                        {chips.slice(3).map((chip, idx) => (
                          <span key={idx} className="text-xs">
                            {chip}
                          </span>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}

          {/* Stat tiles */}
          <div className="mt-4 grid grid-cols-3 gap-1.5 border-t border-[#F1F5F9] pt-3">
            {[
              { value: endpointCount, label: 'ENDPOINTS' },
              { value: diagramCount, label: 'DIAGRAMS' },
              { value: tableCount, label: 'TABLES' },
            ].map(({ value, label }) => (
              <div
                key={label}
                className={cn(
                  'flex flex-col items-start rounded-lg bg-[#F8FAFC] px-2.5 py-2',
                  value === 0 && 'opacity-50'
                )}
              >
                <span
                  className={cn(
                    'text-[20px] leading-none font-bold tracking-tight tabular-nums',
                    value > 0 ? 'text-[#0F172A]' : 'text-[#94A3B8]'
                  )}
                >
                  {statsLoading ? '—' : value}
                </span>
                <span className="mt-1.5 text-[9px] font-semibold tracking-widest text-[#94A3B8]">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Date */}
          {updatedDate && (
            <p className="mt-2 text-right text-[11px] text-[#CBD5E1]">
              {format(updatedDate, 'd MMM yyyy')}
            </p>
          )}
        </div>
      </Link>

      {/* ··· menu — appears on hover */}
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              'absolute top-4 right-3 h-6 w-6 rounded-md bg-white/90 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-white',
              isDropdownOpen && 'opacity-100'
            )}
          >
            <MoreVerticalIcon className="h-3.5 w-3.5 text-[#64748B]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsUpdateModalOpen(true)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <BetterDeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Do you want to delete this service?"
        description="Deleting your service is a permanent action and cannot be undone. Please think carefully before proceeding."
        onConfirm={async () => {
          await deleteService()
          setIsDeleteModalOpen(false)
          toast.success('Service deleted')
        }}
      />

      <BetterDialogProvider
        open={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
      >
        <ConfigureServiceModal
          mode="update"
          defaultValues={objectOmitNull({
            ...service,
            name: service.name || '',
            category: service.category || '',
            description: service.description || '',
          })}
          onSubmit={async (data) => {
            await updateService(data)
            toast.success('Service updated')
            setIsUpdateModalOpen(false)
          }}
        />
      </BetterDialogProvider>
    </div>
  )
}

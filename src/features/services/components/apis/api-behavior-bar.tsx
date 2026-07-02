'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { OpenApiRuntime } from '@/utils/api/openapi-runtime'
import { Copy, Lock, LockOpen } from 'lucide-react'
import { useMemo } from 'react'
import { toast } from 'sonner'
import {
  ApiAuthorizeDialog,
  useApiAuthorizeDialog,
} from './api-authorize-dialog'

type ApiGroupVersionOption = {
  versionId?: string | null
  versionNumber?: number | null
  label?: string | null
}

type ApiBehaviorBarProps = {
  apiGroupVersions?: ApiGroupVersionOption[]
  selectedVersionId?: string | null
  onSelectedVersionIdChange?: (versionId: string | null) => void
  showServerControls?: boolean
  openApiRuntime?: OpenApiRuntime | null
  baseUrl?: string
  selectedEnv?: string
  fallbackBaseUrl?: string
  serviceId?: string
  selectedServerIndex?: string
  onServerIndexChange?: (index: string) => void
}

export function ApiBehaviorBar({
  apiGroupVersions = [],
  selectedVersionId = null,
  onSelectedVersionIdChange,
  showServerControls = false,
  openApiRuntime,
  baseUrl = '',
  selectedEnv = 'production',
  fallbackBaseUrl = '',
  serviceId = '',
  selectedServerIndex = '0',
  onServerIndexChange,
}: ApiBehaviorBarProps) {
  const versionOptions = useMemo(() => {
    return apiGroupVersions.map((version, index) => {
      const num = version.versionNumber
      const label = num != null ? `v${num}` : version.label?.trim() || 'Latest'
      return {
        value: version.versionId!,
        label,
        isLatest: index === 0,
      }
    })
  }, [apiGroupVersions])

  const defaultVersionId = versionOptions.find((o) => o.isLatest)?.value
  const currentVersionId = selectedVersionId ?? defaultVersionId ?? ''

  if (versionOptions.length === 0) {
    return showServerControls && openApiRuntime ? (
      <div className="flex w-full flex-wrap items-center gap-2 border-b bg-[#141925] px-4 py-2">
        <ServerControls
          openApiRuntime={openApiRuntime}
          baseUrl={baseUrl}
          selectedEnv={selectedEnv}
          fallbackBaseUrl={fallbackBaseUrl}
          serviceId={serviceId}
          selectedServerIndex={selectedServerIndex}
          onServerIndexChange={onServerIndexChange}
        />
      </div>
    ) : null
  }

  return (
    <>
      <div className="flex w-full flex-wrap items-center gap-2 border-b bg-[#141925] px-4 py-2">
        <CompactSelector
          label="Versions"
          value={currentVersionId}
          options={versionOptions}
          onValueChange={(value) => onSelectedVersionIdChange?.(value)}
        />

        {showServerControls && openApiRuntime ? (
          <>
            <div className="hidden h-5 w-px bg-[#2A3242] sm:block" />
            <ServerControls
              openApiRuntime={openApiRuntime}
              baseUrl={baseUrl}
              selectedEnv={selectedEnv}
              fallbackBaseUrl={fallbackBaseUrl}
              serviceId={serviceId}
              selectedServerIndex={selectedServerIndex}
              onServerIndexChange={onServerIndexChange}
            />
          </>
        ) : null}
      </div>
    </>
  )
}

function CompactSelector({
  label,
  value,
  options,
  onValueChange,
}: {
  label: string
  value: string
  options: Array<{
    value: string
    label: string
    isLatest?: boolean
  }>
  onValueChange: (value: string) => void
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="border-stock h-8 min-w-[9rem] gap-2 rounded-full bg-[#141925] px-3 text-xs shadow-none">
        <span className="text-[#828DA3]">{label}</span>
        <span className="max-w-[8rem] truncate font-medium">
          <SelectValue placeholder={`Select ${label}`} />
        </span>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className="flex items-center gap-2">
              {option.label}
              {option.isLatest ? (
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                  Latest
                </Badge>
              ) : null}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function ServerControls({
  openApiRuntime,
  baseUrl,
  selectedEnv,
  fallbackBaseUrl,
  serviceId,
  selectedServerIndex,
  onServerIndexChange,
}: {
  openApiRuntime: OpenApiRuntime
  baseUrl: string
  selectedEnv: string
  fallbackBaseUrl: string
  serviceId: string
  selectedServerIndex: string
  onServerIndexChange?: (index: string) => void
}) {
  const authorize = useApiAuthorizeDialog(
    serviceId,
    openApiRuntime.securitySchemes
  )

  const serverOptions = useMemo(() => {
    const servers = openApiRuntime.servers
    if (!servers.length) {
      const url = baseUrl || fallbackBaseUrl || 'No server configured'
      return [{ value: '0', url, description: null as string | null }]
    }

    return servers.map((server, index) => {
      const url = openApiRuntime.resolveServerUrl(
        server,
        selectedEnv,
        fallbackBaseUrl
      )
      const description = server.description?.trim() || null
      return { value: String(index), url, description }
    })
  }, [baseUrl, fallbackBaseUrl, openApiRuntime, selectedEnv])

  const selectedServer =
    serverOptions.find((option) => option.value === selectedServerIndex) ??
    serverOptions[0]

  const { hasSecuritySchemes, isAuthorized, openDialog } = authorize

  return (
    <>
      <div className="flex min-w-0 items-center gap-2">
        <Select value={selectedServerIndex} onValueChange={onServerIndexChange}>
          <SelectTrigger className="border-stock h-8 max-w-[28rem] min-w-[18rem] gap-2 rounded-full bg-[#141925] px-3 text-xs shadow-none [&_[data-slot=select-value]]:hidden">
            <span className="shrink-0 text-[#828DA3]">Servers</span>
            <span className="min-w-0 flex-1 truncate font-medium">
              {selectedServer?.url ?? 'Select server'}
            </span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-w-[32rem]">
            {serverOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                textValue={option.url}
                title={
                  option.description
                    ? `${option.url} — ${option.description}`
                    : option.url
                }
              >
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate font-medium">{option.url}</span>
                  {option.description ? (
                    <span className="truncate text-[11px] text-[#828DA3]">
                      {option.description}
                    </span>
                  ) : null}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 shrink-0 gap-1.5 px-2.5 text-xs"
          onClick={() => void copyServerUrl(baseUrl)}
          disabled={!baseUrl}
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </Button>

        {hasSecuritySchemes ? (
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'h-8 shrink-0 gap-1.5 rounded-full px-3 text-xs',
              isAuthorized
                ? 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'
                : 'border-[#2A3242] text-[#D2D9E6] hover:bg-[#1E2533]'
            )}
            onClick={openDialog}
          >
            {isAuthorized ? (
              <Lock className="h-3.5 w-3.5" />
            ) : (
              <LockOpen className="h-3.5 w-3.5" />
            )}
            Authorize
          </Button>
        ) : (
          <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-[#2A3242] px-3 text-xs text-[#828DA3]">
            <LockOpen className="h-3.5 w-3.5" />
            No auth
          </span>
        )}
      </div>

      <ApiAuthorizeDialog {...authorize} serviceId={serviceId} />
    </>
  )
}

async function copyServerUrl(value: string) {
  if (!value) return
  try {
    await navigator.clipboard.writeText(value)
    toast.success('Server URL copied')
  } catch {
    toast.error('Failed to copy')
  }
}

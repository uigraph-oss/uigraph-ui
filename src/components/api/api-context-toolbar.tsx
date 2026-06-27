'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Copy,
  GitBranch,
} from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { useMemo, useState } from 'react'

const DEFAULT_ENV = 'staging'
const ENV_STORAGE_KEY = 'uigraph.apiBehavior.env'

export type ApiContextOption = {
  value: string
  label: string
  isLatest?: boolean
  isDraft?: boolean
}

type ApiContextToolbarProps = {
  /** @deprecated Group selector removed from toolbar. Kept for backward compat. */
  groupOptions?: ApiContextOption[]
  /** @deprecated Version selector removed; only Release is shown. Kept for backward compat. */
  versionOptions?: ApiContextOption[]
  releaseOptions: ApiContextOption[]
  /** @deprecated Group selector removed. Kept for backward compat. */
  currentGroupId?: string
  currentReleaseId: string
  /** @deprecated Protocol badge removed. Kept for backward compat. */
  groupProtocol?: 'OpenAPI' | 'GraphQL' | 'gRPC' | 'REST'
  groupProtocolWarning?: string
  showGroupSemverWarning?: boolean
  groupSemverWarningText?: string
  lastUpdatedAt?: string | null
  provenance: {
    compactLabel: string
    repoUrl?: string | null
    commitShort?: string | null
    commitFull?: string | null
    lastSyncedAt?: string | null
    importedBy?: string | null
  }
  /** @deprecated Group selector removed. Kept for backward compat. */
  onGroupChange?: (groupId: string) => void
  onReleaseChange: (releaseId: string) => void
  environmentOptions?: ApiContextOption[]
  environmentMode?: 'spec' | 'manual'
  authOptions?: ApiContextOption[]
  showAuthSelector?: boolean
  authPreview?: boolean
}

export function ApiContextToolbar({
  releaseOptions,
  currentReleaseId,
  lastUpdatedAt,
  provenance,
  onReleaseChange,
  environmentOptions: environmentOptionsProp,
}: ApiContextToolbarProps) {
  const [showDetails, setShowDetails] = useState(false)

  const defaultEnvironmentOptions = useMemo<ApiContextOption[]>(
    () => [
      { value: 'dev', label: 'Development' },
      { value: 'staging', label: 'Staging' },
      { value: 'production', label: 'Production' },
    ],
    []
  )

  const environmentOptions =
    environmentOptionsProp && environmentOptionsProp.length > 0
      ? environmentOptionsProp
      : defaultEnvironmentOptions

  // URL is the source of truth, but nothing is written until the user picks a
  // non-default value (clearOnDefault). The default falls back to the last
  // choice in localStorage, then the hardcoded default.
  const envDefault = resolveValue(
    readStorage(ENV_STORAGE_KEY),
    environmentOptions,
    DEFAULT_ENV
  )

  // releaseId is owned by the page (via onReleaseChange); read it here only to
  // reflect the current selection, falling back to the latest release.
  const [releaseIdParam] = useQueryState('releaseId', parseAsString)
  const [env, setEnv] = useQueryState(
    'env',
    parseAsString.withDefault(envDefault)
  )

  const releaseId =
    resolveValue(releaseIdParam, releaseOptions, '') ||
    releaseOptions.find((option) => option.isLatest)?.value ||
    releaseOptions[0]?.value ||
    currentReleaseId ||
    ''

  const selectedRelease = useMemo(
    () => releaseOptions.find((option) => option.value === releaseId),
    [releaseId, releaseOptions]
  )

  return (
    <div className="bg-card border-b px-4 py-2">
      <div className="flex items-center justify-between gap-4">
        {/* Zone A — Context (left): Release, Environment */}
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1">
          <Selector
            label="Release"
            value={releaseId}
            options={releaseOptions}
            onValueChange={(value) => {
              onReleaseChange(value)
            }}
          />
          <Selector
            label="Environment"
            value={env}
            options={environmentOptions}
            onValueChange={(value) => {
              writeStorage(ENV_STORAGE_KEY, value)
              void setEnv(value)
            }}
          />
        </div>

        {/* Zone C — Meta (right, subtle): Git repo, Details — do not compete visually */}
        <div className="text-muted-foreground border-border/60 flex shrink-0 items-center gap-1 border-l pl-3">
          <ProvenancePill provenance={provenance} variant="subtle" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails((prev) => !prev)}
            className="text-muted-foreground hover:text-foreground h-7 gap-1 px-2 text-xs"
          >
            <motion.div
              animate={{ rotate: showDetails ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </motion.div>
            <span className="inline-flex overflow-hidden">
              <AnimatePresence mode="sync" initial={false}>
                {showDetails ? (
                  <motion.span
                    key="hide"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="block overflow-hidden whitespace-nowrap"
                  >
                    Hide details
                  </motion.span>
                ) : (
                  <motion.span
                    key="show"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="block overflow-hidden whitespace-nowrap"
                  >
                    Details
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </Button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0.5 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0.5 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="bg-secondary/60 mt-2 flex min-h-9 flex-wrap items-center gap-2 rounded-md border px-3 py-1.5 text-xs">
              {selectedRelease?.isDraft || releaseId === 'working-copy' ? (
                <Badge variant="secondary">Draft</Badge>
              ) : (
                <Badge variant="outline">Published</Badge>
              )}
              {selectedRelease?.isLatest ? (
                <Badge variant="secondary">Latest</Badge>
              ) : null}
              {provenance.lastSyncedAt ? (
                <span className="text-muted-foreground">
                  Last synced {formatDateTime(provenance.lastSyncedAt)}
                </span>
              ) : lastUpdatedAt ? (
                <span className="text-muted-foreground">
                  Last updated {formatDateTime(lastUpdatedAt)}
                </span>
              ) : null}
              {provenance.commitShort ? (
                <span className="text-muted-foreground font-mono">
                  Commit {provenance.commitShort}
                </span>
              ) : null}
              {!provenance.lastSyncedAt &&
              !provenance.commitShort &&
              !lastUpdatedAt ? (
                <span className="text-muted-foreground">
                  No additional metadata
                </span>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Selector({
  label,
  value,
  options,
  protocolBadge,
  protocolWarningText,
  helperBadge,
  onValueChange,
  showWarning = false,
  warningText,
}: {
  label: string
  value: string
  options: ApiContextOption[]
  protocolBadge?: 'OpenAPI' | 'GraphQL' | 'gRPC' | 'REST'
  protocolWarningText?: string
  helperBadge?: string
  onValueChange: (value: string) => void
  showWarning?: boolean
  warningText?: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-8 min-w-34 gap-2 rounded-full px-3 text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className="max-w-28 truncate font-medium">
            <SelectValue placeholder={`Select ${label}`} />
          </span>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <span className="flex items-center gap-2">
                {option.label}
                {option.isLatest ? (
                  <Badge
                    variant="secondary"
                    className="px-1.5 py-0 text-[10px]"
                  >
                    Latest
                  </Badge>
                ) : null}
                {option.isDraft ? (
                  <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                    Draft
                  </Badge>
                ) : null}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {protocolBadge ? (
        <Badge variant="outline" className="h-6 rounded-full px-2 text-[10px]">
          {protocolBadge}
        </Badge>
      ) : null}
      {protocolWarningText ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className={cn(
                'text-amber-500 hover:text-amber-600',
                'inline-flex h-6 w-6 items-center justify-center rounded-full'
              )}
              aria-label="Protocol/spec warning"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>{protocolWarningText}</TooltipContent>
        </Tooltip>
      ) : null}
      {helperBadge ? (
        <Badge variant="outline" className="h-6 rounded-full px-2 text-[10px]">
          {helperBadge}
        </Badge>
      ) : null}
      {showWarning ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className={cn(
                'text-amber-500 hover:text-amber-600',
                'inline-flex h-6 w-6 items-center justify-center rounded-full'
              )}
              aria-label="Group naming warning"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>
            {warningText ||
              'Group name looks like a release; rename to public/internal.'}
          </TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  )
}

function ProvenancePill({
  provenance,
  variant = 'default',
}: {
  provenance: ApiContextToolbarProps['provenance']
  variant?: 'default' | 'subtle'
}) {
  const [isCopyingCommit, setIsCopyingCommit] = useState(false)
  const [isCopyingRepo, setIsCopyingRepo] = useState(false)
  const isSubtle = variant === 'subtle'

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-xs',
            isSubtle
              ? 'text-muted-foreground hover:bg-muted/60 hover:text-foreground border-0 bg-transparent'
              : 'border font-medium'
          )}
        >
          <GitBranch className="h-3 w-3" />
          <span className="max-w-40 truncate">{provenance.compactLabel}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 space-y-2">
        <h4 className="text-sm font-semibold">Source / Provenance</h4>
        {provenance.repoUrl && (
          <div className="text-xs">
            <div className="text-muted-foreground mb-1">Repository URL</div>
            <div className="flex items-start justify-between gap-2">
              <a
                className="text-primary break-all hover:underline"
                href={provenance.repoUrl}
                target="_blank"
                rel="noreferrer"
              >
                {provenance.repoUrl}
              </a>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 shrink-0 px-2"
                onClick={async () => {
                  if (!navigator?.clipboard) return
                  await navigator.clipboard.writeText(provenance.repoUrl!)
                  setIsCopyingRepo(true)
                  setTimeout(() => setIsCopyingRepo(false), 1200)
                }}
              >
                {isCopyingRepo ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        )}
        {provenance.commitFull && (
          <div className="text-xs">
            <div className="text-muted-foreground mb-1">Commit SHA</div>
            <div className="flex items-center justify-between gap-2">
              <code className="font-mono text-sm">{provenance.commitFull}</code>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 shrink-0 px-2"
                onClick={async () => {
                  if (!navigator?.clipboard) return
                  await navigator.clipboard.writeText(provenance.commitFull!)
                  setIsCopyingCommit(true)
                  setTimeout(() => setIsCopyingCommit(false), 1200)
                }}
              >
                {isCopyingCommit ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        )}
        {provenance.lastSyncedAt && (
          <div className="text-xs">
            <div className="text-muted-foreground mb-1">Last synced</div>
            <div>{formatDateTime(provenance.lastSyncedAt)}</div>
          </div>
        )}
        {!provenance.repoUrl &&
        !provenance.commitFull &&
        !provenance.lastSyncedAt ? (
          <div className="text-muted-foreground text-xs">
            No metadata available.
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

function resolveValue(
  input: string | null,
  options: ApiContextOption[],
  fallback: string
): string {
  if (input && options.some((option) => option.value === input)) {
    return input
  }
  return fallback
}

function readStorage(key: string): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(key)
}

function writeStorage(key: string, value: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, value)
}

function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

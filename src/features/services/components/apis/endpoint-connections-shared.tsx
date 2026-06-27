/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
'use client'

import {
  BetterDialogContent,
  BetterDialogProvider,
} from '@/components/better-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Layers,
  MapPin,
  Plus,
  Trash2,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export type ConnectionItem = {
  id: string
  name: string
  imageUrl?: string
  /** Screen (frame) the usage lives on. */
  screenName?: string
  /** Focal point the usage is pinned to — the deep-link target. */
  focalPointName?: string
  breadcrumb?: string
  pageId?: string
}

export type ConnectionSectionProps = {
  type: 'uiFlow' | 'service' | 'data' | 'event' | 'focalPoint'
  title: string
  description: string
  readonly?: boolean
  microcopy?: string
  items: ConnectionItem[]
  error?: string
  onLink?: () => void
  onUnlink?: (id: string) => void
  onItemClick: (id: string) => void
  onRetry?: () => void
  onGoToSystemMaps?: () => void
}

const MAX_VISIBLE_ITEMS = 4

export function ConnectionSection({
  title,
  description,
  readonly = false,
  items,
  error,
  onLink,
  onUnlink,
  onItemClick,
  onRetry,
  onGoToSystemMaps,
}: ConnectionSectionProps) {
  const navigate = useNavigate()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  function handleDeleteClick(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (onUnlink) {
      setDeleteId(id)
    }
  }

  function handleConfirmDelete() {
    if (deleteId && onUnlink) {
      onUnlink(deleteId)
      setDeleteId(null)
    }
  }

  const visibleItems = useMemo(() => {
    if (isExpanded || items.length <= MAX_VISIBLE_ITEMS) {
      return items
    }
    return items.slice(0, MAX_VISIBLE_ITEMS)
  }, [items, isExpanded])

  function handleGoToSystemMaps() {
    if (onGoToSystemMaps) {
      onGoToSystemMaps()
    } else {
      void navigate('/dashboard/maps')
    }
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border py-4 shadow-sm">
        <div className="px-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{title}</h3>
                {/* <Badge variant="secondary" className="ml-1">
                  {items.length}
                </Badge> */}
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                {description}
              </p>
            </div>
          </div>
        </div>
        <div className="px-6">
          <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-sm">
            Couldn&apos;t load connections.
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={onRetry || (() => window.location.reload())}
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const isEmpty = items.length === 0

  return (
    <>
      <div className="flex flex-col gap-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {title}
          </h3>
          {!isEmpty && (
            <span className="text-muted-foreground text-xs">
              {items.length}
            </span>
          )}
        </div>

        <div>
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
              <p className="text-muted-foreground text-sm">
                Not used in any system map yet.
              </p>
              {!readonly && (
                <Button
                  onClick={handleGoToSystemMaps}
                  variant="outline"
                  size="sm"
                >
                  Go to System Maps
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {visibleItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      onItemClick(item.id)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onItemClick(item.id)
                      }
                    }}
                    className="group hover:bg-muted/50 hover:border-muted-foreground/30 focus:ring-ring flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-all hover:shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                    aria-label={`Open ${item.focalPointName || item.name} in map`}
                  >
                    <div className="bg-muted ring-border/60 flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg ring-1">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <Layers className="text-muted-foreground h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="truncate text-sm font-medium">
                        {item.name}
                      </span>
                      <div className="text-muted-foreground mt-0.5 flex min-w-0 items-center gap-1 text-xs">
                        {item.focalPointName && (
                          <span className="inline-flex min-w-0 items-center gap-1">
                            <MapPin className="text-primary h-3 w-3 flex-shrink-0" />
                            <span className="truncate">
                              {item.focalPointName}
                            </span>
                          </span>
                        )}
                        {item.focalPointName && item.screenName && (
                          <span className="text-muted-foreground/50">·</span>
                        )}
                        {item.screenName && (
                          <span className="truncate">{item.screenName}</span>
                        )}
                        {!item.focalPointName &&
                          !item.screenName &&
                          item.breadcrumb && (
                            <span className="truncate">{item.breadcrumb}</span>
                          )}
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <ExternalLink
                              className="text-muted-foreground h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100"
                              aria-label="Opens focal point in map"
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Open focal point in map</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {onUnlink && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={(e) => handleDeleteClick(item.id, e)}
                          aria-label={`Unlink ${item.name}`}
                        >
                          <Trash2 className="text-destructive h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {items.length > MAX_VISIBLE_ITEMS && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      View all ({items.length})
                    </>
                  )}
                </Button>
              )}
              {onLink && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={onLink}
                >
                  <Plus className="h-4 w-4" />
                  Link another
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlink {title.slice(0, -1)}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unlink this item? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Unlink
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

type EntityPickerModalProps = {
  type: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (ids: string[]) => void
}

export function EntityPickerModal({
  type,
  open,
  onOpenChange,
  onConfirm,
}: EntityPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // TODO: Replace with actual data fetching based on type
  // For now, using placeholder data
  const allItems = useMemo(() => {
    // Placeholder - replace with actual API calls
    return [
      { id: '1', name: `Example ${type} 1` },
      { id: '2', name: `Example ${type} 2` },
      { id: '3', name: `Example ${type} 3` },
    ]
  }, [type])

  const filteredItems = allItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  function handleToggle(id: string) {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  function handleConfirm() {
    onConfirm(Array.from(selectedIds))
    setSelectedIds(new Set())
    setSearchQuery('')
  }

  function handleCancel() {
    setSelectedIds(new Set())
    setSearchQuery('')
    onOpenChange(false)
  }

  return (
    <BetterDialogProvider open={open} onOpenChange={onOpenChange}>
      <BetterDialogContent
        title={`Link ${type === 'uiFlow' ? 'UI Flow' : type === 'service' ? 'Service' : type === 'data' ? 'Data Resource' : 'Event'}`}
        description={`Select ${type === 'uiFlow' ? 'UI flows' : type === 'service' ? 'services' : type === 'data' ? 'data resources' : 'events'} to link to this endpoint`}
      >
        <div className="space-y-4">
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="hover:bg-muted/50 flex items-center space-x-2 rounded-lg border p-3"
                >
                  <Checkbox
                    checked={selectedIds.has(item.id)}
                    onCheckedChange={() => handleToggle(item.id)}
                  />
                  <label
                    className="flex-1 cursor-pointer text-sm"
                    onClick={() => handleToggle(item.id)}
                  >
                    {item.name}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={selectedIds.size === 0}>
              Link {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
            </Button>
          </div>
        </div>
      </BetterDialogContent>
    </BetterDialogProvider>
  )
}

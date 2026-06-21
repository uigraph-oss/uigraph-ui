'use client'

import { V2 } from '@/api'
import { SectionLoader } from '@/components/section-loader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { EllipsisVertical } from 'lucide-react'
import { useState } from 'react'
import { useServiceTestsContext } from '../context/service-tests-context'

type TestPackListPanelProps = {
  onCreatePack: () => void
  onEditPack: (pack: V2.TestPack) => void
  onDeletePack: (pack: V2.TestPack) => void
}

export function TestPackListPanel({
  onCreatePack,
  onEditPack,
  onDeletePack,
}: TestPackListPanelProps) {
  const {
    selectedPackId,
    testPacks,
    testRuns,
    isTestPacksLoading,
    handleSelectPack,
  } = useServiceTestsContext()

  function getTypeBadgeVariant(type: string | null) {
    switch (type?.toLowerCase()) {
      case 'smoke':
        return 'default'
      case 'regression':
        return 'secondary'
      case 'manual':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="border-border flex h-full w-[300px] flex-col overflow-y-auto border-r bg-[#141925]">
      {isTestPacksLoading ? (
        <div className="flex h-full items-center justify-center">
          <SectionLoader label="Loading test packs..." />
        </div>
      ) : testPacks.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="flex flex-col gap-2">
            <p className="text-foreground text-sm font-semibold">
              No test packs yet
            </p>
            <p className="text-muted-foreground text-sm">
              Create your first smoke or regression pack to start tracking test
              results.
            </p>
          </div>
          <Button preset="primary" onClick={onCreatePack}>
            Create Test Pack
          </Button>
        </div>
      ) : (
        <div className="flex flex-col">
          {testPacks.map((pack) => {
            const packId = pack.testPackId ?? ''
            const isSelected = selectedPackId === packId

            const packRuns = testRuns.filter(
              (run) => (run.testPackId ?? null) === packId
            )
            const latestRun =
              packRuns.length > 0
                ? packRuns.sort((a, b) => {
                    const aTime = a.executedAt
                      ? new Date(a.executedAt).getTime()
                      : 0
                    const bTime = b.executedAt
                      ? new Date(b.executedAt).getTime()
                      : 0
                    return bTime - aTime
                  })[0]
                : null

            return (
              <TestPackRow
                key={packId}
                pack={pack}
                isSelected={isSelected}
                latestRun={latestRun}
                onSelect={() => handleSelectPack(packId)}
                onEdit={() => onEditPack(pack)}
                onDelete={() => onDeletePack(pack)}
                getTypeBadgeVariant={getTypeBadgeVariant}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

type TestPackRowProps = {
  pack: V2.TestPack
  isSelected: boolean
  latestRun: V2.TestRun | V2.TestRunSummary | null
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
  getTypeBadgeVariant: (
    type: string | null
  ) => 'default' | 'secondary' | 'outline'
}

function TestPackRow({
  pack,
  isSelected,
  latestRun,
  onSelect,
  onEdit,
  onDelete,
  getTypeBadgeVariant,
}: TestPackRowProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  function getStatusIndicator(status: string | null | undefined) {
    switch (status?.toLowerCase()) {
      case 'passed':
        return '🟢'
      case 'failed':
        return '🔴'
      case 'partial':
        return '🟡'
      default:
        return null
    }
  }

  return (
    <div
      className={cn(
        'group border-border relative flex cursor-pointer flex-col gap-2 border-b p-4 transition-all',
        'hover:bg-accent/50',
        isSelected && 'bg-accent border-l-primary border-l-[3px]'
      )}
      onClick={onSelect}
    >
      <div className="flex flex-col gap-2 text-left">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{pack.name ?? 'Untitled'}</span>
          {pack.type && (
            <Badge variant={getTypeBadgeVariant(pack.type)}>{pack.type}</Badge>
          )}
        </div>
        {latestRun ? (
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            {getStatusIndicator(latestRun.overallStatus) && (
              <span>{getStatusIndicator(latestRun.overallStatus)}</span>
            )}
            <span>
              Last run:{' '}
              {latestRun.executedAt
                ? formatDistanceToNow(new Date(latestRun.executedAt), {
                    addSuffix: true,
                  })
                : 'Unknown'}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">No runs yet</span>
        )}
      </div>

      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100',
              isMenuOpen && 'opacity-100'
            )}
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-[#141925]">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              setIsMenuOpen(false)
              onEdit()
            }}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              setIsMenuOpen(false)
              onDelete()
            }}
            className="text-destructive focus:text-destructive"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

'use client'

import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { BetterDialogProvider } from '@/components/better-dialog'
import { FunctionalPagination } from '@/components/common/functional-pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useNow } from '@/hooks/use-now'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { formatDistanceToNow } from 'date-fns'
import {
  EllipsisVertical,
  GitCompareIcon,
  Pencil,
  PlusIcon,
  Search,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DELETE_ML_RUN, ML_STUDIO_EXPERIMENT_RUNS_PAGE } from '../../api/runs'
import { useExperimentContext } from '../../contexts/experiment-context'
import { formatMetric, formatRunDuration } from '../../format'
import { useMetricColumns } from '../../hooks/use-metric-columns'
import type { Run } from '../../types'
import { MetricColumnsSelect } from '../metric-columns-select'
import { StatusBadge } from '../status-badge'
import { RunComparisonDialog } from './run-comparison-dialog'
import { RunModal } from './run-modal'

export function ExperimentRunsTab() {
  const { experiment, runs: allRuns } = useExperimentContext()
  const orgId = useCurrentOrganization()?.id
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const now = useNow()

  const [selected, setSelected] = useState<string[]>([])
  const [comparing, setComparing] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [runModalOpen, setRunModalOpen] = useState(false)
  const [editingRun, setEditingRun] = useState<Run | null>(null)
  const [deletingRun, setDeletingRun] = useState<Run | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const [deleteRun] = useMutation(DELETE_ML_RUN, {
    refetchQueries: ['MlStudioExperimentRuns', 'MlStudioExperimentRunsPage'],
    awaitRefetchQueries: true,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const runsQuery = useQuery(ML_STUDIO_EXPERIMENT_RUNS_PAGE, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !experiment?.id,
    variables: {
      orgId: orgId!,
      experimentId: experiment.id,
      search: search || undefined,
      limit: rowsPerPage,
      offset: (currentPage - 1) * rowsPerPage,
    },
  })

  const pageData =
    runsQuery.data?.mlRunsPage ?? runsQuery.previousData?.mlRunsPage
  const total = pageData?.total ?? 0

  const runs: Run[] = useMemo(
    () =>
      (pageData?.runs ?? []).map((r) => ({
        id: r.id,
        experimentId: r.experimentId,
        name: r.name,
        status: r.status as Run['status'],
        startedAt: r.startedAt,
        endedAt: r.endedAt ?? null,
        notes: r.notes,
        tags: r.tags,
        parameters: (r.parameters ?? {}) as Record<string, string | number>,
        metrics: (r.metrics ?? {}) as Record<string, number>,
        datasetId: r.datasetId ?? undefined,
        source: r.source as Run['source'],
        updatedAt: r.updatedAt ?? undefined,
        syncedAt: r.syncedAt ?? undefined,
      })),
    [pageData?.runs]
  )

  const availableMetricKeys = useMemo(() => {
    const keys: string[] = []
    for (const run of allRuns) {
      for (const key of Object.keys(run.metrics)) {
        if (!keys.includes(key)) {
          keys.push(key)
        }
      }
    }
    return keys
  }, [allRuns])

  const metricColumns = useMetricColumns('ml_run', availableMetricKeys)

  const selectedRuns = runs.filter((r) => selected.includes(r.id))
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage))

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-[#F4F7FC]">Runs</h2>
          <p className="text-sm text-[#828DA3]">
            Every run recorded in this experiment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            preset="outline"
            className="h-10"
            disabled={selected.length < 2}
            onClick={() => setComparing(true)}
          >
            <GitCompareIcon />
            Compare ({selected.length})
          </Button>
          {experiment.source === 'manual' && (
            <Button
              className="h-10"
              onClick={() => {
                setEditingRun(null)
                setRunModalOpen(true)
              }}
            >
              <PlusIcon />
              New Run
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-[12px] border border-[#2A3242]">
        <div className="flex items-center justify-between p-4">
          <div className="relative max-w-[420px]">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-[#828DA3]" />
            <Input
              placeholder="Search runs by name"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-11 w-full rounded-[12px] border-[#2A3242] bg-[#1E2533] pt-3 pb-3 pl-10"
            />
          </div>

          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <span>Show per page:</span>
            <Select
              value={String(rowsPerPage)}
              onValueChange={(value) => {
                setRowsPerPage(Number(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="h-12 w-[120px] rounded-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 rows</SelectItem>
                <SelectItem value="10">10 rows</SelectItem>
                <SelectItem value="20">20 rows</SelectItem>
                <SelectItem value="50">50 rows</SelectItem>
                <SelectItem value="100">100 rows</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border-stock overflow-x-auto border-t">
          <Table className="[&_td]:px-6 [&_td]:py-3.5 [&_th]:h-12 [&_th]:px-6">
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
                {metricColumns.columns.map((key) => (
                  <TableHead key={key} className="capitalize">
                    {key.replace(/_/g, ' ')}
                  </TableHead>
                ))}
                <TableHead>Duration</TableHead>
                <TableHead>Synced</TableHead>
                <TableHead className="w-12 !px-2 text-center">
                  <MetricColumnsSelect
                    options={metricColumns.options}
                    columns={metricColumns.columns}
                    onToggle={metricColumns.toggle}
                    onSelectAll={metricColumns.selectAll}
                    onClear={metricColumns.clear}
                    onReset={metricColumns.reset}
                  />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7 + metricColumns.columns.length}
                    className="py-10 text-center text-sm text-[#828DA3]"
                  >
                    {runsQuery.loading ? 'Loading runs…' : 'No runs found.'}
                  </TableCell>
                </TableRow>
              ) : (
                runs.map((run) => (
                  <TableRow
                    key={run.id}
                    className="cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/dashboard/ml-studio/projects/${projectId}/experiments/${experiment.id}/runs/${run.id}`
                      )
                    }
                  >
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(run.id)}
                        onCheckedChange={() => toggle(run.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell className="hover:text-primary font-medium text-[#F4F7FC]">
                      {run.name}
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={run.status} />
                    </TableCell>
                    <TableCell>
                      {run.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {run.tags.map((tag) => (
                            <Badge
                              key={tag}
                              className="border-stock rounded-md border bg-[#1E2533] text-[#828DA3]"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-[#828DA3]">—</span>
                      )}
                    </TableCell>
                    {metricColumns.columns.map((key) => (
                      <TableCell
                        key={key}
                        className={
                          run.metrics[key] !== undefined
                            ? 'text-[#F4F7FC]'
                            : 'text-xs text-[#828DA3]'
                        }
                      >
                        {run.metrics[key] !== undefined
                          ? formatMetric(run.metrics[key])
                          : '—'}
                      </TableCell>
                    ))}
                    <TableCell
                      className={
                        formatRunDuration(run, now) === '—'
                          ? 'text-xs text-[#828DA3]'
                          : 'text-sm text-[#828DA3]'
                      }
                    >
                      {formatRunDuration(run, now)}
                    </TableCell>
                    <TableCell
                      className={
                        run.syncedAt
                          ? 'text-sm text-[#828DA3]'
                          : 'text-xs text-[#828DA3]'
                      }
                      title={run.syncedAt ?? undefined}
                    >
                      {run.syncedAt
                        ? formatDistanceToNow(new Date(run.syncedAt), {
                            addSuffix: true,
                          })
                        : '—'}
                    </TableCell>
                    <TableCell
                      className="w-12 !px-2 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {run.source === 'manual' && (
                        <DropdownMenu
                          open={openMenuId === run.id}
                          onOpenChange={(o) => setOpenMenuId(o ? run.id : null)}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <EllipsisVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-[#141925]"
                          >
                            <DropdownMenuItem
                              onClick={() => {
                                setOpenMenuId(null)
                                setEditingRun(run)
                                setRunModalOpen(true)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setOpenMenuId(null)
                                setDeletingRun(run)
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="stroke-destructive h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          Total <span className="font-medium text-[#F4F7FC]">{total}</span> runs
        </div>

        <FunctionalPagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
        />
      </div>

      <BetterDialogProvider
        open={comparing}
        onOpenChange={setComparing}
        className="[--width:72rem]"
      >
        <RunComparisonDialog
          runs={selectedRuns}
          availableRuns={runs}
          onToggleRun={toggle}
        />
      </BetterDialogProvider>

      <BetterDialogProvider open={runModalOpen} onOpenChange={setRunModalOpen}>
        <RunModal
          onClose={() => setRunModalOpen(false)}
          experimentId={experiment.id}
          run={editingRun}
        />
      </BetterDialogProvider>

      <BetterDeleteConfirmationModal
        open={!!deletingRun}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingRun(null)
          }
        }}
        title="Delete run?"
        description="This will permanently remove this run and its recorded parameters and metrics."
        onConfirm={async () => {
          if (!orgId || !deletingRun) {
            return
          }
          await deleteRun({ variables: { orgId, id: deletingRun.id } })
        }}
      />
    </div>
  )
}

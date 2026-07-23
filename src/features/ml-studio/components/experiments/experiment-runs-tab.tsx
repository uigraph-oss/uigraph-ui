'use client'

import { BetterDialogProvider } from '@/components/better-dialog'
import { FunctionalPagination } from '@/components/common/functional-pagination'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { formatDistanceToNow } from 'date-fns'
import { GitCompareIcon, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ML_STUDIO_EXPERIMENT_RUNS_PAGE } from '../../api/ml-studio'
import { useExperimentContext } from '../../contexts/experiment-context'
import { formatMetric } from '../../format'
import type { MetricPoint, Run } from '../../types'
import { MetricSparkline } from '../metric-sparkline'
import { StatusBadge } from '../status-badge'
import { RunComparisonDialog } from './run-comparison-dialog'

export function ExperimentRunsTab() {
  const { experiment } = useExperimentContext()
  const orgId = useCurrentOrganization()?.id
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [selected, setSelected] = useState<string[]>([])
  const [comparing, setComparing] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

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
        startedAt: r.startedAt ?? '',
        endedAt: r.endedAt ?? undefined,
        duration: r.duration,
        notes: r.notes,
        parameters: (r.parameters ?? {}) as Record<string, string | number>,
        metrics: (r.metrics ?? {}) as Record<string, number>,
        series: (r.series ?? {}) as Record<string, MetricPoint[]>,
        datasetId: r.datasetId ?? undefined,
        artifactIds: [],
        updatedAt: r.updatedAt ?? undefined,
        syncedAt: r.syncedAt ?? undefined,
      })),
    [pageData?.runs]
  )

  const primaryMetric = Object.keys(runs[0]?.metrics ?? {})[0] ?? ''
  const primaryLabel = primaryMetric.replace(/_/g, ' ')
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
        <Button
          preset="outline"
          className="h-10"
          disabled={selected.length < 2}
          onClick={() => setComparing(true)}
        >
          <GitCompareIcon />
          Compare ({selected.length})
        </Button>
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
                <TableHead>{primaryLabel}</TableHead>
                <TableHead>Loss trend</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Synced</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
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
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected.includes(run.id)}
                        onCheckedChange={() => toggle(run.id)}
                      />
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Link
                        to={`/dashboard/ml-studio/projects/${projectId}/experiments/${experiment.id}/runs/${run.id}`}
                        className="hover:text-primary font-medium text-[#F4F7FC]"
                      >
                        {run.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={run.status} />
                    </TableCell>
                    <TableCell className="text-[#F4F7FC]">
                      {primaryMetric && run.metrics[primaryMetric] !== undefined
                        ? formatMetric(run.metrics[primaryMetric])
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <MetricSparkline
                        points={run.series.loss || []}
                        color="#F5A623"
                      />
                    </TableCell>
                    <TableCell className="text-sm text-[#828DA3]">
                      {run.duration}
                    </TableCell>
                    <TableCell
                      className="text-sm text-[#828DA3]"
                      title={run.syncedAt ?? undefined}
                    >
                      {run.syncedAt
                        ? formatDistanceToNow(new Date(run.syncedAt), {
                            addSuffix: true,
                          })
                        : '—'}
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
    </div>
  )
}

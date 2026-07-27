'use client'

import { BetterDialogProvider } from '@/components/better-dialog'
import { FunctionalPagination } from '@/components/common/functional-pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { format, formatDistanceToNow } from 'date-fns'
import { Link2Icon, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ML_VERSION_EVALUATIONS,
  ML_VERSION_EVALUATIONS_PAGE,
} from '../../api/evaluations'
import { useModelContext } from '../../contexts/model-context'
import { formatMetric } from '../../format'
import { useMetricColumns } from '../../hooks/use-metric-columns'
import { MetricColumnsSelect } from '../metric-columns-select'
import { LinkEvaluationsDialog } from './link-evaluations-dialog'

export function ModelEvaluationsTable() {
  const { selectedVersion } = useModelContext()
  const [linkOpen, setLinkOpen] = useState(false)
  const orgId = useCurrentOrganization()?.id
  const { projectId, modelId } = useParams<{
    projectId: string
    modelId: string
  }>()
  const navigate = useNavigate()

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

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedVersion?.id])

  const evaluationsQuery = useQuery(ML_VERSION_EVALUATIONS_PAGE, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !selectedVersion?.id,
    variables: {
      orgId: orgId!,
      versionId: selectedVersion?.id ?? '',
      search: search || undefined,
      limit: rowsPerPage,
      offset: (currentPage - 1) * rowsPerPage,
    },
  })

  const pageData =
    evaluationsQuery.data?.mlVersionEvaluationsPage ??
    evaluationsQuery.previousData?.mlVersionEvaluationsPage
  const evaluations = pageData?.evaluations ?? []
  const total = pageData?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage))

  const allEvaluationsQuery = useQuery(ML_VERSION_EVALUATIONS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !selectedVersion?.id,
    variables: { orgId: orgId!, versionId: selectedVersion?.id ?? '' },
  })

  const availableMetricKeys = useMemo(() => {
    const keys: string[] = []
    for (const evaluation of allEvaluationsQuery.data?.mlVersionEvaluations ??
      []) {
      for (const key of Object.keys(
        (evaluation.metrics ?? {}) as Record<string, number>
      )) {
        if (!keys.includes(key)) {
          keys.push(key)
        }
      }
    }
    return keys
  }, [allEvaluationsQuery.data?.mlVersionEvaluations])

  const metricColumns = useMetricColumns('ml_evaluation', availableMetricKeys)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-[#F4F7FC]">
            Evaluation Runs
          </h2>
          <p className="text-sm text-[#828DA3]">
            {selectedVersion
              ? `Every evaluation run recorded for version ${selectedVersion.version}.`
              : 'Every evaluation run recorded for this version.'}
          </p>
        </div>
        {selectedVersion && (
          <Button preset="primary" onClick={() => setLinkOpen(true)}>
            <Link2Icon />
            Link Evaluations
          </Button>
        )}
      </div>

      <div className="rounded-[12px] border border-[#2A3242]">
        <div className="flex items-center justify-between p-4">
          <div className="relative max-w-[420px]">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-[#828DA3]" />
            <Input
              placeholder="Search evaluations by name"
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
                <TableHead>Name</TableHead>
                <TableHead>Tags</TableHead>
                {metricColumns.columns.map((key) => (
                  <TableHead key={key} className="capitalize">
                    {key.replace(/_/g, ' ')}
                  </TableHead>
                ))}
                <TableHead>Evaluated</TableHead>
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
              {evaluations.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4 + metricColumns.columns.length}
                    className="py-10 text-center text-sm text-[#828DA3]"
                  >
                    {!selectedVersion
                      ? 'No version selected.'
                      : evaluationsQuery.loading
                        ? 'Loading evaluations…'
                        : 'No evaluation runs recorded for this version.'}
                  </TableCell>
                </TableRow>
              ) : (
                evaluations.map((evaluation) => {
                  const metrics = (evaluation.metrics ?? {}) as Record<
                    string,
                    number
                  >
                  const href = `/dashboard/ml-studio/projects/${projectId}/models/${modelId}/evaluations/${evaluation.id}`

                  return (
                    <TableRow
                      key={evaluation.id}
                      className="cursor-pointer"
                      onClick={() => navigate(href)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Link
                          to={href}
                          className="hover:text-primary font-medium text-[#F4F7FC]"
                        >
                          {evaluation.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {evaluation.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {evaluation.tags.map((tag) => (
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
                            metrics[key] !== undefined
                              ? 'text-[#F4F7FC]'
                              : 'text-xs text-[#828DA3]'
                          }
                        >
                          {metrics[key] !== undefined
                            ? formatMetric(metrics[key])
                            : '—'}
                        </TableCell>
                      ))}
                      <TableCell
                        className="text-sm text-[#828DA3]"
                        title={format(new Date(evaluation.startedAt), 'PPpp')}
                      >
                        {formatDistanceToNow(new Date(evaluation.startedAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell className="w-12 !px-2" />
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          Total <span className="font-medium text-[#F4F7FC]">{total}</span>{' '}
          evaluation runs
        </div>

        <FunctionalPagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
        />
      </div>

      {selectedVersion && (
        <BetterDialogProvider open={linkOpen} onOpenChange={setLinkOpen}>
          <LinkEvaluationsDialog
            onClose={() => setLinkOpen(false)}
            versionId={selectedVersion.id}
          />
        </BetterDialogProvider>
      )}
    </div>
  )
}

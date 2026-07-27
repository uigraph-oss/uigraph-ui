'use client'

import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { BetterDialogProvider } from '@/components/better-dialog'
import { FunctionalPagination } from '@/components/common/functional-pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { format, formatDistanceToNow } from 'date-fns'
import {
  EllipsisVertical,
  Pencil,
  PlusIcon,
  Search,
  Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  DELETE_ML_EVALUATION,
  ML_EXPERIMENT_EVALUATIONS_PAGE,
} from '../../api/evaluations'
import { formatMetric } from '../../format'
import { EvaluationModal, type EditableEvaluation } from './evaluation-modal'

export function ExperimentEvaluationsTab() {
  const orgId = useCurrentOrganization()?.id
  const { projectId, experimentId } = useParams<{
    projectId: string
    experimentId: string
  }>()
  const navigate = useNavigate()

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvaluation, setEditingEvaluation] =
    useState<EditableEvaluation | null>(null)
  const [deletingEvaluation, setDeletingEvaluation] =
    useState<EditableEvaluation | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const [deleteEvaluation] = useMutation(DELETE_ML_EVALUATION, {
    refetchQueries: ['MlExperimentEvaluations', 'MlExperimentEvaluationsPage'],
    awaitRefetchQueries: true,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const evaluationsQuery = useQuery(ML_EXPERIMENT_EVALUATIONS_PAGE, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !experimentId,
    variables: {
      orgId: orgId!,
      experimentId: experimentId ?? '',
      search: search || undefined,
      limit: rowsPerPage,
      offset: (currentPage - 1) * rowsPerPage,
    },
  })

  const pageData =
    evaluationsQuery.data?.mlExperimentEvaluationsPage ??
    evaluationsQuery.previousData?.mlExperimentEvaluationsPage
  const evaluations = pageData?.evaluations ?? []
  const total = pageData?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage))

  const primaryMetric =
    Object.keys(
      (evaluations.find(
        (e) =>
          Object.keys((e.metrics ?? {}) as Record<string, number>).length > 0
      )?.metrics as Record<string, number> | undefined) ?? {}
    )[0] ?? ''
  const primaryLabel = primaryMetric
    ? primaryMetric.replace(/_/g, ' ')
    : 'Metric'

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-[#F4F7FC]">
            Evaluation Runs
          </h2>
          <p className="text-sm text-[#828DA3]">
            Every evaluation run recorded in this experiment.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingEvaluation(null)
            setModalOpen(true)
          }}
        >
          <PlusIcon />
          New Evaluation
        </Button>
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
                <TableHead>Model / Version</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="capitalize">{primaryLabel}</TableHead>
                <TableHead>Evaluated</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluations.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-sm text-[#828DA3]"
                  >
                    {evaluationsQuery.loading
                      ? 'Loading evaluations…'
                      : 'No evaluation runs recorded for this experiment.'}
                  </TableCell>
                </TableRow>
              ) : (
                evaluations.map((evaluation) => {
                  const metrics = (evaluation.metrics ?? {}) as Record<
                    string,
                    number
                  >
                  const href = `/dashboard/ml-studio/projects/${projectId}/experiments/${experimentId}/evaluations/${evaluation.id}`
                  const isManual = evaluation.source === 'manual'
                  const editable: EditableEvaluation = {
                    id: evaluation.id,
                    versionId: evaluation.versionId,
                    datasetId: evaluation.datasetId,
                    name: evaluation.name,
                    type: evaluation.type,
                    description: evaluation.description,
                    summary: evaluation.summary,
                    startedAt: evaluation.startedAt,
                    endedAt: evaluation.endedAt,
                    parameters: evaluation.parameters as Record<
                      string,
                      unknown
                    > | null,
                    metrics: evaluation.metrics as Record<
                      string,
                      unknown
                    > | null,
                  }

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
                      <TableCell className="text-sm text-[#828DA3]">
                        {evaluation.modelName}{' '}
                        <span className="text-[#F4F7FC]">
                          v{evaluation.version}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className="border-stock rounded-md border bg-[#1E2533] text-[#828DA3]">
                          {evaluation.type}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={
                          primaryMetric && metrics[primaryMetric] !== undefined
                            ? 'text-[#F4F7FC]'
                            : 'text-xs text-[#828DA3]'
                        }
                      >
                        {primaryMetric && metrics[primaryMetric] !== undefined
                          ? formatMetric(metrics[primaryMetric])
                          : '—'}
                      </TableCell>
                      <TableCell
                        className="text-sm text-[#828DA3]"
                        title={format(new Date(evaluation.startedAt), 'PPpp')}
                      >
                        {formatDistanceToNow(new Date(evaluation.startedAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {isManual && (
                          <DropdownMenu
                            open={openMenuId === evaluation.id}
                            onOpenChange={(o) =>
                              setOpenMenuId(o ? evaluation.id : null)
                            }
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
                                  setEditingEvaluation(editable)
                                  setModalOpen(true)
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setOpenMenuId(null)
                                  setDeletingEvaluation(editable)
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

      {experimentId && projectId && (
        <BetterDialogProvider open={modalOpen} onOpenChange={setModalOpen}>
          <EvaluationModal
            onClose={() => setModalOpen(false)}
            experimentId={experimentId}
            evaluation={editingEvaluation}
          />
        </BetterDialogProvider>
      )}

      <BetterDeleteConfirmationModal
        open={!!deletingEvaluation}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingEvaluation(null)
          }
        }}
        title="Delete evaluation run?"
        description="This will permanently remove this evaluation run from the experiment."
        onConfirm={async () => {
          if (!orgId || !deletingEvaluation) {
            return
          }
          await deleteEvaluation({
            variables: { orgId, id: deletingEvaluation.id },
          })
        }}
      />
    </div>
  )
}

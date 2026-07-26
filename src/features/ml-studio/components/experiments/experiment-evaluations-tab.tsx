'use client'

import { Badge } from '@/components/ui/badge'
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
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ML_EXPERIMENT_EVALUATIONS } from '../../api/ml-studio'
import { formatMetric } from '../../format'

export function ExperimentEvaluationsTab() {
  const orgId = useCurrentOrganization()?.id
  const { projectId, experimentId } = useParams<{
    projectId: string
    experimentId: string
  }>()
  const navigate = useNavigate()

  const evaluationsQuery = useQuery(ML_EXPERIMENT_EVALUATIONS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !experimentId,
    variables: { orgId: orgId!, experimentId: experimentId ?? '' },
  })
  const evaluations = evaluationsQuery.data?.mlExperimentEvaluations ?? []

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
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-[#F4F7FC]">
          Evaluation Runs
        </h2>
        <p className="text-sm text-[#828DA3]">
          Every evaluation run recorded in this experiment.
        </p>
      </div>

      <div className="rounded-[12px] border border-[#2A3242]">
        <div className="overflow-x-auto">
          <Table className="[&_td]:px-6 [&_td]:py-3.5 [&_th]:h-12 [&_th]:px-6">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Model / Version</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="capitalize">{primaryLabel}</TableHead>
                <TableHead>Evaluator</TableHead>
                <TableHead>Evaluated</TableHead>
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
                        className={
                          evaluation.evaluator
                            ? 'text-sm text-[#828DA3]'
                            : 'text-xs text-[#828DA3]'
                        }
                      >
                        {evaluation.evaluator || '—'}
                      </TableCell>
                      <TableCell
                        className={
                          evaluation.evaluatedAt
                            ? 'text-sm text-[#828DA3]'
                            : 'text-xs text-[#828DA3]'
                        }
                        title={
                          evaluation.evaluatedAt
                            ? format(new Date(evaluation.evaluatedAt), 'PPpp')
                            : undefined
                        }
                      >
                        {evaluation.evaluatedAt
                          ? formatDistanceToNow(
                              new Date(evaluation.evaluatedAt),
                              { addSuffix: true }
                            )
                          : '—'}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="text-muted-foreground text-sm">
        Total{' '}
        <span className="font-medium text-[#F4F7FC]">{evaluations.length}</span>{' '}
        evaluation runs
      </div>
    </div>
  )
}

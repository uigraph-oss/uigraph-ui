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
import { ML_VERSION_EVALUATIONS } from '../../api/ml-studio'
import { useModelContext } from '../../contexts/model-context'
import { formatMetric } from '../../format'
import { Panel } from '../panel'

export function ModelEvaluationsTab() {
  const { selectedVersion } = useModelContext()
  const orgId = useCurrentOrganization()?.id

  const evaluationsQuery = useQuery(ML_VERSION_EVALUATIONS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !selectedVersion?.id,
    variables: { orgId: orgId!, versionId: selectedVersion?.id ?? '' },
  })
  const evaluations = evaluationsQuery.data?.mlVersionEvaluations ?? []

  if (!selectedVersion) {
    return (
      <div className="grid grid-cols-1 gap-6 p-6">
        <Panel title="Evaluations">
          <p className="text-sm text-[#586378]">No version selected.</p>
        </Panel>
      </div>
    )
  }

  if (evaluationsQuery.loading && evaluations.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-6 p-6">
        <Panel title="Evaluations">
          <p className="text-sm text-[#586378]">Loading evaluations…</p>
        </Panel>
      </div>
    )
  }

  if (evaluations.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-6 p-6">
        <Panel
          title="Evaluations"
          description={`Version ${selectedVersion.version}`}
        >
          <p className="text-sm text-[#586378]">
            No evaluations recorded for this version.
          </p>
        </Panel>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 p-6">
      {evaluations.map((evaluation) => (
        <Panel
          key={evaluation.id}
          title={evaluation.name}
          description={evaluation.summary || evaluation.description}
          action={
            <div className="flex flex-col items-end gap-1.5 text-sm">
              <Badge className="border-stock rounded-md border bg-[#1E2533] text-[#828DA3]">
                {evaluation.type}
              </Badge>
              {evaluation.evaluatedAt && (
                <span
                  className="text-[#586378]"
                  title={format(new Date(evaluation.evaluatedAt), 'PP pp')}
                >
                  {formatDistanceToNow(new Date(evaluation.evaluatedAt), {
                    addSuffix: true,
                  })}
                </span>
              )}
              {evaluation.evaluator && (
                <span className="text-[#586378]">
                  Evaluated by {evaluation.evaluator}
                </span>
              )}
            </div>
          }
        >
          <div className="text-xs tracking-wide text-[#586378] uppercase">
            Metrics
          </div>
          {evaluation.metrics.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Measured</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluation.metrics.map((metric) => (
                  <TableRow key={metric.id}>
                    <TableCell className="font-medium text-[#F4F7FC]">
                      {metric.name.replace(/_/g, ' ')}
                    </TableCell>
                    <TableCell className="text-[#F4F7FC]">
                      {formatMetric(metric.value)}
                      {metric.unit && (
                        <span className="text-[#586378]"> {metric.unit}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-[#828DA3]">
                      {metric.category}
                    </TableCell>
                    <TableCell className="text-[#828DA3]">
                      {metric.direction}
                    </TableCell>
                    <TableCell
                      className="text-[#828DA3]"
                      title={metric.measuredAt ?? undefined}
                    >
                      {metric.measuredAt
                        ? formatDistanceToNow(new Date(metric.measuredAt), {
                            addSuffix: true,
                          })
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-[#586378]">
              No metrics recorded for this evaluation.
            </p>
          )}

          <div className="text-xs tracking-wide text-[#586378] uppercase">
            Parameters
          </div>
          {Object.entries(
            (evaluation.parameters ?? {}) as Record<string, unknown>
          ).length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parameter</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(
                  (evaluation.parameters ?? {}) as Record<string, unknown>
                ).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell className="text-[#828DA3]">{key}</TableCell>
                    <TableCell className="font-mono text-[#F4F7FC]">
                      {String(value)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-[#586378]">
              No parameters recorded for this evaluation.
            </p>
          )}
        </Panel>
      ))}
    </div>
  )
}

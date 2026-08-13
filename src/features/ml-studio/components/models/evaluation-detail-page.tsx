'use client'

import { TagList } from '@/components/common/tag-list'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCurrentOrganization } from '@/store/auth-store'
import { formatToHumanReadableMS } from '@/utils/time'
import { useQuery } from '@apollo/client'
import { format, formatDistanceToNow } from 'date-fns'
import {
  ArrowLeftIcon,
  ChartLineIcon,
  DatabaseIcon,
  SlidersHorizontalIcon,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { ML_STUDIO_DATASET } from '../../api/datasets'
import { ML_EVALUATION } from '../../api/evaluations'
import { InfoRow, Panel } from '../panel'

export function EvaluationDetailPage() {
  const { evaluationId } = useParams<{ evaluationId: string }>()
  const navigate = useNavigate()
  const orgId = useCurrentOrganization()?.id

  const evaluationQuery = useQuery(ML_EVALUATION, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !evaluationId,
    variables: { orgId: orgId!, id: evaluationId! },
  })
  const evaluation = evaluationQuery.data?.mlEvaluation

  const datasetQuery = useQuery(ML_STUDIO_DATASET, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !evaluation?.datasetId,
    variables: { orgId: orgId!, id: evaluation?.datasetId ?? '' },
  })
  const dataset = evaluation?.datasetId
    ? datasetQuery.data?.mlDataset
    : undefined

  if (!evaluation) {
    return (
      <div className="p-6 text-[#828DA3]">
        {evaluationQuery.loading
          ? 'Loading evaluation…'
          : 'Evaluation not found.'}
      </div>
    )
  }

  const metrics = Object.entries(
    (evaluation.metrics ?? {}) as Record<string, number>
  )
  const parameters = Object.entries(
    (evaluation.parameters ?? {}) as Record<string, string | number>
  )
  const durationMS = evaluation.endedAt
    ? Date.parse(evaluation.endedAt) - Date.parse(evaluation.startedAt)
    : null
  const duration =
    durationMS === null || durationMS < 0
      ? '—'
      : formatToHumanReadableMS(durationMS)

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-[#F4F7FC]">
              {evaluation.name}
            </h2>
            <Badge className="border-stock rounded-md border bg-[#1E2533] text-[#828DA3]">
              {evaluation.type}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-[#586378]">
            {evaluation.summary || evaluation.description}
          </p>
          {evaluation.tags.length > 0 && (
            <TagList tags={evaluation.tags} max={8} className="mt-2" />
          )}
        </div>
        <Button preset="outline" onClick={() => navigate(-1)}>
          <ArrowLeftIcon />
          Go Back
        </Button>
      </div>

      <Panel>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          <InfoRow label="Started at">
            {format(new Date(evaluation.startedAt), 'PPpp')}
          </InfoRow>
          <InfoRow label="Ended at">
            {evaluation.endedAt
              ? format(new Date(evaluation.endedAt), 'PPpp')
              : '—'}
          </InfoRow>
          <InfoRow label="Duration">{duration}</InfoRow>
          <InfoRow label="Evaluated">
            {formatDistanceToNow(new Date(evaluation.startedAt), {
              addSuffix: true,
            })}
          </InfoRow>
          <InfoRow label="Dataset">{dataset?.name ?? '—'}</InfoRow>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel title="Parameters" icon={<SlidersHorizontalIcon size={16} />}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parameter</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parameters.map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell className="text-[#828DA3]">{key}</TableCell>
                  <TableCell className="font-mono text-[#F4F7FC]">
                    {String(value)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>

        <Panel title="Metrics" icon={<ChartLineIcon size={16} />}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell className="text-[#828DA3]">{key}</TableCell>
                  <TableCell className="font-mono text-[#F4F7FC]">
                    {value}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>
      </div>

      <Panel title="Evaluation dataset" icon={<DatabaseIcon size={16} />}>
        {dataset ? (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            <InfoRow label="Name">{dataset.name}</InfoRow>
            <InfoRow label="Context">
              <Badge className="border-stock rounded-md border bg-[#1E2533] text-[#828DA3] capitalize">
                {dataset.context}
              </Badge>
            </InfoRow>
            <InfoRow label="Rows">{dataset.rowCount.toLocaleString()}</InfoRow>
            <InfoRow label="Digest">
              <span className="font-mono text-xs text-[#586378]">
                {dataset.digest}
              </span>
            </InfoRow>
          </div>
        ) : (
          <p className="text-sm text-[#586378]">
            No dataset linked to this evaluation.
          </p>
        )}
      </Panel>
    </div>
  )
}

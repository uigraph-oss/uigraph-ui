'use client'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format, formatDistanceToNow } from 'date-fns'
import { FlaskConical } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useModelContext } from '../../contexts/model-context'
import { formatMetric } from '../../format'
import { Panel } from '../panel'
import { DeploymentHistory } from './deployment-history'
import { ModelCard } from './model-card'

export function ModelOverviewTab() {
  const { selectedVersion, selectedRun, selectedRunExperiment } =
    useModelContext()
  const navigate = useNavigate()

  const latestRun = selectedRun
  const runExperiment = selectedRunExperiment
  const runLink = latestRun
    ? `/dashboard/ml-studio/projects/${runExperiment?.projectId}/experiments/${latestRun.experimentId}/runs/${latestRun.id}`
    : ''
  const metrics = Object.entries(latestRun?.metrics ?? {})
  const parameters = Object.entries(latestRun?.parameters ?? {})

  const lastUpdatedAt = latestRun?.endedAt || latestRun?.startedAt
  const lastUpdated = lastUpdatedAt ? (
    <span
      className="text-xs text-[#586378]"
      title={format(new Date(lastUpdatedAt), 'PPpp')}
    >
      Updated{' '}
      {formatDistanceToNow(new Date(lastUpdatedAt), { addSuffix: true })}
    </span>
  ) : null

  return (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
      <ModelCard />

      <Panel title="Metrics" action={lastUpdated}>
        {metrics.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            {metrics.map(([key, value]) => (
              <div key={key}>
                <div className="text-2xl font-bold text-[#F4F7FC]">
                  {formatMetric(value)}
                </div>
                <div className="mt-1 text-sm text-[#828DA3]">
                  {key.replace(/_/g, ' ')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#586378]">
            No metrics recorded for this version.
          </p>
        )}
      </Panel>

      <Panel title="Parameters" action={lastUpdated}>
        {parameters.length > 0 ? (
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
        ) : (
          <p className="text-sm text-[#586378]">No parameters recorded.</p>
        )}
      </Panel>

      <div className="border-stock bg-card flex items-center gap-4 rounded-xl border p-4 md:col-span-2">
        {latestRun ? (
          <>
            <div className="border-stock flex size-10 shrink-0 items-center justify-center rounded-lg border bg-[#0F1523] text-[#828DA3]">
              <FlaskConical className="size-5" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#586378]">Created from run</span>
                <Link
                  to={runLink}
                  className="hover:text-primary text-sm font-medium text-[#F4F7FC]"
                >
                  {latestRun.name}
                </Link>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#828DA3]">
                {latestRun.endedAt ? (
                  <span title={format(new Date(latestRun.endedAt), 'PPpp')}>
                    Completed{' '}
                    {formatDistanceToNow(new Date(latestRun.endedAt), {
                      addSuffix: true,
                    })}
                  </span>
                ) : (
                  <span>In progress</span>
                )}
                <span className="text-[#586378]">·</span>
                <span>Training duration {latestRun.duration}</span>
              </div>
            </div>
            <Button
              preset="outline"
              className="ml-auto"
              onClick={() => navigate(runLink)}
            >
              Go To Training Run
            </Button>
          </>
        ) : (
          <p className="text-sm text-[#586378]">
            No run is associated with this version.
          </p>
        )}
      </div>

      {selectedVersion && <DeploymentHistory versionId={selectedVersion.id} />}
    </div>
  )
}

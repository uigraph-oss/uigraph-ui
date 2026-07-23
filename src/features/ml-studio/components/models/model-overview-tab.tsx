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
import { Link, useNavigate } from 'react-router-dom'
import { useMlStudioData } from '../../contexts/ml-studio-data-context'
import { useModelContext } from '../../contexts/model-context'
import { formatMetric } from '../../format'
import { InfoRow, Panel } from '../panel'
import { StatusBadge } from '../status-badge'
import { DeploymentHistory } from './deployment-history'
import { ModelCard } from './model-card'

export function ModelOverviewTab() {
  const { selectedVersion } = useModelContext()
  const { runs, experiments, datasets } = useMlStudioData()
  const navigate = useNavigate()

  const latestRun = runs.find((r) => r.id === selectedVersion?.runId)
  const runExperiment = experiments.find(
    (e) => e.id === latestRun?.experimentId
  )
  const runLink = latestRun
    ? `/dashboard/ml-studio/projects/${runExperiment?.projectId}/experiments/${latestRun.experimentId}/runs/${latestRun.id}`
    : ''
  const metrics = Object.entries(latestRun?.metrics ?? {})
  const parameters = Object.entries(latestRun?.parameters ?? {})
  const runDataset = datasets.find((d) => d.id === latestRun?.datasetId)

  return (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
      <ModelCard />

      <Panel title="Metrics">
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

      <Panel title="Parameters">
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

      <Panel
        title="Training run"
        className="md:col-span-2"
        action={
          latestRun && (
            <Button preset="outline" onClick={() => navigate(runLink)}>
              Go To {latestRun.name}
            </Button>
          )
        }
      >
        {latestRun ? (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            <InfoRow label="Run">
              <Link to={runLink} className="hover:text-primary">
                {latestRun.name}
              </Link>
            </InfoRow>
            <InfoRow label="Status">
              <StatusBadge value={latestRun.status} />
            </InfoRow>
            <InfoRow label="Created">
              <span title={format(new Date(latestRun.startedAt), 'PPpp')}>
                {formatDistanceToNow(new Date(latestRun.startedAt), {
                  addSuffix: true,
                })}
              </span>
            </InfoRow>
            <InfoRow label="Duration">{latestRun.duration}</InfoRow>
            <InfoRow label="Dataset">
              {runDataset ? (
                runDataset.name
              ) : (
                <span className="text-[#586378]">—</span>
              )}
            </InfoRow>
            <InfoRow label="Notes">
              {latestRun.notes ? (
                <span className="text-[#828DA3]">{latestRun.notes}</span>
              ) : (
                <span className="text-[#586378]">—</span>
              )}
            </InfoRow>
          </div>
        ) : (
          <p className="text-sm text-[#586378]">
            No run is associated with this version.
          </p>
        )}
      </Panel>

      {selectedVersion && <DeploymentHistory versionId={selectedVersion.id} />}
    </div>
  )
}

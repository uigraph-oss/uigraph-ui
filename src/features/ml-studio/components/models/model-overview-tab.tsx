'use client'

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
import { formatDistanceToNow } from 'date-fns'
import { Link, useNavigate } from 'react-router-dom'
import { useMlStudioData } from '../../contexts/ml-studio-data-context'
import { useModelContext } from '../../contexts/model-context'
import { formatMetric } from '../../format'
import { InfoRow, Panel } from '../panel'

export function ModelOverviewTab() {
  const { model, selectedVersion } = useModelContext()
  const { runs, artifacts: allArtifacts } = useMlStudioData()
  const navigate = useNavigate()

  const latestRun = runs.find((r) => r.id === selectedVersion?.runId)
  const metrics = Object.entries(latestRun?.metrics ?? {})
  const parameters = Object.entries(latestRun?.parameters ?? {})
  const artifacts = latestRun
    ? allArtifacts.filter((a) => latestRun.artifactIds.includes(a.id))
    : []

  return (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
      <Panel title="Model card" className="md:col-span-2">
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          <InfoRow label="Problem type">
            <span className="capitalize">{model.problemType}</span>
          </InfoRow>
          <InfoRow label="Domain">{model.domain || '—'}</InfoRow>
        </div>
        <InfoRow label="Description">
          <span className="leading-relaxed text-[#828DA3]">
            {model.description || 'No description.'}
          </span>
        </InfoRow>
        {model.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {model.tags.map((tag) => (
              <Badge
                key={tag}
                className="border-stock rounded-md border bg-[#1E2533] text-[#828DA3]"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </Panel>

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
        title="Artifacts"
        description={
          latestRun && (
            <>
              Created by{' '}
              <Link
                to={`/dashboard/ml-studio/experiments/${latestRun.experimentId}/runs/${latestRun.id}`}
                className="hover:text-primary text-[#F4F7FC]"
              >
                {latestRun.name}
              </Link>{' '}
              ·{' '}
              {formatDistanceToNow(new Date(latestRun.startedAt), {
                addSuffix: true,
              })}
            </>
          )
        }
        className="md:col-span-2"
        action={
          latestRun && (
            <Button
              preset="outline"
              onClick={() =>
                navigate(
                  `/dashboard/ml-studio/experiments/${latestRun.experimentId}/runs/${latestRun.id}`
                )
              }
            >
              Go To {latestRun.name}
            </Button>
          )
        }
      >
        {artifacts.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Size</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artifacts.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium text-[#F4F7FC]">
                    {a.name}
                  </TableCell>
                  <TableCell className="text-[#828DA3]">{a.type}</TableCell>
                  <TableCell className="text-[#828DA3]">{a.format}</TableCell>
                  <TableCell className="text-[#828DA3]">{a.size}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-[#586378]">No artifacts attached.</p>
        )}
      </Panel>
    </div>
  )
}

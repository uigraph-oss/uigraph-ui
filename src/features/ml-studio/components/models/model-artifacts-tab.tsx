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
import { formatDistanceToNow } from 'date-fns'
import { Link, useNavigate } from 'react-router-dom'
import { useMlStudioData } from '../../contexts/ml-studio-data-context'
import { useModelContext } from '../../contexts/model-context'
import { Panel } from '../panel'

export function ModelArtifactsTab() {
  const { selectedVersion } = useModelContext()
  const { runs, experiments, artifacts: allArtifacts } = useMlStudioData()
  const navigate = useNavigate()

  const latestRun = runs.find((r) => r.id === selectedVersion?.runId)
  const runExperiment = experiments.find(
    (e) => e.id === latestRun?.experimentId
  )
  const runLink = latestRun
    ? `/dashboard/ml-studio/projects/${runExperiment?.projectId}/experiments/${latestRun.experimentId}/runs/${latestRun.id}`
    : ''
  const artifacts = latestRun
    ? allArtifacts.filter((a) => latestRun.artifactIds.includes(a.id))
    : []

  return (
    <div className="grid grid-cols-1 gap-6 p-6">
      <Panel
        title="Artifacts"
        description={
          latestRun && (
            <>
              Created by{' '}
              <Link to={runLink} className="hover:text-primary text-[#F4F7FC]">
                {latestRun.name}
              </Link>{' '}
              ·{' '}
              {formatDistanceToNow(new Date(latestRun.startedAt), {
                addSuffix: true,
              })}
            </>
          )
        }
        action={
          latestRun && (
            <Button preset="outline" onClick={() => navigate(runLink)}>
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

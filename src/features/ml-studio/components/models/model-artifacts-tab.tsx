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
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { formatDistanceToNow } from 'date-fns'
import { DownloadIcon } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { ML_STUDIO_RUN_ARTIFACTS } from '../../api/ml-studio'
import { useModelContext } from '../../contexts/model-context'
import { Panel } from '../panel'

export function ModelArtifactsTab() {
  const { selectedRun, selectedRunExperiment } = useModelContext()
  const orgId = useCurrentOrganization()?.id
  const navigate = useNavigate()

  const latestRun = selectedRun
  const runExperiment = selectedRunExperiment

  const runLink = latestRun
    ? `/dashboard/ml-studio/projects/${runExperiment?.projectId}/experiments/${latestRun.experimentId}/runs/${latestRun.id}`
    : ''

  const artifactsQuery = useQuery(ML_STUDIO_RUN_ARTIFACTS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !latestRun?.id,
    variables: { orgId: orgId!, runId: latestRun?.id ?? '' },
  })
  const artifacts = artifactsQuery.data?.mlArtifacts ?? []

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
              Go To Training Run
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
                <TableHead>Synced</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artifacts.map((a) => {
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium text-[#F4F7FC]">
                      {a.name}
                    </TableCell>
                    <TableCell className="text-[#828DA3]">{a.type}</TableCell>
                    <TableCell className="text-[#828DA3]">{a.format}</TableCell>
                    <TableCell className="text-[#828DA3]">{a.size}</TableCell>
                    <TableCell
                      className="text-[#828DA3]"
                      title={a.syncedAt ?? undefined}
                    >
                      {a.syncedAt
                        ? formatDistanceToNow(new Date(a.syncedAt), {
                            addSuffix: true,
                          })
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {a.downloadUri ? (
                        <a
                          href={a.downloadUri}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-[#B4BECE] hover:text-[#F4F7FC]"
                        >
                          <DownloadIcon size={14} />
                          Download
                        </a>
                      ) : (
                        <span className="text-[#586378]">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-[#586378]">No artifacts attached.</p>
        )}
      </Panel>
    </div>
  )
}

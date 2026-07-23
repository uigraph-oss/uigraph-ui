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
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { format, formatDistanceToNow } from 'date-fns'
import { ArrowLeftIcon } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ML_STUDIO_DATASET,
  ML_STUDIO_PROJECT,
  ML_STUDIO_RUN,
  ML_STUDIO_RUN_ARTIFACTS,
} from '../../api/ml-studio'
import { artifactDownloadUrl } from '../../format'
import { InfoRow, Panel } from '../panel'
import { StatusBadge } from '../status-badge'

export function RunDetailPage() {
  const { runId, projectId } = useParams<{
    runId: string
    projectId: string
  }>()
  const navigate = useNavigate()
  const orgId = useCurrentOrganization()?.id

  const projectQuery = useQuery(ML_STUDIO_PROJECT, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !projectId,
    variables: { orgId: orgId!, id: projectId! },
  })
  const sourceUrl = projectQuery.data?.mlProject?.sourceUrl

  const runQuery = useQuery(ML_STUDIO_RUN, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !runId,
    variables: { orgId: orgId!, id: runId! },
  })
  const run = runQuery.data?.mlRun

  const artifactsQuery = useQuery(ML_STUDIO_RUN_ARTIFACTS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !runId,
    variables: { orgId: orgId!, runId },
  })
  const artifacts = artifactsQuery.data?.mlArtifacts ?? []

  const datasetQuery = useQuery(ML_STUDIO_DATASET, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !run?.datasetId,
    variables: { orgId: orgId!, id: run?.datasetId ?? '' },
  })
  const dataset = run?.datasetId ? datasetQuery.data?.mlDataset : undefined

  if (!run) {
    return <div className="p-6 text-[#828DA3]">Run not found.</div>
  }

  const parameters = (run.parameters ?? {}) as Record<string, unknown>
  const metrics = (run.metrics ?? {}) as Record<string, number>

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-[#F4F7FC]">{run.name}</h2>
            <StatusBadge value={run.status} />
          </div>
          <p className="mt-1 text-sm text-[#586378]">{run.notes}</p>
        </div>
        <Button preset="outline" onClick={() => navigate(-1)}>
          <ArrowLeftIcon />
          Go Back
        </Button>
      </div>

      <Panel>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          <InfoRow label="Started">
            {run.startedAt ? format(new Date(run.startedAt), 'PPpp') : '—'}
          </InfoRow>
          <InfoRow label="Ended">
            {run.endedAt ? format(new Date(run.endedAt), 'PPpp') : '—'}
          </InfoRow>
          <InfoRow label="Duration">{run.duration}</InfoRow>
          <InfoRow label="Last updated">
            {run.updatedAt ? format(new Date(run.updatedAt), 'PPpp') : '—'}
          </InfoRow>
          <InfoRow label="Last synced">
            {run.syncedAt ? format(new Date(run.syncedAt), 'PPpp') : '—'}
          </InfoRow>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel title="Parameters">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parameter</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(parameters).map(([key, value]) => (
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

        <Panel title="Metrics">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(metrics).map(([key, value]) => (
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

      <Panel title="Artifacts">
        {artifacts.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>URI</TableHead>
                <TableHead>Synced</TableHead>
                <TableHead>Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artifacts.map((a) => {
                const downloadUrl = artifactDownloadUrl(sourceUrl, a.uri)
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium text-[#F4F7FC]">
                      {a.name}
                    </TableCell>
                    <TableCell className="text-[#828DA3]">{a.type}</TableCell>
                    <TableCell className="text-[#828DA3]">{a.format}</TableCell>
                    <TableCell className="text-[#828DA3]">{a.size}</TableCell>
                    <TableCell className="font-mono text-xs text-[#586378]">
                      {a.uri}
                    </TableCell>
                    <TableCell
                      className="text-sm text-[#828DA3]"
                      title={a.syncedAt ?? undefined}
                    >
                      {a.syncedAt
                        ? formatDistanceToNow(new Date(a.syncedAt), {
                            addSuffix: true,
                          })
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {downloadUrl ? (
                        <a
                          href={downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline"
                        >
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

      <Panel title="Input dataset">
        {dataset ? (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              <InfoRow label="Context">
                <Badge className="border-stock rounded-md border bg-[#1E2533] text-[#828DA3] capitalize">
                  {dataset.context}
                </Badge>
              </InfoRow>
              <InfoRow label="Name">{dataset.name}</InfoRow>
              <InfoRow label="Source">
                <span className="font-mono text-xs text-[#586378]">
                  {dataset.source}
                </span>
              </InfoRow>
              <InfoRow label="Source type">{dataset.sourceType}</InfoRow>
              <InfoRow label="Rows">
                {dataset.rowCount.toLocaleString()}
              </InfoRow>
              <InfoRow label="Digest">
                <span className="font-mono text-xs text-[#586378]">
                  {dataset.digest}
                </span>
              </InfoRow>
            </div>

            {dataset.schema.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataset.schema.map((field) => (
                    <TableRow key={field.name}>
                      <TableCell className="font-mono text-[#F4F7FC]">
                        {field.name}
                      </TableCell>
                      <TableCell className="font-mono text-[#828DA3]">
                        {field.type}
                      </TableCell>
                      <TableCell className="text-[#828DA3]">
                        {field.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        ) : (
          <p className="text-sm text-[#586378]">
            No input dataset logged for this run.
          </p>
        )}
      </Panel>
    </div>
  )
}

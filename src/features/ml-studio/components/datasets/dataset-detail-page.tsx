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
import { Link, useParams } from 'react-router-dom'
import { mockDatasets } from '../../constants/mock-data'
import { useModelContext } from '../../contexts/model-context'
import { InfoRow, Panel } from '../panel'

export function DatasetDetailPage() {
  const { model, selectedVersionId } = useModelContext()
  const { datasetId } = useParams<{ datasetId: string }>()
  const versionQuery = selectedVersionId ? `?v=${selectedVersionId}` : ''

  const dataset = mockDatasets.find((d) => d.id === datasetId)

  if (!dataset) {
    return <div className="p-6 text-[#828DA3]">Dataset not found.</div>
  }

  const parent = dataset.parentId
    ? mockDatasets.find((d) => d.id === dataset.parentId)
    : undefined

  return (
    <div className="flex flex-col gap-5 p-6">
      <div>
        <h2 className="text-xl font-semibold text-[#F4F7FC]">
          {dataset.name} {dataset.version}
        </h2>
        <p className="mt-1 text-sm text-[#828DA3]">{dataset.description}</p>
      </div>

      <Panel>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          <InfoRow label="Type">
            <span className="capitalize">{dataset.type}</span>
          </InfoRow>
          <InfoRow label="Rows">{dataset.rowCount.toLocaleString()}</InfoRow>
          <InfoRow label="Size">{dataset.size}</InfoRow>
          <InfoRow label="License">{dataset.license}</InfoRow>
          <InfoRow label="Source">
            <span className="font-mono text-xs text-[#586378]">
              {dataset.source}
            </span>
          </InfoRow>
          <InfoRow label="Lineage">
            {parent ? (
              <Link
                to={`/dashboard/ml-studio/${model.id}/datasets/${parent.id}${versionQuery}`}
                className="hover:text-primary"
              >
                {parent.name} {parent.version}
              </Link>
            ) : (
              'Root dataset'
            )}
          </InfoRow>
          <InfoRow label="Tags">
            <div className="flex flex-wrap gap-1">
              {dataset.tags.map((t) => (
                <Badge
                  key={t}
                  className="border-stock rounded-md border bg-[#1E2533] text-[#828DA3]"
                >
                  {t}
                </Badge>
              ))}
            </div>
          </InfoRow>
        </div>
      </Panel>

      <Panel title="Split" description="Train / validation / test partition.">
        <div className="flex h-3 w-full overflow-hidden rounded-full">
          <div
            className="bg-[#3B6BFF]"
            style={{ width: `${dataset.split.train}%` }}
          />
          <div
            className="bg-[#21AD6D]"
            style={{ width: `${dataset.split.validation}%` }}
          />
          <div
            className="bg-[#F5A623]"
            style={{ width: `${dataset.split.test}%` }}
          />
        </div>
        <div className="flex gap-5 text-sm">
          <span className="text-[#828DA3]">
            <span className="mr-1 inline-block size-2 rounded-full bg-[#3B6BFF]" />
            Train {dataset.split.train}%
          </span>
          <span className="text-[#828DA3]">
            <span className="mr-1 inline-block size-2 rounded-full bg-[#21AD6D]" />
            Validation {dataset.split.validation}%
          </span>
          <span className="text-[#828DA3]">
            <span className="mr-1 inline-block size-2 rounded-full bg-[#F5A623]" />
            Test {dataset.split.test}%
          </span>
        </div>
      </Panel>

      <Panel
        title="Feature schema"
        description="Fields available in this dataset."
      >
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
      </Panel>
    </div>
  )
}

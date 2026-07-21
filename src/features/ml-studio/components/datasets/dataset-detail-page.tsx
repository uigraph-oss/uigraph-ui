'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useParams } from 'react-router-dom'
import { useMlStudioData } from '../../contexts/ml-studio-data-context'
import { InfoRow, Panel } from '../panel'

export function DatasetDetailPage() {
  const { datasetId } = useParams<{ datasetId: string }>()

  const { datasets } = useMlStudioData()
  const dataset = datasets.find((d) => d.id === datasetId)

  if (!dataset) {
    return <div className="p-6 text-[#828DA3]">Dataset not found.</div>
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      <div>
        <h2 className="text-xl font-semibold text-[#F4F7FC]">{dataset.name}</h2>
      </div>

      <Panel>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          <InfoRow label="Type">
            <span className="capitalize">{dataset.type}</span>
          </InfoRow>
          <InfoRow label="Rows">{dataset.rowCount.toLocaleString()}</InfoRow>
          <InfoRow label="Source">
            <span className="font-mono text-xs text-[#586378]">
              {dataset.source}
            </span>
          </InfoRow>
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

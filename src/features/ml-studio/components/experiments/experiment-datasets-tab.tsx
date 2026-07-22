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
import { useQuery } from '@apollo/client'
import { ML_STUDIO_DATASETS } from '../../api/ml-studio'
import { useExperimentContext } from '../../contexts/experiment-context'
import { useMlStudioData } from '../../contexts/ml-studio-data-context'

export function ExperimentDatasetsTab() {
  const { experimentId } = useExperimentContext()
  const { orgId } = useMlStudioData()

  const datasetsQuery = useQuery(ML_STUDIO_DATASETS, {
    skip: !orgId || !experimentId,
    variables: { orgId: orgId!, experimentId },
    fetchPolicy: 'cache-and-network',
  })
  const datasets = datasetsQuery.data?.mlDatasets ?? []

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-[#F4F7FC]">Datasets</h2>
        <p className="text-sm text-[#828DA3]">
          Datasets logged to this experiment.
        </p>
      </div>

      {datasets.length > 0 ? (
        <div className="border-stock bg-card overflow-hidden rounded-xl border">
          <Table className="table-fixed [&_td]:px-4 [&_td]:py-3.5 [&_th]:h-12 [&_th]:px-4">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="w-32">Context</TableHead>
                <TableHead className="w-56">Source</TableHead>
                <TableHead className="w-32">Source type</TableHead>
                <TableHead className="w-40">Digest</TableHead>
                <TableHead className="w-24">Rows</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datasets.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <div className="truncate font-medium text-[#F4F7FC]">
                      {d.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="border-stock rounded-md border bg-[#1E2533] text-[#828DA3] capitalize">
                      {d.context}
                    </Badge>
                  </TableCell>
                  <TableCell className="truncate font-mono text-xs text-[#586378]">
                    {d.source}
                  </TableCell>
                  <TableCell className="truncate text-[#828DA3]">
                    {d.sourceType}
                  </TableCell>
                  <TableCell className="truncate font-mono text-xs text-[#586378]">
                    {d.digest}
                  </TableCell>
                  <TableCell className="text-[#828DA3]">
                    {d.rowCount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-sm text-[#586378]">
          No datasets for this experiment.
        </p>
      )}
    </div>
  )
}

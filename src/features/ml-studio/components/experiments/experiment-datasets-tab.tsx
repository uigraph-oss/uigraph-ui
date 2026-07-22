'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useQuery } from '@apollo/client'
import { ML_STUDIO_EVALUATION_DATASETS } from '../../api/ml-studio'
import { useExperimentContext } from '../../contexts/experiment-context'
import { useMlStudioData } from '../../contexts/ml-studio-data-context'
import { Panel } from '../panel'

export function ExperimentDatasetsTab() {
  const { experimentId } = useExperimentContext()
  const { orgId } = useMlStudioData()

  const evaluationDatasetsQuery = useQuery(ML_STUDIO_EVALUATION_DATASETS, {
    skip: !orgId || !experimentId,
    variables: { orgId: orgId!, experimentId },
    fetchPolicy: 'cache-and-network',
  })
  const evaluationDatasets =
    evaluationDatasetsQuery.data?.mlEvaluationDatasets ?? []

  return (
    <div className="flex flex-col gap-5 p-6">
      <Panel
        title="Datasets"
        description="Evaluation datasets registered to this experiment."
      >
        {evaluationDatasets.length > 0 ? (
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="w-56">Source</TableHead>
                <TableHead className="w-32">Source type</TableHead>
                <TableHead className="w-24">Rows</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluationDatasets.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <div className="truncate font-medium text-[#F4F7FC]">
                      {d.name}
                    </div>
                  </TableCell>
                  <TableCell className="truncate font-mono text-xs text-[#586378]">
                    {d.source}
                  </TableCell>
                  <TableCell className="truncate text-[#828DA3]">
                    {d.sourceType}
                  </TableCell>
                  <TableCell className="text-[#828DA3]">
                    {d.rowCount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-[#586378]">
            No evaluation datasets for this experiment.
          </p>
        )}
      </Panel>
    </div>
  )
}

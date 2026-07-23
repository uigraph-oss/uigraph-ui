'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useNavigate, useParams } from 'react-router-dom'
import { useMlStudioData } from '../../contexts/ml-studio-data-context'
import { formatMetric } from '../../format'
import { StatusBadge } from '../status-badge'

export function ExperimentsTab() {
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()
  const { experiments: allExperiments, runs: allRuns } = useMlStudioData()
  const experiments = allExperiments.filter((e) => e.projectId === projectId)

  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-[#F4F7FC]">Experiments</h2>
        <p className="text-sm text-[#828DA3]">
          Research efforts across all models.
        </p>
      </div>

      <div className="border-stock bg-card overflow-hidden rounded-xl border">
        <Table className="table-fixed [&_td]:px-4 [&_td]:py-3.5 [&_th]:h-12 [&_th]:px-4">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-20">Runs</TableHead>
              <TableHead className="w-48">Latest result</TableHead>
              <TableHead className="w-36">Last activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {experiments.map((exp) => {
              const runs = allRuns.filter((r) => r.experimentId === exp.id)
              const latestRun = runs[runs.length - 1]
              const primaryMetric = Object.keys(latestRun?.metrics ?? {})[0]
              return (
                <TableRow
                  key={exp.id}
                  className="cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/dashboard/ml-studio/projects/${projectId}/experiments/${exp.id}`
                    )
                  }
                >
                  <TableCell>
                    <div className="truncate font-medium text-[#F4F7FC]">
                      {exp.name}
                    </div>
                    <div className="truncate text-sm text-[#828DA3]">
                      {exp.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={exp.status} />
                  </TableCell>
                  <TableCell className="text-[#828DA3]">
                    {runs.length}
                  </TableCell>
                  <TableCell className="text-[#F4F7FC]">
                    {primaryMetric ? (
                      <>
                        <div className="truncate">
                          {formatMetric(latestRun.metrics[primaryMetric])}
                        </div>
                        <div className="truncate text-xs text-[#586378]">
                          {primaryMetric.replace(/_/g, ' ')}
                        </div>
                      </>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-[#828DA3]">
                    {new Date(exp.startedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

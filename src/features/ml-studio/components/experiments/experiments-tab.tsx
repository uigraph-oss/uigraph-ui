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
import { PlusIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { mockExperiments, mockRuns } from '../../constants/mock-data'
import { useModelContext } from '../../contexts/model-context'
import { StatusBadge } from '../status-badge'

export function ExperimentsTab() {
  const { model, selectedVersionId } = useModelContext()
  const navigate = useNavigate()
  const versionQuery = selectedVersionId ? `?v=${selectedVersionId}` : ''

  const experiments = mockExperiments.filter(
    (e) => e.versionId === selectedVersionId
  )

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#828DA3]">
          Research efforts scoped to the selected version.
        </p>
        <Button
          preset="primary"
          className="h-10"
          onClick={() =>
            navigate(
              `/dashboard/ml-studio/${model.id}/experiments/new${versionQuery}`
            )
          }
        >
          <PlusIcon />
          New Experiment
        </Button>
      </div>

      <div className="border-stock bg-card overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Runs</TableHead>
              <TableHead>Latest result</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Last activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {experiments.map((exp) => {
              const runs = mockRuns.filter((r) => r.experimentId === exp.id)
              const latestRun = runs[runs.length - 1]
              const primaryMetric = Object.keys(latestRun?.metrics ?? {})[0]
              return (
                <TableRow
                  key={exp.id}
                  className="cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/dashboard/ml-studio/${model.id}/experiments/${exp.id}${versionQuery}`
                    )
                  }
                >
                  <TableCell>
                    <div className="font-medium text-[#F4F7FC]">{exp.name}</div>
                    <div className="line-clamp-1 text-sm text-[#828DA3]">
                      {exp.goal}
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
                        {latestRun.metrics[primaryMetric]}
                        <div className="text-xs text-[#586378]">
                          {primaryMetric.replace(/_/g, ' ')}
                        </div>
                      </>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="text-[#828DA3]">{exp.owner}</TableCell>
                  <TableCell className="text-sm text-[#828DA3]">
                    {new Date(
                      exp.endedAt || exp.startedAt
                    ).toLocaleDateString()}
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

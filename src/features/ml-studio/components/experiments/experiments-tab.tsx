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
import { ModelVersionLink } from '../model-version-link'
import { StatusBadge } from '../status-badge'

export function ExperimentsTab() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#828DA3]">
          Research efforts across all models.
        </p>
        <Button
          preset="primary"
          className="h-10"
          onClick={() => navigate('/dashboard/ml-studio/experiments/new')}
        >
          <PlusIcon />
          New Experiment
        </Button>
      </div>

      <div className="border-stock bg-card overflow-hidden rounded-xl border">
        <Table className="[&_td]:px-4 [&_td]:py-3.5 [&_th]:h-12 [&_th]:px-4">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Model / Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Runs</TableHead>
              <TableHead>Latest result</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Last activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockExperiments.map((exp) => {
              const runs = mockRuns.filter((r) => r.experimentId === exp.id)
              const latestRun = runs[runs.length - 1]
              const primaryMetric = Object.keys(latestRun?.metrics ?? {})[0]
              return (
                <TableRow
                  key={exp.id}
                  className="cursor-pointer"
                  onClick={() =>
                    navigate(`/dashboard/ml-studio/experiments/${exp.id}`)
                  }
                >
                  <TableCell>
                    <div className="font-medium text-[#F4F7FC]">{exp.name}</div>
                    <div className="line-clamp-1 text-sm text-[#828DA3]">
                      {exp.goal}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ModelVersionLink
                      modelId={exp.modelId}
                      versionId={exp.versionId}
                    />
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

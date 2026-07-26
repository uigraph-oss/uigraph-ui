'use client'

import { MLflowIcon } from '@/assets/svgs'
import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { BetterDialogProvider } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { EllipsisVertical, Pencil, PlusIcon, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  DELETE_ML_EXPERIMENT,
  ML_STUDIO_EXPERIMENT_RUNS,
  ML_STUDIO_EXPERIMENTS,
} from '../../api/ml-studio'
import { formatMetric } from '../../format'
import type { Experiment } from '../../types'
import { MlUser } from '../ml-user'
import { StatusBadge } from '../status-badge'
import { ExperimentModal } from './experiment-modal'

export function ExperimentsTab() {
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()
  const orgId = useCurrentOrganization()?.id
  const experimentsQuery = useQuery(ML_STUDIO_EXPERIMENTS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !projectId,
    variables: { orgId: orgId!, projectId },
  })
  const runsQuery = useQuery(ML_STUDIO_EXPERIMENT_RUNS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !projectId,
    variables: { orgId: orgId!, projectId },
  })
  const experiments = experimentsQuery.data?.mlExperiments ?? []
  const allRuns = runsQuery.data?.mlRuns ?? []

  const [deleteExperiment] = useMutation(DELETE_ML_EXPERIMENT, {
    refetchQueries: ['MlStudioExperiments'],
    awaitRefetchQueries: true,
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [editingExperiment, setEditingExperiment] = useState<Experiment | null>(
    null
  )
  const [deletingExperiment, setDeletingExperiment] =
    useState<Experiment | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-[#F4F7FC]">Experiments</h2>
          <p className="text-sm text-[#828DA3]">
            Research efforts across all models.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingExperiment(null)
            setModalOpen(true)
          }}
        >
          <PlusIcon />
          New Experiment
        </Button>
      </div>

      <div className="border-stock bg-card overflow-hidden rounded-xl border">
        <Table className="table-fixed [&_td]:px-4 [&_td]:py-3.5 [&_th]:h-12 [&_th]:px-4">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-44">Source</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-20">Runs</TableHead>
              <TableHead className="w-48">Latest result</TableHead>
              <TableHead className="w-36">Last activity</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {experiments.map((exp) => {
              const runs = allRuns.filter((r) => r.experimentId === exp.id)
              const latestRun = runs[runs.length - 1]
              const metrics = (latestRun?.metrics ?? {}) as Record<
                string,
                number
              >
              const primaryMetric = Object.keys(metrics)[0]
              const isManual = exp.source === 'manual'
              const experiment: Experiment = {
                id: exp.id,
                projectId: exp.projectId ?? undefined,
                name: exp.name,
                description: exp.description,
                status: exp.status as Experiment['status'],
                startedAt: exp.startedAt ?? '',
                source: exp.source as Experiment['source'],
              }
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
                  <TableCell className="text-sm">
                    {isManual && <MlUser identifier={exp.createdBy} />}
                    {!isManual && (
                      <span className="flex items-center gap-2 text-[#F4F7FC]">
                        <MLflowIcon className="size-5" />
                        MLflow
                      </span>
                    )}
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
                          {formatMetric(metrics[primaryMetric])}
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
                    {exp.startedAt
                      ? new Date(exp.startedAt).toLocaleDateString()
                      : '—'}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {isManual && (
                      <DropdownMenu
                        open={openMenuId === exp.id}
                        onOpenChange={(o) => setOpenMenuId(o ? exp.id : null)}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <EllipsisVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-[#141925]"
                        >
                          <DropdownMenuItem
                            onClick={() => {
                              setOpenMenuId(null)
                              setEditingExperiment(experiment)
                              setModalOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setOpenMenuId(null)
                              setDeletingExperiment(experiment)
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="stroke-destructive h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {projectId && (
        <BetterDialogProvider open={modalOpen} onOpenChange={setModalOpen}>
          <ExperimentModal
            onClose={() => setModalOpen(false)}
            experiment={editingExperiment}
            projectId={projectId}
          />
        </BetterDialogProvider>
      )}

      <BetterDeleteConfirmationModal
        open={!!deletingExperiment}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingExperiment(null)
          }
        }}
        title="Delete experiment?"
        description="This will permanently remove this experiment. Runs recorded under it will remain but stay unlinked in listings."
        onConfirm={async () => {
          if (!orgId || !deletingExperiment) {
            return
          }
          await deleteExperiment({
            variables: { orgId, id: deletingExperiment.id },
          })
        }}
      />
    </div>
  )
}

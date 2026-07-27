'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TEAMS } from '@/features/dashboard-diagrams/api/teams'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ML_STUDIO_EXPERIMENTS } from '../../api/experiments'
import { SET_ML_MODEL_VERSION_RUN } from '../../api/model-versions'
import { ML_STUDIO_PROJECTS } from '../../api/projects'
import { ML_STUDIO_EXPERIMENT_RUNS } from '../../api/runs'
import { useMetricColumns } from '../../hooks/use-metric-columns'
import { FormField } from '../form-field'
import { MetricChips } from '../metric-chips'
import { StatusBadge } from '../status-badge'

const triggerClassName =
  'text-foreground/80 h-[56px] w-full rounded-[16px] border-[#2A3242] bg-transparent px-6'

export function LinkRunDialog({
  onClose,
  versionId,
  runId,
  experimentId,
  projectId,
}: {
  onClose: () => void
  versionId: string
  runId?: string
  experimentId?: string
  projectId?: string
}) {
  const orgId = useCurrentOrganization()?.id
  const [pickedTeamId, setPickedTeamId] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState(projectId ?? '')
  const [selectedExperimentId, setSelectedExperimentId] = useState(
    experimentId ?? ''
  )
  const [selectedRunId, setSelectedRunId] = useState(runId ?? '')
  const [runOpen, setRunOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const teamsQuery = useQuery(TEAMS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
    variables: { orgId: orgId! },
  })
  const projectsQuery = useQuery(ML_STUDIO_PROJECTS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
    variables: { orgId: orgId! },
  })
  const experimentsQuery = useQuery(ML_STUDIO_EXPERIMENTS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !selectedProjectId,
    variables: { orgId: orgId!, projectId: selectedProjectId },
  })
  const runsQuery = useQuery(ML_STUDIO_EXPERIMENT_RUNS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !selectedExperimentId,
    variables: { orgId: orgId!, experimentId: selectedExperimentId },
  })

  const teams = teamsQuery.data?.teams ?? []
  const allProjects = projectsQuery.data?.mlProjects ?? []
  const experiments = experimentsQuery.data?.mlExperiments ?? []
  const runs = useMemo(() => runsQuery.data?.mlRuns ?? [], [runsQuery.data])

  const availableMetricKeys = useMemo(() => {
    const keys: string[] = []
    for (const run of runs) {
      for (const key of Object.keys(
        (run.metrics ?? {}) as Record<string, number>
      )) {
        if (!keys.includes(key)) {
          keys.push(key)
        }
      }
    }
    return keys
  }, [runs])

  const metricColumns = useMetricColumns('ml_run', availableMetricKeys)
  const selectedRun = runs.find((r) => r.id === selectedRunId)

  const preselectedTeamId =
    allProjects.find((p) => p.id === projectId)?.teamId ?? ''
  const selectedTeamId = pickedTeamId !== '' ? pickedTeamId : preselectedTeamId
  const projects = allProjects.filter(
    (p) => p.teamId === selectedTeamId && p.type === 'training'
  )

  const noTeams = !teamsQuery.loading && teams.length === 0
  const noProjects =
    !!selectedTeamId && !projectsQuery.loading && projects.length === 0
  const noExperiments =
    !!selectedProjectId && !experimentsQuery.loading && experiments.length === 0
  const noRuns =
    !!selectedExperimentId && !runsQuery.loading && runs.length === 0

  const [setVersionRun] = useMutation(SET_ML_MODEL_VERSION_RUN, {
    refetchQueries: ['MlStudioModelVersions'],
    awaitRefetchQueries: true,
  })

  function pickTeam(id: string) {
    setPickedTeamId(id)
    setSelectedProjectId('')
    setSelectedExperimentId('')
    setSelectedRunId('')
  }

  function pickProject(id: string) {
    setSelectedProjectId(id)
    setSelectedExperimentId('')
    setSelectedRunId('')
  }

  function pickExperiment(id: string) {
    setSelectedExperimentId(id)
    setSelectedRunId('')
  }

  async function save(nextRunId: string | null) {
    if (!orgId) {
      return
    }
    setSaving(true)
    try {
      await setVersionRun({
        variables: { orgId, versionId, runId: nextRunId },
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  async function submit() {
    if (!selectedRunId) {
      return
    }
    await save(selectedRunId)
  }

  return (
    <BetterDialogContent
      title={runId ? 'Change training run' : 'Link training run'}
      description="Pick the run this version was trained from."
      footerCancel
      footerSubmit={runId ? 'Save' : 'Link run'}
      footerSubmitLoading={saving}
      onFooterSubmitClick={submit}
    >
      <div className="flex flex-col gap-5">
        <FormField label="Team">
          <Select value={selectedTeamId} onValueChange={pickTeam}>
            <SelectTrigger className={triggerClassName}>
              <SelectValue placeholder="Select a team" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {noTeams && (
            <p className="text-destructive text-xs">
              No teams found in this organization.
            </p>
          )}
        </FormField>

        <FormField label="Project">
          <Select
            value={selectedProjectId}
            onValueChange={pickProject}
            disabled={!selectedTeamId}
          >
            <SelectTrigger className={triggerClassName}>
              <SelectValue
                placeholder={
                  selectedTeamId ? 'Select a project' : 'Select a team first'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {noProjects && (
            <p className="text-destructive text-xs">
              No training projects found in this team.
            </p>
          )}
        </FormField>

        <FormField label="Experiment">
          <Select
            value={selectedExperimentId}
            onValueChange={pickExperiment}
            disabled={!selectedProjectId}
          >
            <SelectTrigger className={triggerClassName}>
              <SelectValue
                placeholder={
                  selectedProjectId
                    ? 'Select an experiment'
                    : 'Select a project first'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {experiments.map((experiment) => (
                <SelectItem key={experiment.id} value={experiment.id}>
                  {experiment.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {noExperiments && (
            <p className="text-destructive text-xs">
              No experiments found in this project.
            </p>
          )}
        </FormField>

        <FormField label="Training run">
          <Popover open={runOpen} onOpenChange={setRunOpen}>
            <PopoverTrigger asChild disabled={!selectedExperimentId}>
              <button
                type="button"
                className="flex min-h-[56px] w-full items-center justify-between gap-2 rounded-[16px] border border-[#2A3242] bg-transparent px-6 py-2 text-left text-sm focus:outline-none disabled:opacity-50"
              >
                {selectedRun ? (
                  <span className="flex-1 text-[#F4F7FC]">
                    {selectedRun.name}
                  </span>
                ) : (
                  <span className="text-muted-foreground flex-1">
                    {selectedExperimentId
                      ? 'Select a training run'
                      : 'Select an experiment first'}
                  </span>
                )}
                <ChevronsUpDown className="text-muted-foreground size-4 shrink-0 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-(--radix-popover-trigger-width) p-0"
              onWheel={(e) => e.stopPropagation()}
            >
              <Command>
                <CommandInput placeholder="Search runs by id or name..." />
                <CommandList>
                  <CommandEmpty>No runs found.</CommandEmpty>
                  <CommandGroup>
                    {runs.map((run) => (
                      <CommandItem
                        key={run.id}
                        value={`${run.name} ${run.id}`}
                        onSelect={() => {
                          setSelectedRunId(run.id)
                          setRunOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            'size-4',
                            selectedRunId === run.id
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        <span className="flex-1">{run.name}</span>
                        <MetricChips
                          metrics={
                            (run.metrics ?? {}) as Record<string, number>
                          }
                          columns={metricColumns.columns}
                        />
                        <StatusBadge value={run.status} />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {noRuns && (
            <p className="text-destructive text-xs">
              No runs found in this experiment.
            </p>
          )}
        </FormField>

        {runId && (
          <Button
            preset="ghost"
            className="self-start"
            onClick={() => save(null)}
          >
            Unlink current run
          </Button>
        )}
      </div>
    </BetterDialogContent>
  )
}

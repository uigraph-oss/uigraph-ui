'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { Badge } from '@/components/ui/badge'
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
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { useState } from 'react'
import {
  LINK_ML_VERSION_EVALUATIONS,
  ML_EXPERIMENT_EVALUATIONS,
} from '../../api/evaluations'
import { ML_STUDIO_EXPERIMENTS } from '../../api/experiments'
import { ML_STUDIO_PROJECTS } from '../../api/projects'
import { FormField } from '../form-field'

const triggerClassName =
  'text-foreground/80 h-[56px] w-full rounded-[16px] border-[#2A3242] bg-transparent px-6'

export function LinkEvaluationsDialog({
  onClose,
  versionId,
}: {
  onClose: () => void
  versionId: string
}) {
  const orgId = useCurrentOrganization()?.id
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [selectedExperimentId, setSelectedExperimentId] = useState('')
  const [selected, setSelected] = useState<{ id: string; name: string }[]>([])
  const [evaluationsOpen, setEvaluationsOpen] = useState(false)
  const [saving, setSaving] = useState(false)

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
  const evaluationsQuery = useQuery(ML_EXPERIMENT_EVALUATIONS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !selectedExperimentId,
    variables: { orgId: orgId!, experimentId: selectedExperimentId },
  })

  const projects = projectsQuery.data?.mlProjects ?? []
  const experiments = experimentsQuery.data?.mlExperiments ?? []
  const allEvaluations = evaluationsQuery.data?.mlExperimentEvaluations ?? []
  const evaluations = allEvaluations.filter((e) => e.versionId !== versionId)

  const noProjects = !projectsQuery.loading && projects.length === 0
  const noExperiments =
    !!selectedProjectId && !experimentsQuery.loading && experiments.length === 0
  const noEvaluations =
    !!selectedExperimentId &&
    !evaluationsQuery.loading &&
    evaluations.length === 0

  const [linkEvaluations] = useMutation(LINK_ML_VERSION_EVALUATIONS, {
    refetchQueries: ['MlVersionEvaluations', 'MlVersionEvaluationsPage'],
    awaitRefetchQueries: true,
  })

  function pickProject(id: string) {
    setSelectedProjectId(id)
    setSelectedExperimentId('')
  }

  function pickExperiment(id: string) {
    setSelectedExperimentId(id)
  }

  function toggle(evaluation: { id: string; name: string }) {
    if (selected.some((e) => e.id === evaluation.id)) {
      setSelected(selected.filter((e) => e.id !== evaluation.id))
      return
    }
    setSelected([...selected, { id: evaluation.id, name: evaluation.name }])
  }

  function remove(evaluationId: string) {
    setSelected(selected.filter((e) => e.id !== evaluationId))
  }

  async function submit() {
    if (!orgId || selected.length === 0) {
      return
    }
    setSaving(true)
    try {
      await linkEvaluations({
        variables: {
          orgId,
          versionId,
          evaluationIds: selected.map((e) => e.id),
        },
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <BetterDialogContent
      title="Link evaluations"
      description="Attach one or more evaluations to this version."
      footerCancel
      footerSubmit={
        selected.length > 1
          ? `Link ${selected.length} evaluations`
          : 'Link evaluation'
      }
      footerSubmitLoading={saving}
      onFooterSubmitClick={submit}
    >
      <div className="flex flex-col gap-5">
        <FormField label="Project">
          <Select value={selectedProjectId} onValueChange={pickProject}>
            <SelectTrigger className={triggerClassName}>
              <SelectValue placeholder="Select a project" />
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
              No projects found in this organization.
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

        <FormField
          label="Evaluations"
          hint="Pick as many as you like — switch project or experiment to keep adding. An evaluation belongs to one version, so linking moves it from the version it is on now."
        >
          <Popover open={evaluationsOpen} onOpenChange={setEvaluationsOpen}>
            <PopoverTrigger asChild disabled={!selectedExperimentId}>
              <button
                type="button"
                className="flex min-h-[56px] w-full items-center justify-between gap-2 rounded-[16px] border border-[#2A3242] bg-transparent px-6 py-2 text-left text-sm focus:outline-none disabled:opacity-50"
              >
                <div className="flex flex-1 flex-wrap items-center gap-1">
                  {selected.length === 0 && (
                    <span className="text-muted-foreground">
                      {selectedExperimentId
                        ? 'Select evaluations'
                        : 'Select an experiment first'}
                    </span>
                  )}
                  {selected.map((evaluation) => (
                    <Badge
                      key={evaluation.id}
                      variant="secondary"
                      className="gap-1"
                    >
                      {evaluation.name}
                      <span
                        role="button"
                        tabIndex={0}
                        className="hover:text-white/70"
                        onClick={(e) => {
                          e.stopPropagation()
                          remove(evaluation.id)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            e.stopPropagation()
                            remove(evaluation.id)
                          }
                        }}
                      >
                        <X className="size-3" />
                      </span>
                    </Badge>
                  ))}
                </div>
                <ChevronsUpDown className="text-muted-foreground size-4 shrink-0 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-(--radix-popover-trigger-width) p-0"
              align="start"
              onWheel={(e) => e.stopPropagation()}
            >
              <Command>
                <CommandInput placeholder="Search evaluations..." />
                <CommandList>
                  <CommandEmpty>No evaluations found.</CommandEmpty>
                  <CommandGroup heading="Evaluations">
                    {evaluations.map((evaluation) => (
                      <CommandItem
                        key={evaluation.id}
                        value={`${evaluation.name} ${evaluation.id}`}
                        onSelect={() => toggle(evaluation)}
                      >
                        <Check
                          className={cn(
                            'size-4',
                            selected.some((e) => e.id === evaluation.id)
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        <div className="flex flex-1 flex-col">
                          <span>{evaluation.name}</span>
                          <span className="text-muted-foreground text-xs">
                            {evaluation.modelName} · version{' '}
                            {evaluation.version}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {noEvaluations && allEvaluations.length === 0 && (
            <p className="text-destructive text-xs">
              No evaluations found in this experiment.
            </p>
          )}
          {noEvaluations && allEvaluations.length > 0 && (
            <p className="text-destructive text-xs">
              Every evaluation in this experiment is already linked to this
              version.
            </p>
          )}
        </FormField>
      </div>
    </BetterDialogContent>
  )
}

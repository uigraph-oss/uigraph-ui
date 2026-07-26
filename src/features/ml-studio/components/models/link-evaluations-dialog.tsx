'use client'

import { BetterDialogContent } from '@/components/better-dialog'
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
import { Check, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'
import {
  LINK_ML_VERSION_EVALUATIONS,
  ML_EXPERIMENT_EVALUATIONS,
  ML_STUDIO_EXPERIMENTS,
  ML_STUDIO_PROJECTS,
} from '../../api/ml-studio'
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
  const [selectedIds, setSelectedIds] = useState<string[]>([])
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
  const evaluations = (
    evaluationsQuery.data?.mlExperimentEvaluations ?? []
  ).filter((e) => e.versionId !== versionId)

  const [linkEvaluations] = useMutation(LINK_ML_VERSION_EVALUATIONS, {
    refetchQueries: ['MlVersionEvaluations'],
    awaitRefetchQueries: true,
  })

  function pickProject(id: string) {
    setSelectedProjectId(id)
    setSelectedExperimentId('')
    setSelectedIds([])
  }

  function pickExperiment(id: string) {
    setSelectedExperimentId(id)
    setSelectedIds([])
  }

  function toggle(evaluationId: string) {
    if (selectedIds.includes(evaluationId)) {
      setSelectedIds(selectedIds.filter((id) => id !== evaluationId))
      return
    }
    setSelectedIds([...selectedIds, evaluationId])
  }

  async function submit() {
    if (!orgId || selectedIds.length === 0) {
      return
    }
    setSaving(true)
    try {
      await linkEvaluations({
        variables: { orgId, versionId, evaluationIds: selectedIds },
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <BetterDialogContent
      title="Link evaluations"
      description="Attach evaluations from an experiment to this version."
      footerCancel
      footerSubmit="Link evaluations"
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
        </FormField>

        <FormField
          label="Evaluations"
          hint="An evaluation belongs to one version, so linking moves it from the version it is on now."
        >
          <Popover open={evaluationsOpen} onOpenChange={setEvaluationsOpen}>
            <PopoverTrigger asChild disabled={!selectedExperimentId}>
              <button
                type="button"
                className="flex min-h-[56px] w-full items-center justify-between gap-2 rounded-[16px] border border-[#2A3242] bg-transparent px-6 py-2 text-left text-sm focus:outline-none disabled:opacity-50"
              >
                {selectedIds.length > 0 ? (
                  <span className="flex-1 text-[#F4F7FC]">
                    {selectedIds.length} selected
                  </span>
                ) : (
                  <span className="text-muted-foreground flex-1">
                    {selectedExperimentId
                      ? 'Select evaluations'
                      : 'Select an experiment first'}
                  </span>
                )}
                <ChevronsUpDown className="text-muted-foreground size-4 shrink-0 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-(--radix-popover-trigger-width) p-0"
              align="start"
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
                        onSelect={() => toggle(evaluation.id)}
                      >
                        <Check
                          className={cn(
                            'size-4',
                            selectedIds.includes(evaluation.id)
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
        </FormField>
      </div>
    </BetterDialogContent>
  )
}

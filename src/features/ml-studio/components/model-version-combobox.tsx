'use client'

import { ActorAvatar } from '@/components/actor-avatar'
import {
  Command,
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
import { useQuery } from '@apollo/client'
import { format, formatDistanceToNow } from 'date-fns'
import { Boxes, Check, ChevronsUpDown, Folder, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  ML_MODEL_VERSIONS_EXPLORE,
  ML_STUDIO_MODEL_VERSION,
} from '../api/model-versions'
import { ML_STUDIO_MODEL } from '../api/models'
import { ML_STUDIO_PROJECTS } from '../api/projects'
import { StatusBadge } from './status-badge'

export function ModelVersionCombobox({
  value,
  onChange,
  onModelChange,
  disabled,
  lockedModelId,
}: {
  value: string
  onChange: (versionId: string) => void
  onModelChange?: (modelId: string) => void
  disabled?: boolean
  lockedModelId?: string
}) {
  const orgId = useCurrentOrganization()?.id
  const { projectId: routeProjectId } = useParams<{ projectId: string }>()
  const [open, setOpen] = useState(false)
  const [pickedTeamId, setPickedTeamId] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const teamsQuery = useQuery(TEAMS, {
    skip: !orgId,
    variables: { orgId: orgId! },
  })
  const teams = teamsQuery.data?.teams ?? []

  const projectsQuery = useQuery(ML_STUDIO_PROJECTS, {
    skip: !orgId,
    variables: { orgId: orgId! },
  })
  const routeTeamId =
    (projectsQuery.data?.mlProjects ?? []).find((p) => p.id === routeProjectId)
      ?.teamId ?? ''
  const teamId = pickedTeamId !== '' ? pickedTeamId : routeTeamId || 'all'

  const exploreQuery = useQuery(ML_MODEL_VERSIONS_EXPLORE, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
    variables: {
      orgId: orgId!,
      teamId: teamId === 'all' ? undefined : teamId,
      modelId: lockedModelId,
      search: search || undefined,
      limit: 50,
    },
  })
  const items =
    exploreQuery.data?.mlModelVersionsExplore.items ??
    exploreQuery.previousData?.mlModelVersionsExplore.items ??
    []
  const total =
    exploreQuery.data?.mlModelVersionsExplore.total ??
    exploreQuery.previousData?.mlModelVersionsExplore.total ??
    0

  const selectedItem = items.find((item) => item.id === value)

  const selectedVersionQuery = useQuery(ML_STUDIO_MODEL_VERSION, {
    skip: !orgId || !value || !!selectedItem,
    variables: { orgId: orgId!, id: value },
  })
  const selectedVersion = selectedVersionQuery.data?.mlModelVersion

  const selectedModelQuery = useQuery(ML_STUDIO_MODEL, {
    skip: !orgId || !selectedVersion,
    variables: { orgId: orgId!, id: selectedVersion?.modelId ?? '' },
  })
  const selectedModel = selectedModelQuery.data?.mlModel

  let selectedLabel:
    | {
        model: string
        version: string
        project?: string
        team?: string
        status: string
      }
    | undefined
  if (selectedItem) {
    selectedLabel = {
      model: selectedItem.model.name,
      version: selectedItem.version,
      project: selectedItem.project?.name ?? undefined,
      team: selectedItem.team?.name ?? undefined,
      status: selectedItem.deploymentStatus,
    }
  } else if (selectedVersion && selectedModel) {
    selectedLabel = {
      model: selectedModel.name,
      version: selectedVersion.version,
      project: undefined,
      team: undefined,
      status: selectedVersion.deploymentStatus,
    }
  }

  type Item = (typeof items)[number]
  const groups: {
    projectId: string
    projectName: string
    teamName: string
    models: { id: string; name: string; versions: Item[] }[]
  }[] = []
  for (const item of items) {
    const projectId = item.project?.id ?? 'unassigned'
    let group = groups.find((g) => g.projectId === projectId)
    if (!group) {
      group = {
        projectId,
        projectName: item.project?.name ?? 'Unassigned',
        teamName: item.team?.name ?? '',
        models: [],
      }
      groups.push(group)
    }
    let model = group.models.find((m) => m.id === item.model.id)
    if (!model) {
      model = { id: item.model.id, name: item.model.name, versions: [] }
      group.models.push(model)
    }
    model.versions.push(item)
  }
  for (const group of groups) {
    for (const model of group.models) {
      model.versions.sort((a, b) => {
        if (!a.createdAt) return 1
        if (!b.createdAt) return -1
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setSearchInput('')
      setSearch('')
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          disabled={disabled}
          className="flex min-h-[56px] w-full items-center justify-between gap-3 rounded-[16px] border border-[#2A3242] bg-transparent px-4 py-2 text-left text-sm transition-colors hover:border-[#3A4256] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {selectedLabel ? (
            <span className="flex min-w-0 flex-1 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-[#2A3242] bg-[#0F1523]">
                <Boxes className="size-4 text-[#828DA3]" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-medium text-[#F4F7FC]">
                    {selectedLabel.model}
                  </span>
                  <span className="shrink-0 rounded-md border border-[#2A3242] bg-[#1E2533] px-1.5 py-0.5 font-mono text-xs text-[#F4F7FC]">
                    v{selectedLabel.version}
                  </span>
                  <StatusBadge
                    value={selectedLabel.status}
                    className="shrink-0 px-1.5 py-0 text-[11px]"
                  />
                </span>
                {(selectedLabel.team || selectedLabel.project) && (
                  <span className="flex min-w-0 items-center gap-1.5 text-xs text-[#586378]">
                    {selectedLabel.team && (
                      <span className="truncate">{selectedLabel.team}</span>
                    )}
                    {selectedLabel.team && selectedLabel.project && (
                      <span className="shrink-0 text-[#3A4256]">/</span>
                    )}
                    {selectedLabel.project && (
                      <span className="truncate">{selectedLabel.project}</span>
                    )}
                  </span>
                )}
              </span>
            </span>
          ) : (
            <span className="flex flex-1 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-dashed border-[#2A3242]">
                <Boxes className="size-4 text-[#3A4256]" />
              </span>
              <span className="text-[#586378]">Select a model version</span>
            </span>
          )}
          <ChevronsUpDown className="size-4 shrink-0 text-[#586378]" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) min-w-[440px] overflow-hidden rounded-[14px] border-[#2A3242] p-0"
        onWheel={(e) => e.stopPropagation()}
      >
        <Command shouldFilter={false} className="bg-transparent">
          <div className="flex items-center gap-2 border-b border-[#2A3242] pr-2 [&_[data-slot=command-input-wrapper]]:min-w-0 [&_[data-slot=command-input-wrapper]]:flex-1 [&_[data-slot=command-input-wrapper]]:border-b-0">
            <CommandInput
              value={searchInput}
              onValueChange={setSearchInput}
              className="h-9 text-sm"
              placeholder="Search models and versions..."
            />
            {!lockedModelId && (
              <Select value={teamId} onValueChange={setPickedTeamId}>
                <SelectTrigger className="h-7 w-[136px] shrink-0 rounded-[8px] border-[#2A3242] bg-transparent text-[13px]">
                  <Users className="size-3.5 shrink-0 text-[#3A4256]" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All teams</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {groups.length === 0 ? (
            <div className="flex h-[140px] flex-col items-center justify-center gap-2 text-sm text-[#586378]">
              <Boxes className="size-5 text-[#2A3242]" />
              {exploreQuery.loading && <span>Loading model versions…</span>}
              {!exploreQuery.loading && search && (
                <span>No matches for “{search}”.</span>
              )}
              {!exploreQuery.loading && !search && teamId !== 'all' && (
                <span>No model versions for this team.</span>
              )}
              {!exploreQuery.loading && !search && teamId === 'all' && (
                <span>No model versions yet.</span>
              )}
            </div>
          ) : (
            <CommandList className="max-h-[340px] py-1.5">
              {groups.map((group) => (
                <div key={group.projectId} className="mb-1">
                  <div className="flex items-center gap-2 px-2.5 py-1.5">
                    <Folder className="size-4 shrink-0 text-[#586378]" />
                    <span className="truncate text-[13px] font-semibold text-[#F4F7FC]">
                      {group.projectName}
                    </span>
                    <span className="ml-auto shrink-0 text-[11px] text-[#586378]">
                      {group.models.length}{' '}
                      {group.models.length === 1 ? 'model' : 'models'}
                    </span>
                  </div>

                  <div className="ml-[18px] border-l border-[#2A3242]">
                    {group.models.map((model) => (
                      <div key={model.id}>
                        <div className="flex items-center gap-2 py-1.5 pr-2.5 pl-2.5">
                          <Boxes className="size-4 shrink-0 text-[#586378]" />
                          <span className="truncate text-[13px] text-[#F4F7FC]">
                            {model.name}
                          </span>
                          {model.versions.some((v) => v.id === value) && (
                            <Check className="size-3.5 shrink-0 text-[#3BD68E]" />
                          )}
                          <span className="ml-auto shrink-0 text-[11px] text-[#586378]">
                            {model.versions.length}{' '}
                            {model.versions.length === 1
                              ? 'version'
                              : 'versions'}
                          </span>
                        </div>

                        <div className="mb-1 ml-[18px] border-l border-[#2A3242] pl-1">
                          {model.versions.map((item) => (
                            <CommandItem
                              key={item.id}
                              value={item.id}
                              className={cn(
                                'items-start gap-2 rounded-[8px] px-2 py-1.5 data-[selected=true]:bg-[#1E2533]',
                                value === item.id && 'bg-[#1E2533]/60'
                              )}
                              onSelect={() => {
                                onChange(item.id)
                                onModelChange?.(item.model.id)
                                handleOpenChange(false)
                              }}
                            >
                              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                <span className="flex min-w-0 items-center gap-2">
                                  <span
                                    className={cn(
                                      'shrink-0 rounded-md border px-1.5 py-0.5 font-mono text-[13px]',
                                      value === item.id
                                        ? 'border-[#3B6BFF]/40 bg-[#3B6BFF]/15 text-[#F4F7FC]'
                                        : 'border-[#2A3242] bg-[#0F1523] text-[#828DA3]'
                                    )}
                                  >
                                    v{item.version}
                                  </span>
                                  <StatusBadge
                                    value={item.deploymentStatus}
                                    className="shrink-0 px-1.5 py-0 text-[11px]"
                                  />
                                  <span className="ml-auto flex shrink-0 items-center gap-1.5">
                                    {item.createdByActor && (
                                      <ActorAvatar
                                        actor={item.createdByActor}
                                        className="size-[18px]"
                                      />
                                    )}
                                    {item.createdAt && (
                                      <span
                                        className="text-xs text-[#586378]"
                                        title={format(
                                          new Date(item.createdAt),
                                          'PPpp'
                                        )}
                                      >
                                        {formatDistanceToNow(
                                          new Date(item.createdAt),
                                          { addSuffix: true }
                                        )}
                                      </span>
                                    )}
                                  </span>
                                </span>
                                {item.description && (
                                  <span className="line-clamp-1 text-[13px] text-[#586378]">
                                    {item.description}
                                  </span>
                                )}
                              </span>
                              <Check
                                className={cn(
                                  'mt-1 size-4 shrink-0 text-[#3BD68E]',
                                  value === item.id
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                            </CommandItem>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CommandList>
          )}

          {items.length < total && (
            <div className="border-t border-[#2A3242] px-3 py-1.5 text-xs text-[#586378]">
              Showing {items.length} of {total} — refine your search to see more
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}

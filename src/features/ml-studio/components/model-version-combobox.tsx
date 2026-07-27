'use client'

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
import { useQuery } from '@apollo/client'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  ML_MODEL_VERSIONS_EXPLORE,
  ML_STUDIO_MODEL_VERSION,
} from '../api/model-versions'
import { ML_STUDIO_MODEL } from '../api/models'

export function ModelVersionCombobox({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (versionId: string) => void
  disabled?: boolean
}) {
  const orgId = useCurrentOrganization()?.id
  const [open, setOpen] = useState(false)
  const [teamId, setTeamId] = useState('all')
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

  const exploreQuery = useQuery(ML_MODEL_VERSIONS_EXPLORE, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
    variables: {
      orgId: orgId!,
      teamId: teamId === 'all' ? undefined : teamId,
      search: search || undefined,
      limit: 50,
    },
  })
  const items =
    exploreQuery.data?.mlModelVersionsExplore.items ??
    exploreQuery.previousData?.mlModelVersionsExplore.items ??
    []

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

  const selectedLabel = selectedItem
    ? { model: selectedItem.model.name, version: selectedItem.version }
    : selectedVersion && selectedModel
      ? { model: selectedModel.name, version: selectedVersion.version }
      : undefined

  const modelIds = [...new Set(items.map((item) => item.model.id))]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          className="flex min-h-[56px] w-full items-center justify-between gap-2 rounded-[16px] border border-[#2A3242] bg-transparent px-6 py-2 text-left text-sm focus:outline-none disabled:opacity-50"
        >
          {selectedLabel ? (
            <span className="flex flex-1 items-center gap-2">
              <span className="font-medium text-[#F4F7FC]">
                {selectedLabel.model}
              </span>
              <span className="text-[#3A4256]">·</span>
              <span className="text-[#828DA3]">v{selectedLabel.version}</span>
            </span>
          ) : (
            <span className="text-muted-foreground flex-1">
              Select a model version
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
        <Command shouldFilter={false}>
          <div className="flex items-center gap-3 border-b py-2 pr-3 [&_[data-slot=command-input-wrapper]]:min-w-0 [&_[data-slot=command-input-wrapper]]:flex-1 [&_[data-slot=command-input-wrapper]]:border-b-0">
            <CommandInput
              value={searchInput}
              onValueChange={setSearchInput}
              placeholder="Search models and versions..."
            />
            <Select value={teamId} onValueChange={setTeamId}>
              <SelectTrigger className="border-stock h-9 w-[160px] shrink-0 rounded-[10px] bg-transparent text-sm">
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
          </div>
          <CommandList>
            <CommandEmpty>
              {exploreQuery.loading
                ? 'Loading model versions…'
                : teamId === 'all'
                  ? 'No model versions found.'
                  : 'No model versions for this team.'}
            </CommandEmpty>
            {modelIds.map((modelId) => {
              const modelItems = items.filter(
                (item) => item.model.id === modelId
              )
              const model = modelItems[0].model
              const project = modelItems[0].project
              return (
                <CommandGroup
                  key={modelId}
                  heading={
                    <span className="flex items-center gap-1.5">
                      {project && (
                        <>
                          <span className="font-normal text-[#586378]">
                            {project.name}
                          </span>
                          <span className="text-[#3A4256]">·</span>
                        </>
                      )}
                      <span>{model.name}</span>
                    </span>
                  }
                >
                  {modelItems.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={() => {
                        onChange(item.id)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'size-4',
                          value === item.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-1 flex-col">
                        <span>v{item.version}</span>
                        {item.description && (
                          <span className="text-muted-foreground line-clamp-1 text-xs">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

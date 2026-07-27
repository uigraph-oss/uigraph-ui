'use client'

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
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'
import { ML_STUDIO_MODEL_VERSIONS } from '../api/model-versions'
import { ML_STUDIO_MODELS } from '../api/models'

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

  const modelsQuery = useQuery(ML_STUDIO_MODELS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
    variables: { orgId: orgId! },
  })
  const versionsQuery = useQuery(ML_STUDIO_MODEL_VERSIONS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
    variables: { orgId: orgId! },
  })

  const models = modelsQuery.data?.mlModels ?? []
  const versions = versionsQuery.data?.mlModelVersions ?? []
  const loading = modelsQuery.loading || versionsQuery.loading

  const selectedVersion = versions.find((v) => v.id === value)
  const selectedModel = models.find((m) => m.id === selectedVersion?.modelId)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          className="flex min-h-[56px] w-full items-center justify-between gap-2 rounded-[16px] border border-[#2A3242] bg-transparent px-6 py-2 text-left text-sm focus:outline-none disabled:opacity-50"
        >
          {selectedVersion ? (
            <span className="flex flex-1 items-center gap-2">
              <span className="font-medium text-[#F4F7FC]">
                {selectedModel?.name ?? 'Unknown model'}
              </span>
              <span className="text-[#3A4256]">·</span>
              <span className="text-[#828DA3]">v{selectedVersion.version}</span>
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
        <Command>
          <CommandInput placeholder="Search models and versions..." />
          <CommandList>
            <CommandEmpty>
              {loading ? 'Loading model versions…' : 'No model versions found.'}
            </CommandEmpty>
            {[...new Set(versions.map((v) => v.modelId))].map((modelId) => {
              const model = models.find((m) => m.id === modelId)
              const modelVersions = versions.filter(
                (v) => v.modelId === modelId
              )
              return (
                <CommandGroup
                  key={modelId}
                  heading={model?.name ?? 'Unknown model'}
                >
                  {modelVersions.map((version) => (
                    <CommandItem
                      key={version.id}
                      value={`${model?.name ?? ''} v${version.version} ${version.description} ${version.id}`}
                      onSelect={() => {
                        onChange(version.id)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'size-4',
                          value === version.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-1 flex-col">
                        <span>v{version.version}</span>
                        {version.description && (
                          <span className="text-muted-foreground line-clamp-1 text-xs">
                            {version.description}
                          </span>
                        )}
                      </div>
                      <Badge variant="secondary">
                        {version.deploymentStatus}
                      </Badge>
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

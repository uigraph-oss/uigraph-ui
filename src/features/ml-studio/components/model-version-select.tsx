'use client'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { ML_STUDIO_MODELS, ML_STUDIO_VERSIONS } from '../api/ml-studio'

export function ModelVersionSelect({
  modelId,
  versionId,
  onModelChange,
  onVersionChange,
  lockedModelId,
  projectId,
}: {
  modelId: string
  versionId: string
  onModelChange: (modelId: string) => void
  onVersionChange: (versionId: string) => void
  lockedModelId?: string
  projectId?: string
}) {
  const orgId = useCurrentOrganization()?.id
  const modelsQuery = useQuery(ML_STUDIO_MODELS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
    variables: { orgId: orgId!, projectId },
  })
  const versionsQuery = useQuery(ML_STUDIO_VERSIONS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
    variables: { orgId: orgId! },
  })
  const allModels = modelsQuery.data?.mlModels ?? []
  const versions = versionsQuery.data?.mlModelVersions ?? []
  let models = allModels
  if (lockedModelId) {
    models = allModels.filter((m) => m.id === lockedModelId)
  } else if (projectId) {
    models = allModels.filter((m) => m.projectId === projectId)
  }

  const selectedValue = versionId
    ? `ver:${versionId}`
    : modelId
      ? `model:${modelId}`
      : ''

  function handleChange(value: string) {
    if (value.startsWith('ver:')) {
      const id = value.slice(4)
      const version = versions.find((v) => v.id === id)
      if (version) {
        onModelChange(version.modelId)
        onVersionChange(version.id)
      }
      return
    }
    if (value.startsWith('model:')) {
      onModelChange(value.slice(6))
      onVersionChange('')
      return
    }
    onModelChange('')
    onVersionChange('')
  }

  const selectedModel = models.find((m) => m.id === modelId)
  const selectedVersion = versions.find((v) => v.id === versionId)
  const triggerLabel = selectedModel
    ? selectedVersion
      ? `${selectedModel.name} · ${selectedVersion.version}`
      : `${selectedModel.name} · Any version`
    : undefined

  return (
    <Select value={selectedValue} onValueChange={handleChange}>
      <SelectTrigger className="h-[56px] w-full rounded-[16px] border border-[#2A3242] bg-transparent px-6 text-sm">
        <SelectValue placeholder="Select a model version">
          {triggerLabel}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => {
          const modelVersions = versions.filter((v) => v.modelId === model.id)
          return (
            <SelectGroup key={model.id}>
              <SelectLabel className="text-xs font-semibold text-[#828DA3]">
                {model.name}
              </SelectLabel>
              <SelectItem
                value={`model:${model.id}`}
                className="pl-8 text-[#828DA3]"
              >
                Any version
              </SelectItem>
              {modelVersions.map((v) => (
                <SelectItem key={v.id} value={`ver:${v.id}`} className="pl-8">
                  Version {v.version}
                </SelectItem>
              ))}
            </SelectGroup>
          )
        })}
      </SelectContent>
    </Select>
  )
}

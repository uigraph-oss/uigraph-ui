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
import { useMlStudioData } from '../contexts/ml-studio-data-context'

export function ModelVersionSelect({
  modelId,
  versionId,
  onModelChange,
  onVersionChange,
  lockedModelId,
}: {
  modelId: string
  versionId: string
  onModelChange: (modelId: string) => void
  onVersionChange: (versionId: string) => void
  lockedModelId?: string
}) {
  const { models: allModels, versions } = useMlStudioData()
  const models = lockedModelId
    ? allModels.filter((m) => m.id === lockedModelId)
    : allModels

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

'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMlStudioData } from '../contexts/ml-studio-data-context'
import { FormField, FormGrid } from './form-field'

export function ModelVersionSelect({
  modelId,
  versionId,
  onModelChange,
  onVersionChange,
}: {
  modelId: string
  versionId: string
  onModelChange: (modelId: string) => void
  onVersionChange: (versionId: string) => void
}) {
  const { models, versions: allVersions } = useMlStudioData()
  const versions = allVersions.filter((v) => v.modelId === modelId)

  return (
    <FormGrid>
      <FormField label="Model">
        <Select
          value={modelId}
          onValueChange={(value) => {
            onModelChange(value)
            onVersionChange('')
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {models.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <FormField label="Version">
        <Select value={versionId} onValueChange={onVersionChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select version" />
          </SelectTrigger>
          <SelectContent>
            {versions.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.version}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
    </FormGrid>
  )
}

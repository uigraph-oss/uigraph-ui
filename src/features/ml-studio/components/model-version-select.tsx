'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import { mockModels, mockVersions } from '../constants/mock-data'
import { FormField, FormGrid } from './form-field'

export function ModelVersionSelect() {
  const [modelId, setModelId] = useState(mockModels[0]?.id ?? '')
  const [versionId, setVersionId] = useState('')

  const versions = mockVersions.filter((v) => v.modelId === modelId)

  return (
    <FormGrid>
      <FormField label="Model">
        <Select
          value={modelId}
          onValueChange={(value) => {
            setModelId(value)
            setVersionId('')
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {mockModels.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <FormField label="Version">
        <Select value={versionId} onValueChange={setVersionId}>
          <SelectTrigger>
            <SelectValue placeholder="Select version" />
          </SelectTrigger>
          <SelectContent>
            {versions.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.displayName} · {v.version}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
    </FormGrid>
  )
}

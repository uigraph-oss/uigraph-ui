'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  mockExperiments,
  mockModels,
  mockVersions,
} from '../../constants/mock-data'
import { FormField, FormGrid } from '../form-field'
import { Panel } from '../panel'

export function ExperimentFormPage() {
  const { experimentId } = useParams<{ experimentId: string }>()
  const navigate = useNavigate()

  const experiment = experimentId
    ? mockExperiments.find((e) => e.id === experimentId)
    : undefined
  const isEdit = Boolean(experiment)

  const [modelId, setModelId] = useState(
    experiment?.modelId ?? mockModels[0]?.id ?? ''
  )
  const [versionId, setVersionId] = useState(experiment?.versionId ?? '')

  const versions = mockVersions.filter((v) => v.modelId === modelId)

  const backTo = isEdit
    ? `/dashboard/ml-studio/experiments/${experimentId}`
    : '/dashboard/ml-studio/experiments'

  return (
    <div className="flex flex-col gap-5 p-6">
      <div>
        <h2 className="text-xl font-semibold text-[#F4F7FC]">
          {isEdit ? 'Edit Experiment' : 'New Experiment'}
        </h2>
        <p className="mt-1 text-sm text-[#828DA3]">
          Define a research effort and link it to a model version.
        </p>
      </div>

      <div className="mx-auto w-full max-w-3xl">
        <Panel>
          <div className="flex flex-col gap-5">
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

            <FormField label="Name">
              <Input
                placeholder="Cold-start recall improvement"
                defaultValue={experiment?.name}
              />
            </FormField>

            <FormField label="Description">
              <Textarea
                placeholder="Short summary of the effort."
                rows={3}
                defaultValue={experiment?.description}
              />
            </FormField>

            <FormField label="Goal">
              <Textarea
                placeholder="What outcome are you chasing?"
                rows={2}
                defaultValue={experiment?.goal}
              />
            </FormField>

            <FormField label="Hypothesis">
              <Textarea
                placeholder="What do you expect to happen and why?"
                rows={2}
                defaultValue={experiment?.hypothesis}
              />
            </FormField>

            <FormGrid>
              <FormField label="Owner">
                <Input
                  placeholder="Maya Patel"
                  defaultValue={experiment?.owner}
                />
              </FormField>
              <FormField label="Status">
                <Select defaultValue={experiment?.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="concluded">Concluded</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </FormGrid>

            <FormField label="Tags" hint="Comma separated">
              <Input placeholder="ranking, cold-start" />
            </FormField>

            <div className="flex justify-end gap-2 pt-2">
              <Button preset="outline" onClick={() => navigate(backTo)}>
                Cancel
              </Button>
              <Button preset="primary" onClick={() => navigate(backTo)}>
                {isEdit ? 'Save experiment' : 'Create experiment'}
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  )
}

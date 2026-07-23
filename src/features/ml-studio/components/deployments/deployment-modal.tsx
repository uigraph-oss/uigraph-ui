'use client'

import {
  BetterDialogContent,
  BetterDialogProvider,
} from '@/components/better-dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { CREATE_ML_DEPLOYMENT } from '../../api/ml-studio'
import { FormField, FormGrid } from '../form-field'
import { ModelVersionSelect } from '../model-version-select'

export function DeploymentModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const orgId = useCurrentOrganization()?.id
  const [createDeployment] = useMutation(CREATE_ML_DEPLOYMENT, {
    refetchQueries: ['MlStudioDeploymentUpdates'],
    awaitRefetchQueries: true,
  })
  const [modelId, setModelId] = useState('')
  const [versionId, setVersionId] = useState('')
  const [name, setName] = useState('')
  const [environment, setEnvironment] = useState('')
  const [status, setStatus] = useState('')
  const [region, setRegion] = useState('')
  const [endpoint, setEndpoint] = useState('')

  async function submit() {
    if (!orgId || !modelId || !versionId || !name) {
      return
    }
    await createDeployment({
      variables: {
        orgId,
        input: {
          modelId,
          versionId,
          name,
          environment,
          status,
          region,
          endpoint,
          deployedAt: new Date().toISOString(),
        },
      },
    })
    onOpenChange(false)
  }

  return (
    <BetterDialogProvider open={open} onOpenChange={onOpenChange}>
      <BetterDialogContent
        title="New deployment"
        description="Roll this version out to a serving environment."
        footerCancel
        footerSubmit="Create deployment"
        onFooterSubmitClick={submit}
      >
        <div className="flex flex-col gap-5">
          <ModelVersionSelect
            modelId={modelId}
            versionId={versionId}
            onModelChange={setModelId}
            onVersionChange={setVersionId}
          />

          <FormGrid>
            <FormField label="Name">
              <Input
                placeholder="rec-prod-us"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormField>
            <FormField label="Environment">
              <Select value={environment} onValueChange={setEnvironment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="canary">Canary</SelectItem>
                  <SelectItem value="shadow">Shadow</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormGrid>

          <FormGrid>
            <FormField label="Status">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="rolling-out">Rolling out</SelectItem>
                  <SelectItem value="rolled-back">Rolled back</SelectItem>
                  <SelectItem value="stopped">Stopped</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Region">
              <Input
                placeholder="us-east-1"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              />
            </FormField>
          </FormGrid>

          <FormField label="Endpoint">
            <Input
              placeholder="https://infer.internal/rec/v3"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
            />
          </FormField>
        </div>
      </BetterDialogContent>
    </BetterDialogProvider>
  )
}

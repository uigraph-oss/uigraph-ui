'use client'

import type { GT } from '@/api'
import { BetterDialogContent } from '@/components/better-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'

export type CloudConnectionFormValues = GT.CreateCloudConnectionInput

const PROVIDER_LABELS: Record<GT.CloudProvider, string> = {
  AWS: 'Amazon Web Services',
  AZURE: 'Microsoft Azure',
  GCP: 'Google Cloud Platform',
}

function emptyValues(): CloudConnectionFormValues {
  return {
    provider: 'AWS' as GT.CloudProvider,
    displayName: '',
    roleArn: '',
    externalId: '',
    serviceAccountJson: '',
    billingDataset: '',
    tenantId: '',
    clientId: '',
    clientSecret: '',
    subscriptionId: '',
  }
}

export function CloudConnectionModal({
  onSubmit,
}: {
  onSubmit: (values: CloudConnectionFormValues) => Promise<void>
}) {
  const [values, setValues] = useState<CloudConnectionFormValues>(emptyValues())
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function set<K extends keyof CloudConnectionFormValues>(
    key: K,
    value: CloudConnectionFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function validate(): string | null {
    if (values.displayName.trim() === '') return 'Display name is required'
    switch (values.provider) {
      case 'AWS':
        if (!values.roleArn || !values.externalId) {
          return 'Role ARN and External ID are required for AWS'
        }
        break
      case 'GCP':
        if (!values.serviceAccountJson || !values.billingDataset) {
          return 'Service account key and billing dataset are required for GCP'
        }
        break
      case 'AZURE':
        if (
          !values.tenantId ||
          !values.clientId ||
          !values.clientSecret ||
          !values.subscriptionId
        ) {
          return 'Tenant, client, secret, and subscription are required for Azure'
        }
        break
    }
    return null
  }

  async function handleSubmit() {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <BetterDialogContent
      title="Connect a cloud account"
      description="Link an AWS, Azure, or GCP billing account so its resources and costs can be pulled into service dashboards by tag."
      footerSubmit="Connect"
      footerSubmitLoading={submitting}
      onFooterSubmitClick={handleSubmit}
      footerCancel
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-foreground text-sm font-medium">
            Provider
          </Label>
          <Select
            value={values.provider}
            onValueChange={(value) =>
              set('provider', value as GT.CloudProvider)
            }
          >
            <SelectTrigger className="h-[56px] w-full rounded-[16px] border border-[#2A3242] bg-transparent px-6">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PROVIDER_LABELS) as GT.CloudProvider[]).map(
                (provider) => (
                  <SelectItem key={provider} value={provider}>
                    {PROVIDER_LABELS[provider]}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="cc-display-name"
            className="text-foreground text-sm font-medium"
          >
            Display Name
          </Label>
          <Input
            id="cc-display-name"
            value={values.displayName}
            onChange={(e) => set('displayName', e.target.value)}
            placeholder="e.g., prod-aws-billing"
            className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6"
            autoComplete="off"
          />
        </div>

        {values.provider === 'AWS' && (
          <>
            <div className="space-y-2">
              <Label
                htmlFor="cc-role-arn"
                className="text-foreground text-sm font-medium"
              >
                Role ARN
              </Label>
              <Input
                id="cc-role-arn"
                value={values.roleArn ?? ''}
                onChange={(e) => set('roleArn', e.target.value)}
                placeholder="arn:aws:iam::123456789012:role/uigraph-billing-read"
                className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="cc-external-id"
                className="text-foreground text-sm font-medium"
              >
                External ID
              </Label>
              <Input
                id="cc-external-id"
                value={values.externalId ?? ''}
                onChange={(e) => set('externalId', e.target.value)}
                placeholder="A shared secret you set on the trust policy"
                className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6"
                autoComplete="off"
              />
            </div>
          </>
        )}

        {values.provider === 'GCP' && (
          <>
            <div className="space-y-2">
              <Label
                htmlFor="cc-sa-json"
                className="text-foreground text-sm font-medium"
              >
                Service Account Key (JSON)
              </Label>
              <Input
                id="cc-sa-json"
                value={values.serviceAccountJson ?? ''}
                onChange={(e) => set('serviceAccountJson', e.target.value)}
                placeholder='{"type": "service_account", ...}'
                className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="cc-billing-dataset"
                className="text-foreground text-sm font-medium"
              >
                Billing Export Dataset
              </Label>
              <Input
                id="cc-billing-dataset"
                value={values.billingDataset ?? ''}
                onChange={(e) => set('billingDataset', e.target.value)}
                placeholder="project.dataset for the BigQuery billing export"
                className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6"
                autoComplete="off"
              />
            </div>
          </>
        )}

        {values.provider === 'AZURE' && (
          <>
            <div className="space-y-2">
              <Label
                htmlFor="cc-tenant-id"
                className="text-foreground text-sm font-medium"
              >
                Tenant ID
              </Label>
              <Input
                id="cc-tenant-id"
                value={values.tenantId ?? ''}
                onChange={(e) => set('tenantId', e.target.value)}
                className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="cc-client-id"
                className="text-foreground text-sm font-medium"
              >
                Client ID
              </Label>
              <Input
                id="cc-client-id"
                value={values.clientId ?? ''}
                onChange={(e) => set('clientId', e.target.value)}
                className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="cc-client-secret"
                className="text-foreground text-sm font-medium"
              >
                Client Secret
              </Label>
              <Input
                id="cc-client-secret"
                type="password"
                value={values.clientSecret ?? ''}
                onChange={(e) => set('clientSecret', e.target.value)}
                className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="cc-subscription-id"
                className="text-foreground text-sm font-medium"
              >
                Subscription ID
              </Label>
              <Input
                id="cc-subscription-id"
                value={values.subscriptionId ?? ''}
                onChange={(e) => set('subscriptionId', e.target.value)}
                className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6"
                autoComplete="off"
              />
            </div>
          </>
        )}

        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>
    </BetterDialogContent>
  )
}

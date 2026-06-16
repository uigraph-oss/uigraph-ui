'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import type { ServiceAccount } from './api'
import { ScopeSelector } from './scope-selector'

export type ServiceAccountFormValues = {
  name: string
  description: string
  scopes: string[]
}

// Shared create/edit modal. When `account` is provided the form is in edit mode.
export function ServiceAccountModal({
  account,
  availableScopes,
  onSubmit,
}: {
  account?: ServiceAccount
  availableScopes: string[]
  onSubmit: (values: ServiceAccountFormValues) => Promise<void>
}) {
  const [name, setName] = useState(account?.name ?? '')
  const [description, setDescription] = useState(account?.description ?? '')
  const [scopes, setScopes] = useState<string[]>(account?.scopes ?? [])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (name.trim() === '') {
      setError('Name is required')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        scopes,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <BetterDialogContent
      title={account ? 'Edit Service Account' : 'Create Service Account'}
      description="Service accounts authenticate automated clients (CI/CD, scripts) using scoped API tokens."
      footerSubmit={account ? 'Save Changes' : 'Create Service Account'}
      footerSubmitLoading={submitting}
      onFooterSubmitClick={handleSubmit}
      footerCancel
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label
            htmlFor="sa-name"
            className="text-sm font-medium text-[#111110]"
          >
            Name
          </Label>
          <Input
            id="sa-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., ci-pipeline"
            className="h-[56px] rounded-[16px] border border-[#E5E7E9] bg-white px-6"
            autoComplete="off"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="sa-description"
            className="text-sm font-medium text-[#111110]"
          >
            Description (Optional)
          </Label>
          <Input
            id="sa-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this service account used for?"
            className="h-[56px] rounded-[16px] border border-[#E5E7E9] bg-white px-6"
            autoComplete="off"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-[#111110]">
            Permissions
          </Label>
          <ScopeSelector
            available={availableScopes}
            selected={scopes}
            onChange={setScopes}
          />
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>
    </BetterDialogContent>
  )
}

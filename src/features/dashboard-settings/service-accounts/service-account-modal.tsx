'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCurrentOrganization } from '@/store/auth-store'
import { Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { setServiceAccountAvatar, type ServiceAccount } from './api'
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
  const orgId = useCurrentOrganization().id
  const [name, setName] = useState(account?.name ?? '')
  const [description, setDescription] = useState(account?.description ?? '')
  const [scopes, setScopes] = useState<string[]>(account?.scopes ?? [])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  async function handleAvatarUpload(file: File) {
    if (!orgId || !account) return
    setUploadingAvatar(true)
    try {
      await setServiceAccountAvatar(orgId, account.id, file)
      setAvatarPreview(URL.createObjectURL(file))
      toast.success('Avatar updated')
    } catch {
      toast.error('Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

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
        {account && (
          <div className="flex items-center gap-4">
            <Avatar className="size-16 bg-[#F0F0F2]">
              <AvatarImage
                src={avatarPreview ?? undefined}
                alt={account.name}
                className="object-cover"
              />
              <AvatarFallback className="text-sm font-medium text-[#A0A0A2]">
                {account.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void handleAvatarUpload(file)
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              {uploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <Label
            htmlFor="sa-name"
            className="text-foreground text-sm font-medium"
          >
            Name
          </Label>
          <Input
            id="sa-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., ci-pipeline"
            className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6"
            autoComplete="off"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="sa-description"
            className="text-foreground text-sm font-medium"
          >
            Description (Optional)
          </Label>
          <Input
            id="sa-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this service account used for?"
            className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6"
            autoComplete="off"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground text-sm font-medium">
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

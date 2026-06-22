'use client'
import { SectionNotFound } from '@/components/section-not-found'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  refreshOrganizations,
  useCurrentOrganization,
} from '@/store/auth-store'
import { useMutation } from '@apollo/client'
import { Camera, SquarePen, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { removeOrgLogo, setOrgLogo, UPDATE_ORG } from './api/organization'
import { SettingsHeader } from './components/settings-header'

export function OrganizationSettings() {
  const org = useCurrentOrganization()

  const [updateOrg, { loading: isUpdating }] = useMutation(UPDATE_ORG, {
    onCompleted: async () => {
      await refreshOrganizations()
      toast.success('Organization updated successfully')
      setIsEditingName(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update organization')
    },
  })

  const [isEditingName, setIsEditingName] = useState(false)
  const [name, setName] = useState('')
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (org?.name) {
      setName(org.name)
    }
  }, [org?.name])

  async function handleUpdateName() {
    if (!org?.id) {
      toast.error('Organization ID not found')
      return
    }

    await updateOrg({
      variables: {
        id: org.id,
        input: { name },
      },
    })
  }

  async function handleLogoSelected(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }
    if (!org?.id) {
      toast.error('Organization ID not found')
      return
    }
    setIsUploadingLogo(true)
    try {
      await setOrgLogo(org.id, file)
      await refreshOrganizations()
      toast.success('Logo updated successfully')
    } catch {
      toast.error('Failed to upload logo')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  async function handleRemoveLogo() {
    if (!org?.id) {
      toast.error('Organization ID not found')
      return
    }
    setIsUploadingLogo(true)
    try {
      await removeOrgLogo(org.id)
      await refreshOrganizations()
      toast.success('Logo removed successfully')
    } catch {
      toast.error('Failed to remove logo')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  if (!org) {
    return <SectionNotFound label="Organization not found" />
  }

  return (
    <>
      <SettingsHeader
        title="Organization Settings"
        description="Manage your organization profile and preferences"
      />
      <div className="space-y-6 p-6">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#F4F7FC]">
              Organization Profile
            </h2>
            {!isEditingName ? (
              <button
                onClick={() => setIsEditingName(true)}
                className="flex h-9 items-center gap-2 rounded-lg bg-[#2A3242] px-3 text-sm font-normal text-[#D2D9E6] transition-colors hover:bg-[#3B4658]"
              >
                <SquarePen className="h-4 w-4" />
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <Button
                  className="h-9 rounded-lg bg-[#015AEB] text-sm text-white hover:bg-blue-700"
                  onClick={handleUpdateName}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  className="h-9"
                  onClick={() => {
                    setIsEditingName(false)
                    setName(org.name || '')
                  }}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
          <div className="bg-card rounded-2xl border border-[#2A3242] p-6 transition-colors hover:bg-[#1E2533]">
            <div className="flex items-center space-x-4">
              <div className="relative h-28 w-28 shrink-0">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-lg bg-green-500 text-lg font-bold text-white">
                  {org.logoUrl ? (
                    <img
                      src={org.logoUrl}
                      alt={org.name ?? 'Organization logo'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    org.name?.substring(0, 2).toUpperCase() || 'OR'
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingLogo}
                  className="absolute right-1 bottom-1 flex size-7 items-center justify-center rounded-full bg-[#015AEB] text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Camera className="size-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoSelected}
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-sm font-medium text-[#828DA3]">
                  Name
                </label>
                {isEditingName ? (
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 rounded-lg border border-[#2A3242] bg-transparent"
                    placeholder="Organization name"
                  />
                ) : (
                  <h2 className="text-lg font-semibold text-[#F4F7FC]">
                    {org.name}
                  </h2>
                )}
                {org.logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    disabled={isUploadingLogo}
                    className="flex items-center gap-1.5 pt-1 text-sm text-red-600 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-400"
                  >
                    <Trash2 className="size-3.5" />
                    Remove logo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

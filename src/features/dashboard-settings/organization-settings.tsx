'use client'
import { clientV2 } from '@/api-v2/client'
import { SectionLoader } from '@/components/section-loader'
import { SectionNotFound } from '@/components/section-not-found'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { SquarePen } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ORG_V2, UPDATE_ORG_V2 } from './api/organization-v2'
import { SettingsHeader } from './components/settings-header'

export function OrganizationSettings() {
  const organizationId = useCurrentOrganization()?.id

  const { data, loading, refetch } = useQuery(ORG_V2, {
    client: clientV2,
    variables: { id: organizationId! },
    fetchPolicy: 'cache-first',
    skip: !organizationId,
  })

  const [updateOrg, { loading: isUpdating }] = useMutation(UPDATE_ORG_V2, {
    client: clientV2,
    onCompleted: () => {
      toast.success('Organization updated successfully')
      void refetch()
      setIsEditingName(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update organization')
    },
  })

  const orgData = data?.org

  const [isEditingName, setIsEditingName] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => {
    if (orgData?.name) {
      setName(orgData.name)
    }
  }, [orgData])

  async function handleUpdateName() {
    if (!orgData?.id) {
      toast.error('Organization ID not found')
      return
    }

    await updateOrg({
      variables: {
        id: orgData.id,
        input: { name },
      },
    })
  }

  if (loading) {
    return <SectionLoader label="Loading organization..." />
  }

  if (!orgData) {
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
            <h2 className="text-base font-semibold text-gray-900">
              Organization Profile
            </h2>
            {!isEditingName ? (
              <button
                onClick={() => setIsEditingName(true)}
                className="flex h-9 items-center gap-2 rounded-lg bg-[#E8E9EA] px-3 text-sm font-normal transition-colors hover:bg-gray-100"
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
                    setName(orgData.name || '')
                  }}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 transition-colors hover:bg-gray-50">
            <div className="flex items-center space-x-4">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-lg bg-green-500 text-lg font-bold text-white">
                {orgData.name?.substring(0, 2).toUpperCase() || 'OR'}
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-sm font-medium text-gray-500">
                  Name
                </label>
                {isEditingName ? (
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 rounded-lg border border-gray-200"
                    placeholder="Organization name"
                  />
                ) : (
                  <h2 className="text-lg font-semibold text-gray-900">
                    {orgData.name}
                  </h2>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

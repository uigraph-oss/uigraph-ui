'use client'
import { uploadGlobalFile } from '@/api/upload-global-file'
import { SectionLoader } from '@/components/section-loader'
import { SectionNotFound } from '@/components/section-not-found'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { ExternalLink, Globe, Receipt, SquarePen, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { GET_ORGANIZATION, UPDATE_ORGANIZATION } from './api/organization'
import { SettingsHeader } from './components/settings-header'

export function OrganizationSettings() {
  const organizationId = useCurrentOrganization()?.id
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data, loading, refetch } = useQuery(GET_ORGANIZATION, {
    variables: { organizationId },
    fetchPolicy: 'cache-first',
  })

  const [updateOrganization, { loading: isUpdating }] = useMutation(
    UPDATE_ORGANIZATION,
    {
      onCompleted: () => {
        toast.success('Organization updated successfully')
        void refetch()
        setIsEditingLogo(false)
        setIsEditingAddress(false)
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update organization')
      },
      refetchQueries: ['GetInitialOrganizationsByRoleAndUser'],
    }
  )

  const orgData = data?.GetOrganizationByID

  const [isEditingLogo, setIsEditingLogo] = useState(false)
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)

  const [addressData, setAddressData] = useState({
    addressLine1: '',
    addressLine2: '',
    country: '',
    postalCode: '',
    city: '',
    state: '',
    taxId: '',
  })

  useEffect(() => {
    if (orgData?.address) {
      setAddressData({
        addressLine1: orgData.address.addressLine1 || '',
        addressLine2: orgData.address.addressLine2 || '',
        country: orgData.address.country || '',
        postalCode: orgData.address.postalCode || '',
        city: orgData.address.city || '',
        state: orgData.address.state || '',
        taxId: orgData.address.taxId || '',
      })
    }
  }, [orgData])

  async function handleLogoUpload(file: File) {
    setIsUploadingLogo(true)
    try {
      const logoFileId = await uploadGlobalFile(file, {
        description: 'Organization logo',
      })

      if (!orgData?.organizationId) {
        toast.error('Organization ID not found')
        return
      }

      await updateOrganization({
        variables: {
          organizationId: orgData.organizationId,
          input: {
            logoImgId: logoFileId,
          },
        },
      })
    } catch (error) {
      console.error('Failed to upload logo:', error)
      toast.error('Failed to upload logo')
    } finally {
      setIsUploadingLogo(false)
      setIsEditingLogo(false)
    }
  }

  async function handleUpdateAddress() {
    if (!orgData?.organizationId) {
      toast.error('Organization ID not found')
      return
    }

    await updateOrganization({
      variables: {
        organizationId: orgData.organizationId,
        input: {
          address: {
            addressLine1: addressData.addressLine1 || null,
            addressLine2: addressData.addressLine2 || null,
            country: addressData.country || null,
            postalCode: addressData.postalCode || null,
            city: addressData.city || null,
            state: addressData.state || null,
            taxId: addressData.taxId || null,
          },
        },
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
        {/* Organization Profile Section */}
        <div>
          <div className="mb-3">
            <h2 className="text-base font-semibold text-gray-900">
              Organization Profile
            </h2>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 transition-colors hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="relative h-28 w-28 overflow-hidden rounded-lg border border-gray-200 bg-white">
                    {orgData.logoImgUrl ? (
                      <img
                        src={orgData.logoImgUrl}
                        alt={orgData.name || ''}
                        className="h-full w-full object-contain"
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-lg bg-green-500 text-lg font-bold text-white">
                        {orgData.name?.substring(0, 2).toUpperCase() || 'OR'}
                      </div>
                    )}
                    {isEditingLogo && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                        {isUploadingLogo ? (
                          <div className="text-white">Uploading...</div>
                        ) : (
                          <Upload className="h-6 w-6 text-white" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {orgData.name}
                  </h2>
                  {orgData.address?.city && orgData.address?.state && (
                    <p className="text-sm leading-[1.33] font-normal text-gray-600">
                      {orgData.address.city}, {orgData.address.state}
                    </p>
                  )}
                </div>
              </div>
              {!isEditingLogo && (
                <button
                  className="flex h-11 items-center gap-2 rounded-[12.85px] bg-[#E8E9EA] px-3 text-sm leading-[1.33] font-normal transition-colors hover:bg-gray-100"
                  onClick={() => setIsEditingLogo(true)}
                  disabled={isUploadingLogo}
                >
                  <SquarePen className="mr-0.5 h-4 w-4" />
                  Edit Logo
                </button>
              )}
            </div>

            {isEditingLogo && (
              <div className="mt-4 flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      await handleLogoUpload(file)
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingLogo}
                >
                  <Upload className="h-4 w-4" />
                  {isUploadingLogo ? 'Uploading...' : 'Choose File'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditingLogo(false)}
                  disabled={isUploadingLogo}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Organization Details Section */}
        <div>
          <div className="mb-3">
            <h2 className="text-base font-semibold text-gray-900">
              Organization Details
            </h2>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 transition-colors hover:bg-gray-50">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <Globe className="h-4 w-4" />
                  Domain
                </label>
                <div className="mt-1 flex items-center">
                  <p className="text-base font-medium text-gray-800">
                    {orgData.domain || (
                      <span className="text-gray-400 italic">N/A</span>
                    )}
                  </p>
                  {orgData.domain && (
                    <ExternalLink className="ml-2 h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <Globe className="h-4 w-4" />
                  Domain Slug
                </label>
                <p className="mt-1 text-base font-medium text-gray-800">
                  {orgData.domainSlug || (
                    <span className="text-gray-400 italic">N/A</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Address & Tax ID Section */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-gray-600" />
              <h2 className="text-base font-semibold text-gray-900">
                Billing Address & Tax ID
              </h2>
            </div>
            {!isEditingAddress ? (
              <button
                onClick={() => setIsEditingAddress(true)}
                className="flex h-9 items-center gap-2 rounded-lg bg-[#E8E9EA] px-3 text-sm font-normal transition-colors hover:bg-gray-100"
              >
                <SquarePen className="h-4 w-4" />
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <Button
                  className="h-9 rounded-lg bg-[#015AEB] text-sm text-white hover:bg-blue-700"
                  onClick={handleUpdateAddress}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  className="h-9"
                  onClick={() => {
                    setIsEditingAddress(false)
                    if (orgData?.address) {
                      setAddressData({
                        addressLine1: orgData.address.addressLine1 || '',
                        addressLine2: orgData.address.addressLine2 || '',
                        country: orgData.address.country || '',
                        postalCode: orgData.address.postalCode || '',
                        city: orgData.address.city || '',
                        state: orgData.address.state || '',
                        taxId: orgData.address.taxId || '',
                      })
                    }
                  }}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 transition-colors hover:bg-gray-50">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Address Fields */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      Address line 1
                    </label>
                    {isEditingAddress ? (
                      <Input
                        value={addressData.addressLine1}
                        onChange={(e) =>
                          setAddressData({
                            ...addressData,
                            addressLine1: e.target.value,
                          })
                        }
                        className="h-10 rounded-lg border border-gray-200"
                        placeholder="Street address"
                      />
                    ) : (
                      <p className="text-base font-medium text-gray-800">
                        {addressData.addressLine1 || (
                          <span className="text-gray-400 italic">N/A</span>
                        )}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      Address line 2 (optional)
                    </label>
                    {isEditingAddress ? (
                      <Input
                        value={addressData.addressLine2}
                        onChange={(e) =>
                          setAddressData({
                            ...addressData,
                            addressLine2: e.target.value,
                          })
                        }
                        className="h-10 rounded-lg border border-gray-200"
                        placeholder="Apartment, suite, unit, building, floor, etc."
                      />
                    ) : (
                      <p className="text-base font-medium text-gray-800">
                        {addressData.addressLine2 || (
                          <span className="text-gray-400 italic">N/A</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100"></div>

                {/* Location Fields */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      Country
                    </label>
                    {isEditingAddress ? (
                      <Input
                        value={addressData.country}
                        onChange={(e) =>
                          setAddressData({
                            ...addressData,
                            country: e.target.value,
                          })
                        }
                        className="h-10 rounded-lg border border-gray-200"
                        placeholder="Select country"
                      />
                    ) : (
                      <p className="text-base font-medium text-gray-800">
                        {addressData.country || (
                          <span className="text-gray-400 italic">N/A</span>
                        )}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      City
                    </label>
                    {isEditingAddress ? (
                      <Input
                        value={addressData.city}
                        onChange={(e) =>
                          setAddressData({
                            ...addressData,
                            city: e.target.value,
                          })
                        }
                        className="h-10 rounded-lg border border-gray-200"
                      />
                    ) : (
                      <p className="text-base font-medium text-gray-800">
                        {addressData.city || (
                          <span className="text-gray-400 italic">N/A</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">
                    Postal code
                  </label>
                  {isEditingAddress ? (
                    <Input
                      value={addressData.postalCode}
                      onChange={(e) =>
                        setAddressData({
                          ...addressData,
                          postalCode: e.target.value,
                        })
                      }
                      className="h-10 rounded-lg border border-gray-200"
                      placeholder="12345"
                    />
                  ) : (
                    <p className="text-base font-medium text-gray-800">
                      {addressData.postalCode || (
                        <span className="text-gray-400 italic">N/A</span>
                      )}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">
                    State / Province
                  </label>
                  {isEditingAddress ? (
                    <Input
                      value={addressData.state}
                      onChange={(e) =>
                        setAddressData({
                          ...addressData,
                          state: e.target.value,
                        })
                      }
                      className="h-10 rounded-lg border border-gray-200"
                    />
                  ) : (
                    <p className="text-base font-medium text-gray-800">
                      {addressData.state || (
                        <span className="text-gray-400 italic">N/A</span>
                      )}
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100"></div>

                {/* Tax ID */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">
                    Tax ID
                  </label>
                  {isEditingAddress ? (
                    <Input
                      value={addressData.taxId}
                      onChange={(e) =>
                        setAddressData({
                          ...addressData,
                          taxId: e.target.value,
                        })
                      }
                      className="h-10 rounded-lg border border-gray-200"
                      placeholder="Select tax ID"
                    />
                  ) : (
                    <p className="text-base font-medium text-gray-800">
                      {addressData.taxId || (
                        <span className="text-gray-400 italic">N/A</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

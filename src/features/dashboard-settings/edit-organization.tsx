'use client'
import cloudUpload from '@/assets/icons/cloud-upload.svg'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Camera, Upload, X } from 'lucide-react'
import { useState } from 'react'
import { Textarea } from '../../components/ui/textarea'
import { SettingsHeader } from './components/settings-header'

interface EditPorps {
  handleUpdateAll: () => void
  onCancel: () => void
  initialData: {
    name: string
    domain: string
    email: string
    phone: string
    description: string
    country: string
    city: string
    state: string
    address: string
    zipCode: string
    taxId: string
    logo: string
  }
}

export function EditOrganization({
  handleUpdateAll,
  onCancel,
  initialData,
}: EditPorps) {
  const [orgData, _setOrgData] = useState(initialData)

  return (
    <>
      <SettingsHeader
        title="Organization Settings"
        description="Manage your organization's profile and settings"
        cta={
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="h-[44px] rounded-[12.85px] border-[#E5E7E9] bg-white text-sm leading-[1.33] text-[#6B7480] hover:bg-gray-50"
              onClick={onCancel}
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              className="h-[44px] rounded-[12.85px] bg-[#015AEB] text-sm leading-[1.33] text-white hover:bg-blue-700"
              onClick={handleUpdateAll}
            >
              <img src={cloudUpload.src} alt="arrow-up-right" />
              Update Organization
            </Button>
          </div>
        }
      />

      <div className="px-6 pb-6">
        <div className="flex flex-col gap-8 rounded-[12px] border border-[#E5E7E9] p-6 lg:flex-row">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative size-[110px] rounded-xl">
              <Avatar className="h-[110px] w-[110px] rounded-lg">
                <AvatarImage src={orgData.logo} alt={orgData.name} />
                <AvatarFallback className="rounded-lg bg-green-500 text-3xl font-bold text-white">
                  {orgData.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute top-1/2 left-1/2 !z-50 flex size-[28px] -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#015AEB] text-xs font-medium text-white">
                <Camera className="size-4" />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="flex h-[44px] items-center gap-2 rounded-[12.85px] bg-[#E8E9EA] px-3 text-sm leading-[1.33] text-[#6B7480]"
            >
              <Upload className="h-4 w-4" />
              Upload Photo
            </Button>
          </div>

          <form className="flex-1 space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-textPrimary">Organization Name</Label>
                <Input
                  id="name"
                  defaultValue={orgData.name}
                  className="h-14 rounded-[12px] border border-[#E5E7E9]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-textPrimary">Domain</Label>
                <Input
                  id="domain"
                  defaultValue={orgData.domain}
                  className="h-14 rounded-[12px] border border-[#E5E7E9]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-textPrimary">
                  Email address
                </Label>
                <Input
                  id="email"
                  defaultValue={orgData.email}
                  className="h-14 rounded-[12px] border border-[#E5E7E9]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-textPrimary">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  defaultValue={orgData.phone}
                  className="h-14 rounded-[12px] border border-[#E5E7E9]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country" className="text-textPrimary">
                  Country
                </Label>
                <Input
                  id="country"
                  defaultValue={orgData.country}
                  className="h-14 rounded-[12px] border border-[#E5E7E9]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city" className="text-textPrimary">
                  City
                </Label>
                <Input
                  id="city"
                  defaultValue={orgData.city}
                  className="h-14 rounded-[12px] border border-[#E5E7E9]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="state" className="text-textPrimary">
                  State
                </Label>
                <Input
                  id="state"
                  defaultValue={orgData.state}
                  className="h-14 rounded-[12px] border border-[#E5E7E9]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode" className="text-textPrimary">
                  Zip Code
                </Label>
                <Input
                  id="zipCode"
                  defaultValue={orgData.zipCode}
                  className="h-14 rounded-[12px] border border-[#E5E7E9]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-textPrimary">
                  Address
                </Label>
                <Input
                  id="address"
                  defaultValue={orgData.address}
                  className="h-14 rounded-[12px] border border-[#E5E7E9]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxId" className="text-textPrimary">
                  TAX ID
                </Label>
                <Input
                  id="taxId"
                  defaultValue={orgData.taxId}
                  className="h-14 rounded-[12px] border border-[#E5E7E9]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-textPrimary">
                Description
              </Label>
              <Textarea
                id="description"
                defaultValue={orgData.description}
                className="focus:border-input min-h-[123px] rounded-[12px] border border-[#E5E7E9] focus:ring-0 focus:ring-offset-0"
              />
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

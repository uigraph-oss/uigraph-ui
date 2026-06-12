'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useOrganizationContext } from '@/contexts'
import { SquarePen } from 'lucide-react'
import { useState } from 'react'
import { SettingsHeader } from './components/settings-header'
import { EditProfile } from './edit-profile'

export function ProfileSettings() {
  const { account } = useOrganizationContext()

  const [isEditMode, setIsEditMode] = useState(false)

  const initials = `${account?.firstName?.[0] || ''}${
    account?.lastName?.[0] || ''
  }`.toUpperCase()

  if (isEditMode) {
    return (
      <EditProfile
        onCancel={() => setIsEditMode(false)}
        initialData={{
          firstName: account?.firstName || '',
          lastName: account?.lastName || '',
          email: account?.email || '',
          image: account?.imageUrl || account?.image || '',
        }}
      />
    )
  }

  return (
    <>
      <SettingsHeader
        title="Profile Settings"
        description="Manage your personal profile and preferences"
        cta={
          <Button
            className="h-[44px] rounded-[12.85px] bg-[#015AEB] text-sm leading-[1.33] text-white hover:bg-blue-700"
            onClick={() => setIsEditMode(true)}
          >
            <SquarePen className="mr-0.5 h-4 w-4" />
            Edit Profile
          </Button>
        }
      />
      <div className="space-y-3 p-6">
        <div className="rounded-[12px] border border-[#E5E7E9] bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={account?.imageUrl || account?.image || ''}
                  alt="Profile"
                  className="object-cover"
                />
                <AvatarFallback className="text-lg font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-[#111110]">
                  {account?.firstName} {account?.lastName}
                </h2>
              </div>
            </div>
            <button
              className="flex h-11 items-center gap-2 rounded-[12.85px] bg-[#E8E9EA] px-3 text-sm leading-[1.33] font-normal"
              onClick={() => setIsEditMode(true)}
            >
              <SquarePen className="mr-0.5 h-4 w-4" />
              Edit
            </button>
          </div>
        </div>
        <div className="rounded-[12px] border border-[#E5E7E9] bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-[16px] leading-[1.33] font-semibold text-[#111110]">
              Personal Information
            </h3>
            <button
              className="flex h-11 items-center gap-2 rounded-[12.85px] bg-[#E8E9EA] px-3 text-sm leading-[1.33] font-normal"
              onClick={() => setIsEditMode(true)}
            >
              <SquarePen className="mr-0.5 h-4 w-4" />
              Edit
            </button>
          </div>

          <div className="grid max-w-[40rem] grid-cols-2 gap-x-[64px] gap-y-6">
            <div>
              <Label className="text-sm leading-[1.33] font-normal text-[#6B7480]">
                First Name
              </Label>
              <p className="text-[1rem] leading-[1.33] font-normal text-[#111110]">
                {account?.firstName}
              </p>
            </div>

            <div>
              <Label className="text-sm leading-[1.33] font-normal text-[#6B7480]">
                Last Name
              </Label>
              <p className="text-[1rem] leading-[1.33] font-normal text-[#111110]">
                {account?.lastName}
              </p>
            </div>

            <div>
              <Label className="text-sm leading-[1.33] font-normal text-[#6B7480]">
                Email address
              </Label>
              <p className="text-[1rem] leading-[1.33] font-normal text-[#111110]">
                {account?.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

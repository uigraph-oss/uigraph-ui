'use client'

import { clientV2 } from '@/api/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { bootstrapSession, useAuthenticatedUser } from '@/store/auth-store'
import { useMutation } from '@apollo/client'
import axios from 'axios'
import { Upload, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { UPDATE_USER_V2 } from './api/update-user-v2'
import { SettingsHeader } from './components/settings-header'

interface EditProfileProps {
  onCancel: () => void
  initialData: {
    name?: string
    email?: string
    image?: string
  }
}

export function EditProfile({ onCancel, initialData }: EditProfileProps) {
  const user = useAuthenticatedUser()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [updateUser, { loading: isUpdating }] = useMutation(UPDATE_USER_V2, {
    client: clientV2,
    onCompleted: async () => {
      await bootstrapSession()
      toast.success('Profile updated successfully')
      onCancel()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile')
    },
  })

  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [name, setName] = useState(user.name || initialData.name || '')

  useEffect(() => {
    setName(user.name || '')
  }, [user.name])

  async function handleImageUpload(file: File) {
    setIsUploadingImage(true)
    try {
      const form = new FormData()
      form.append('file', file)

      await axios.put('/api/v1/users/me/avatar', form, {
        withCredentials: true,
      })

      await bootstrapSession()
      toast.success('Avatar updated')
    } catch (error) {
      console.error('Failed to upload image:', error)
      toast.error('Failed to upload image')
    } finally {
      setIsUploadingImage(false)
    }
  }

  async function handleUpdateProfile() {
    await updateUser({
      variables: {
        id: user.userId,
        input: { name: name || null },
      },
    })
  }

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  const currentImage = user.avatarUrl || initialData.image || ''

  return (
    <>
      <SettingsHeader
        title="Edit Profile Settings"
        description="Manage your personal profile and preferences"
        cta={
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="h-[44px] rounded-[12.85px] border-[#E5E7E9] bg-white text-sm leading-[1.33] text-[#6B7480] hover:bg-gray-50"
              onClick={onCancel}
              disabled={isUpdating || isUploadingImage}
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              className="h-[44px] rounded-[12.85px] bg-[#015AEB] text-sm leading-[1.33] text-white hover:bg-blue-700"
              onClick={handleUpdateProfile}
              disabled={isUpdating || isUploadingImage}
            >
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-8 rounded-[12px] border border-[#E5E7E9] p-6 lg:flex-row">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative size-[110px] rounded-full">
            <Avatar className="h-[110px] w-[110px]">
              <AvatarImage
                src={currentImage}
                alt="Profile"
                className="object-cover"
              />
              <AvatarFallback className="text-3xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {isUploadingImage && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                <div className="text-white">Uploading...</div>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) {
                await handleImageUpload(file)
              }
            }}
          />
          <Button
            variant="outline"
            size="sm"
            className="flex h-[44px] items-center gap-2 rounded-[12.85px] bg-[#E8E9EA] px-3 text-sm leading-[1.33] text-[#6B7480] hover:bg-gray-100"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingImage}
          >
            <Upload className="h-4 w-4" />
            {isUploadingImage ? 'Uploading...' : 'Upload Photo'}
          </Button>
        </div>

        <form className="flex-1 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-textPrimary">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-14 rounded-[12px] border border-[#E5E7E9]"
              disabled={isUpdating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-textPrimary">
              Email address
            </Label>
            <Input
              id="email"
              defaultValue={user.email || initialData.email}
              className="h-14 rounded-[12px] border border-[#E5E7E9] bg-gray-50"
              disabled
            />
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>
        </form>
      </div>
    </>
  )
}

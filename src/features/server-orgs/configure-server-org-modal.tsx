'use client'

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
import { Switch } from '@/components/ui/switch'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  autoJoin: z.boolean(),
})

const editSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  autoJoin: z.boolean(),
  disabled: z.boolean(),
})

export type CreateServerOrgValues = z.infer<typeof createSchema>
export type EditServerOrgValues = z.infer<typeof editSchema>

type CreateProps = {
  mode: 'create'
  onSubmit: SubmitHandler<CreateServerOrgValues>
}

type EditProps = {
  mode: 'edit'
  defaultValues: EditServerOrgValues
  logoUrl?: string | null
  onSubmit: SubmitHandler<EditServerOrgValues>
  onUploadLogo: (file: File) => Promise<void>
  onRemoveLogo: () => Promise<void>
}

export function ConfigureServerOrgModal(props: CreateProps | EditProps) {
  if (props.mode === 'create') {
    return <CreateServerOrgModal onSubmit={props.onSubmit} />
  }
  if (props.mode === 'edit') {
    return (
      <EditServerOrgModal
        defaultValues={props.defaultValues}
        logoUrl={props.logoUrl}
        onSubmit={props.onSubmit}
        onUploadLogo={props.onUploadLogo}
        onRemoveLogo={props.onRemoveLogo}
      />
    )
  }
  throw new Error('Unknown modal mode')
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-destructive text-sm">{message}</p>
}

const inputClassName =
  'h-[56px] rounded-[16px] border border-[#2A3242] bg-[#1E2533] px-6'
const selectTriggerClassName =
  '!h-[56px] !w-full rounded-[16px] border border-[#2A3242] bg-[#1E2533] px-4 capitalize'

function AutoJoinField({
  value,
  onChange,
}: {
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between rounded-[16px] border border-[#2A3242] bg-[#1E2533] px-6 py-4">
      <div className="space-y-1">
        <Label className="text-sm font-medium text-[#D2D9E6]">Auto Join</Label>
        <p className="text-xs text-[#828DA3]">
          New SSO users are added to this organization automatically.
        </p>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  )
}

function LogoField({
  logoUrl,
  orgName,
  onUploadLogo,
  onRemoveLogo,
}: {
  logoUrl?: string | null
  orgName: string
  onUploadLogo: (file: File) => Promise<void>
  onRemoveLogo: () => Promise<void>
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isBusy, setIsBusy] = useState(false)

  async function handleSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setIsBusy(true)
    try {
      await onUploadLogo(file)
      toast.success('Logo updated successfully')
    } catch {
      toast.error('Failed to upload logo')
    } finally {
      setIsBusy(false)
    }
  }

  async function handleRemove() {
    setIsBusy(true)
    try {
      await onRemoveLogo()
      toast.success('Logo removed successfully')
    } catch {
      toast.error('Failed to remove logo')
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-[#D2D9E6]">Logo</Label>
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg bg-green-500 text-lg font-bold text-white">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={orgName}
                className="h-full w-full object-cover"
              />
            ) : (
              orgName.substring(0, 2).toUpperCase() || 'OR'
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy}
            className="absolute right-1 bottom-1 flex size-7 items-center justify-center rounded-full bg-[#015AEB] text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Camera className="size-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleSelected}
          />
        </div>
        {logoUrl && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={isBusy}
            className="flex items-center gap-1.5 text-sm text-red-600 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-400"
          >
            <Trash2 className="size-3.5" />
            Remove logo
          </button>
        )}
      </div>
    </div>
  )
}

function CreateServerOrgModal({
  onSubmit,
}: {
  onSubmit: SubmitHandler<CreateServerOrgValues>
}) {
  const form = useForm<CreateServerOrgValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '', autoJoin: false },
  })

  return (
    <BetterDialogContent
      title="Add New Organization"
      description="Create a new organization on this server."
      footerSubmit="Add Organization"
      footerSubmitLoading={form.formState.isSubmitting}
      onFooterSubmitClick={form.handleSubmit(onSubmit)}
      footerCancel
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Controller
          name="name"
          control={form.control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#D2D9E6]">Name</Label>
              <Input
                {...field}
                placeholder="Enter organization name"
                className={inputClassName}
                autoComplete="off"
              />
              <FieldError message={form.formState.errors.name?.message} />
            </div>
          )}
        />

        <Controller
          name="autoJoin"
          control={form.control}
          render={({ field }) => (
            <AutoJoinField value={field.value} onChange={field.onChange} />
          )}
        />
      </form>
    </BetterDialogContent>
  )
}

function EditServerOrgModal({
  defaultValues,
  logoUrl,
  onSubmit,
  onUploadLogo,
  onRemoveLogo,
}: {
  defaultValues: EditServerOrgValues
  logoUrl?: string | null
  onSubmit: SubmitHandler<EditServerOrgValues>
  onUploadLogo: (file: File) => Promise<void>
  onRemoveLogo: () => Promise<void>
}) {
  const form = useForm<EditServerOrgValues>({
    resolver: zodResolver(editSchema),
    defaultValues,
  })

  return (
    <BetterDialogContent
      title="Edit Organization"
      description="Update this organization's details."
      footerSubmit="Update Organization"
      footerSubmitLoading={form.formState.isSubmitting}
      onFooterSubmitClick={form.handleSubmit(onSubmit)}
      footerCancel
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <LogoField
          logoUrl={logoUrl}
          orgName={defaultValues.name}
          onUploadLogo={onUploadLogo}
          onRemoveLogo={onRemoveLogo}
        />

        <Controller
          name="name"
          control={form.control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#D2D9E6]">Name</Label>
              <Input
                {...field}
                placeholder="Enter organization name"
                className={inputClassName}
                autoComplete="off"
              />
              <FieldError message={form.formState.errors.name?.message} />
            </div>
          )}
        />

        <Controller
          name="autoJoin"
          control={form.control}
          render={({ field }) => (
            <AutoJoinField value={field.value} onChange={field.onChange} />
          )}
        />

        <Controller
          name="disabled"
          control={form.control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#D2D9E6]">
                Status
              </Label>
              <Select
                value={field.value ? 'disabled' : 'active'}
                onValueChange={(value) => field.onChange(value === 'disabled')}
              >
                <SelectTrigger className={selectTriggerClassName}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        />
      </form>
    </BetterDialogContent>
  )
}

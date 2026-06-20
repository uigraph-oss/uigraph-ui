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
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'
import { SERVER_USER_ROLES } from './api/server-users-v2'

const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(SERVER_USER_ROLES),
})

const editSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string(),
  role: z.enum(SERVER_USER_ROLES),
  disabled: z.boolean(),
})

export type CreateServerUserValues = z.infer<typeof createSchema>
export type EditServerUserValues = z.infer<typeof editSchema>

type CreateProps = {
  mode: 'create'
  onSubmit: SubmitHandler<CreateServerUserValues>
}

type EditProps = {
  mode: 'edit'
  defaultValues: EditServerUserValues
  onSubmit: SubmitHandler<EditServerUserValues>
}

export function ConfigureServerUserModal(props: CreateProps | EditProps) {
  if (props.mode === 'create') {
    return <CreateServerUserModal onSubmit={props.onSubmit} />
  }
  if (props.mode === 'edit') {
    return (
      <EditServerUserModal
        defaultValues={props.defaultValues}
        onSubmit={props.onSubmit}
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
  'h-[56px] rounded-[16px] border border-[#E5E7E9] bg-white px-6'
const selectTriggerClassName =
  '!h-[56px] !w-full rounded-[16px] border border-[#E5E7E9] bg-white px-4 capitalize'

function RoleField({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <Select value={value} onValueChange={onChange} aria-label="role select">
      <SelectTrigger className={selectTriggerClassName}>
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        {SERVER_USER_ROLES.map((role) => (
          <SelectItem key={role} value={role} className="capitalize">
            {role === 'server_admin' ? 'Server Admin' : 'User'}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function CreateServerUserModal({
  onSubmit,
}: {
  onSubmit: SubmitHandler<CreateServerUserValues>
}) {
  const form = useForm<CreateServerUserValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '', email: '', password: '', role: 'user' },
  })

  return (
    <BetterDialogContent
      title="Add New User"
      description="Create a new account on this server."
      footerSubmit="Add User"
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
              <Label className="text-sm font-medium text-[#111110]">Name</Label>
              <Input
                {...field}
                placeholder="Enter full name"
                className={inputClassName}
                autoComplete="off"
              />
              <FieldError message={form.formState.errors.name?.message} />
            </div>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#111110]">
                Email Address
              </Label>
              <Input
                {...field}
                placeholder="Enter email address"
                className={inputClassName}
                autoComplete="off"
              />
              <FieldError message={form.formState.errors.email?.message} />
            </div>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#111110]">
                Password
              </Label>
              <Input
                {...field}
                type="password"
                placeholder="Enter a password"
                className={inputClassName}
                autoComplete="new-password"
              />
              <FieldError message={form.formState.errors.password?.message} />
            </div>
          )}
        />

        <Controller
          name="role"
          control={form.control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#111110]">Role</Label>
              <RoleField value={field.value} onChange={field.onChange} />
              <FieldError message={form.formState.errors.role?.message} />
            </div>
          )}
        />
      </form>
    </BetterDialogContent>
  )
}

function EditServerUserModal({
  defaultValues,
  onSubmit,
}: {
  defaultValues: EditServerUserValues
  onSubmit: SubmitHandler<EditServerUserValues>
}) {
  const form = useForm<EditServerUserValues>({
    resolver: zodResolver(editSchema),
    defaultValues,
  })

  return (
    <BetterDialogContent
      title="Edit User"
      description="Update this user's account details."
      footerSubmit="Update User"
      footerSubmitLoading={form.formState.isSubmitting}
      onFooterSubmitClick={form.handleSubmit(onSubmit)}
      footerCancel
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Controller
          name="email"
          control={form.control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#111110]">
                Email Address
              </Label>
              <Input
                {...field}
                disabled
                className={inputClassName}
                autoComplete="off"
              />
            </div>
          )}
        />

        <Controller
          name="name"
          control={form.control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#111110]">Name</Label>
              <Input
                {...field}
                placeholder="Enter full name"
                className={inputClassName}
                autoComplete="off"
              />
              <FieldError message={form.formState.errors.name?.message} />
            </div>
          )}
        />

        <Controller
          name="role"
          control={form.control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#111110]">Role</Label>
              <RoleField value={field.value} onChange={field.onChange} />
              <FieldError message={form.formState.errors.role?.message} />
            </div>
          )}
        />

        <Controller
          name="disabled"
          control={form.control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#111110]">
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

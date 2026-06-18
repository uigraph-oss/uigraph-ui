'use client'

import type { SettingsTeam } from '../api/teams-v2'
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
import { TEAM_MEMBER_ROLES } from '../constants/team'
import { useTeamContext } from '../context/team-context'

const teamMemberSchema = z.object({
  email: z.email('Enter a valid email address'),
  role: z.string().min(1, 'Role is required'),

  teamId: z.string().optional(),
  status: z.enum(['Active', 'Pending', 'Deactivated'], {
    error: 'Status is required',
  }),
})

type ConfigureTeamMemberModalProps = {
  mode?: 'create' | 'edit'
  defaultValues?: Partial<z.infer<typeof teamMemberSchema>>
  onSubmit: SubmitHandler<z.infer<typeof teamMemberSchema>>
}

export function ConfigureTeamMemberModal({
  mode = 'create',
  defaultValues = {},
  onSubmit,
}: ConfigureTeamMemberModalProps) {
  const { teams } = useTeamContext()
  const form = useForm({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      email: '',
      role: '',
      teamId: '',
      status: mode === 'create' ? 'Active' : ('' as 'Active'),
      ...defaultValues,
    },
  })

  const selectableTeams = teams.filter(
    (team): team is SettingsTeam => Boolean(team.teamId)
  )

  return (
    <BetterDialogContent
      title={mode === 'create' ? 'Add New User' : 'Edit User'}
      description={
        mode === 'create'
          ? 'Add a new user to your organization.'
          : 'Update the user account details.'
      }
      footerSubmit={mode === 'create' ? 'Add User' : 'Update User'}
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
              <Label
                htmlFor="team-member-email"
                className="text-sm font-medium text-[#111110]"
              >
                Email Address
              </Label>
              <Input
                id="team-member-email"
                {...field}
                placeholder="Enter email address"
                className="h-[56px] rounded-[16px] border border-[#E5E7E9] bg-white px-6"
                autoComplete="off"
              />
              {form.formState.errors.email && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
          )}
        />

        <Controller
          name="role"
          control={form.control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label
                htmlFor="team-member-role"
                className="text-sm font-medium text-[#111110]"
              >
                Role
              </Label>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                aria-label="role select"
              >
                <SelectTrigger className="!h-[56px] !w-full rounded-[16px] border border-[#E5E7E9] bg-white px-4 capitalize">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_MEMBER_ROLES.map((role) => (
                    <SelectItem key={role} value={role} className="capitalize">
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.role && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.role.message}
                </p>
              )}
            </div>
          )}
        />

        {mode === 'edit' && (
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label
                  htmlFor="team-member-status"
                  className="text-sm font-medium text-[#111110]"
                >
                  Status
                </Label>
                <Select
                  {...field}
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="!h-[56px] !w-full rounded-[16px] border border-[#E5E7E9] bg-white px-4">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Deactivated">Deactivated</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.status && (
                  <p className="text-destructive text-sm">
                    {form.formState.errors.status.message}
                  </p>
                )}
              </div>
            )}
          />
        )}

        <Controller
          name="teamId"
          control={form.control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label
                htmlFor="team-member-team"
                className="text-sm font-medium text-[#111110]"
              >
                Team
              </Label>
              <Select
                {...field}
                value={field.value ?? ''}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="!h-[56px] !w-full rounded-[16px] border border-[#E5E7E9] bg-white px-4">
                  <SelectValue placeholder="Select Team" />
                </SelectTrigger>
                <SelectContent>
                  {selectableTeams.map((team) => (
                    <SelectItem key={team.teamId} value={team.teamId}>
                      {team.teamName || 'Unknown Team'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.teamId && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.teamId.message}
                </p>
              )}
            </div>
          )}
        />
      </form>
    </BetterDialogContent>
  )
}

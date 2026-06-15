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
import { useEffect, useMemo } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'
import { DashboardFolder } from './api/folders-v2'
import { DashboardTeam } from './api/teams-v2'

const createDiagramSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  folderId: z.string().optional(),
  teamId: z.string().min(1, 'Team is required'),
})

const updateDiagramSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  folderId: z.string().optional(),
  teamId: z.string().optional(),
})

type ConfigureDiagramModalProps = {
  mode: 'create' | 'update'
  open: boolean
  defaultName?: string
  defaultFolderId?: string | null
  defaultTeamId?: string | null
  folders?: DashboardFolder[]
  teams?: DashboardTeam[]
  onSubmit: SubmitHandler<
    z.infer<typeof createDiagramSchema> | z.infer<typeof updateDiagramSchema>
  >
}

function foldersForTeam(
  folders: DashboardFolder[],
  teamId: string | undefined
) {
  if (!teamId) return folders.filter((f) => !f.teamId)
  return folders.filter((f) => f.teamId === teamId)
}

export function ConfigureDiagramModal({
  mode,
  open,
  defaultName = '',
  defaultFolderId,
  defaultTeamId,
  folders = [],
  teams = [],
  onSubmit,
}: ConfigureDiagramModalProps) {
  const form = useForm({
    resolver: zodResolver(
      mode === 'create' ? createDiagramSchema : updateDiagramSchema
    ),
    defaultValues: {
      name: defaultName,
      folderId: defaultFolderId ?? undefined,
      teamId: defaultTeamId ?? undefined,
    },
  })

  const selectedTeamId = form.watch('teamId')

  const availableFolders = useMemo(
    () => foldersForTeam(folders, selectedTeamId),
    [folders, selectedTeamId]
  )

  useEffect(() => {
    if (open) {
      const teamId = defaultTeamId ?? undefined
      const folderOptions = foldersForTeam(folders, teamId)
      const folderId =
        defaultFolderId && folderOptions.some((f) => f.id === defaultFolderId)
          ? defaultFolderId
          : undefined

      form.reset({
        name: defaultName,
        teamId,
        folderId,
      })
    }
  }, [defaultName, defaultFolderId, defaultTeamId, folders, open, form])

  useEffect(() => {
    const currentFolderId = form.getValues('folderId')
    if (!selectedTeamId && currentFolderId) {
      form.setValue('folderId', undefined)
      return
    }
    if (
      currentFolderId &&
      !availableFolders.some((f) => f.id === currentFolderId)
    ) {
      form.setValue('folderId', undefined)
    }
  }, [availableFolders, form, selectedTeamId])

  return (
    <BetterDialogContent
      title={mode === 'create' ? 'Create Flow' : 'Rename Flow'}
      description={
        mode === 'create'
          ? 'Name your flow to start building it.'
          : 'Give this flow a new name.'
      }
      footerSubmit={mode === 'create' ? 'Create Flow' : 'Save Changes'}
      footerSubmitLoading={form.formState.isSubmitting}
      onFooterSubmitClick={form.handleSubmit(onSubmit)}
      footerCancel
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="diagram-name"
            className="text-sm font-medium text-[#111110]"
          >
            Name
          </Label>
          <Controller
            name="name"
            control={form.control}
            render={({ field }) => (
              <Input
                id="diagram-name"
                {...field}
                placeholder="Enter flow name"
                className="h-[56px] rounded-[16px] border border-[#E5E7E9] bg-white px-6 focus:outline-none"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
              />
            )}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        {mode === 'create' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#6B7280]">Team</Label>
              <Controller
                name="teamId"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-10 w-full rounded-xl border border-[#E5E7E9] bg-[#F9FAFB] px-3 text-sm">
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.teamId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.teamId.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#6B7280]">
                Folder <span className="text-[#9CA3AF]">(optional)</span>
              </Label>
              <Controller
                name="folderId"
                control={form.control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? '__none__'}
                    onValueChange={(v) =>
                      field.onChange(v === '__none__' ? undefined : v)
                    }
                    disabled={!selectedTeamId}
                  >
                    <SelectTrigger className="h-10 w-full rounded-xl border border-[#E5E7E9] bg-[#F9FAFB] px-3 text-sm disabled:opacity-60">
                      <SelectValue
                        placeholder={
                          selectedTeamId ? 'No folder' : 'Select a team first'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No folder</SelectItem>
                      {availableFolders.length === 0 ? (
                        <SelectItem value="__empty__" disabled>
                          No folders for this team
                        </SelectItem>
                      ) : (
                        availableFolders.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        )}
      </form>
    </BetterDialogContent>
  )
}

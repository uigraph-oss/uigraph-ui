'use client'

import { GT } from '@/api'
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
import { useEffect } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'

const diagramSchema = z.object({
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
  folders?: GT.Folder[]
  teams?: GT.TeamInfo[]
  onSubmit: SubmitHandler<z.infer<typeof diagramSchema>>
}

export function ConfigureDiagramModal({
  mode,
  open,
  defaultName = '',
  defaultFolderId,
  defaultTeamId,
  folders,
  teams,
  onSubmit,
}: ConfigureDiagramModalProps) {
  const form = useForm({
    resolver: zodResolver(diagramSchema),
    defaultValues: {
      name: defaultName,
      folderId: defaultFolderId ?? undefined,
      teamId: defaultTeamId ?? undefined,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: defaultName,
        folderId: defaultFolderId ?? undefined,
        teamId: defaultTeamId ?? undefined,
      })
    }
  }, [defaultName, defaultFolderId, defaultTeamId, open, form])

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
          <div className="grid grid-cols-2 gap-3">
            {folders && folders.length > 0 && (
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
                    >
                      <SelectTrigger className="h-10 w-full rounded-xl border border-[#E5E7E9] bg-[#F9FAFB] px-3 text-sm">
                        <SelectValue placeholder="No folder" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">No folder</SelectItem>
                        {folders.map((f) => (
                          <SelectItem
                            key={f.folderId ?? ''}
                            value={f.folderId ?? ''}
                          >
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}

            {teams && teams.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-[#6B7280]">
                  Team <span className="text-[#9CA3AF]">(optional)</span>
                </Label>
                <Controller
                  name="teamId"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? '__none__'}
                      onValueChange={(v) =>
                        field.onChange(v === '__none__' ? undefined : v)
                      }
                    >
                      <SelectTrigger className="h-10 w-full rounded-xl border border-[#E5E7E9] bg-[#F9FAFB] px-3 text-sm">
                        <SelectValue placeholder="No team" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">No team</SelectItem>
                        {teams.map((t) => (
                          <SelectItem
                            key={t.teamId ?? ''}
                            value={t.teamId ?? ''}
                          >
                            {t.teamName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}
          </div>
        )}
      </form>
    </BetterDialogContent>
  )
}

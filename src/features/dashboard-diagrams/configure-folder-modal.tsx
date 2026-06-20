'use client'

import { useEffect } from 'react'

import { BetterDialogContent } from '@/components/better-dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import { type ReactNode } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import z from 'zod'
import { DashboardTeam } from './api/teams'

const createFolderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  teamId: z.string().min(1, 'Team is required'),
})

const updateFolderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

export type CreateFolderFormValues = z.infer<typeof createFolderSchema>
export type UpdateFolderFormValues = z.infer<typeof updateFolderSchema>

type ConfigureFolderModalContentProps = {
  teams?: DashboardTeam[]
  defaultTeamId?: string | null
} & (
  | {
      mode: 'create'
      defaultValues?: Partial<CreateFolderFormValues>
      onSubmit: SubmitHandler<CreateFolderFormValues>
    }
  | {
      mode: 'update'
      defaultValues?: Partial<UpdateFolderFormValues>
      onSubmit: SubmitHandler<UpdateFolderFormValues>
    }
)

export function ConfigureFolderModal(props: ConfigureFolderModalContentProps) {
  if (props.mode === 'create') {
    return <ConfigureFolderModalCreate {...props} />
  }

  return <ConfigureFolderModalUpdate {...props} />
}

function ConfigureFolderModalCreate({
  defaultValues,
  defaultTeamId,
  onSubmit,
  teams = [],
}: Extract<ConfigureFolderModalContentProps, { mode: 'create' }>) {
  const form = useForm<CreateFolderFormValues>({
    resolver: zodResolver(createFolderSchema),
    defaultValues: {
      name: '',
      teamId: defaultTeamId ?? undefined,
      ...defaultValues,
    },
  })

  const { control, formState, handleSubmit, reset } = form

  useEffect(() => {
    reset({
      name: '',
      teamId: defaultTeamId ?? undefined,
      ...defaultValues,
    })
  }, [defaultValues, defaultTeamId, reset])

  return (
    <ConfigureFolderModalLayout
      mode="create"
      formState={formState}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm text-[#111110]">
                  Folder name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="E.g. Onboarding, Payments"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    className="h-[56px] rounded-[16px] border border-[#E5E7E9] bg-white px-6 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="teamId"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-medium text-[#6B7280]">
                  Team
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="h-10 w-full rounded-xl border border-[#E5E7E9] bg-[#F9FAFB] px-3 text-sm">
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teams.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </ConfigureFolderModalLayout>
  )
}

function ConfigureFolderModalUpdate({
  defaultValues,
  onSubmit,
}: Extract<ConfigureFolderModalContentProps, { mode: 'update' }>) {
  const form = useForm<UpdateFolderFormValues>({
    resolver: zodResolver(updateFolderSchema),
    defaultValues: {
      name: '',
      ...defaultValues,
    },
  })

  const { control, formState, handleSubmit, reset } = form

  useEffect(() => {
    reset({
      name: '',
      ...defaultValues,
    })
  }, [defaultValues, reset])

  return (
    <ConfigureFolderModalLayout
      mode="update"
      formState={formState}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm text-[#111110]">
                  Folder name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="E.g. Onboarding, Payments"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    className="h-[56px] rounded-[16px] border border-[#E5E7E9] bg-white px-6 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </ConfigureFolderModalLayout>
  )
}

function ConfigureFolderModalLayout({
  mode,
  formState,
  onSubmit,
  children,
}: {
  mode: 'create' | 'update'
  formState: { isSubmitting: boolean }
  onSubmit: () => void
  children: ReactNode
}) {
  const title = mode === 'create' ? 'Create Folder' : 'Update Folder'
  const description =
    mode === 'create'
      ? 'Name your folder to organize diagrams.'
      : 'Update the name of this folder.'
  const submitLabel = mode === 'create' ? 'Create Folder' : 'Save Changes'

  return (
    <BetterDialogContent
      title={title}
      description={description}
      footerCancel
      footerSubmit={submitLabel}
      footerSubmitLoading={formState.isSubmitting}
      onFooterSubmitClick={onSubmit}
    >
      {children}
    </BetterDialogContent>
  )
}

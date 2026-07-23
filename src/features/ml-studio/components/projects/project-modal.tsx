'use client'

import {
  BetterDialogContent,
  BetterDialogProvider,
} from '@/components/better-dialog'
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
import { Textarea } from '@/components/ui/textarea'
import { TEAMS } from '@/features/dashboard-diagrams/api/teams'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { CREATE_ML_PROJECT } from '../../api/ml-studio'

const projectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  type: z.enum(['model', 'training']),
  teamId: z.string().min(1, 'Team is required'),
})

type ProjectFormValues = z.infer<typeof projectSchema>

const emptyValues: ProjectFormValues = {
  name: '',
  description: '',
  type: 'model',
  teamId: '',
}

export function ProjectModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const orgId = useCurrentOrganization()?.id
  const { data: teamsData } = useQuery(TEAMS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
    variables: { orgId: orgId! },
  })
  const teams = teamsData?.teams ?? []
  const [createProject] = useMutation(CREATE_ML_PROJECT, {
    refetchQueries: ['MlStudioProjects'],
    awaitRefetchQueries: true,
  })

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: emptyValues,
  })
  const { control, handleSubmit, formState, reset } = form

  useEffect(() => {
    if (!open) {
      return
    }
    reset(emptyValues)
  }, [open, reset])

  async function onSubmit(values: ProjectFormValues) {
    if (!orgId) {
      return
    }
    await createProject({
      variables: {
        orgId,
        input: {
          name: values.name,
          type: values.type,
          description: values.description,
          teamId: values.teamId,
        },
      },
    })
    onOpenChange(false)
  }

  return (
    <BetterDialogProvider open={open} onOpenChange={onOpenChange}>
      <BetterDialogContent
        title="New project"
        description="Group models and experiments across your ML sources."
        footerCancel
        footerSubmit="Create project"
        footerSubmitLoading={formState.isSubmitting}
        onFooterSubmitClick={handleSubmit(onSubmit)}
      >
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Recommendations"
                      className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What does this project cover?"
                      className="min-h-[6.75rem] w-full resize-none rounded-[16px] border border-[#2A3242] bg-transparent p-6 text-sm leading-normal focus:outline-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="border-stock text-foreground/80 h-[56px] w-full rounded-[16px] bg-transparent px-6">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="model">Model</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="teamId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="border-stock text-foreground/80 h-[56px] w-full rounded-[16px] bg-transparent px-6">
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </BetterDialogContent>
    </BetterDialogProvider>
  )
}

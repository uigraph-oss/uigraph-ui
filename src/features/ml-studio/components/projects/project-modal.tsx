'use client'

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
import { Textarea } from '@/components/ui/textarea'
import { TEAMS } from '@/features/dashboard-diagrams/api/teams'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { BoxesIcon, FlaskConicalIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { CREATE_ML_PROJECT, UPDATE_ML_PROJECT } from '../../api/projects'

const projectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  type: z.enum(['model', 'training']),
  teamId: z.string().min(1, 'Team is required'),
})

type ProjectFormValues = z.infer<typeof projectSchema>
type ProjectTypeValue = ProjectFormValues['type']

const PROJECT_TYPES: {
  value: ProjectTypeValue
  label: string
  description: string
  icon: typeof BoxesIcon
  activeClassName: string
}[] = [
  {
    value: 'model',
    label: 'Model',
    description: 'Track model cards, versions, and deployments',
    icon: BoxesIcon,
    activeClassName: 'border-blue-500 bg-blue-500/10',
  },
  {
    value: 'training',
    label: 'Training',
    description: 'Organize experiments, runs, and datasets',
    icon: FlaskConicalIcon,
    activeClassName: 'border-violet-500 bg-violet-500/10',
  },
]

const emptyValues: ProjectFormValues = {
  name: '',
  description: '',
  type: 'model',
  teamId: '',
}

export function ProjectModal({
  onClose,
  project,
}: {
  onClose: () => void
  project?: {
    id: string
    name: string
    description: string
    type: string
    teamId?: string | null
  }
}) {
  const orgId = useCurrentOrganization()?.id
  const navigate = useNavigate()
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
  const [updateProject] = useMutation(UPDATE_ML_PROJECT, {
    refetchQueries: ['MlStudioProjects', 'MlStudioProject'],
    awaitRefetchQueries: true,
  })

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
          name: project.name,
          description: project.description,
          type: project.type === 'training' ? 'training' : 'model',
          teamId: project.teamId ?? '',
        }
      : emptyValues,
  })
  const { control, handleSubmit, formState } = form

  async function onSubmit(values: ProjectFormValues) {
    if (!orgId) {
      return
    }
    const input = {
      name: values.name,
      type: values.type,
      description: values.description,
      teamId: values.teamId,
    }
    if (project) {
      try {
        await updateProject({ variables: { orgId, id: project.id, input } })
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to update project'
        )
        return
      }
      toast.success('Project updated')
      onClose()
      return
    }
    const created = await createProject({ variables: { orgId, input } })
    onClose()
    const createdId = created.data?.createMlProject.id
    if (createdId) {
      void navigate(`/dashboard/ml-studio/projects/${createdId}`)
    }
  }

  return (
    <BetterDialogContent
      title={project ? 'Edit project' : 'New project'}
      description="Group models and experiments across your ML sources."
      footerCancel
      footerSubmit={project ? 'Save changes' : 'Create project'}
      footerSubmitLoading={formState.isSubmitting}
      onFooterSubmitClick={handleSubmit(onSubmit)}
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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
                  <div className="grid grid-cols-2 gap-3">
                    {PROJECT_TYPES.map((type) => {
                      const Icon = type.icon
                      const isSelected = field.value === type.value
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => field.onChange(type.value)}
                          disabled={formState.isSubmitting}
                          className={cn(
                            'flex flex-col items-start gap-2 rounded-[16px] border border-[#2A3242] bg-[#141925] p-4 text-left transition-colors hover:border-[#3A4356]',
                            isSelected && type.activeClassName
                          )}
                        >
                          <Icon
                            className={cn(
                              'h-5 w-5',
                              isSelected
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                            )}
                          />
                          <span className="text-sm font-semibold">
                            {type.label}
                          </span>
                          <span className="text-muted-foreground text-xs leading-snug">
                            {type.description}
                          </span>
                        </button>
                      )
                    })}
                  </div>
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
  )
}

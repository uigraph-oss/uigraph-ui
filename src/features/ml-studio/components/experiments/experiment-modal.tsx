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
import { TagInput } from '@/features/component-meta/components/tag-input'
import { ComponentMetaThemeProvider } from '@/features/component-meta/theme'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { CREATE_ML_EXPERIMENT, UPDATE_ML_EXPERIMENT } from '../../api/ml-studio'
import type { Experiment } from '../../types'

const experimentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  status: z.enum(['active', 'concluded', 'archived']),
  tags: z.array(z.string()),
  startedAt: z.string(),
})

type ExperimentFormValues = z.infer<typeof experimentSchema>

const emptyValues: ExperimentFormValues = {
  name: '',
  description: '',
  status: 'active',
  tags: [],
  startedAt: '',
}

export function ExperimentModal({
  onClose,
  experiment,
  projectId,
}: {
  onClose: () => void
  experiment?: Experiment | null
  projectId: string
}) {
  const orgId = useCurrentOrganization()?.id
  const [createExperiment] = useMutation(CREATE_ML_EXPERIMENT, {
    refetchQueries: ['MlStudioExperiments'],
    awaitRefetchQueries: true,
  })
  const [updateExperiment] = useMutation(UPDATE_ML_EXPERIMENT, {
    refetchQueries: ['MlStudioExperiments', 'MlStudioExperiment'],
    awaitRefetchQueries: true,
  })
  const isEdit = !!experiment
  const isSynced = experiment?.source === 'mlflow'

  const form = useForm<ExperimentFormValues>({
    resolver: zodResolver(experimentSchema),
    defaultValues: experiment
      ? {
          name: experiment.name,
          description: experiment.description,
          status: experiment.status,
          tags: experiment.tags,
          startedAt: experiment.startedAt
            ? experiment.startedAt.slice(0, 10)
            : '',
        }
      : emptyValues,
  })
  const { control, handleSubmit, formState } = form

  async function onSubmit(values: ExperimentFormValues) {
    if (!orgId) {
      return
    }
    const startedAt = values.startedAt
      ? new Date(values.startedAt).toISOString()
      : null
    if (experiment && isSynced) {
      await updateExperiment({
        variables: { orgId, id: experiment.id, input: { tags: values.tags } },
      })
    } else if (experiment) {
      await updateExperiment({
        variables: {
          orgId,
          id: experiment.id,
          input: {
            name: values.name,
            description: values.description,
            status: values.status,
            tags: values.tags,
            startedAt,
          },
        },
      })
    } else {
      await createExperiment({
        variables: {
          orgId,
          input: {
            projectId,
            name: values.name,
            description: values.description,
            status: values.status,
            tags: values.tags,
            startedAt,
          },
        },
      })
    }
    onClose()
  }

  return (
    <BetterDialogContent
      title={isEdit ? 'Edit experiment' : 'New experiment'}
      description={
        isSynced
          ? 'This experiment is synced from MLflow, so only its tags can be edited here.'
          : 'Report an experiment you ran outside of MLflow sync.'
      }
      footerCancel
      footerSubmit={isEdit ? 'Save changes' : 'Create experiment'}
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
                    placeholder="Two-tower retrieval v3"
                    disabled={isSynced}
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
                    placeholder="What is this experiment testing?"
                    disabled={isSynced}
                    className="min-h-[6.75rem] w-full resize-none rounded-[16px] border border-[#2A3242] bg-transparent p-6 text-sm leading-normal focus:outline-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSynced}
                    >
                      <SelectTrigger className="border-stock text-foreground/80 h-[56px] w-full rounded-[16px] bg-transparent px-6">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="concluded">Concluded</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="startedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Started on</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      disabled={isSynced}
                      className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <ComponentMetaThemeProvider theme="modal">
                    <TagInput
                      placeholder="fraud, unsupervised, baseline"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </ComponentMetaThemeProvider>
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

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
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { CREATE_ML_EXPERIMENT, UPDATE_ML_EXPERIMENT } from '../../api/ml-studio'
import type { Experiment } from '../../types'

const experimentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  status: z.enum(['active', 'concluded', 'archived']),
  startedAt: z.string(),
})

type ExperimentFormValues = z.infer<typeof experimentSchema>

const emptyValues: ExperimentFormValues = {
  name: '',
  description: '',
  status: 'active',
  startedAt: '',
}

export function ExperimentModal({
  open,
  onOpenChange,
  experiment,
  projectId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
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

  const form = useForm<ExperimentFormValues>({
    resolver: zodResolver(experimentSchema),
    defaultValues: emptyValues,
  })
  const { control, handleSubmit, formState, reset } = form

  useEffect(() => {
    if (!open) {
      return
    }
    reset(
      experiment
        ? {
            name: experiment.name,
            description: experiment.description,
            status: experiment.status,
            startedAt: experiment.startedAt
              ? experiment.startedAt.slice(0, 10)
              : '',
          }
        : emptyValues
    )
  }, [open, experiment, reset])

  async function onSubmit(values: ExperimentFormValues) {
    if (!orgId) {
      return
    }
    const startedAt = values.startedAt
      ? new Date(values.startedAt).toISOString()
      : null
    if (experiment) {
      await updateExperiment({
        variables: {
          orgId,
          id: experiment.id,
          input: {
            name: values.name,
            description: values.description,
            status: values.status,
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
            startedAt,
          },
        },
      })
    }
    onOpenChange(false)
  }

  return (
    <BetterDialogProvider open={open} onOpenChange={onOpenChange}>
      <BetterDialogContent
        title={isEdit ? 'Edit experiment' : 'New experiment'}
        description="Report an experiment you ran outside of MLflow sync."
        footerCancel
        footerSubmit={isEdit ? 'Save changes' : 'Create experiment'}
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
                      placeholder="Two-tower retrieval v3"
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
                        className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </BetterDialogContent>
    </BetterDialogProvider>
  )
}

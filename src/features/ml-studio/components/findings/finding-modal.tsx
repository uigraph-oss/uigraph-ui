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
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useMlStudioData } from '../../contexts/ml-studio-data-context'
import { ModelVersionSelect } from '../model-version-select'
import { EvidenceRunsSelect } from './evidence-runs-select'

const findingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  runIds: z.array(z.string()),
  modelId: z.string().min(1, 'Model is required'),
  versionId: z.string(),
})

type FindingFormValues = z.infer<typeof findingSchema>

const defaultValues: FindingFormValues = {
  title: '',
  description: '',
  runIds: [],
  modelId: '',
  versionId: '',
}

export function FindingModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { orgId, createFinding } = useMlStudioData()

  const form = useForm<FindingFormValues>({
    resolver: zodResolver(findingSchema),
    defaultValues,
  })
  const { control, handleSubmit, formState, reset, watch, setValue } = form

  useEffect(() => {
    if (open) {
      reset(defaultValues)
    }
  }, [open, reset])

  async function onSubmit(values: FindingFormValues) {
    if (!orgId) {
      return
    }
    await createFinding({
      variables: {
        orgId,
        input: {
          modelId: values.modelId,
          versionId: values.versionId || null,
          title: values.title,
          description: values.description,
          runIds: values.runIds,
        },
      },
    })
    onOpenChange(false)
  }

  return (
    <BetterDialogProvider open={open} onOpenChange={onOpenChange}>
      <BetterDialogContent
        title="New finding"
        description="Capture what was learned from an experiment."
        footerCancel
        footerSubmit="Create finding"
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Two-tower architecture improves cold-start recommendations"
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
                  <FormLabel>Body</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What did we discover, why did it happen, and why does it matter?"
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
              name="runIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evidence</FormLabel>
                  <FormControl>
                    <EvidenceRunsSelect
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="modelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Which model version does this support?</FormLabel>
                  <FormControl>
                    <ModelVersionSelect
                      modelId={field.value}
                      versionId={watch('versionId')}
                      onModelChange={field.onChange}
                      onVersionChange={(value) => setValue('versionId', value)}
                    />
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

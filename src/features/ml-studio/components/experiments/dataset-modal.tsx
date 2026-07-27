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
import { TagInput } from '@/features/component-meta/components/tag-input'
import { ComponentMetaThemeProvider } from '@/features/component-meta/theme'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { CREATE_ML_DATASET, UPDATE_ML_DATASET } from '../../api/datasets'
import type { Dataset } from '../../types'

const datasetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  source: z.string(),
  sourceType: z.string(),
  context: z.enum(['training', 'evaluation']),
  rowCount: z.string(),
  digest: z.string(),
  tags: z.array(z.string()),
})

type DatasetFormValues = z.infer<typeof datasetSchema>

const emptyValues: DatasetFormValues = {
  name: '',
  source: '',
  sourceType: '',
  context: 'training',
  rowCount: '',
  digest: '',
  tags: [],
}

export function DatasetModal({
  onClose,
  experimentId,
  dataset,
}: {
  onClose: () => void
  experimentId: string
  dataset?: Dataset | null
}) {
  const orgId = useCurrentOrganization()?.id
  const [createDataset] = useMutation(CREATE_ML_DATASET, {
    refetchQueries: ['MlStudioDatasets'],
    awaitRefetchQueries: true,
  })
  const [updateDataset] = useMutation(UPDATE_ML_DATASET, {
    refetchQueries: ['MlStudioDatasets', 'MlStudioDataset'],
    awaitRefetchQueries: true,
  })
  const isEdit = !!dataset

  const form = useForm<DatasetFormValues>({
    resolver: zodResolver(datasetSchema),
    defaultValues: dataset
      ? {
          name: dataset.name,
          source: dataset.source,
          sourceType: dataset.sourceType,
          context: dataset.context,
          rowCount: dataset.rowCount ? String(dataset.rowCount) : '',
          digest: dataset.digest,
          tags: dataset.tags,
        }
      : emptyValues,
  })
  const { control, handleSubmit, formState } = form

  async function onSubmit(values: DatasetFormValues) {
    if (!orgId) {
      return
    }
    const rowCount = values.rowCount.trim() ? Number(values.rowCount) : null
    const input = {
      name: values.name,
      source: values.source,
      sourceType: values.sourceType,
      context: values.context,
      rowCount: rowCount !== null && !Number.isNaN(rowCount) ? rowCount : null,
      digest: values.digest,
      tags: values.tags,
    }
    if (dataset) {
      await updateDataset({
        variables: { orgId, id: dataset.id, input },
      })
    } else {
      await createDataset({
        variables: { orgId, experimentId, input },
      })
    }
    onClose()
  }

  return (
    <BetterDialogContent
      title={isEdit ? 'Edit dataset' : 'New dataset'}
      description="Document a dataset used in this experiment — a path, URL, or table reference works fine."
      footerCancel
      footerSubmit={isEdit ? 'Save changes' : 'Log dataset'}
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
                    placeholder="training-set-v2"
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
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <FormControl>
                  <Input
                    placeholder="s3://my-bucket/datasets/roblox_players.csv"
                    className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6 font-mono text-sm focus:outline-none"
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
              name="sourceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source type</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="s3, local, url, table..."
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
              name="context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Context</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="border-stock text-foreground/80 h-[56px] w-full rounded-[16px] bg-transparent px-6">
                        <SelectValue placeholder="Select context" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="evaluation">Evaluation</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="rowCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Row count</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="120000"
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
              name="digest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Digest</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="sha256:abc123..."
                      className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6 font-mono text-sm focus:outline-none"
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
                      placeholder="tabular, pii-free, v2"
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

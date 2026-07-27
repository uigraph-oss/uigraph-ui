'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
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
import { toDateTimeLocal } from '@/utils/time'
import { useMutation, useQuery } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon, Trash2 } from 'lucide-react'
import { useFieldArray, useForm, type Control } from 'react-hook-form'
import { z } from 'zod'
import { ML_STUDIO_DATASETS } from '../../api/datasets'
import {
  CREATE_ML_EVALUATION,
  UPDATE_ML_EVALUATION,
} from '../../api/evaluations'
import { ModelVersionCombobox } from '../model-version-combobox'

const EVALUATION_TYPES = [
  'Offline Benchmark',
  'Online A/B Test',
  'Human Review',
  'Production Monitoring',
] as const

const KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_.-]*$/
const KEY_MESSAGE =
  'Use letters, numbers, ".", "-" or "_", starting with a letter or "_"'
const keySchema = z
  .string()
  .trim()
  .min(1, 'Key is required')
  .max(64, 'Key must be 64 characters or fewer')
  .regex(KEY_PATTERN, KEY_MESSAGE)

function withUniqueKeys<T extends { key: string }>(
  rows: T[],
  ctx: z.RefinementCtx
) {
  const seen = new Set<string>()
  rows.forEach((row, index) => {
    const key = row.key.trim()
    if (!key) {
      return
    }
    if (seen.has(key)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Key must be unique',
        path: [index, 'key'],
      })
      return
    }
    seen.add(key)
  })
}

const NUMBER_PATTERN = /^-?(\d+(\.\d+)?|\.\d+)([eE][+-]?\d+)?$/
const NUMBER_MESSAGE = 'Value must be a number'
const numberValueSchema = z
  .string()
  .trim()
  .min(1, 'Value is required')
  .max(32, 'Value must be 32 characters or fewer')
  .regex(NUMBER_PATTERN, NUMBER_MESSAGE)
  .refine((value) => Number.isFinite(Number(value)), NUMBER_MESSAGE)

const parametersSchema = z
  .array(
    z.object({
      key: keySchema,
      value: numberValueSchema,
    })
  )
  .max(50, 'At most 50 parameters')
  .superRefine(withUniqueKeys)

const metricsSchema = z
  .array(
    z.object({
      key: keySchema,
      value: numberValueSchema,
    })
  )
  .max(50, 'At most 50 metrics')
  .superRefine(withUniqueKeys)

const evaluationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required')
      .max(100, 'Name must be 100 characters or fewer'),
    type: z.enum(EVALUATION_TYPES),
    versionId: z.string().min(1, 'Model version is required'),
    datasetId: z.string(),
    startedAt: z.string().min(1, 'Start time is required'),
    endedAt: z.string().min(1, 'End time is required'),
    description: z
      .string()
      .max(2000, 'Description must be 2000 characters or fewer'),
    summary: z.string().max(2000, 'Summary must be 2000 characters or fewer'),
    parameters: parametersSchema,
    metrics: metricsSchema,
  })
  .superRefine((values, ctx) => {
    if (values.startedAt !== '' && Number.isNaN(Date.parse(values.startedAt))) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a valid date and time',
        path: ['startedAt'],
      })
    }
    if (values.endedAt !== '' && Number.isNaN(Date.parse(values.endedAt))) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a valid date and time',
        path: ['endedAt'],
      })
      return
    }
    if (
      values.startedAt !== '' &&
      values.endedAt !== '' &&
      Date.parse(values.endedAt) < Date.parse(values.startedAt)
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'End time must be after the start time',
        path: ['endedAt'],
      })
    }
  })

type EvaluationFormValues = z.infer<typeof evaluationSchema>

export type EditableEvaluation = {
  id: string
  versionId: string
  datasetId?: string | null
  name: string
  type: string
  description: string
  summary: string
  startedAt: string
  endedAt: string
  parameters?: Record<string, unknown> | null
  metrics?: Record<string, unknown> | null
}

function emptyValues(): EvaluationFormValues {
  const now = toDateTimeLocal(new Date())
  return {
    name: '',
    type: 'Offline Benchmark',
    versionId: '',
    datasetId: '',
    startedAt: now,
    endedAt: now,
    description: '',
    summary: '',
    parameters: [],
    metrics: [],
  }
}

function toRows(values?: Record<string, unknown> | null) {
  if (!values) {
    return []
  }
  return Object.entries(values).map(([key, value]) => ({
    key,
    value: String(value),
  }))
}

function toNumberMap(rows: { key: string; value: string }[]) {
  const out: Record<string, number> = {}
  for (const row of rows) {
    out[row.key.trim()] = Number(row.value.trim())
  }
  return out
}

function KeyValueFields({
  name,
  control,
  keyPlaceholder,
  valuePlaceholder,
  addLabel,
}: {
  name: 'parameters' | 'metrics'
  control: Control<EvaluationFormValues>
  keyPlaceholder: string
  valuePlaceholder: string
  addLabel: string
}) {
  const { fields, append, remove } = useFieldArray({ control, name })

  return (
    <div className="flex flex-col gap-2">
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-start gap-2">
          <FormField
            control={control}
            name={`${name}.${index}.key` as const}
            render={({ field: keyField }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    placeholder={keyPlaceholder}
                    className="h-11 rounded-[12px] border-[#2A3242] bg-transparent"
                    {...keyField}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${name}.${index}.value` as const}
            render={({ field: valueField }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    placeholder={valuePlaceholder}
                    inputMode="decimal"
                    className="h-11 rounded-[12px] border-[#2A3242] bg-transparent"
                    {...valueField}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <button
            type="button"
            onClick={() => remove(index)}
            className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-[8px] text-[#828DA3] transition-all hover:bg-red-500/15 hover:text-red-400"
            aria-label={`Remove ${name}`}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <Button
        type="button"
        preset="outline"
        className="h-10 w-fit"
        disabled={fields.length >= 50}
        onClick={() => append({ key: '', value: '' })}
      >
        <PlusIcon />
        {addLabel}
      </Button>
    </div>
  )
}

export function EvaluationModal({
  onClose,
  experimentId,
  evaluation,
}: {
  onClose: () => void
  experimentId: string
  evaluation?: EditableEvaluation | null
}) {
  const orgId = useCurrentOrganization()?.id
  const isEdit = !!evaluation

  const datasetsQuery = useQuery(ML_STUDIO_DATASETS, {
    skip: !orgId || !experimentId,
    variables: { orgId: orgId!, experimentId },
  })
  const datasets = datasetsQuery.data?.mlDatasets ?? []

  const [createEvaluation] = useMutation(CREATE_ML_EVALUATION, {
    refetchQueries: ['MlExperimentEvaluations', 'MlExperimentEvaluationsPage'],
    awaitRefetchQueries: true,
  })
  const [updateEvaluation] = useMutation(UPDATE_ML_EVALUATION, {
    refetchQueries: [
      'MlExperimentEvaluations',
      'MlExperimentEvaluationsPage',
      'MlEvaluation',
    ],
    awaitRefetchQueries: true,
  })

  const form = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: evaluation
      ? {
          name: evaluation.name,
          type: evaluation.type as EvaluationFormValues['type'],
          versionId: evaluation.versionId,
          datasetId: evaluation.datasetId ?? '',
          startedAt: toDateTimeLocal(new Date(evaluation.startedAt)),
          endedAt: toDateTimeLocal(new Date(evaluation.endedAt)),
          description: evaluation.description,
          summary: evaluation.summary,
          parameters: toRows(evaluation.parameters),
          metrics: toRows(evaluation.metrics),
        }
      : emptyValues(),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })
  const { control, handleSubmit, formState } = form

  async function onSubmit(values: EvaluationFormValues) {
    if (!orgId) {
      return
    }
    const shared = {
      name: values.name.trim(),
      type: values.type,
      datasetId: values.datasetId === '' ? null : values.datasetId,
      description: values.description,
      summary: values.summary,
      startedAt: new Date(values.startedAt).toISOString(),
      endedAt: new Date(values.endedAt).toISOString(),
      parameters: toNumberMap(values.parameters),
      metrics: toNumberMap(values.metrics),
    }
    if (evaluation) {
      await updateEvaluation({
        variables: { orgId, id: evaluation.id, input: shared },
      })
    } else {
      await createEvaluation({
        variables: {
          orgId,
          experimentId,
          input: { ...shared, versionId: values.versionId },
        },
      })
    }
    onClose()
  }

  return (
    <BetterDialogContent
      title={isEdit ? 'Edit evaluation run' : 'New evaluation run'}
      description="Record an evaluation run's parameters and metrics for this experiment."
      footerCancel
      footerSubmit={isEdit ? 'Save changes' : 'Create evaluation run'}
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
                    placeholder="eval-baseline-v2"
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
                      {EVALUATION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="versionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model version</FormLabel>
                <FormControl>
                  <ModelVersionCombobox
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isEdit}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="datasetId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dataset</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="border-stock text-foreground/80 h-[56px] w-full rounded-[16px] bg-transparent px-6">
                      <SelectValue placeholder="No dataset" />
                    </SelectTrigger>
                    <SelectContent>
                      {datasets.map((dataset) => (
                        <SelectItem key={dataset.id} value={dataset.id}>
                          {dataset.name}
                        </SelectItem>
                      ))}
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
                <FormLabel>Started at</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
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
            name="endedAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ended at</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
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
                    placeholder="What was evaluated?"
                    className="min-h-[5rem] w-full resize-none rounded-[16px] border border-[#2A3242] bg-transparent p-6 text-sm leading-normal focus:outline-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Summary</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What did the results show?"
                    className="min-h-[5rem] w-full resize-none rounded-[16px] border border-[#2A3242] bg-transparent p-6 text-sm leading-normal focus:outline-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Parameters</FormLabel>
            <KeyValueFields
              name="parameters"
              control={control}
              keyPlaceholder="temperature"
              valuePlaceholder="0.7"
              addLabel="Add parameter"
            />
          </FormItem>

          <FormItem>
            <FormLabel>Metrics</FormLabel>
            <KeyValueFields
              name="metrics"
              control={control}
              keyPlaceholder="accuracy"
              valuePlaceholder="0.94"
              addLabel="Add metric"
            />
          </FormItem>
        </form>
      </Form>
    </BetterDialogContent>
  )
}

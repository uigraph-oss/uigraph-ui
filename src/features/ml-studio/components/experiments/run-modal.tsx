'use client'

import {
  BetterDialogContent,
  BetterDialogProvider,
} from '@/components/better-dialog'
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
import { useMutation } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon, Trash2 } from 'lucide-react'
import ms from 'ms'
import { useEffect } from 'react'
import { useFieldArray, useForm, type Control } from 'react-hook-form'
import { z } from 'zod'
import { CREATE_ML_RUN, UPDATE_ML_RUN } from '../../api/ml-studio'
import type { Run } from '../../types'

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

const parametersSchema = z
  .array(
    z.object({
      key: keySchema,
      value: z
        .string()
        .trim()
        .min(1, 'Value is required')
        .max(256, 'Value must be 256 characters or fewer'),
    })
  )
  .max(50, 'At most 50 parameters')
  .superRefine(withUniqueKeys)

const metricsSchema = z
  .array(
    z.object({
      key: keySchema,
      value: z
        .string()
        .trim()
        .min(1, 'Value is required')
        .refine(
          (value) => Number.isFinite(Number(value)),
          'Value must be a number'
        ),
    })
  )
  .max(50, 'At most 50 metrics')
  .superRefine(withUniqueKeys)

const runSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required')
      .max(100, 'Name must be 100 characters or fewer'),
    status: z.enum(['running', 'completed', 'failed', 'cancelled']),
    startedAt: z.string(),
    endedAt: z.string(),
    duration: z
      .string()
      .trim()
      .refine(
        (value) => Number.isFinite(ms(value as ms.StringValue)),
        'Use a duration like "5s", "2h" or "1500ms"'
      ),
    notes: z.string().max(2000, 'Notes must be 2000 characters or fewer'),
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
    if (values.endedAt === '') {
      return
    }
    if (Number.isNaN(Date.parse(values.endedAt))) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a valid date and time',
        path: ['endedAt'],
      })
      return
    }
    if (values.startedAt === '') {
      ctx.addIssue({
        code: 'custom',
        message: 'Set a start time first',
        path: ['startedAt'],
      })
      return
    }
    if (Date.parse(values.endedAt) < Date.parse(values.startedAt)) {
      ctx.addIssue({
        code: 'custom',
        message: 'End time must be after the start time',
        path: ['endedAt'],
      })
    }
  })

type RunFormValues = z.infer<typeof runSchema>

const emptyValues: RunFormValues = {
  name: '',
  status: 'completed',
  startedAt: '',
  endedAt: '',
  duration: '',
  notes: '',
  parameters: [],
  metrics: [],
}

function toRows(values?: Record<string, string | number>) {
  if (!values) {
    return []
  }
  return Object.entries(values).map(([key, value]) => ({
    key,
    value: String(value),
  }))
}

function toParameterMap(rows: { key: string; value: string }[]) {
  const out: Record<string, string> = {}
  for (const row of rows) {
    out[row.key.trim()] = row.value.trim()
  }
  return out
}

function toMetricMap(rows: { key: string; value: string }[]) {
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
  control: Control<RunFormValues>
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

export function RunModal({
  open,
  onOpenChange,
  experimentId,
  run,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  experimentId: string
  run?: Run | null
}) {
  const orgId = useCurrentOrganization()?.id
  const [createRun] = useMutation(CREATE_ML_RUN, {
    refetchQueries: ['MlStudioExperimentRuns', 'MlStudioExperimentRunsPage'],
    awaitRefetchQueries: true,
  })
  const [updateRun] = useMutation(UPDATE_ML_RUN, {
    refetchQueries: [
      'MlStudioExperimentRuns',
      'MlStudioExperimentRunsPage',
      'MlStudioRun',
    ],
    awaitRefetchQueries: true,
  })
  const isEdit = !!run

  const form = useForm<RunFormValues>({
    resolver: zodResolver(runSchema),
    defaultValues: emptyValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })
  const { control, handleSubmit, formState, reset } = form

  useEffect(() => {
    if (!open) {
      return
    }
    reset(
      run
        ? {
            name: run.name,
            status: run.status,
            startedAt: run.startedAt ? run.startedAt.slice(0, 16) : '',
            endedAt: run.endedAt ? run.endedAt.slice(0, 16) : '',
            duration: ms(run.duration),
            notes: run.notes,
            parameters: toRows(run.parameters),
            metrics: toRows(run.metrics),
          }
        : emptyValues
    )
  }, [open, run, reset])

  async function onSubmit(values: RunFormValues) {
    if (!orgId) {
      return
    }
    const input = {
      name: values.name.trim(),
      status: values.status,
      startedAt: values.startedAt
        ? new Date(values.startedAt).toISOString()
        : null,
      endedAt: values.endedAt ? new Date(values.endedAt).toISOString() : null,
      duration: ms(values.duration as ms.StringValue),
      notes: values.notes,
      parameters: toParameterMap(values.parameters),
      metrics: toMetricMap(values.metrics),
    }
    if (run) {
      await updateRun({
        variables: { orgId, id: run.id, input },
      })
    } else {
      await createRun({
        variables: { orgId, experimentId, input },
      })
    }
    onOpenChange(false)
  }

  return (
    <BetterDialogProvider open={open} onOpenChange={onOpenChange}>
      <BetterDialogContent
        title={isEdit ? 'Edit run' : 'New run'}
        description="Report a run's parameters and metrics for this experiment."
        footerCancel
        footerSubmit={isEdit ? 'Save changes' : 'Create run'}
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
                      placeholder="baseline-run-4"
                      className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none"
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
                          <SelectItem value="running">Running</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="5s"
                        className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <FormField
              control={control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What changed in this run?"
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
                keyPlaceholder="learning_rate"
                valuePlaceholder="0.001"
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
    </BetterDialogProvider>
  )
}

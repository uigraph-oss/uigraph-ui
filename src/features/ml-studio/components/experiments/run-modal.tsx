'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import { DateTimePicker } from '@/components/ui/date-time-picker'
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TagInput } from '@/features/component-meta/components/tag-input'
import { ComponentMetaThemeProvider } from '@/features/component-meta/theme'
import { useCurrentOrganization } from '@/store/auth-store'
import { toDateTimeLocal } from '@/utils/time'
import { useMutation } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { PlusIcon, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useFieldArray, useForm, type Control } from 'react-hook-form'
import { z } from 'zod'
import { CREATE_ML_RUN, UPDATE_ML_RUN } from '../../api/runs'
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

const runSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required')
      .max(100, 'Name must be 100 characters or fewer'),
    status: z.enum(['running', 'completed', 'failed', 'cancelled']),
    startedAt: z.string().min(1, 'Start time is required'),
    endedAt: z.string(),
    notes: z.string().max(2000, 'Notes must be 2000 characters or fewer'),
    tags: z.array(z.string()),
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

function emptyValues(): RunFormValues {
  const now = toDateTimeLocal(new Date())
  return {
    name: '',
    status: 'completed',
    startedAt: now,
    endedAt: '',
    notes: '',
    tags: [],
    parameters: [],
    metrics: [],
  }
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

export function RunModal({
  onClose,
  experimentId,
  run,
}: {
  onClose: () => void
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
    defaultValues: run
      ? {
          name: run.name,
          status: run.status,
          startedAt: toDateTimeLocal(new Date(run.startedAt)),
          endedAt: run.endedAt ? toDateTimeLocal(new Date(run.endedAt)) : '',
          notes: run.notes,
          tags: run.tags,
          parameters: toRows(run.parameters),
          metrics: toRows(run.metrics),
        }
      : emptyValues(),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })
  const { control, handleSubmit, formState, setValue, watch, trigger } = form
  const [durationInput, setDurationInput] = useState<string | null>(null)

  const startMs = Date.parse(watch('startedAt'))
  const endMs = Date.parse(watch('endedAt'))
  const durationDisabled = !Number.isFinite(startMs)
  const derivedDuration =
    Number.isFinite(startMs) && Number.isFinite(endMs) && endMs >= startMs
      ? String(Math.round((endMs - startMs) / 60000))
      : ''
  const durationValue = durationInput ?? derivedDuration

  function onStartedAtChange(value: string) {
    setDurationInput(null)
    setValue('startedAt', value, { shouldValidate: true, shouldDirty: true })
    const nextStartMs = Date.parse(value)
    if (
      Number.isFinite(nextStartMs) &&
      Number.isFinite(startMs) &&
      Number.isFinite(endMs) &&
      endMs >= startMs
    ) {
      setValue(
        'endedAt',
        format(new Date(nextStartMs + (endMs - startMs)), "yyyy-MM-dd'T'HH:mm"),
        { shouldValidate: true, shouldDirty: true }
      )
      return
    }
    void trigger('endedAt')
  }

  function onEndedAtChange(value: string) {
    setDurationInput(null)
    setValue('endedAt', value, { shouldValidate: true, shouldDirty: true })
    void trigger('startedAt')
  }

  function onDurationChange(value: string) {
    setDurationInput(value)
    if (!Number.isFinite(startMs)) {
      return
    }
    if (value.trim() === '') {
      setValue('endedAt', '', { shouldValidate: true, shouldDirty: true })
      void trigger('startedAt')
      return
    }
    const minutes = Number(value)
    if (!Number.isInteger(minutes) || minutes < 0) {
      return
    }
    setValue(
      'endedAt',
      format(new Date(startMs + minutes * 60000), "yyyy-MM-dd'T'HH:mm"),
      { shouldValidate: true, shouldDirty: true }
    )
    void trigger('startedAt')
  }

  async function onSubmit(values: RunFormValues) {
    if (!orgId) {
      return
    }
    const input = {
      name: values.name.trim(),
      status: values.status,
      startedAt: new Date(values.startedAt).toISOString(),
      endedAt:
        values.endedAt === '' ? null : new Date(values.endedAt).toISOString(),
      notes: values.notes,
      tags: values.tags,
      parameters: toNumberMap(values.parameters),
      metrics: toNumberMap(values.metrics),
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
    onClose()
  }

  return (
    <BetterDialogContent
      title={isEdit ? 'Edit run' : 'New run'}
      description="Report a run's parameters and metrics for this experiment."
      footerCancel
      footerSubmit={isEdit ? 'Save changes' : 'Create run'}
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
                    placeholder="baseline-run-4"
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
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

          <div className="grid grid-cols-3 items-start gap-4">
            <FormField
              control={control}
              name="startedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="whitespace-nowrap">
                    Started at
                  </FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={onStartedAtChange}
                      onBlur={field.onBlur}
                      className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none"
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
                  <FormLabel className="whitespace-nowrap">Ended at</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={onEndedAtChange}
                      onBlur={field.onBlur}
                      className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel className="whitespace-nowrap">
                Duration (min)
              </FormLabel>
              {durationDisabled ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Input
                        disabled
                        value=""
                        readOnly
                        placeholder="—"
                        className="h-[56px] w-full rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Set a start time first</TooltipContent>
                </Tooltip>
              ) : (
                <Input
                  inputMode="numeric"
                  placeholder="60"
                  value={durationValue}
                  onChange={(e) => onDurationChange(e.target.value)}
                  onBlur={() => setDurationInput(null)}
                  className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none"
                />
              )}
            </FormItem>
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

          <FormField
            control={control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <ComponentMetaThemeProvider theme="modal">
                    <TagInput
                      placeholder="sweep, baseline, gpu"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </ComponentMetaThemeProvider>
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
  )
}

'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Activity, ClipboardList, RefreshCw, X, Zap } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'
import {
  decodePackTargetEndpoints,
  encodePackTargetEndpoint,
  type PackTargetEndpoint,
} from '../../../lib/load-pack-target-endpoints'
import { EndpointPicker } from '../endpoint-picker'

const createTestPackSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['smoke', 'regression', 'manual', 'load'], {
    message: 'Type is required',
  }),
})

type TestPackType = z.infer<typeof createTestPackSchema>['type']

const TEST_PACK_TYPES: {
  value: TestPackType
  label: string
  description: string
  icon: typeof Zap
  activeClassName: string
}[] = [
  {
    value: 'smoke',
    label: 'Smoke',
    description: 'Fast checks on critical paths',
    icon: Zap,
    activeClassName: 'border-primary bg-primary/10',
  },
  {
    value: 'regression',
    label: 'Regression',
    description: 'Full coverage across the API surface',
    icon: RefreshCw,
    activeClassName: 'border-purple-500 bg-purple-500/10',
  },
  {
    value: 'manual',
    label: 'Manual',
    description: 'Human-run checklists and exploratory steps',
    icon: ClipboardList,
    activeClassName: 'border-slate-400 bg-slate-400/10',
  },
  {
    value: 'load',
    label: 'Load',
    description:
      'Performance & throughput results, imported from load-test tools',
    icon: Activity,
    activeClassName: 'border-emerald-500 bg-emerald-500/10',
  },
]

type LoadPackScope = 'scoped' | 'broad'

type CreateTestPackModalProps = {
  mode: 'create' | 'update'
  defaultValues?: {
    name?: string
    type?: TestPackType
    loadConfig?: { targetEndpoints?: (string | null)[] | null } | null
  }
  onSubmit: (data: {
    name: string
    type: TestPackType
    loadConfig?: { targetEndpoints: string[] }
  }) => Promise<void>
}

export function CreateTestPackModal({
  mode,
  defaultValues,
  onSubmit,
}: CreateTestPackModalProps) {
  const form = useForm<z.infer<typeof createTestPackSchema>>({
    resolver: zodResolver(createTestPackSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      type: defaultValues?.type,
    },
    mode: 'onBlur',
  })

  const initialScopedEndpoints = decodePackTargetEndpoints(
    defaultValues?.loadConfig?.targetEndpoints
  )
  const [loadScope, setLoadScope] = useState<LoadPackScope>(
    initialScopedEndpoints.length > 0 ? 'scoped' : 'broad'
  )
  const [scopedEndpoints, setScopedEndpoints] = useState<PackTargetEndpoint[]>(
    initialScopedEndpoints
  )
  const [scopeError, setScopeError] = useState<string | null>(null)

  function addScopedEndpoint(endpoint: {
    id: string
    method: string
    path: string
  }) {
    setScopeError(null)
    setScopedEndpoints((rows) =>
      rows.some((r) => r.apiEndpointId === endpoint.id)
        ? rows
        : [
            ...rows,
            {
              apiEndpointId: endpoint.id,
              method: endpoint.method,
              path: endpoint.path,
            },
          ]
    )
  }

  function removeScopedEndpoint(apiEndpointId: string) {
    setScopedEndpoints((rows) =>
      rows.filter((r) => r.apiEndpointId !== apiEndpointId)
    )
  }

  async function handleSubmit(data: z.infer<typeof createTestPackSchema>) {
    if (data.type === 'load' && loadScope === 'scoped') {
      if (scopedEndpoints.length === 0) {
        setScopeError('Add at least one target endpoint, or switch to Broad.')
        return
      }
    }
    setScopeError(null)

    await onSubmit({
      name: data.name,
      type: data.type,
      loadConfig:
        data.type === 'load' && loadScope === 'scoped'
          ? { targetEndpoints: scopedEndpoints.map(encodePackTargetEndpoint) }
          : data.type === 'load'
            ? { targetEndpoints: [] }
            : undefined,
    })
  }

  const nameError = form.formState.errors.name
  const typeError = form.formState.errors.type
  const selectedType = form.watch('type')

  return (
    <BetterDialogContent
      title={mode === 'create' ? 'Create Test Pack' : 'Edit Test Pack'}
      description={
        mode === 'create'
          ? 'Create a new test pack to organize your test cases.'
          : 'Update test pack details.'
      }
      footerSubmit={mode === 'create' ? 'Create Test Pack' : 'Save Changes'}
      footerSubmitLoading={form.formState.isSubmitting}
      onFooterSubmitClick={form.handleSubmit(handleSubmit)}
      footerCancel="Cancel"
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-normal">
            Name
          </Label>
          <Controller
            name="name"
            control={form.control}
            render={({ field }) => (
              <Input
                id="name"
                placeholder="e.g. Smoke Tests, Regression Suite"
                autoCorrect="off"
                autoComplete="off"
                autoCapitalize="off"
                className={cn(
                  'h-[56px] rounded-[16px] border border-[#2A3242] bg-[#141925] px-6 focus:outline-none',
                  nameError && 'border-red-500'
                )}
                {...field}
              />
            )}
          />
          {nameError && (
            <p className="text-sm text-red-500">{nameError.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-normal">Type</Label>
          <Controller
            name="type"
            control={form.control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-3">
                {TEST_PACK_TYPES.map((type) => {
                  const { value, label, description, activeClassName } = type
                  const Icon = type.icon
                  const isSelected = field.value === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => field.onChange(value)}
                      disabled={form.formState.isSubmitting}
                      className={cn(
                        'flex flex-col items-start gap-2 rounded-[16px] border border-[#2A3242] bg-[#141925] p-4 text-left transition-colors hover:border-[#3A4356]',
                        isSelected && activeClassName
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
                      <span className="text-sm font-semibold">{label}</span>
                      <span className="text-muted-foreground text-xs leading-snug">
                        {description}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          />
          {typeError && (
            <p className="text-sm text-red-500">{typeError.message}</p>
          )}
        </div>

        {selectedType === 'load' && (
          <div className="space-y-2">
            <Label className="text-sm font-normal">Scope</Label>
            <p className="text-muted-foreground text-xs">
              Endpoint-scoped packs require every run to report metrics for the
              declared endpoint(s), so the SLA thresholds set on those endpoints
              always have something to grade. Broad packs are for full-surface
              or system-wide tests — endpoint attribution stays optional per
              run.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLoadScope('scoped')}
                disabled={form.formState.isSubmitting}
                className={cn(
                  'rounded-[16px] border border-[#2A3242] bg-[#141925] p-4 text-left transition-colors hover:border-[#3A4356]',
                  loadScope === 'scoped' &&
                    'border-emerald-500 bg-emerald-500/10'
                )}
              >
                <span className="text-sm font-semibold">Endpoint-scoped</span>
                <p className="text-muted-foreground mt-1 text-xs leading-snug">
                  Tests one or a few specific endpoints. Target endpoints
                  required on every run.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setLoadScope('broad')}
                disabled={form.formState.isSubmitting}
                className={cn(
                  'rounded-[16px] border border-[#2A3242] bg-[#141925] p-4 text-left transition-colors hover:border-[#3A4356]',
                  loadScope === 'broad' &&
                    'border-emerald-500 bg-emerald-500/10'
                )}
              >
                <span className="text-sm font-semibold">
                  Broad / system-wide
                </span>
                <p className="text-muted-foreground mt-1 text-xs leading-snug">
                  Soak, spike, or capacity tests across many endpoints. Endpoint
                  attribution optional per run.
                </p>
              </button>
            </div>

            {loadScope === 'scoped' && (
              <div className="border-border mt-3 rounded-[16px] border bg-[#141925] p-4">
                {scopedEndpoints.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {scopedEndpoints.map((endpoint) => (
                      <span
                        key={endpoint.apiEndpointId}
                        className="flex items-center gap-1.5 rounded-[10px] border border-[#2A3242] bg-[#0F131C] px-3 py-1.5 font-mono text-xs"
                      >
                        {endpoint.method} {endpoint.path}
                        <button
                          type="button"
                          onClick={() =>
                            removeScopedEndpoint(endpoint.apiEndpointId)
                          }
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <EndpointPicker onSelect={addScopedEndpoint} />
              </div>
            )}
            {scopeError && <p className="text-sm text-red-500">{scopeError}</p>}
          </div>
        )}
      </form>
    </BetterDialogContent>
  )
}

export type { TestPackType }

import { BetterDialogContent } from '@/components/better-dialog'
import { SectionLoader } from '@/components/section-loader'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SelectSearch } from '@/components/ui/select-search'
import {
  API_ENDPOINTS,
  API_GROUPS,
} from '@/features/services/api/api-endpoints'
import {
  SERVICE_DEPENDENCIES,
  SERVICE_DEPENDENCY_GRAPH,
  UPDATE_SERVICE_DEPENDENCIES,
  type ServiceDependenciesData,
  type ServiceDependency,
} from '@/features/services/api/dependencies'
import { SERVICE_DBS } from '@/features/services/api/service-db'
import { SERVICES } from '@/features/services/api/services'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useApolloClient, useMutation, useQuery } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRightLeft, ChevronDown, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Controller,
  useFieldArray,
  useForm,
  type UseFormReturn,
} from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const NO_TYPE = 'none'

const DEPENDENCY_TYPE_OPTIONS = [
  { value: NO_TYPE, label: 'No type' },
  { value: 'http', label: 'HTTP API' },
  { value: 'graphql', label: 'GraphQL API' },
  { value: 'grpc', label: 'gRPC API' },
  { value: 'database', label: 'Database' },
]

const PROTOCOL_BY_TYPE: Record<string, string> = {
  http: 'rest',
  graphql: 'graphql',
  grpc: 'grpc',
}

const CRITICALITIES = ['hard', 'soft']

const rowSchema = z.object({
  dependencyId: z.string().nullable(),
  direction: z.enum(['upstream', 'downstream']),
  otherService: z.string().min(1, 'Service is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['', 'http', 'graphql', 'grpc', 'database']),
  criticality: z.enum(['hard', 'soft']),
  description: z.string(),
  apiGroupName: z.string(),
  apiEndpointNames: z.array(z.string()),
  databaseName: z.string(),
})

const formSchema = z
  .object({ rows: z.array(rowSchema) })
  .superRefine((value, ctx) => {
    const seen = new Map<string, number>()
    value.rows.forEach((row, index) => {
      const owner = row.direction === 'upstream' ? 'self' : row.otherService
      const key = `${owner}::${row.name}`
      if (row.name && seen.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Duplicate dependency name for this service',
          path: ['rows', index, 'name'],
        })
      }
      seen.set(key, index)
    })
  })

type FormValues = z.infer<typeof formSchema>
type DependencyRow = z.infer<typeof rowSchema>
type DependencyType = DependencyRow['type']
type DependencyInput = {
  name: string
  service: string
  type: string
  criticality: string
  description: string
  apiGroupName?: string
  apiEndpointNames?: string[]
  databaseName?: string
}

function isApiType(type: string): boolean {
  return type === 'http' || type === 'graphql' || type === 'grpc'
}

function isDbType(type: string): boolean {
  return type === 'database'
}

function providerNameOf(dep: ServiceDependency): string {
  return dep.providerName ?? dep.providerService?.name ?? ''
}

function endpointNamesOf(dep: ServiceDependency): string[] {
  return Array.isArray(dep.apiEndpointNames) ? dep.apiEndpointNames : []
}

function buildInput(
  base: Omit<
    DependencyInput,
    'apiGroupName' | 'apiEndpointNames' | 'databaseName'
  >,
  type: string,
  apiGroupName: string,
  apiEndpointNames: string[],
  databaseName: string
): DependencyInput {
  if (isApiType(type)) {
    return { ...base, apiGroupName, apiEndpointNames }
  }
  if (isDbType(type)) {
    return { ...base, databaseName }
  }
  return base
}

function depToInput(dep: ServiceDependency): DependencyInput {
  const type = dep.type ?? ''
  const base = {
    name: dep.name,
    service: providerNameOf(dep),
    type,
    criticality: dep.criticality ?? 'soft',
    description: dep.description ?? '',
  }
  return buildInput(
    base,
    type,
    dep.apiGroupName ?? '',
    endpointNamesOf(dep),
    dep.databaseName ?? ''
  )
}

function rowToInput(row: DependencyRow, providerName: string): DependencyInput {
  const base = {
    name: row.name,
    service: providerName,
    type: row.type,
    criticality: row.criticality,
    description: row.description,
  }
  return buildInput(
    base,
    row.type,
    row.apiGroupName,
    row.apiEndpointNames,
    row.databaseName
  )
}

function DependencyTypeFields({
  index,
  form,
  orgId,
  providerServiceId,
  type,
}: {
  index: number
  form: UseFormReturn<FormValues>
  orgId: string
  providerServiceId: string | undefined
  type: DependencyType
}) {
  const apiGroupName = form.watch(`rows.${index}.apiGroupName`)

  const apiGroupsRes = useQuery(API_GROUPS, {
    variables: { orgId, serviceId: providerServiceId! },
    skip: !orgId || !providerServiceId || !isApiType(type),
  })
  const apiGroups = (apiGroupsRes.data?.apiGroups ?? []).filter(
    (group) => (group.protocol ?? '').toLowerCase() === PROTOCOL_BY_TYPE[type]
  )
  const selectedGroup = apiGroups.find((group) => group.name === apiGroupName)

  const endpointsRes = useQuery(API_ENDPOINTS, {
    variables: {
      orgId,
      serviceId: providerServiceId!,
      apiGroupId: selectedGroup?.id ?? '',
    },
    skip: !orgId || !providerServiceId || !selectedGroup,
  })
  const endpoints = endpointsRes.data?.apiEndpoints ?? []

  const dbsRes = useQuery(SERVICE_DBS, {
    variables: { orgId, serviceId: providerServiceId! },
    skip: !orgId || !providerServiceId || !isDbType(type),
  })
  const dbs = dbsRes.data?.serviceDBs ?? []

  if (!providerServiceId) {
    return (
      <p className="text-xs text-[#828DA3]">
        Select an onboarded provider service to choose its APIs or databases.
      </p>
    )
  }

  if (isApiType(type)) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-normal text-[#828DA3]">
            API group
          </Label>
          <Controller
            name={`rows.${index}.apiGroupName`}
            control={form.control}
            render={({ field }) => (
              <SelectSearch
                value={field.value}
                onChange={(value) => {
                  field.onChange(value)
                  form.setValue(`rows.${index}.apiEndpointNames`, [])
                }}
                options={apiGroups.map((group) => ({
                  label: group.name,
                  value: group.name,
                }))}
                placeholder="Select an API group"
                className="!h-[56px] w-full rounded-[16px] border-[#2A3242] !bg-transparent px-6"
              />
            )}
          />
        </div>

        {selectedGroup && (
          <div className="space-y-2">
            <Label className="text-sm font-normal text-[#828DA3]">
              API endpoints
            </Label>
            <Controller
              name={`rows.${index}.apiEndpointNames`}
              control={form.control}
              render={({ field }) => (
                <div className="max-h-[240px] space-y-1 overflow-y-auto rounded-[16px] border border-[#2A3242] p-3">
                  {endpoints.length === 0 ? (
                    <p className="text-xs text-[#828DA3]">
                      No endpoints in this API group.
                    </p>
                  ) : (
                    endpoints.map((endpoint) => {
                      const checked = field.value.includes(endpoint.operationId)
                      return (
                        <label
                          key={endpoint.id}
                          className="flex cursor-pointer items-center gap-3 rounded-[8px] px-2 py-2 hover:bg-[#1E2533]"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(next) => {
                              if (next) {
                                field.onChange([
                                  ...field.value,
                                  endpoint.operationId,
                                ])
                              } else {
                                field.onChange(
                                  field.value.filter(
                                    (name) => name !== endpoint.operationId
                                  )
                                )
                              }
                            }}
                          />
                          <span className="text-sm text-[#F4F7FC]">
                            {endpoint.operationId}
                          </span>
                          <span className="ml-auto text-xs text-[#828DA3]">
                            {endpoint.method}
                          </span>
                        </label>
                      )
                    })
                  )}
                </div>
              )}
            />
          </div>
        )}
      </div>
    )
  }

  if (isDbType(type)) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-normal text-[#828DA3]">Database</Label>
        <Controller
          name={`rows.${index}.databaseName`}
          control={form.control}
          render={({ field }) => (
            <SelectSearch
              value={field.value}
              onChange={field.onChange}
              options={dbs.map((db) => ({
                label: db.dbName,
                value: db.dbName,
              }))}
              placeholder="Select a database"
              className="!h-[56px] w-full rounded-[16px] border-[#2A3242] !bg-transparent px-6"
            />
          )}
        />
      </div>
    )
  }

  return null
}

function DependencyEditor({
  fieldId,
  index,
  direction,
  form,
  remove,
  serviceOptions,
  orgId,
  serviceId,
  services,
}: {
  fieldId: string
  index: number
  direction: DependencyRow['direction']
  form: UseFormReturn<FormValues>
  remove: (index: number) => void
  serviceOptions: { label: string; value: string }[]
  orgId: string
  serviceId: string
  services: { id: string; name: string }[]
}) {
  const row = form.watch(`rows.${index}`)
  const errors = form.formState.errors.rows?.[index]
  const type = (row?.type ?? '') as DependencyType

  const providerServiceId =
    direction === 'upstream'
      ? services.find((s) => s.name === row?.otherService)?.id
      : serviceId

  return (
    <AccordionItem
      value={fieldId}
      className="rounded-[16px] border border-[#2A3242] bg-[#171D2A] last:border-b"
    >
      <div className="relative">
        <AccordionTrigger className="group min-w-0 items-center justify-start gap-3 px-5 py-4 pr-64 hover:no-underline [&>svg]:hidden">
          <span className="shrink-0">
            <ChevronDown className="size-4 text-[#828DA3] transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </span>
          <div className="min-w-0 space-y-1">
            <h4 className="truncate text-base font-medium text-[#F4F7FC]">
              {row?.name || 'New dependency'}
            </h4>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#828DA3]">
              <span>
                {row?.otherService ||
                  (direction === 'upstream' ? 'New provider' : 'New consumer')}
              </span>
              <span className="rounded bg-[#1E2533] px-2 py-0.5 text-[#D2D9E6]">
                {DEPENDENCY_TYPE_OPTIONS.find(
                  (option) => option.value === (row?.type || NO_TYPE)
                )?.label ?? 'No type'}
              </span>
              <span className="rounded bg-[#1E2533] px-2 py-0.5 text-[#D2D9E6]">
                {row?.criticality || 'soft'}
              </span>
            </div>
          </div>
        </AccordionTrigger>

        <div className="absolute top-1/2 right-5 z-10 flex -translate-y-1/2 items-center gap-2">
          <button
            type="button"
            onClick={() =>
              form.setValue(
                `rows.${index}.direction`,
                direction === 'upstream' ? 'downstream' : 'upstream'
              )
            }
            className="flex h-9 items-center gap-2 rounded-[8px] px-3.5 text-sm text-[#828DA3] transition-all hover:bg-[#1E2533] hover:text-[#F4F7FC]"
          >
            <ArrowRightLeft className="size-[18px]" />
            Move to {direction === 'upstream' ? 'downstream' : 'upstream'}
          </button>
          <button
            type="button"
            onClick={() => remove(index)}
            className="flex size-9 items-center justify-center rounded-[8px] text-[#828DA3] transition-all hover:bg-red-500/15 hover:text-red-400"
            aria-label="Remove dependency"
          >
            <Trash2 className="size-[18px]" />
          </button>
        </div>
      </div>

      <AccordionContent className="border-t border-[#2A3242] p-4 pt-3">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-normal text-[#828DA3]">
                {direction === 'upstream'
                  ? 'Provider service'
                  : 'Consumer service'}
              </Label>
              <Controller
                name={`rows.${index}.otherService`}
                control={form.control}
                render={({ field }) => (
                  <SelectSearch
                    value={field.value}
                    onChange={field.onChange}
                    options={serviceOptions}
                    placeholder="Select a service"
                    className="!h-[56px] w-full rounded-[16px] border-[#2A3242] !bg-transparent px-6"
                  />
                )}
              />
              {errors?.otherService && (
                <p className="text-xs text-red-500">
                  {errors.otherService.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-normal text-[#828DA3]">
                Dependency name
              </Label>
              <Controller
                name={`rows.${index}.name`}
                control={form.control}
                render={({ field }) => (
                  <Input
                    placeholder="e.g. getOrder"
                    autoComplete="off"
                    className={cn(
                      'h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none',
                      errors?.name && 'border-red-500'
                    )}
                    {...field}
                  />
                )}
              />
              {errors?.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-normal text-[#828DA3]">Type</Label>
              <Controller
                name={`rows.${index}.type`}
                control={form.control}
                render={({ field }) => (
                  <Select
                    value={field.value || NO_TYPE}
                    onValueChange={(value) => {
                      field.onChange(value === NO_TYPE ? '' : value)
                      form.setValue(`rows.${index}.apiGroupName`, '')
                      form.setValue(`rows.${index}.apiEndpointNames`, [])
                      form.setValue(`rows.${index}.databaseName`, '')
                    }}
                  >
                    <SelectTrigger className="h-[56px]! w-full rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPENDENCY_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-normal text-[#828DA3]">
                Criticality
              </Label>
              <Controller
                name={`rows.${index}.criticality`}
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-[56px]! w-full rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CRITICALITIES.map((criticality) => (
                        <SelectItem key={criticality} value={criticality}>
                          {criticality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-normal text-[#828DA3]">
              Description
            </Label>
            <Controller
              name={`rows.${index}.description`}
              control={form.control}
              render={({ field }) => (
                <Input
                  placeholder="Optional description"
                  autoComplete="off"
                  className="h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none"
                  {...field}
                />
              )}
            />
          </div>

          {type && (
            <DependencyTypeFields
              index={index}
              form={form}
              orgId={orgId}
              providerServiceId={providerServiceId}
              type={type}
            />
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export function ManageDependenciesModal({
  serviceId: presetServiceId,
  serviceName: presetServiceName,
  onClose,
}: {
  serviceId?: string
  serviceName?: string
  onClose: () => void
}) {
  const orgId = useCurrentOrganization().id
  const apollo = useApolloClient()

  const [selectedServiceId, setSelectedServiceId] = useState(
    presetServiceId ?? ''
  )
  const serviceId = presetServiceId ?? selectedServiceId

  const servicesRes = useQuery(SERVICES, {
    variables: { orgId: orgId!, limit: 1000 },
    skip: !orgId,
  })
  const services = servicesRes.data?.services.items ?? []
  const serviceName =
    presetServiceName ?? services.find((s) => s.id === serviceId)?.name ?? ''
  const serviceOptions = services
    .filter((s) => s.id !== serviceId)
    .map((s) => ({ label: s.name, value: s.name }))

  const depsRes = useQuery<ServiceDependenciesData>(SERVICE_DEPENDENCIES, {
    variables: { orgId, serviceId, direction: 'all' },
    skip: !orgId || !serviceId,
    fetchPolicy: 'cache-and-network',
  })

  const [updateDependencies] = useMutation(UPDATE_SERVICE_DEPENDENCIES)

  const dependencies = depsRes.data?.dependencies
  const initialRows = useMemo<DependencyRow[]>(() => {
    if (!dependencies) {
      return []
    }
    return dependencies.map((dep) => {
      const type = (dep.type ?? '') as DependencyType
      const direction = (
        dep.direction === 'downstream' ? 'downstream' : 'upstream'
      ) as DependencyRow['direction']
      const otherService =
        direction === 'upstream'
          ? providerNameOf(dep)
          : (dep.consumerService?.name ?? '')
      return {
        dependencyId: dep.id,
        direction,
        otherService,
        name: dep.name,
        type,
        criticality: (dep.criticality ??
          'soft') as DependencyRow['criticality'],
        description: dep.description ?? '',
        apiGroupName: dep.apiGroupName ?? '',
        apiEndpointNames: endpointNamesOf(dep),
        databaseName: dep.databaseName ?? '',
      }
    })
  }, [dependencies])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: { rows: initialRows },
  })
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'rows',
  })

  async function onSubmit(values: FormValues) {
    if (!orgId || !serviceId) {
      return
    }

    function resolveOwnerId(row: DependencyRow): string | null {
      if (row.direction === 'upstream') {
        return serviceId
      }
      return services.find((s) => s.name === row.otherService)?.id ?? null
    }

    for (const row of values.rows) {
      if (row.direction === 'downstream' && !resolveOwnerId(row)) {
        toast.error(
          `Downstream consumer "${row.otherService}" must be an existing service`
        )
        return
      }
    }

    const upstreamPayload = values.rows
      .filter((row) => row.direction === 'upstream')
      .map((row) => rowToInput(row, row.otherService))

    const initialDownstreamOwners = new Set(
      (dependencies ?? [])
        .filter((dep) => dep.direction === 'downstream')
        .map((dep) => dep.consumerService?.id)
        .filter((id): id is string => Boolean(id))
    )
    const currentDownstreamOwners = new Set(
      values.rows
        .filter((row) => row.direction === 'downstream')
        .map((row) => resolveOwnerId(row))
        .filter((id): id is string => Boolean(id))
    )
    const affectedOwners = new Set([
      ...initialDownstreamOwners,
      ...currentDownstreamOwners,
    ])

    try {
      await updateDependencies({
        variables: {
          orgId,
          serviceId,
          input: { dependencies: upstreamPayload },
        },
      })

      for (const ownerId of affectedOwners) {
        const ownerResult = await apollo.query<ServiceDependenciesData>({
          query: SERVICE_DEPENDENCIES,
          variables: { orgId, serviceId: ownerId, direction: 'upstream' },
          fetchPolicy: 'network-only',
        })
        const kept = (ownerResult.data.dependencies ?? [])
          .filter((dep) => providerNameOf(dep) !== serviceName)
          .map(depToInput)
        const edgesIntoService = values.rows
          .filter(
            (row) =>
              row.direction === 'downstream' && resolveOwnerId(row) === ownerId
          )
          .map((row) => rowToInput(row, serviceName))
        await updateDependencies({
          variables: {
            orgId,
            serviceId: ownerId,
            input: { dependencies: [...kept, ...edgesIntoService] },
          },
        })
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to save dependencies'
      )
      return
    }

    await apollo.refetchQueries({
      include: [SERVICE_DEPENDENCY_GRAPH, SERVICE_DEPENDENCIES],
    })
    toast.success('Dependencies saved')
    onClose()
  }

  return (
    <BetterDialogContent
      title="Manage Dependencies"
      description="Add, edit, or remove this service's upstream and downstream dependencies."
      footerSubmit="Save"
      footerSubmitLoading={form.formState.isSubmitting}
      onFooterSubmitClick={form.handleSubmit(onSubmit)}
      footerCancel
    >
      {!presetServiceId && (
        <div className="mb-6 space-y-2">
          <Label className="text-sm font-normal text-[#828DA3]">Service</Label>
          <Select value={serviceId} onValueChange={setSelectedServiceId}>
            <SelectTrigger className="h-[56px]! w-full rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none">
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {!serviceId ? (
        <p className="text-sm text-[#828DA3]">
          Select a service to manage its dependencies.
        </p>
      ) : depsRes.loading && !dependencies ? (
        <SectionLoader label="Loading dependencies..." />
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {fields.length === 0 && (
            <p className="text-sm text-[#828DA3]">
              No dependencies yet. Add one to get started.
            </p>
          )}

          <Accordion type="single" collapsible className="space-y-8">
            <section className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-base font-medium text-[#F4F7FC]">
                    Upstream dependencies
                  </h3>
                  <p className="text-sm text-[#828DA3]">
                    Services this service relies on.
                  </p>
                </div>
                <Button
                  type="button"
                  preset="outline"
                  onClick={() =>
                    append({
                      dependencyId: null,
                      direction: 'upstream',
                      otherService: '',
                      name: '',
                      type: '',
                      criticality: 'soft',
                      description: '',
                      apiGroupName: '',
                      apiEndpointNames: [],
                      databaseName: '',
                    })
                  }
                >
                  <Plus className="size-4" />
                  Add upstream dependency
                </Button>
              </div>

              {fields.map((field, index) =>
                form.watch(`rows.${index}.direction`) === 'upstream' ? (
                  <DependencyEditor
                    key={field.id}
                    fieldId={field.id}
                    index={index}
                    direction="upstream"
                    form={form}
                    remove={remove}
                    serviceOptions={serviceOptions}
                    orgId={orgId!}
                    serviceId={serviceId}
                    services={services}
                  />
                ) : null
              )}

              {!fields.some(
                (_, index) =>
                  form.watch(`rows.${index}.direction`) === 'upstream'
              ) && (
                <p className="text-sm text-[#828DA3]">
                  No upstream dependencies yet.
                </p>
              )}
            </section>

            <section className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-base font-medium text-[#F4F7FC]">
                    Downstream dependencies
                  </h3>
                  <p className="text-sm text-[#828DA3]">
                    Services that rely on this service.
                  </p>
                </div>
                <Button
                  type="button"
                  preset="outline"
                  onClick={() =>
                    append({
                      dependencyId: null,
                      direction: 'downstream',
                      otherService: '',
                      name: '',
                      type: '',
                      criticality: 'soft',
                      description: '',
                      apiGroupName: '',
                      apiEndpointNames: [],
                      databaseName: '',
                    })
                  }
                >
                  <Plus className="size-4" />
                  Add downstream dependency
                </Button>
              </div>

              {fields.map((field, index) =>
                form.watch(`rows.${index}.direction`) === 'downstream' ? (
                  <DependencyEditor
                    key={field.id}
                    fieldId={field.id}
                    index={index}
                    direction="downstream"
                    form={form}
                    remove={remove}
                    serviceOptions={serviceOptions}
                    orgId={orgId!}
                    serviceId={serviceId}
                    services={services}
                  />
                ) : null
              )}

              {!fields.some(
                (_, index) =>
                  form.watch(`rows.${index}.direction`) === 'downstream'
              ) && (
                <p className="text-sm text-[#828DA3]">
                  No downstream dependencies yet.
                </p>
              )}
            </section>
          </Accordion>
        </form>
      )}
    </BetterDialogContent>
  )
}

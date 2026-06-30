'use client'

import { cn } from '@/lib/utils'
import { apolloClientGQL } from '@/api/client'
import { MethodBadge } from '@/components/api/method-badge'
import { CrossButton } from '@/components/cross-button'
import { DynamicScrollArea } from '@/components/dynamic-scroll-area'
import { SuperCircleLoader } from '@/components/loader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LegacyApiEndpoint,
  LegacyComponentMeta,
} from '@/features/services/api/api-adapters'
import { API_GROUP_SPEC } from '@/features/services/api/api-spec'
import { BetterTabController, useBetterTabs } from '@/hooks/use-better-tabs'
import { useScopedStorage } from '@/hooks/use-scoped-storage'
import { useCurrentOrganization } from '@/store/auth-store'
import { parseAsString, useQueryState } from 'nuqs'
import { normalizePath } from '@/utils/api/display'
import {
  SpecResponseData,
  SpecRequestBodyData,
  SpecParameterData,
  createOpenApiRuntime,
} from '@/utils/api/openapi-runtime'
import { flattenMetaData } from '@uigraph/sdk'
import { arrayNonNullable } from 'daily-code'
import {
  ChevronDown,
  Copy,
  EllipsisVertical,
  Search,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useServiceApiEndpointsContext } from '../../contexts/service-api-endpoints'
import { ConfigureApiEndpointConnections } from './configure-api-endpoint-connections'
import { ConfigureApiEndpointMeta } from './configure-api-endpoint-meta'
import { ConfigureApiEndpointSamples } from './configure-api-endpoint-samples'
import { EndpointSchemaView, SchemaNode, SchemaTree } from './endpoint-schema-view'
import { EndpointTryItTab } from './endpoint-try-it-tab'
import { ApiBehaviorBar } from './api-behavior-bar'
import { GraphQLOperationItem } from './rows/graphql-operation-row'
import { GrpcMethodItem } from './rows/grpc-method-row'

type RestEndpointItem = {
  selectionKey: string
  endpointId: string
  apiEndpoint: LegacyApiEndpoint
  componentMeta: LegacyComponentMeta
  method: string
  path: string
  fullUrl: string
  summary: string
  operationId: string
  tags: string[]
  auth: AuthKind
  protocol: string
  requestSchema: string | null
  responseSchema: string | null
  statusCodes: string | null
  parameters: string | null
  description: string | null
  requestExample: string | null
  sourceType: string | null
}

type GroupByKind = 'tags' | 'none'
type AuthKind = 'none' | 'bearer' | 'api-key' | 'oauth2' | 'other'

export function ServiceApiEndpoints() {
  const {
    apiEndpoints,
    protocol,
    graphQLOperations,
    isGraphQLLoading,
    grpcMethods,
    isGrpcLoading,
    selectedVersionId,
    setSelectedVersionId,
    apiGroupVersions,
    deleteServiceApiEndpoint,
    serviceId,
    apiGroup,
  } = useServiceApiEndpointsContext()
  const organizationId = useCurrentOrganization()?.id
  const apiGroupId = apiGroup?.serviceApiGroupId ?? ''
  const [endpointId, setEndpointId] = useQueryState('endpointId', parseAsString)

  const [searchQuery, setSearchQuery] = useState('')
  const [authFilter, setAuthFilter] = useScopedStorage(
    `${serviceId}:apis-auth`,
    'all'
  )
  const [methodFilter, setMethodFilter] = useScopedStorage(
    `${serviceId}:apis-method`,
    'all'
  )
  const [groupBy, setGroupBy] = useScopedStorage<GroupByKind>(
    `${serviceId}:apis-groupby`,
    'tags'
  )
  const [operationTypeFilter, setOperationTypeFilter] = useScopedStorage(
    `${serviceId}:apis-optype`,
    'all'
  )
  const [openApiSpec, setOpenApiSpec] = useState<Record<
    string,
    unknown
  > | null>(null)
  const [selectedServerIndex, setSelectedServerIndex] = useState('0')
  const prevVersionIdRef = useRef<string | null | undefined>(undefined)

  useEffect(() => {
    setSelectedServerIndex('0')

    if (prevVersionIdRef.current === undefined) {
      prevVersionIdRef.current = selectedVersionId
      return
    }

    if (prevVersionIdRef.current !== selectedVersionId) {
      prevVersionIdRef.current = selectedVersionId
      void setEndpointId(null)
    }
  }, [selectedVersionId, setEndpointId])

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 250)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    const normalizedProtocol = (protocol || '').toLowerCase()
    const isRestLikeProtocol =
      normalizedProtocol === 'rest' ||
      normalizedProtocol === 'openapi' ||
      normalizedProtocol === 'swagger'
    if (!isRestLikeProtocol || !apiGroupId || !organizationId) {
      setOpenApiSpec(null)
      return
    }

    let cancelled = false

    async function run() {
      try {
        const { data } = await apolloClientGQL.query({
          query: API_GROUP_SPEC,
          variables: {
            orgId: organizationId!,
            serviceId,
            apiGroupId,
            versionId: selectedVersionId,
          },
          fetchPolicy: 'cache-first',
        })
        const raw = data?.apiGroupSpec?.content
        if (raw == null) return

        let parsed: unknown = null
        try {
          parsed = JSON.parse(raw)
        } catch {
          const yaml = await import('js-yaml')
          parsed = yaml.load(raw)
        }

        if (!cancelled && parsed && typeof parsed === 'object') {
          setOpenApiSpec(parsed as Record<string, unknown>)
        }
      } catch {
        if (!cancelled) setOpenApiSpec(null)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [protocol, organizationId, serviceId, apiGroupId, selectedVersionId])

  const isGraphQL = protocol === 'graphql'
  const isGrpc = protocol === 'grpc'

  const openApiRuntime = useMemo(
    () => createOpenApiRuntime(openApiSpec),
    [openApiSpec]
  )

  const selectedEnv = openApiRuntime.defaultEnv ?? 'production'

  const restEndpoints = useMemo<RestEndpointItem[]>(() => {
    return apiEndpoints.map((endpoint) => {
      const fields = arrayNonNullable(
        endpoint.componentMeta?.componentModalFields
      )
      const metaData = flattenMetaData(fields, fields)
      const url = getMetaValue(metaData, fields, ['url']) ?? ''
      const path = normalizePath(url, openApiRuntime.basePath)
      const method = (
        getMetaValue(metaData, fields, ['method']) ?? 'GET'
      ).toUpperCase()
      const summary = getMetaValue(metaData, fields, ['summary', 'label']) ?? ''
      const operationId =
        getMetaValue(metaData, fields, ['operation id', 'operationid']) ??
        endpoint.apiEndpoint?.apiEndpointId ??
        ''
      const tags = parseTags(getMetaValue(metaData, fields, ['tags']))
      const authValue = getMetaValue(metaData, fields, ['authentication'])
      const protocolValue =
        getMetaValue(metaData, fields, ['protocol']) ?? 'REST'
      const sourceType = getMetaValue(metaData, fields, ['api source type'])
      const endpointId = endpoint.apiEndpoint?.apiEndpointId ?? operationId

      return {
        selectionKey: operationId || endpointId,
        endpointId,
        apiEndpoint: endpoint.apiEndpoint!,
        componentMeta: endpoint.componentMeta!,
        method,
        path,
        fullUrl: url,
        summary,
        operationId,
        tags,
        auth: toAuthKind(authValue),
        protocol: protocolValue,
        requestSchema: getMetaValue(metaData, fields, ['request schema']),
        responseSchema: getMetaValue(metaData, fields, ['response schema']),
        statusCodes: getMetaValue(metaData, fields, ['status codes']),
        parameters: getMetaValue(metaData, fields, ['parameters']),
        description: getMetaValue(metaData, fields, ['notes', 'description']),
        requestExample: getMetaValue(metaData, fields, ['request example']),
        sourceType,
      }
    })
  }, [apiEndpoints, openApiRuntime])

  const fallbackBaseUrl = useMemo(() => {
    const firstWithUrl = restEndpoints.find((item) =>
      item.fullUrl.toLowerCase().startsWith('http')
    )
    if (!firstWithUrl) return ''
    if (!firstWithUrl.path || firstWithUrl.path === '/')
      return firstWithUrl.fullUrl
    const idx = firstWithUrl.fullUrl.indexOf(firstWithUrl.path)
    return idx > 0 ? firstWithUrl.fullUrl.slice(0, idx) : firstWithUrl.fullUrl
  }, [restEndpoints])

  const baseUrl = useMemo(() => {
    const server =
      openApiRuntime.servers[Number(selectedServerIndex)] ??
      openApiRuntime.defaultServer
    return openApiRuntime.resolveServerUrl(
      server,
      selectedEnv,
      fallbackBaseUrl
    )
  }, [fallbackBaseUrl, openApiRuntime, selectedEnv, selectedServerIndex])

  const authOptions = useMemo(() => {
    const values = new Set<AuthKind>()
    for (const endpoint of restEndpoints) {
      values.add(
        openApiRuntime.hasSecuritySchemes
          ? openApiRuntime.operationAuth(endpoint.operationId)
          : endpoint.auth
      )
    }
    return ['none', 'bearer', 'api-key', 'oauth2', 'other'].filter((item) =>
      values.has(item as AuthKind)
    ) as AuthKind[]
  }, [openApiRuntime, restEndpoints])

  const filteredRestEndpoints = useMemo(() => {
    if (!debouncedSearch && authFilter === 'all' && methodFilter === 'all') {
      return restEndpoints
    }

    const term = debouncedSearch.toLowerCase()
    return restEndpoints.filter((endpoint) => {
      const matchesSearch =
        !term ||
        endpoint.path.toLowerCase().includes(term) ||
        endpoint.method.toLowerCase().includes(term) ||
        endpoint.summary.toLowerCase().includes(term) ||
        endpoint.operationId.toLowerCase().includes(term) ||
        endpoint.tags.some((tag) => tag.toLowerCase().includes(term))

      const matchesMethod =
        methodFilter === 'all' || endpoint.method === methodFilter
      const endpointAuth = openApiRuntime.hasSecuritySchemes
        ? openApiRuntime.operationAuth(endpoint.operationId)
        : endpoint.auth
      const matchesAuth = authFilter === 'all' || endpointAuth === authFilter
      return matchesSearch && matchesMethod && matchesAuth
    })
  }, [authFilter, debouncedSearch, methodFilter, openApiRuntime, restEndpoints])

  const groupedRestEndpoints = useMemo(() => {
    if (groupBy === 'none') {
      return [{ group: 'All Endpoints', endpoints: filteredRestEndpoints }]
    }

    const map = new Map<string, RestEndpointItem[]>()
    for (const endpoint of filteredRestEndpoints) {
      const tags = endpoint.tags.length > 0 ? endpoint.tags : ['Ungrouped']
      for (const tag of tags) {
        if (!map.has(tag)) map.set(tag, [])
        map.get(tag)!.push(endpoint)
      }
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([group, endpoints]) => ({ group, endpoints }))
  }, [filteredRestEndpoints, groupBy])

  const selectedRestEndpoint = useMemo(() => {
    const selected = endpointId
    if (!selected) return null
    return (
      restEndpoints.find(
        (item) =>
          item.selectionKey === selected ||
          item.operationId === selected ||
          item.endpointId === selected
      ) ?? null
    )
  }, [endpointId, restEndpoints])

  const selectedGraphQLOperation = useMemo(() => {
    const selected = endpointId
    if (!selected) return null
    return (
      graphQLOperations.find(
        (item) => item.apiEndpoint.apiEndpointId === selected
      ) ?? null
    )
  }, [graphQLOperations, endpointId])

  const selectedGrpcMethod = useMemo(() => {
    const selected = endpointId
    if (!selected) return null
    return (
      grpcMethods.find((item) => item.apiEndpoint.apiEndpointId === selected) ??
      null
    )
  }, [grpcMethods, endpointId])

  useEffect(() => {
    if (!endpointId) return
    const selectedEndpoint =
      selectedRestEndpoint ?? selectedGraphQLOperation ?? selectedGrpcMethod
    if (!selectedEndpoint) {
      void setEndpointId(null)
    }
  }, [
    endpointId,
    selectedGraphQLOperation,
    selectedGrpcMethod,
    selectedRestEndpoint,
    setEndpointId,
  ])

  const filteredGraphQLOperations = useMemo(() => {
    return graphQLOperations.filter((op) => {
      const fields = arrayNonNullable(op.componentMeta.componentModalFields)
      const flattened = flattenMetaData(fields, fields)
      const nameField = fields.find(
        (field) => field?.label?.toLowerCase() === 'name'
      )
      const kindField = fields.find(
        (field) =>
          field?.label?.toLowerCase() === 'graphql operation type' ||
          field?.label?.toLowerCase() === 'operation type' ||
          field?.label?.toLowerCase() === 'kind'
      )
      const signatureField = fields.find(
        (field) => field?.label?.toLowerCase() === 'signature'
      )

      const name = nameField?.componentFieldId
        ? (flattened[nameField.componentFieldId] as string)
        : ''
      const kind = kindField?.componentFieldId
        ? (flattened[kindField.componentFieldId] as string)
        : ''
      const signature = signatureField?.componentFieldId
        ? (flattened[signatureField.componentFieldId] as string)
        : ''

      const matchesSearch =
        !debouncedSearch ||
        name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        signature?.toLowerCase().includes(debouncedSearch.toLowerCase())
      const matchesType =
        operationTypeFilter === 'all' || kind === operationTypeFilter
      return matchesSearch && matchesType
    })
  }, [graphQLOperations, debouncedSearch, operationTypeFilter])

  const groupedGrpcMethods = useMemo(() => {
    const grouped = new Map<string, typeof grpcMethods>()
    grpcMethods.forEach((methodData) => {
      const fields = arrayNonNullable(
        methodData.componentMeta.componentModalFields
      )
      const flattened = flattenMetaData(fields, fields)
      const packageField = fields.find(
        (field) => field?.label?.toLowerCase() === 'package name'
      )
      const serviceField = fields.find(
        (field) =>
          field?.label?.toLowerCase() === 'grpc service name' ||
          field?.label?.toLowerCase() === 'service name'
      )

      const packageName = packageField?.componentFieldId
        ? (flattened[packageField.componentFieldId] as string)
        : ''
      const serviceName = serviceField?.componentFieldId
        ? (flattened[serviceField.componentFieldId] as string)
        : ''

      const key = packageName
        ? `${packageName}.${serviceName}`
        : serviceName || 'Unknown'
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key)!.push(methodData)
    })
    return Array.from(grouped.entries()).map(([key, methods]) => ({
      serviceKey: key,
      methods: methods.filter((m) => {
        const fields = arrayNonNullable(m.componentMeta.componentModalFields)
        const flattened = flattenMetaData(fields, fields)
        const methodNameField = fields.find(
          (field) =>
            field?.label?.toLowerCase() === 'grpc method name' ||
            field?.label?.toLowerCase() === 'method name'
        )
        const serviceNameField = fields.find(
          (field) =>
            field?.label?.toLowerCase() === 'grpc service name' ||
            field?.label?.toLowerCase() === 'service name'
        )

        const methodName = methodNameField?.componentFieldId
          ? (flattened[methodNameField.componentFieldId] as string)
          : ''
        const serviceName = serviceNameField?.componentFieldId
          ? (flattened[serviceNameField.componentFieldId] as string)
          : ''

        const matchesSearch =
          !debouncedSearch ||
          methodName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          serviceName?.toLowerCase().includes(debouncedSearch.toLowerCase())
        return matchesSearch
      }),
    }))
  }, [grpcMethods, debouncedSearch])

  return (
    <div className="flex h-full flex-col">
      <ApiBehaviorBar
        apiGroupVersions={apiGroupVersions}
        selectedVersionId={selectedVersionId}
        onSelectedVersionIdChange={setSelectedVersionId}
        showServerControls={!isGraphQL && !isGrpc}
        openApiRuntime={openApiRuntime}
        baseUrl={baseUrl}
        selectedEnv={selectedEnv}
        fallbackBaseUrl={fallbackBaseUrl}
        serviceId={serviceId}
        selectedServerIndex={selectedServerIndex}
        onServerIndexChange={setSelectedServerIndex}
      />

      {isGraphQLLoading || isGrpcLoading ? (
        <div className="flex h-[400px] items-center justify-center px-6 py-4">
          <SuperCircleLoader />
        </div>
      ) : isGraphQL ? (
        <div className="rest-endpoints-shell grid min-h-0 flex-1 xl:grid-cols-[264px_minmax(0,1fr)]">
          <aside className="rest-endpoints-sidebar overflow-y-auto border-r">
            <div className="border-b p-3 space-y-2">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#828DA3]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search operations..."
                  className="border-stock h-8! !rounded-[0.65rem] bg-[#1E2533] pl-8 text-xs shadow-none"
                  aria-label="Search operations"
                />
              </div>
              <Select value={operationTypeFilter} onValueChange={setOperationTypeFilter}>
                <SelectTrigger className="border-stock h-8! w-full !rounded-[0.65rem] bg-[#1E2533]! text-xs shadow-none">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Query">Query</SelectItem>
                  <SelectItem value="Mutation">Mutation</SelectItem>
                  <SelectItem value="Subscription">Subscription</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 px-3 py-3">
              {filteredGraphQLOperations.length === 0 ? (
                <div className="rest-endpoints-empty rounded-[14px] border border-dashed px-4 py-6 text-center text-sm">
                  <p className="mb-2 text-[#828DA3]">No operations match these filters</p>
                  <Button
                    variant="link"
                    onClick={() => { setSearchQuery(''); setOperationTypeFilter('all') }}
                    className="h-auto p-0 text-[#3B82F6]"
                  >
                    Clear filters
                  </Button>
                </div>
              ) : (
                filteredGraphQLOperations.map((operation) => (
                  <GraphQLOperationSidebarRow
                    key={operation.apiEndpoint.apiEndpointId}
                    operation={operation}
                    selected={selectedGraphQLOperation?.apiEndpoint.apiEndpointId === operation.apiEndpoint.apiEndpointId}
                    onSelect={() => void setEndpointId(operation.apiEndpoint.apiEndpointId)}
                  />
                ))
              )}
            </div>
          </aside>
          <main className="min-w-0 overflow-y-auto p-4">
            {selectedGraphQLOperation ? (
              <GraphQLOperationDetailsPanel
                operation={selectedGraphQLOperation}
                readonly={selectedVersionId !== null}
                onClose={() => void setEndpointId(null)}
              />
            ) : (
              <div className="rest-endpoints-empty flex h-full items-center justify-center rounded-[16px] border border-dashed p-10 text-sm">
                Select an operation to view its details
              </div>
            )}
          </main>
        </div>
      ) : isGrpc ? (
        <div className="rest-endpoints-shell grid min-h-0 flex-1 xl:grid-cols-[264px_minmax(0,1fr)]">
          <aside className="rest-endpoints-sidebar overflow-y-auto border-r">
            <div className="border-b p-3">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#828DA3]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search methods..."
                  className="border-stock h-8! !rounded-[0.65rem] bg-[#1E2533] pl-8 text-xs shadow-none"
                  aria-label="Search methods"
                />
              </div>
            </div>
            <div className="py-3">
              {groupedGrpcMethods.every(g => g.methods.length === 0) ? (
                <div className="rest-endpoints-empty mx-3 rounded-[14px] border border-dashed px-4 py-6 text-center text-sm">
                  <p className="mb-2 text-[#828DA3]">No methods match these filters</p>
                  <Button
                    variant="link"
                    onClick={() => setSearchQuery('')}
                    className="h-auto p-0 text-[#3B82F6]"
                  >
                    Clear filters
                  </Button>
                </div>
              ) : (
                groupedGrpcMethods.map(({ serviceKey, methods }) => (
                  methods.length > 0 && (
                    <div key={serviceKey} className="mb-4">
                      <div className="rest-endpoints-section-label px-5 pb-1 text-[11px] font-medium uppercase tracking-wide">
                        {serviceKey}
                      </div>
                      <div className="space-y-1 px-3">
                        {methods.map((method) => (
                          <GrpcMethodSidebarRow
                            key={method.apiEndpoint.apiEndpointId}
                            method={method}
                            selected={selectedGrpcMethod?.apiEndpoint.apiEndpointId === method.apiEndpoint.apiEndpointId}
                            onSelect={() => void setEndpointId(method.apiEndpoint.apiEndpointId)}
                          />
                        ))}
                      </div>
                    </div>
                  )
                ))
              )}
            </div>
          </aside>
          <main className="min-w-0 overflow-y-auto p-4">
            {selectedGrpcMethod ? (
              <GrpcMethodDetailsPanel
                method={selectedGrpcMethod}
                readonly={selectedVersionId !== null}
                onClose={() => void setEndpointId(null)}
              />
            ) : (
              <div className="rest-endpoints-empty flex h-full items-center justify-center rounded-[16px] border border-dashed p-10 text-sm">
                Select a method to view its details
              </div>
            )}
          </main>
        </div>
      ) : (
        <>
          {/* ── Sidebar + main grid ───────────────────────────── */}
          <div className="rest-endpoints-shell grid min-h-0 flex-1 xl:grid-cols-[264px_minmax(0,1fr)]">
            <aside className="rest-endpoints-sidebar overflow-y-auto border-r">
              {/* Search */}
              <div className="border-b p-3">
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#828DA3]" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search endpoints..."
                    className="border-stock h-8! !rounded-[0.65rem] bg-[#1E2533] pl-8 text-xs shadow-none"
                    aria-label="Search endpoints"
                  />
                </div>
              </div>

              <div className="space-y-4 px-3 py-3">
              {filteredRestEndpoints.length === 0 ? (
                <div className="rest-endpoints-empty rounded-[14px] border border-dashed px-4 py-6 text-center text-sm">
                  <p className="mb-2 text-[#828DA3]">
                    No endpoints match these filters
                  </p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearchQuery('')
                      setAuthFilter('all')
                      setMethodFilter('all')
                    }}
                    className="h-auto p-0 text-[#3B82F6]"
                  >
                    Clear filters
                  </Button>
                </div>
              ) : (
                groupedRestEndpoints.map((group) => (
                  <div key={group.group} className="space-y-1">
                    {groupBy === 'tags' && (
                      <div className="rest-endpoints-section-label flex items-center justify-between px-2 text-[11px] font-medium uppercase tracking-wide">
                        <span>{group.group}</span>
                        <span className="tabular-nums">
                          {group.endpoints.length}
                        </span>
                      </div>
                    )}
                    {group.endpoints.map((endpoint) => (
                      <RestEndpointSidebarRow
                        key={endpoint.endpointId}
                        endpoint={endpoint}
                        selected={
                          selectedRestEndpoint?.selectionKey ===
                          endpoint.selectionKey
                        }
                        onSelect={() =>
                          void setEndpointId(endpoint.selectionKey)
                        }
                        baseUrl={baseUrl}
                        readonly={selectedVersionId !== null}
                        onDelete={async () => {
                          if (
                            !endpoint.endpointId ||
                            selectedVersionId !== null
                          )
                            return
                          await deleteServiceApiEndpoint({
                            variables: {
                              organizationId,
                              apiEndpointId: endpoint.endpointId,
                            },
                          })
                          toast.success('API endpoint deleted successfully')
                        }}
                      />
                    ))}
                  </div>
                ))
              )}
            </div>
          </aside>

          <main className="min-w-0 overflow-y-auto p-4">
            {selectedRestEndpoint ? (
              <EndpointDetailsPanel
                endpoint={selectedRestEndpoint}
                baseUrl={baseUrl}
                readonly={selectedVersionId !== null}
                openApiRuntime={openApiRuntime}
                onClose={() =>
                  void setEndpointId(null)
                }
              />
            ) : (
              <div className="rest-endpoints-empty flex h-full items-center justify-center rounded-[16px] border border-dashed p-10 text-sm">
                Select an endpoint to view its details
              </div>
            )}
          </main>
          </div>
        </>
      )}

      <style>{`
        .rest-endpoints-shell {
          flex: 1;
          min-height: 0;
        }

        .rest-endpoints-sidebar {
          border-right: 1px solid var(--border);
          background: var(--card);
        }

        .rest-endpoints-section-label {
          color: var(--muted-foreground);
        }

        .rest-endpoints-empty {
          border-color: var(--border);
          color: var(--muted-foreground);
        }

        .rest-nav-button {
          border-radius: 10px;
          width: 100%;
        }

        .rest-nav-button-active {
          background: var(--accent);
          box-shadow: inset 0 0 0 1px var(--border);
          color: var(--foreground);
        }

        .rest-nav-button-inactive {
          color: var(--foreground);
        }

        .rest-nav-button-inactive:hover {
          background: var(--secondary);
        }
      `}</style>
    </div>
  )
}

function RestEndpointSidebarRow({
  endpoint,
  selected,
  onSelect,
  baseUrl,
  readonly,
  onDelete,
}: {
  endpoint: RestEndpointItem
  selected: boolean
  onSelect: () => void
  baseUrl: string
  readonly: boolean
  onDelete: () => Promise<void>
}) {
  return (
    <div
      onClick={onSelect}
      className={`rest-nav-button group flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left transition ${
        selected ? 'rest-nav-button-active' : 'rest-nav-button-inactive'
      }`}
    >
      <MethodBadge method={endpoint.method} className="min-w-14 shrink-0 py-0.5 text-[10px]" />
      <div className="min-w-0 flex-1">
        <div className="truncate font-mono text-xs font-semibold text-[#F4F7FC]">
          {endpoint.path}
        </div>
        {endpoint.summary && (
          <div className="truncate text-[10px] text-[#828DA3]">
            {endpoint.summary}
          </div>
        )}
      </div>
      <div
        className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-6">
              <EllipsisVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onSelect}>Open docs</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                void copyToClipboard(
                  buildFullUrl(baseUrl, endpoint.path),
                  'Full URL copied'
                )
              }
              disabled={!baseUrl}
            >
              Copy URL
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                void copyToClipboard(
                  buildCurlSkeleton(
                    baseUrl,
                    endpoint.path,
                    endpoint.method,
                    endpoint.auth
                  ),
                  'cURL skeleton copied'
                )
              }
              disabled={!baseUrl}
            >
              Copy cURL
            </DropdownMenuItem>
            {!readonly && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => void onDelete()}
              >
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function GraphQLOperationSidebarRow({
  operation,
  selected,
  onSelect,
}: {
  operation: GraphQLOperationItem
  selected: boolean
  onSelect: () => void
}) {
  const fields = useMemo(
    () => arrayNonNullable(operation.componentMeta.componentModalFields),
    [operation.componentMeta.componentModalFields]
  )
  const flattened = useMemo(() => flattenMetaData(fields, fields), [fields])

  const nameField = fields.find((f) => f?.label?.toLowerCase() === 'name')
  const kindField = fields.find(
    (f) =>
      f?.label?.toLowerCase() === 'graphql operation type' ||
      f?.label?.toLowerCase() === 'operation type' ||
      f?.label?.toLowerCase() === 'kind'
  )
  const signatureField = fields.find(
    (f) => f?.label?.toLowerCase() === 'signature'
  )

  const name = nameField?.componentFieldId
    ? (flattened[nameField.componentFieldId] as string)
    : 'N/A'
  const kind = (
    kindField?.componentFieldId
      ? (flattened[kindField.componentFieldId] as string)
      : 'Query'
  ) as 'Query' | 'Mutation' | 'Subscription'
  const signature = signatureField?.componentFieldId
    ? (flattened[signatureField.componentFieldId] as string)
    : undefined

  return (
    <div
      onClick={onSelect}
      className={`rest-nav-button group flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left transition ${
        selected ? 'rest-nav-button-active' : 'rest-nav-button-inactive'
      }`}
    >
      <Badge
        variant="outline"
        className={`${getGraphQLOperationTypeColor(kind)} shrink-0 px-1.5 py-0 text-[10px] text-white`}
      >
        {kind.slice(0, 1)}
      </Badge>
      <div className="min-w-0 flex-1">
        <div className="truncate font-mono text-xs font-semibold text-[#F4F7FC]">
          {name}
        </div>
        {signature && (
          <div className="truncate text-[10px] text-[#828DA3]">{signature}</div>
        )}
      </div>
    </div>
  )
}

function GrpcMethodSidebarRow({
  method,
  selected,
  onSelect,
}: {
  method: GrpcMethodItem
  selected: boolean
  onSelect: () => void
}) {
  const fields = useMemo(
    () => arrayNonNullable(method.componentMeta.componentModalFields),
    [method.componentMeta.componentModalFields]
  )
  const flattened = useMemo(() => flattenMetaData(fields, fields), [fields])

  const methodNameField = fields.find(
    (f) =>
      f?.label?.toLowerCase() === 'grpc method name' ||
      f?.label?.toLowerCase() === 'method name'
  )
  const rpcTypeField = fields.find(
    (f) =>
      f?.label?.toLowerCase() === 'grpc rpc type' ||
      f?.label?.toLowerCase() === 'streaming type' ||
      f?.label?.toLowerCase() === 'rpc type'
  )
  const requestTypeField = fields.find(
    (f) => f?.label?.toLowerCase() === 'request type'
  )
  const responseTypeField = fields.find(
    (f) => f?.label?.toLowerCase() === 'response type'
  )

  const methodName = methodNameField?.componentFieldId
    ? (flattened[methodNameField.componentFieldId] as string)
    : 'N/A'
  const streamingType = rpcTypeField?.componentFieldId
    ? mapGrpcRpcType(flattened[rpcTypeField.componentFieldId] as string)
    : 'UNARY'
  const requestType = requestTypeField?.componentFieldId
    ? (flattened[requestTypeField.componentFieldId] as string)
    : undefined
  const responseType = responseTypeField?.componentFieldId
    ? (flattened[responseTypeField.componentFieldId] as string)
    : undefined

  const streamingShortLabel: Record<string, string> = {
    UNARY: 'Unary',
    SERVER_STREAMING: 'S-Stream',
    CLIENT_STREAMING: 'C-Stream',
    BIDIRECTIONAL_STREAMING: 'Bidi',
  }

  return (
    <div
      onClick={onSelect}
      className={`rest-nav-button group flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left transition ${
        selected ? 'rest-nav-button-active' : 'rest-nav-button-inactive'
      }`}
    >
      <Badge
        variant="outline"
        className={`${getGrpcStreamingTypeColor(streamingType)} shrink-0 px-1.5 py-0 text-[10px] text-white`}
      >
        {streamingShortLabel[streamingType] ?? streamingType}
      </Badge>
      <div className="min-w-0 flex-1">
        <div className="truncate font-mono text-xs font-semibold text-[#F4F7FC]">
          {methodName}
        </div>
        {(requestType || responseType) && (
          <div className="truncate font-mono text-[10px] text-[#828DA3]">
            {requestType} → {responseType}
          </div>
        )}
      </div>
    </div>
  )
}

type EndpointTab = 'spec' | 'meta' | 'tryit' | 'samples' | 'connections'

function isJsonSchemaDocument(obj: unknown): boolean {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false
  const o = obj as Record<string, unknown>
  if ('openapi' in o || 'swagger' in o) return true
  if (typeof o.$schema === 'string') return true
  if ('$ref' in o) return true
  if ('properties' in o || 'items' in o || 'allOf' in o || 'oneOf' in o || 'anyOf' in o) {
    return true
  }
  if (typeof o.type === 'string' && (o.properties || o.items)) return true
  return false
}

function unescapeDisplayText(value: string): string {
  return value.replace(/\\n/g, '\n').replace(/\\t/g, '\t')
}

function formatPayloadJson(data: unknown): string {
  return unescapeDisplayText(JSON.stringify(data, null, 2))
}

function JsonPayloadEntry({
  name,
  value,
  depth,
}: {
  name: string
  value: unknown
  depth: number
}) {
  const [expanded, setExpanded] = useState(depth < 2)
  const isObject = value !== null && typeof value === 'object'
  const isArray = Array.isArray(value)
  const entries = isObject
    ? isArray
      ? (value as unknown[]).map((v, i) => [String(i), v] as const)
      : Object.entries(value as Record<string, unknown>)
    : []
  const hasChildren = isObject && entries.length > 0

  const valueType = value === null ? 'null' : isArray ? 'array' : isObject ? 'object' : typeof value
  const leafDisplay =
    valueType === 'string'
      ? `"${String(value)}"`
      : value === null
        ? 'null'
        : String(value)

  const valueColor =
    valueType === 'string'
      ? 'text-green-400'
      : valueType === 'number'
        ? 'text-blue-400'
        : valueType === 'boolean'
          ? 'text-amber-400'
          : 'text-[#828DA3]'

  return (
    <div className={cn(depth > 0 && 'ml-4 border-l border-[#2A3242]')}>
      <div
        className={cn(
          'flex items-baseline gap-2 px-3 py-1.5',
          hasChildren && 'cursor-pointer select-none hover:bg-[#1E2533]'
        )}
        onClick={() => hasChildren && setExpanded((v) => !v)}
      >
        {hasChildren ? (
          <ChevronDown
            className={cn(
              'h-3 w-3 shrink-0 text-[#586378] transition-transform',
              !expanded && '-rotate-90'
            )}
          />
        ) : (
          <span className="w-3 shrink-0" />
        )}
        <span className="font-mono text-xs font-medium text-[#F4F7FC]">{name}</span>
        {hasChildren ? (
          <span className="font-mono text-[10px] text-[#828DA3]">{valueType}</span>
        ) : (
          <span className={cn('font-mono text-xs', valueColor)}>{leafDisplay}</span>
        )}
      </div>
      {hasChildren && expanded && (
        <div>
          {entries.map(([key, child]) => (
            <JsonPayloadEntry key={key} name={key} value={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function JsonPayloadTree({ data }: { data: unknown }) {
  if (data === null || data === undefined) {
    return (
      <div className="text-muted-foreground px-3 py-2 text-xs">No payload defined</div>
    )
  }

  if (typeof data !== 'object') {
    return (
      <pre className="overflow-x-auto px-3 py-2.5 font-mono text-xs text-[#C9D1D9]">
        {String(data)}
      </pre>
    )
  }

  const entries = Array.isArray(data)
    ? data.map((v, i) => [String(i), v] as const)
    : Object.entries(data as Record<string, unknown>)

  if (entries.length === 0) {
    return (
      <div className="text-muted-foreground px-3 py-2 font-mono text-xs">
        {Array.isArray(data) ? '[]' : '{}'}
      </div>
    )
  }

  return (
    <div className="rounded-md border border-[#2A3242] bg-[#141925] py-1">
      {entries.map(([key, value]) => (
        <JsonPayloadEntry key={key} name={key} value={value} depth={0} />
      ))}
    </div>
  )
}

/**
 * Renders a raw schema/payload string in the Spec tab.
 * JSON Schema documents use SchemaTree; example payloads use JsonPayloadTree;
 * GraphQL operation documents render as formatted query text.
 */
function SpecSchemaBlock({ label, raw }: { label: string; raw: string }) {
  const parsed = useMemo(() => {
    try {
      return JSON.parse(raw) as unknown
    } catch {
      return null
    }
  }, [raw])

  const graphqlQuery =
    parsed &&
    typeof parsed === 'object' &&
    !Array.isArray(parsed) &&
    typeof (parsed as Record<string, unknown>).query === 'string'
      ? unescapeDisplayText((parsed as Record<string, string>).query)
      : null

  const payloadData = useMemo(() => {
    if (parsed === null) return null
    if (
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed) &&
      'data' in (parsed as Record<string, unknown>)
    ) {
      return (parsed as Record<string, unknown>).data
    }
    return parsed
  }, [parsed])

  const displayText = useMemo(() => {
    if (parsed !== null) return formatPayloadJson(parsed)
    return unescapeDisplayText(raw)
  }, [parsed, raw])

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold tracking-wider uppercase text-[#828DA3]">
        {label}
      </p>
      {parsed !== null && isJsonSchemaDocument(parsed) ? (
        <div className="rounded-md border border-[#2A3242]">
          <SchemaTree schema={parsed as SchemaNode} showRequired={false} />
        </div>
      ) : graphqlQuery ? (
        <pre className="overflow-x-auto rounded-md bg-[#0D1017] px-3 py-2.5 font-mono text-xs leading-relaxed whitespace-pre-wrap text-[#C9D1D9]">
          {graphqlQuery}
        </pre>
      ) : parsed !== null ? (
        <JsonPayloadTree data={payloadData} />
      ) : (
        <pre className="overflow-x-auto rounded-md bg-[#0D1017] px-3 py-2.5 font-mono text-xs leading-relaxed text-[#C9D1D9]">
          {displayText}
        </pre>
      )}
    </div>
  )
}

function ResponseRow({
  status,
  description,
  specData,
}: {
  status: string
  description: string
  specData: SpecResponseData | undefined
}) {
  const [expanded, setExpanded] = useState(false)
  const hasSpec = !!(specData?.schema || specData?.example)

  return (
    <div className="border-b last:border-b-0">
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-sm',
          hasSpec && 'cursor-pointer select-none hover:bg-[#1E2533]'
        )}
        onClick={() => hasSpec && setExpanded((v) => !v)}
      >
        <span className="font-mono font-medium shrink-0">{status}</span>
        <span className="text-muted-foreground flex-1">
          {description || 'Response'}
        </span>
        {hasSpec && (
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 shrink-0 text-[#586378] transition-transform duration-150',
              expanded && 'rotate-180'
            )}
          />
        )}
      </div>
      {expanded && hasSpec && (
        <div className="space-y-4 border-t border-[#2A3242] px-3 py-3">
          {specData?.schema && (
            <div>
              <p className="mb-2 text-[10px] font-semibold tracking-wider uppercase text-[#828DA3]">
                Response Schema
              </p>
              <SchemaTree schema={specData.schema as SchemaNode} showRequired={false} />
            </div>
          )}
          {specData?.example && (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <p className="text-[10px] font-semibold tracking-wider uppercase text-[#828DA3]">
                  Example
                </p>
                <button
                  type="button"
                  className="text-[#828DA3] hover:text-[#D2D9E6]"
                  onClick={(e) => {
                    e.stopPropagation()
                    void copyToClipboard(specData.example!, 'Example copied')
                  }}
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
              <pre className="overflow-x-auto rounded-lg bg-[#1E2533] p-3 font-mono text-[11px] leading-relaxed text-[#D2D9E6]">
                {specData.example}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const endpointTabs: { id: EndpointTab; label: string }[] = [
  { id: 'spec', label: 'Spec' },
  { id: 'meta', label: 'Meta' },
  { id: 'tryit', label: 'Try it' },
  { id: 'samples', label: 'Samples' },
  { id: 'connections', label: 'Connections' },
]

// ─── Spec tab: swagger-style reference view ───────────────────

type SchemaObj = Record<string, unknown>

type RefResolver = (ref: string) => SchemaObj | null

/**
 * Walk a SchemaNode tree and inline every $ref so that SchemaTree
 * (which doesn't resolve refs itself) can render the full structure.
 */
function resolveSchemaRefs(
  schema: SchemaNode,
  resolveRef: RefResolver,
  visited = new Set<string>(),
  depth = 0
): SchemaNode {
  if (depth > 8) return schema

  if (schema.$ref) {
    if (visited.has(schema.$ref)) {
      // Circular reference guard — return a placeholder object
      return { type: 'object' }
    }
    const resolved = resolveRef(schema.$ref) as SchemaNode | null
    if (resolved) {
      const next = new Set(visited)
      next.add(schema.$ref)
      return resolveSchemaRefs(resolved, resolveRef, next, depth + 1)
    }
    return schema
  }

  const result: SchemaNode = { ...schema }

  if (schema.properties) {
    result.properties = Object.fromEntries(
      Object.entries(schema.properties).map(([k, v]) => [
        k,
        resolveSchemaRefs(v, resolveRef, visited, depth + 1),
      ])
    )
  }

  if (schema.items) {
    result.items = resolveSchemaRefs(schema.items, resolveRef, visited, depth + 1)
  }

  if (schema.allOf) {
    result.allOf = schema.allOf.map((s) =>
      resolveSchemaRefs(s, resolveRef, visited, depth + 1)
    )
  }
  if (schema.oneOf) {
    result.oneOf = schema.oneOf.map((s) =>
      resolveSchemaRefs(s, resolveRef, visited, depth + 1)
    )
  }
  if (schema.anyOf) {
    result.anyOf = schema.anyOf.map((s) =>
      resolveSchemaRefs(s, resolveRef, visited, depth + 1)
    )
  }

  return result
}

function schemaToExample(
  schema: SchemaObj | null | undefined,
  depth = 0,
  resolveRef?: RefResolver
): unknown {
  if (!schema || depth > 6) return null

  // Resolve $ref before anything else
  if (schema['$ref'] && resolveRef) {
    const resolved = resolveRef(schema['$ref'] as string) as SchemaObj | null
    if (resolved) return schemaToExample(resolved, depth + 1, resolveRef)
    return {}
  }
  if (schema['$ref']) return {}

  if (schema.example !== undefined) return schema.example

  if (schema.enum) {
    const vals = schema.enum as unknown[]
    return vals[0] ?? null
  }

  // allOf / anyOf / oneOf — use the first concrete schema
  for (const combiner of ['allOf', 'anyOf', 'oneOf'] as const) {
    const list = schema[combiner] as SchemaObj[] | undefined
    if (Array.isArray(list) && list.length > 0) {
      // Merge allOf into one object for better examples
      if (combiner === 'allOf') {
        const merged: SchemaObj = {}
        for (const sub of list) {
          const resolved = sub['$ref'] && resolveRef
            ? (resolveRef(sub['$ref'] as string) as SchemaObj | null) ?? sub
            : sub
          Object.assign(merged, resolved)
        }
        return schemaToExample(merged, depth + 1, resolveRef)
      }
      return schemaToExample(list[0] as SchemaObj, depth + 1, resolveRef)
    }
  }

  const type = schema.type as string | undefined

  if (type === 'object' || schema.properties) {
    const props = (schema.properties ?? {}) as Record<string, SchemaObj>
    const result: Record<string, unknown> = {}
    for (const [key, propSchema] of Object.entries(props)) {
      result[key] = schemaToExample(propSchema, depth + 1, resolveRef)
    }
    return result
  }

  if (type === 'array' || schema.items) {
    const items = (schema.items ?? {}) as SchemaObj
    return [schemaToExample(items, depth + 1, resolveRef)]
  }

  const format = schema.format as string | undefined
  switch (type) {
    case 'string':
      if (format === 'email') return 'user@example.com'
      if (format === 'date-time') return '2024-01-01T00:00:00Z'
      if (format === 'date') return '2024-01-01'
      if (format === 'password') return '********'
      if (format === 'uuid') return '00000000-0000-0000-0000-000000000000'
      if (format === 'uri') return 'https://example.com'
      return 'string'
    case 'integer':
      return 0
    case 'number':
      return 0
    case 'boolean':
      return true
    default:
      return null
  }
}

function statusPillColor(code: string) {
  if (code.startsWith('2')) return 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30'
  if (code.startsWith('3')) return 'bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/30'
  if (code.startsWith('4')) return 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30'
  if (code.startsWith('5')) return 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30'
  return 'bg-[#1E2533] text-[#D2D9E6] ring-1 ring-[#2A3242]'
}

function EndpointSpecView({
  endpoint,
  responses,
  openApiRuntime,
}: {
  endpoint: RestEndpointItem
  responses: Array<[string, string]>
  openApiRuntime?: ReturnType<typeof createOpenApiRuntime> | null
}) {
  const [expandedCode, setExpandedCode] = useState<string | null>(null)
  const [bodyView, setBodyView] = useState<'example' | 'schema'>('schema')
  const [responseViews, setResponseViews] = useState<Record<string, 'example' | 'schema'>>({})

  function getResponseView(code: string): 'example' | 'schema' {
    return responseViews[code] ?? 'schema'
  }
  function setResponseView(code: string, view: 'example' | 'schema') {
    setResponseViews((prev) => ({ ...prev, [code]: view }))
  }

  // Use path+method as the primary lookup — much more reliable than operationId
  const auth = openApiRuntime
    ? openApiRuntime.operationAuthByPath(endpoint.method, endpoint.path)
    : endpoint.auth

  const requestBody: SpecRequestBodyData | null =
    openApiRuntime?.operationRequestBodyByPath(endpoint.method, endpoint.path) ?? null
  const specParams: SpecParameterData[] =
    openApiRuntime?.operationParametersByPath(endpoint.method, endpoint.path) ?? []

  const pathParams = specParams.filter((p) => p.in === 'path')
  const queryParams = specParams.filter((p) => p.in === 'query')
  const headerParams = specParams.filter((p) => p.in === 'header')

  const resolveRef: RefResolver | undefined = openApiRuntime
    ? (ref) => openApiRuntime.resolveRef(ref) as SchemaObj | null
    : undefined

  const requestSchema = requestBody?.schema as SchemaNode | null
  const resolvedRequestSchema = requestSchema && resolveRef
    ? resolveSchemaRefs(requestSchema, resolveRef)
    : requestSchema
  const requestExample = resolvedRequestSchema
    ? JSON.stringify(schemaToExample(resolvedRequestSchema as SchemaObj, 0, resolveRef), null, 2)
    : null

  return (
    <div className="space-y-5">
      {/* Auth badge ────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1',
            auth === 'none'
              ? 'bg-[#1E2533] text-[#828DA3] ring-[#2A3242]'
              : 'bg-amber-500/15 text-amber-400 ring-amber-500/30'
          )}
        >
          {auth === 'none' ? (
            <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5.5 5a2.5 2.5 0 0 1 5 0H12V4a4 4 0 0 0-8 0v1h1.5Zm-3 2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H2.5Z" />
            </svg>
          ) : (
            <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a4 4 0 0 0-4 4v1H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1V5a4 4 0 0 0-4-4Zm2.5 5H5.5V5a2.5 2.5 0 0 1 5 0v1Z" />
            </svg>
          )}
          {authLabel(auth)}
        </span>
        {endpoint.description && (
          <span className="text-xs text-[#828DA3]">{endpoint.description}</span>
        )}
      </div>

      {/* Path parameters ───────────────────── */}
      {pathParams.length > 0 && (
        <section>
          <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#828DA3]">
            Path Parameters
          </h4>
          <SpecParamList params={pathParams} />
        </section>
      )}

      {/* Query parameters ──────────────────── */}
      {queryParams.length > 0 && (
        <section>
          <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#828DA3]">
            Query Parameters
          </h4>
          <SpecParamList params={queryParams} />
        </section>
      )}

      {/* Header parameters ─────────────────── */}
      {headerParams.length > 0 && (
        <section>
          <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#828DA3]">
            Headers
          </h4>
          <SpecParamList params={headerParams} />
        </section>
      )}

      {/* Request body ──────────────────────── */}
      {requestBody && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#828DA3]">
                Request Body
              </h4>
              <span className="text-[10px] text-[#586378]">
                {requestBody.contentType}
                {requestBody.required ? ' · required' : ' · optional'}
              </span>
            </div>
            {/* Example / Schema toggle */}
            {requestExample && (
              <div className="flex items-center rounded-md border border-[#2A3242] text-[10px]">
                <button
                  type="button"
                  onClick={() => setBodyView('example')}
                  className={cn(
                    'rounded-l-md px-2 py-1 transition',
                    bodyView === 'example'
                      ? 'bg-[#2A3242] text-[#D2D9E6]'
                      : 'text-[#828DA3] hover:text-[#D2D9E6]'
                  )}
                >
                  Example
                </button>
                <button
                  type="button"
                  onClick={() => setBodyView('schema')}
                  className={cn(
                    'rounded-r-md px-2 py-1 transition',
                    bodyView === 'schema'
                      ? 'bg-[#2A3242] text-[#D2D9E6]'
                      : 'text-[#828DA3] hover:text-[#D2D9E6]'
                  )}
                >
                  Schema
                </button>
              </div>
            )}
          </div>
          {bodyView === 'example' && requestExample ? (
            <div className="relative">
              <button
                type="button"
                className="absolute top-2 right-2 text-[#828DA3] hover:text-[#D2D9E6]"
                onClick={() => void copyToClipboard(requestExample, 'Example copied')}
              >
                <Copy className="h-3 w-3" />
              </button>
              <pre className="overflow-x-auto rounded-lg bg-[#1E2533] p-3 font-mono text-[11px] leading-relaxed text-[#D2D9E6]">
                {requestExample}
              </pre>
            </div>
          ) : resolvedRequestSchema ? (
            <SchemaTree schema={resolvedRequestSchema} />
          ) : (
            <p className="text-xs text-[#586378]">No schema defined.</p>
          )}
        </section>
      )}

      {/* Responses ─────────────────────────── */}
      {responses.length > 0 && (
        <section>
          <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#828DA3]">
            Responses
          </h4>
          {/* Status pills */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {responses.map(([code, desc]) => {
              const specDesc = openApiRuntime?.operationResponsesByPath(
                endpoint.method,
                endpoint.path
              )[code]?.description ?? ''
              const label = desc || specDesc
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() =>
                    setExpandedCode(expandedCode === code ? null : code)
                  }
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition',
                    statusPillColor(code),
                    expandedCode === code && 'opacity-100',
                    expandedCode !== null && expandedCode !== code && 'opacity-50'
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {code}{label ? ` — ${label}` : ''}
                </button>
              )
            })}
          </div>

          {/* Expanded response detail */}
          {responses.map(([code, desc]) => {
            const specData = openApiRuntime?.operationResponsesByPath(
              endpoint.method,
              endpoint.path
            )[code]
            const label = desc || specData?.description || ''
            const isExpanded = expandedCode === code || expandedCode === null
            if (!isExpanded) return null

            const respSchema = specData?.schema as SchemaNode | null ?? null
            const resolvedRespSchema = respSchema && resolveRef
              ? resolveSchemaRefs(respSchema, resolveRef)
              : respSchema
            const respExample =
              specData?.example ??
              (resolvedRespSchema
                ? JSON.stringify(schemaToExample(resolvedRespSchema as SchemaObj, 0, resolveRef), null, 2)
                : null)
            const hasContent = resolvedRespSchema || respExample
            const currentView = getResponseView(code)

            return (
              <div
                key={code}
                className="rounded-lg border border-[#2A3242] bg-[#141925]"
              >
                {/* Header row: pill + description + Example/Schema toggle */}
                <div className="flex items-center justify-between gap-2 border-b border-[#2A3242] px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-semibold',
                        statusPillColor(code)
                      )}
                    >
                      {code}
                    </span>
                    {label && (
                      <span className="text-xs text-[#D2D9E6]">{label}</span>
                    )}
                  </div>
                  {/* Example / Schema toggle — mirrors request body toggle */}
                  {hasContent && (
                    <div className="flex items-center rounded-md border border-[#2A3242] text-[10px]">
                      <button
                        type="button"
                        onClick={() => setResponseView(code, 'example')}
                        className={cn(
                          'rounded-l-md px-2 py-1 transition',
                          currentView === 'example'
                            ? 'bg-[#2A3242] text-[#D2D9E6]'
                            : 'text-[#828DA3] hover:text-[#D2D9E6]'
                        )}
                      >
                        Example
                      </button>
                      <button
                        type="button"
                        onClick={() => setResponseView(code, 'schema')}
                        className={cn(
                          'rounded-r-md px-2 py-1 transition',
                          currentView === 'schema'
                            ? 'bg-[#2A3242] text-[#D2D9E6]'
                            : 'text-[#828DA3] hover:text-[#D2D9E6]'
                        )}
                      >
                        Schema
                      </button>
                    </div>
                  )}
                </div>

                {/* Body */}
                {!hasContent ? (
                  <p className="px-3 py-3 text-xs text-[#586378]">
                    No schema defined.
                  </p>
                ) : currentView === 'example' && respExample ? (
                  <div className="relative px-3 py-3">
                    <button
                      type="button"
                      className="absolute top-5 right-5 text-[#828DA3] hover:text-[#D2D9E6]"
                      onClick={() => void copyToClipboard(respExample, 'Example copied')}
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    <pre className="overflow-x-auto rounded-lg bg-[#1E2533] p-3 font-mono text-[11px] leading-relaxed text-[#D2D9E6]">
                      {respExample}
                    </pre>
                  </div>
                ) : resolvedRespSchema ? (
                  <div className="px-3 py-3">
                    <SchemaTree schema={resolvedRespSchema} showRequired={false} />
                  </div>
                ) : null}
              </div>
            )
          })}
        </section>
      )}
    </div>
  )
}

function SpecParamList({ params }: { params: SpecParameterData[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#2A3242] bg-[#141925]">
      {params.map((p, i) => {
        const typeLabel =
          (p.schema?.type as string | undefined) ??
          (p.schema?.['$ref'] as string | undefined)?.split('/').pop() ??
          'string'
        return (
          <div
            key={`${p.in}-${p.name}`}
            className={cn(
              'flex flex-wrap items-baseline gap-x-2 gap-y-1 px-3 py-2.5 text-sm',
              i < params.length - 1 && 'border-b border-[#2A3242]'
            )}
          >
            <span className="font-mono font-semibold text-[#F4F7FC]">
              {p.name}
            </span>
            <span className="font-mono text-xs text-[#828DA3]">
              {typeLabel}
            </span>
            {p.required ? (
              <span className="rounded bg-red-500/15 px-1.5 py-0.5 text-[10px] font-medium text-red-400 ring-1 ring-red-500/30">
                required
              </span>
            ) : (
              <span className="text-[10px] text-[#586378]">optional</span>
            )}
            {p.description && (
              <span className="w-full text-xs text-[#828DA3]">
                {p.description}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function EndpointDetailsPanel({
  endpoint,
  baseUrl,
  readonly,
  openApiRuntime,
  onClose,
}: {
  endpoint: RestEndpointItem
  baseUrl: string
  readonly: boolean
  openApiRuntime?: ReturnType<typeof createOpenApiRuntime> | null
  onClose: () => void
}) {
  const { updateServiceApiEndpoint, serviceId } =
    useServiceApiEndpointsContext()

  const [control, activeTab] = useBetterTabs(endpointTabs, 'spec')
  // Merge status codes: spec-defined responses take priority over stored meta
  const metaResponses = parseStatusCodesMap(endpoint.statusCodes)
  const specResponsesMap = openApiRuntime
    ? openApiRuntime.operationResponsesByPath(endpoint.method, endpoint.path)
    : {}
  const specResponseCodes = Object.keys(specResponsesMap)
  const responses: Array<[string, string]> = specResponseCodes.length > 0
    ? specResponseCodes.map((code) => {
        const fromMeta = metaResponses.find(([c]) => c === code)
        if (fromMeta) return fromMeta
        return [code, specResponsesMap[code]?.description ?? '']
      })
    : metaResponses
  const updatedAt =
    endpoint.apiEndpoint.updatedAt || endpoint.apiEndpoint.createdAt

  async function handleSaveRequestSample(body: string) {
    if (
      !endpoint.apiEndpoint.apiEndpointId ||
      !endpoint.apiEndpoint.serviceApiGroupId ||
      !endpoint.apiEndpoint.componentMetaId
    ) {
      toast.error('Missing endpoint data')
      return
    }

    const exampleRequests = arrayNonNullable(
      endpoint.apiEndpoint.exampleRequests
    )
    await updateServiceApiEndpoint({
      variables: {
        apiEndpointId: endpoint.apiEndpoint.apiEndpointId,
        input: {
          serviceApiGroupId: endpoint.apiEndpoint.serviceApiGroupId,
          componentMetaId: endpoint.apiEndpoint.componentMetaId,
          order: endpoint.apiEndpoint.order ?? 0,
          exampleRequests: [...exampleRequests, body],
          exampleResponses: arrayNonNullable(
            endpoint.apiEndpoint.exampleResponses
          ),
        },
      },
    })
    toast.success('Request sample saved')
  }

  async function handleSaveResponseSample(body: string) {
    if (
      !endpoint.apiEndpoint.apiEndpointId ||
      !endpoint.apiEndpoint.serviceApiGroupId ||
      !endpoint.apiEndpoint.componentMetaId
    ) {
      toast.error('Missing endpoint data')
      return
    }

    const exampleResponses = arrayNonNullable(
      endpoint.apiEndpoint.exampleResponses
    )
    await updateServiceApiEndpoint({
      variables: {
        apiEndpointId: endpoint.apiEndpoint.apiEndpointId,
        input: {
          serviceApiGroupId: endpoint.apiEndpoint.serviceApiGroupId,
          componentMetaId: endpoint.apiEndpoint.componentMetaId,
          order: endpoint.apiEndpoint.order ?? 0,
          exampleRequests: arrayNonNullable(
            endpoint.apiEndpoint.exampleRequests
          ),
          exampleResponses: [...exampleResponses, body],
        },
      },
    })
    toast.success('Response sample saved')
  }

  const fullUrl = buildFullUrl(
    baseUrl || getBaseFromUrl(endpoint.fullUrl, endpoint.path),
    endpoint.path
  )

  return (
    <div className="flex w-full flex-col rounded-lg border bg-[#141925]">
      <div className="flex items-start justify-between border-b bg-[#141925] px-4 py-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-mono text-sm font-semibold">
            {endpoint.method} {endpoint.path}
          </h3>

          <p className="text-muted-foreground text-xs">{fullUrl}</p>

          <p className="text-muted-foreground mt-1 text-[11px]">
            {updatedAt
              ? `Updated ${new Date(updatedAt).toLocaleString()}`
              : null}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-2 text-xs"
            onClick={() => void copyToClipboard(fullUrl, 'URL copied')}
            disabled={!baseUrl}
          >
            <Copy className="h-3.5 w-3.5" />
            Copy URL
          </Button>
          <CrossButton onClick={onClose} />
        </div>
      </div>

      <div className="border-b px-4 py-2">
        <BetterTabController
          control={control}
          className="m-0 rounded-md"
          overlayClassName="rounded-md bg-primary shadow-sm"
          triggerClassName="h-7 rounded-md px-3 text-xs"
          activeTriggerClassName="text-white"
        />
      </div>

      <div className="space-y-4 px-4 py-4">
        {activeTab === 'spec' && (
          <EndpointSpecView
            endpoint={endpoint}
            responses={responses}
            openApiRuntime={openApiRuntime}
          />
        )}

        {activeTab === 'meta' && (
          <ConfigureApiEndpointMeta
            key={endpoint.endpointId}
            endpoint={endpoint.apiEndpoint}
            componentMeta={endpoint.componentMeta}
            readonly
            className="px-0"
            hideFooter
          />
        )}

        {activeTab === 'tryit' && (
          <EndpointTryItTab
            method={endpoint.method}
            path={endpoint.path}
            baseUrl={baseUrl || getBaseFromUrl(endpoint.fullUrl, endpoint.path)}
            operationId={endpoint.operationId}
            authKind={
              openApiRuntime?.hasSecuritySchemes
                ? endpoint.operationId
                  ? openApiRuntime.operationAuth(endpoint.operationId)
                  : openApiRuntime.operationAuthByPath(
                      endpoint.method,
                      endpoint.path
                    )
                : endpoint.auth
            }
            requestSchema={endpoint.requestSchema}
            parameters={endpoint.parameters}
            requestExample={endpoint.requestExample}
            serviceId={serviceId}
            onSaveRequestSample={handleSaveRequestSample}
            onSaveResponseSample={handleSaveResponseSample}
          />
        )}

        {activeTab === 'samples' && (
          <ConfigureApiEndpointSamples
            endpoint={endpoint.apiEndpoint}
            readonly={readonly}
            className="px-0"
          />
        )}

        {activeTab === 'connections' && (
          <ConfigureApiEndpointConnections endpoint={endpoint.apiEndpoint} />
        )}
      </div>
    </div>
  )
}

function GraphQLOperationDetailsPanel({
  operation,
  readonly,
  onClose,
}: {
  operation: GraphQLOperationItem
  readonly: boolean
  onClose: () => void
}) {
  const fields = useMemo(
    () => arrayNonNullable(operation.componentMeta.componentModalFields),
    [operation.componentMeta.componentModalFields]
  )
  const flattened = useMemo(() => flattenMetaData(fields, fields), [fields])
  const [control, activeTab] = useBetterTabs(
    [
      { id: 'spec', label: 'Spec' },
      { id: 'meta', label: 'Meta' },
      { id: 'samples', label: 'Samples' },
      { id: 'connections', label: 'Connections' },
    ],
    'spec'
  )

  const nameField = fields.find(
    (field) => field?.label?.toLowerCase() === 'name'
  )
  const kindField = fields.find(
    (field) =>
      field?.label?.toLowerCase() === 'graphql operation type' ||
      field?.label?.toLowerCase() === 'operation type' ||
      field?.label?.toLowerCase() === 'kind'
  )
  const descriptionField = fields.find(
    (field) => field?.label?.toLowerCase() === 'description' || field?.label?.toLowerCase() === 'summary'
  )

  const operationName = nameField?.componentFieldId
    ? (flattened[nameField.componentFieldId] as string)
    : 'N/A'
  const signature = getMetaValue(flattened, fields, ['signature'])
  const operationKind = kindField?.componentFieldId
    ? (flattened[kindField.componentFieldId] as string)
    : 'Query'
  const description = descriptionField?.componentFieldId
    ? (flattened[descriptionField.componentFieldId] as string)
    : undefined
  const requestSchemaRaw = getMetaValue(flattened, fields, ['request schema'])
  const responseSchemaRaw = getMetaValue(flattened, fields, ['response schema'])
  const variablesRaw = getMetaValue(flattened, fields, ['parameters'])
  const updatedAt =
    operation.apiEndpoint.updatedAt || operation.apiEndpoint.createdAt

  // Parse arguments and return type from the signature string
  // e.g. "createDashboard(input: DashboardInput!): Dashboard!"
  const parsedSignature = useMemo(() => {
    if (!signature) return null
    const argsMatch = signature.match(/\(([^)]*)\)/)
    const returnMatch = signature.match(/\):\s*(.+)$/)
    const args = argsMatch?.[1]
      ? argsMatch[1]
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean)
          .map((a) => {
            const [argName, argType] = a.split(':').map((s) => s.trim())
            return { name: argName, type: argType }
          })
      : []
    const returnType = returnMatch?.[1]?.trim() ?? null
    return { args, returnType }
  }, [signature])

  return (
    <DynamicScrollArea
      topOffset={164}
      bottomOffset={12}
      className="sticky top-3 w-full overflow-y-auto rounded-lg border bg-[#141925]"
    >
      <div className="sticky top-0 z-10 border-b bg-[#141925] px-4 py-3">
        <div className="mb-1 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <Badge
                variant="outline"
                className={`${getGraphQLOperationTypeColor(operationKind)} shrink-0 text-white`}
              >
                {operationKind}
              </Badge>
              <h3 className="truncate font-mono text-sm font-semibold">
                {operationName}
              </h3>
            </div>
            {signature && (
              <p className="text-muted-foreground mt-1 truncate font-mono text-xs">
                {signature}
              </p>
            )}
          </div>

          <CrossButton onClick={onClose} />
        </div>
        <p className="text-muted-foreground text-[11px]">
          {updatedAt ? `Updated ${new Date(updatedAt).toLocaleString()}` : null}
        </p>
      </div>

      <div className="border-b px-4 py-2">
        <BetterTabController
          control={control}
          className="m-0 rounded-md"
          overlayClassName="rounded-md bg-primary shadow-sm"
          triggerClassName="h-7 rounded-md px-3 text-xs"
          activeTriggerClassName="text-white"
        />
      </div>

      <div className="space-y-4 px-4 py-4">
        {activeTab === 'spec' && (
          <div className="space-y-5">
            {/* Operation kind pill */}
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`${getGraphQLOperationTypeColor(operationKind)} text-white`}
              >
                {operationKind}
              </Badge>
              <span className="font-mono text-sm font-semibold text-[#F4F7FC]">
                {operationName}
              </span>
            </div>

            {/* Description */}
            {description && (
              <p className="text-sm text-[#A0ADBE]">{description}</p>
            )}

            {/* Full signature block */}
            {signature && (
              <div>
                <p className="mb-2 text-[10px] font-semibold tracking-wider uppercase text-[#828DA3]">
                  Signature
                </p>
                <pre className="overflow-x-auto rounded-md bg-[#0D1017] px-3 py-2.5 font-mono text-xs text-[#C9D1D9]">
                  {operationKind.toLowerCase()} {signature}
                </pre>
              </div>
            )}

            {/* Arguments */}
            {parsedSignature && parsedSignature.args.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-semibold tracking-wider uppercase text-[#828DA3]">
                  Arguments
                </p>
                <div className="divide-y divide-[#2A3242] rounded-md border border-[#2A3242]">
                  {parsedSignature.args.map((arg, i) => (
                    <div key={i} className="flex items-baseline gap-2 px-3 py-2">
                      <span className="font-mono text-xs font-semibold text-[#F4F7FC]">
                        {arg.name}
                      </span>
                      {arg.type && (
                        <span className="font-mono text-xs text-[#3B82F6]">
                          {arg.type}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Return type */}
            {parsedSignature?.returnType && (
              <div>
                <p className="mb-2 text-[10px] font-semibold tracking-wider uppercase text-[#828DA3]">
                  Returns
                </p>
                <div className="inline-flex items-center gap-1.5 rounded-md bg-[#0D1017] px-3 py-1.5">
                  <span className="font-mono text-xs text-[#3B82F6]">
                    {parsedSignature.returnType}
                  </span>
                </div>
              </div>
            )}

            {/* Variables / input payload */}
            {variablesRaw && variablesRaw !== '{}' && (
              <SpecSchemaBlock label="Variables" raw={variablesRaw} />
            )}

            {/* GraphQL operation document */}
            {requestSchemaRaw && (
              <SpecSchemaBlock label="Operation" raw={requestSchemaRaw} />
            )}

            {/* Response example */}
            {responseSchemaRaw && (
              <SpecSchemaBlock label="Response" raw={responseSchemaRaw} />
            )}
          </div>
        )}

        {activeTab === 'meta' && (
          <ConfigureApiEndpointMeta
            key={operation.apiEndpoint.apiEndpointId}
            endpoint={operation.apiEndpoint}
            componentMeta={operation.componentMeta}
            readonly
            className="px-0"
            hideFooter
          />
        )}

        {activeTab === 'samples' && (
          <ConfigureApiEndpointSamples
            endpoint={operation.apiEndpoint}
            readonly={readonly}
            className="px-0"
          />
        )}

        {activeTab === 'connections' && (
          <ConfigureApiEndpointConnections endpoint={operation.apiEndpoint} />
        )}
      </div>
    </DynamicScrollArea>
  )
}

function GrpcMethodDetailsPanel({
  method,
  readonly,
  onClose,
}: {
  method: GrpcMethodItem
  readonly: boolean
  onClose: () => void
}) {
  const fields = useMemo(
    () => arrayNonNullable(method.componentMeta.componentModalFields),
    [method.componentMeta.componentModalFields]
  )
  const flattened = useMemo(() => flattenMetaData(fields, fields), [fields])
  const [control, activeTab] = useBetterTabs(
    [
      { id: 'spec', label: 'Spec' },
      { id: 'meta', label: 'Meta' },
      { id: 'samples', label: 'Samples' },
      { id: 'connections', label: 'Connections' },
    ],
    'spec'
  )

  const methodNameField = fields.find(
    (field) =>
      field?.label?.toLowerCase() === 'grpc method name' ||
      field?.label?.toLowerCase() === 'method name'
  )
  const packageField = fields.find(
    (field) => field?.label?.toLowerCase() === 'package name'
  )
  const serviceField = fields.find(
    (field) =>
      field?.label?.toLowerCase() === 'grpc service name' ||
      field?.label?.toLowerCase() === 'service name'
  )
  const rpcTypeField = fields.find(
    (field) =>
      field?.label?.toLowerCase() === 'grpc rpc type' ||
      field?.label?.toLowerCase() === 'streaming type' ||
      field?.label?.toLowerCase() === 'rpc type'
  )
  const requestTypeField = fields.find(
    (field) => field?.label?.toLowerCase() === 'request type'
  )
  const responseTypeField = fields.find(
    (field) => field?.label?.toLowerCase() === 'response type'
  )
  const protoSnippetField = fields.find(
    (field) => field?.label?.toLowerCase() === 'proto snippet'
  )
  const descriptionField = fields.find(
    (field) => field?.label?.toLowerCase() === 'description' || field?.label?.toLowerCase() === 'summary'
  )

  const methodName = methodNameField?.componentFieldId
    ? (flattened[methodNameField.componentFieldId] as string)
    : 'N/A'
  const packageName = packageField?.componentFieldId
    ? (flattened[packageField.componentFieldId] as string)
    : ''
  const serviceName = serviceField?.componentFieldId
    ? (flattened[serviceField.componentFieldId] as string)
    : ''
  const streamingType = rpcTypeField?.componentFieldId
    ? mapGrpcRpcType(flattened[rpcTypeField.componentFieldId] as string)
    : 'UNARY'
  const requestType = requestTypeField?.componentFieldId
    ? (flattened[requestTypeField.componentFieldId] as string)
    : undefined
  const responseType = responseTypeField?.componentFieldId
    ? (flattened[responseTypeField.componentFieldId] as string)
    : undefined
  const protoSnippet = protoSnippetField?.componentFieldId
    ? (flattened[protoSnippetField.componentFieldId] as string)
    : undefined
  const description = descriptionField?.componentFieldId
    ? (flattened[descriptionField.componentFieldId] as string)
    : undefined
  const requestSchemaRaw = getMetaValue(flattened, fields, ['request schema'])
  const responseSchemaRaw = getMetaValue(flattened, fields, ['response schema'])

  const updatedAt = method.apiEndpoint.updatedAt || method.apiEndpoint.createdAt
  const servicePath = packageName
    ? `${packageName}.${serviceName || ''}`
    : serviceName || 'N/A'

  const streamingLabel: Record<string, string> = {
    UNARY: 'Unary',
    SERVER_STREAMING: 'Server Streaming',
    CLIENT_STREAMING: 'Client Streaming',
    BIDIRECTIONAL_STREAMING: 'Bidirectional Streaming',
  }

  return (
    <DynamicScrollArea
      topOffset={164}
      bottomOffset={12}
      className="sticky top-3 w-full overflow-y-auto rounded-lg border bg-[#141925]"
    >
      <div className="sticky top-0 z-10 border-b bg-[#141925] px-4 py-3">
        <div className="mb-1 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <Badge
                variant="outline"
                className={`${getGrpcStreamingTypeColor(streamingType)} shrink-0 text-white`}
              >
                {streamingLabel[streamingType] ?? streamingType}
              </Badge>
              <h3 className="truncate font-mono text-sm font-semibold">
                {methodName}
              </h3>
            </div>
            <p className="text-muted-foreground mt-1 truncate font-mono text-xs">
              {servicePath}
            </p>
          </div>

          <CrossButton onClick={onClose} />
        </div>
        <p className="text-muted-foreground mt-1 text-[11px]">
          {updatedAt ? `Updated ${new Date(updatedAt).toLocaleString()}` : null}
        </p>
      </div>

      <div className="border-b px-4 py-2">
        <BetterTabController
          control={control}
          className="m-0 rounded-md"
          overlayClassName="rounded-md bg-primary shadow-sm"
          triggerClassName="h-7 rounded-md px-3 text-xs"
          activeTriggerClassName="text-white"
        />
      </div>

      <div className="space-y-4 px-4 py-4">
        {activeTab === 'spec' && (
          <div className="space-y-5">
            {/* Header info */}
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`${getGrpcStreamingTypeColor(streamingType)} text-white`}
              >
                {streamingLabel[streamingType] ?? streamingType}
              </Badge>
              <span className="font-mono text-sm font-semibold text-[#F4F7FC]">
                {methodName}
              </span>
            </div>

            <p className="font-mono text-xs text-[#828DA3]">{servicePath}</p>

            {description && (
              <p className="text-sm text-[#A0ADBE]">{description}</p>
            )}

            {/* Request / Response */}
            {(requestType || responseType) && (
              <div className="space-y-3">
                <p className="text-[10px] font-semibold tracking-wider uppercase text-[#828DA3]">
                  Message Types
                </p>
                <div className="divide-y divide-[#2A3242] rounded-md border border-[#2A3242]">
                  {requestType && (
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <span className="w-16 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-[#828DA3]">
                        Request
                      </span>
                      <span className="font-mono text-xs text-[#3B82F6]">
                        {requestType}
                      </span>
                    </div>
                  )}
                  {responseType && (
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <span className="w-16 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-[#828DA3]">
                        Response
                      </span>
                      <span className="font-mono text-xs text-[#3B82F6]">
                        {responseType}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Streaming mode info */}
            {streamingType !== 'UNARY' && (
              <div className="rounded-md border border-[#2A3242] bg-[#0D1017] px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#828DA3]">
                  Streaming Mode
                </p>
                <p className="mt-1 text-xs text-[#A0ADBE]">
                  {streamingType === 'SERVER_STREAMING' &&
                    'The server sends a stream of messages in response to a single client request.'}
                  {streamingType === 'CLIENT_STREAMING' &&
                    'The client sends a stream of messages and the server replies with a single response.'}
                  {streamingType === 'BIDIRECTIONAL_STREAMING' &&
                    'Both client and server send streams of messages independently.'}
                </p>
              </div>
            )}

            {/* Proto snippet */}
            {protoSnippet && (
              <div>
                <p className="mb-2 text-[10px] font-semibold tracking-wider uppercase text-[#828DA3]">
                  Proto Definition
                </p>
                <pre className="overflow-x-auto rounded-md bg-[#0D1017] px-3 py-2.5 font-mono text-xs text-[#C9D1D9]">
                  {protoSnippet.replace(/\\n/g, '\n')}
                </pre>
              </div>
            )}

            {/* Request payload */}
            {requestSchemaRaw && (
              <SpecSchemaBlock label="Request" raw={requestSchemaRaw} />
            )}

            {/* Response payload */}
            {responseSchemaRaw && (
              <SpecSchemaBlock label="Response" raw={responseSchemaRaw} />
            )}
          </div>
        )}

        {activeTab === 'meta' && (
          <ConfigureApiEndpointMeta
            key={method.apiEndpoint.apiEndpointId}
            endpoint={method.apiEndpoint}
            componentMeta={method.componentMeta}
            readonly
            className="px-0"
            hideFooter
          />
        )}

        {activeTab === 'samples' && (
          <ConfigureApiEndpointSamples
            endpoint={method.apiEndpoint}
            readonly={readonly}
            className="px-0"
          />
        )}

        {activeTab === 'connections' && (
          <ConfigureApiEndpointConnections endpoint={method.apiEndpoint} />
        )}
      </div>
    </DynamicScrollArea>
  )
}

function getGraphQLOperationTypeColor(kind: string) {
  switch (kind) {
    case 'Query':
      return 'bg-blue-500'
    case 'Mutation':
      return 'bg-green-500'
    case 'Subscription':
      return 'bg-purple-500'
    default:
      return 'bg-gray-500'
  }
}

function mapGrpcRpcType(
  rpcType: string
):
  | 'UNARY'
  | 'SERVER_STREAMING'
  | 'CLIENT_STREAMING'
  | 'BIDIRECTIONAL_STREAMING' {
  const normalized = rpcType.toLowerCase()
  if (normalized === 'unary') return 'UNARY'
  if (normalized === 'server streaming') return 'SERVER_STREAMING'
  if (normalized === 'client streaming') return 'CLIENT_STREAMING'
  if (normalized === 'bidirectional streaming') return 'BIDIRECTIONAL_STREAMING'
  if (normalized === 'server_streaming') return 'SERVER_STREAMING'
  if (normalized === 'client_streaming') return 'CLIENT_STREAMING'
  if (normalized === 'bidirectional_streaming') return 'BIDIRECTIONAL_STREAMING'
  return 'UNARY'
}

function getGrpcStreamingTypeColor(type?: string) {
  switch (type) {
    case 'UNARY':
      return 'bg-blue-500'
    case 'SERVER_STREAMING':
      return 'bg-green-500'
    case 'CLIENT_STREAMING':
      return 'bg-purple-500'
    case 'BIDIRECTIONAL_STREAMING':
      return 'bg-orange-500'
    default:
      return 'bg-gray-500'
  }
}

function getMetaValue(
  metaData: Record<string, unknown>,
  fields: Array<{ label?: string | null; componentFieldId?: string | null }>,
  labels: string[]
): string | null {
  const labelsLower = new Set(labels.map((label) => label.toLowerCase()))
  const field = fields.find((item) =>
    labelsLower.has((item.label || '').toLowerCase())
  )
  if (!field?.componentFieldId) return null
  const value = metaData[field.componentFieldId]
  if (typeof value === 'string') return value
  if (value == null) return null
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value)
  if (typeof value === 'object') {
    const text = (value as { text?: unknown }).text
    if (typeof text === 'string') return text
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return null
    }
  }
  return null
}

function parseTags(value: string | null): string[] {
  if (!value) return []
  const trimmed = value.trim()
  if (!trimmed) return []

  try {
    const parsed = JSON.parse(trimmed)
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => String(item).trim())
        .filter(Boolean)
        .slice(0, 12)
    }
  } catch {
    // ignore
  }

  return trimmed
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12)
}

function toAuthKind(raw: string | null): AuthKind {
  const value = (raw || '').toLowerCase()
  if (!value || value.includes('none') || value.includes('public'))
    return 'none'
  if (value.includes('bearer') || value.includes('jwt')) return 'bearer'
  if (value.includes('api key') || value.includes('api-key')) return 'api-key'
  if (value.includes('oauth')) return 'oauth2'
  return 'other'
}

function authLabel(auth: AuthKind): string {
  switch (auth) {
    case 'none':
      return 'No auth'
    case 'bearer':
      return 'Bearer'
    case 'api-key':
      return 'API key'
    case 'oauth2':
      return 'OAuth2'
    default:
      return 'Other'
  }
}

async function copyToClipboard(value: string, successMessage: string) {
  if (!value) return
  try {
    await navigator.clipboard.writeText(value)
    toast.success(successMessage)
  } catch {
    toast.error('Failed to copy')
  }
}

function buildCurlSkeleton(
  baseUrl: string,
  path: string,
  method: string,
  auth: AuthKind
): string {
  const authHeader =
    auth === 'none'
      ? ''
      : auth === 'api-key'
        ? "  -H 'x-api-key: <API_KEY>' \\\n"
        : "  -H 'Authorization: Bearer <TOKEN>' \\\n"

  const body = method === 'GET' || method === 'DELETE' ? '' : "  -d '{}' \\\n"
  return `curl -X ${method} \\\n${authHeader}  -H 'Content-Type: application/json' \\\n${body}  '${buildFullUrl(baseUrl, path)}'`
}

function buildFullUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalizedBase}${normalizedPath}`
}

function parseStatusCodesMap(
  value: string | null
): Array<[status: string, description: string]> {
  if (!value) return []
  try {
    const parsed = JSON.parse(value) as Record<string, string>
    return Object.entries(parsed).sort(([a], [b]) => a.localeCompare(b))
  } catch {
    return []
  }
}

function getBaseFromUrl(url: string, path: string): string {
  if (!url) return ''
  const idx = url.indexOf(path)
  if (idx <= 0) return url
  return url.slice(0, idx)
}

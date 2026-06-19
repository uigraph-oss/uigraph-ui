'use client'

import { GT, privateClient, v1Graphql } from '@/api'
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
import { Table, TableBody } from '@/components/ui/table'
import { BetterTabController, useBetterTabs } from '@/hooks/use-better-tabs'
import { useSearchParamsState } from '@/hooks/use-search-params-state'
import { useCurrentOrganization } from '@/store/auth-store'
import { normalizePath } from '@/utils/api/display'
import { createOpenApiRuntime } from '@/utils/api/openapi-runtime'
import { flattenMetaData } from '@uigraph/sdk'
import { arrayNonNullable } from 'daily-code'
import { AnimatePresence, motion } from 'framer-motion'
import { Copy, EllipsisVertical, Link2, Search, Terminal } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useServiceApiEndpointsContext } from '../../contexts/service-api-endpoints'
import { ConfigureApiEndpointConnections } from './configure-api-endpoint-connections'
import { ConfigureApiEndpointMeta } from './configure-api-endpoint-meta'
import { ConfigureApiEndpointSamples } from './configure-api-endpoint-samples'
import { EndpointSchemaView } from './endpoint-schema-view'
import { EndpointTryItTab } from './endpoint-try-it-tab'
import {
  GraphQLOperationItem,
  GraphQLOperationRow,
} from './rows/graphql-operation-row'
import { GrpcMethodItem, GrpcMethodRow } from './rows/grpc-method-row'

const GET_FILE_BY_ID_QUERY = v1Graphql(`
  query GetFileByID_ServiceApis($fileId: String!) {
    GetFileByID(fileId: $fileId, download: true) {
      fileId
      fileDownloadURL
    }
  }
`)

type RestEndpointItem = {
  selectionKey: string
  endpointId: string
  apiEndpoint: GT.ApiEndpoint
  componentMeta: GT.ComponentMeta
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

export function ServiceApiEndpoints({ specFileId }: { specFileId?: string }) {
  const {
    apiEndpoints,
    protocol,
    graphQLOperations,
    isGraphQLLoading,
    grpcMethods,
    isGrpcLoading,
    selectedVersionId,
    deleteServiceApiEndpoint,
  } = useServiceApiEndpointsContext()
  const organizationId = useCurrentOrganization()?.id
  const [queryParams, setQueryParams] = useSearchParamsState(
    'endpointId',
    'env'
  )

  const [searchQuery, setSearchQuery] = useState('')
  const [authFilter, setAuthFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [groupBy, setGroupBy] = useState<GroupByKind>('tags')
  const [operationTypeFilter, setOperationTypeFilter] = useState('all')
  const [openApiSpec, setOpenApiSpec] = useState<Record<
    string,
    unknown
  > | null>(null)

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
    if (!isRestLikeProtocol || !specFileId) {
      setOpenApiSpec(null)
      return
    }

    let cancelled = false

    async function run() {
      try {
        const { data } = await privateClient.query({
          query: GET_FILE_BY_ID_QUERY,
          variables: { fileId: specFileId! },
          fetchPolicy: 'cache-first',
        })
        const downloadURL = data?.GetFileByID?.fileDownloadURL
        if (!downloadURL) return

        const response = await fetch(downloadURL)
        if (!response.ok) return
        const raw = await response.text()

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
  }, [protocol, specFileId])

  const isGraphQL = protocol === 'graphql'
  const isGrpc = protocol === 'grpc'
  const selectedEnv = (queryParams.env || 'staging').toLowerCase()

  const openApiRuntime = useMemo(
    () => createOpenApiRuntime(openApiSpec),
    [openApiSpec]
  )

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

  const baseUrl = useMemo(
    () => openApiRuntime.resolveBaseUrl(selectedEnv, fallbackBaseUrl),
    [fallbackBaseUrl, openApiRuntime, selectedEnv]
  )

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
    const selected = queryParams.endpointId
    if (!selected) return null
    return (
      restEndpoints.find(
        (item) =>
          item.selectionKey === selected ||
          item.operationId === selected ||
          item.endpointId === selected
      ) ?? null
    )
  }, [queryParams.endpointId, restEndpoints])

  const selectedGraphQLOperation = useMemo(() => {
    const selected = queryParams.endpointId
    if (!selected) return null
    return (
      graphQLOperations.find(
        (item) => item.apiEndpoint.apiEndpointId === selected
      ) ?? null
    )
  }, [graphQLOperations, queryParams.endpointId])

  const selectedGrpcMethod = useMemo(() => {
    const selected = queryParams.endpointId
    if (!selected) return null
    return (
      grpcMethods.find((item) => item.apiEndpoint.apiEndpointId === selected) ??
      null
    )
  }, [grpcMethods, queryParams.endpointId])

  useEffect(() => {
    if (!queryParams.endpointId) return
    const selectedEndpoint =
      selectedRestEndpoint ?? selectedGraphQLOperation ?? selectedGrpcMethod
    if (!selectedEndpoint) {
      void setQueryParams({ endpointId: null }, true)
    }
  }, [
    queryParams.endpointId,
    selectedGraphQLOperation,
    selectedGrpcMethod,
    selectedRestEndpoint,
    setQueryParams,
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
    <div className="flex h-[calc(100vh-310px)] flex-col">
      <div className="border-stock space-y-3 border-b bg-[#fafbfc] p-4 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="relative max-w-md flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <Input
              id="endpoint-search"
              placeholder={
                isGraphQL
                  ? 'Search operations (operation name, signature)'
                  : isGrpc
                    ? 'Search methods (method name, service name)'
                    : 'Search endpoints (path, method, summary, operationId, tags)'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-stock h-11! !rounded-[0.8rem] bg-white pl-10 shadow-none"
              aria-label={
                isGraphQL
                  ? 'Search operations'
                  : isGrpc
                    ? 'Search methods'
                    : 'Search endpoints'
              }
            />
          </div>

          <div className="flex items-center gap-3">
            {isGraphQL ? (
              <Select
                value={operationTypeFilter}
                onValueChange={setOperationTypeFilter}
              >
                <SelectTrigger className="border-stock h-11! w-[140px] !rounded-[0.8rem] bg-white! shadow-none">
                  <SelectValue placeholder="All Types" className="bg-white" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Query">Query</SelectItem>
                  <SelectItem value="Mutation">Mutation</SelectItem>
                  <SelectItem value="Subscription">Subscription</SelectItem>
                </SelectContent>
              </Select>
            ) : isGrpc ? null : (
              <>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="border-stock h-11! w-[140px] !rounded-[0.8rem] bg-white! shadow-none">
                    <SelectValue placeholder="Method" className="bg-white" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>

                {openApiRuntime.hasSecuritySchemes && (
                  <Select value={authFilter} onValueChange={setAuthFilter}>
                    <SelectTrigger className="border-stock h-11! w-[140px] !rounded-[0.8rem] bg-white! shadow-none">
                      <SelectValue placeholder="Auth" className="bg-white" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Auth</SelectItem>
                      {authOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {authLabel(option)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Select
                  value={groupBy}
                  onValueChange={(value) => setGroupBy(value as GroupByKind)}
                >
                  <SelectTrigger className="border-stock h-11! w-[160px] !rounded-[0.8rem] bg-white! shadow-none">
                    <SelectValue placeholder="Group by" className="bg-white" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tags">Group by: Tags</SelectItem>
                    <SelectItem value="none">Group by: None</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </div>
      </div>

      {!isGraphQL && !isGrpc && (
        <div className="border-stock border-b bg-[#F9FAFB] px-6 py-2">
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <p className="text-[#6B7280]">
                  Base URL:{' '}
                  <span className="font-mono font-medium text-[#111827]">
                    {baseUrl || 'Unavailable'}
                  </span>
                </p>
                {!baseUrl && (
                  <span className="text-[11px] text-amber-600">
                    Cannot resolve base URL from spec
                  </span>
                )}
              </div>
              {openApiRuntime.defaultServer?.url && (
                <p className="text-[11px] text-[#6B7280]">
                  Template:{' '}
                  <span className="font-mono">
                    {openApiRuntime.defaultServer.url}
                  </span>
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() =>
                void copyToClipboard(baseUrl || '', 'Base URL copied')
              }
              disabled={!baseUrl}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {isGraphQLLoading || isGrpcLoading ? (
        <div className="flex h-[400px] items-center justify-center px-6 py-4">
          <SuperCircleLoader />
        </div>
      ) : isGraphQL ? (
        <div className="flex px-6 py-4">
          <div className="min-w-0 flex-1 pr-1">
            {filteredGraphQLOperations.length === 0 ? (
              <div className="flex h-[400px] items-center justify-center text-center">
                <div>
                  <p className="mb-2 text-sm text-[#6B7280]">
                    No operations match these filters
                  </p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearchQuery('')
                      setOperationTypeFilter('all')
                    }}
                    className="text-[#3B82F6]"
                  >
                    Clear filters
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full rounded-lg border bg-white p-1">
                <Table>
                  <TableBody>
                    {filteredGraphQLOperations.map((operation) => (
                      <GraphQLOperationRow
                        key={operation.apiEndpoint.apiEndpointId}
                        operation={operation}
                        selected={
                          selectedGraphQLOperation?.apiEndpoint
                            .apiEndpointId ===
                          operation.apiEndpoint.apiEndpointId
                        }
                        onSelect={() =>
                          void setQueryParams(
                            {
                              endpointId: operation.apiEndpoint.apiEndpointId,
                            },
                            true
                          )
                        }
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <AnimatePresence>
            {selectedGraphQLOperation && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: '40%' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="h-full min-w-[360px] shrink-0"
              >
                <GraphQLOperationDetailsPanel
                  operation={selectedGraphQLOperation}
                  readonly={selectedVersionId !== null}
                  onClose={() =>
                    void setQueryParams({ endpointId: null }, true)
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : isGrpc ? (
        <div className="flex px-6 py-4">
          <div className="min-w-0 flex-1 pr-1">
            {groupedGrpcMethods.length === 0 ? (
              <div className="flex h-[400px] items-center justify-center text-center">
                <div>
                  <p className="mb-2 text-sm text-[#6B7280]">
                    No methods match these filters
                  </p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearchQuery('')
                    }}
                    className="text-[#3B82F6]"
                  >
                    Clear filters
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full space-y-6">
                {groupedGrpcMethods.map(({ serviceKey, methods }) => (
                  <div key={serviceKey} className="space-y-2">
                    <h3 className="px-2 text-sm font-semibold text-[#0B1220]">
                      {serviceKey}
                    </h3>
                    <div className="rounded-lg border bg-white p-1">
                      <Table>
                        <TableBody>
                          {methods.map((method) => (
                            <GrpcMethodRow
                              key={method.apiEndpoint.apiEndpointId}
                              method={method}
                              selected={
                                selectedGrpcMethod?.apiEndpoint
                                  .apiEndpointId ===
                                method.apiEndpoint.apiEndpointId
                              }
                              onSelect={() =>
                                void setQueryParams(
                                  {
                                    endpointId:
                                      method.apiEndpoint.apiEndpointId,
                                  },
                                  true
                                )
                              }
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <AnimatePresence>
            {selectedGrpcMethod && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: '40%' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="h-full min-w-[360px] shrink-0"
              >
                <GrpcMethodDetailsPanel
                  method={selectedGrpcMethod}
                  readonly={selectedVersionId !== null}
                  onClose={() =>
                    void setQueryParams({ endpointId: null }, true)
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex px-6 py-4">
          <div className="min-w-0 flex-1 pr-1">
            {filteredRestEndpoints.length === 0 ? (
              <div className="flex h-[400px] items-center justify-center text-center">
                <div>
                  <p className="mb-2 text-sm text-[#6B7280]">
                    No endpoints match these filters
                  </p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearchQuery('')
                      setAuthFilter('all')
                      setMethodFilter('all')
                    }}
                    className="text-[#3B82F6]"
                  >
                    Clear filters
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {groupedRestEndpoints.map((group) => (
                  <div key={group.group} className="space-y-2">
                    {groupBy === 'tags' && group.group !== 'Ungrouped' && (
                      <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                        {group.group}
                      </h3>
                    )}
                    <div className="space-y-1 rounded-lg border bg-white p-1">
                      {group.endpoints.map((endpoint) => (
                        <RestEndpointRow
                          key={endpoint.endpointId}
                          endpoint={endpoint}
                          selected={
                            selectedRestEndpoint?.selectionKey ===
                            endpoint.selectionKey
                          }
                          onSelect={() =>
                            void setQueryParams(
                              { endpointId: endpoint.selectionKey },
                              true
                            )
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
                  </div>
                ))}
              </div>
            )}
          </div>

          <AnimatePresence>
            {selectedRestEndpoint && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: '40%' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="h-full min-w-[360px] shrink-0 pl-4"
              >
                <EndpointDetailsPanel
                  endpoint={selectedRestEndpoint}
                  baseUrl={baseUrl}
                  readonly={selectedVersionId !== null}
                  openApiRuntime={openApiRuntime}
                  onClose={() =>
                    void setQueryParams({ endpointId: null }, true)
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

function RestEndpointRow({
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
      className={`group flex cursor-pointer items-start justify-between rounded-md border px-3 py-2.5 transition-colors ${
        selected
          ? 'border-blue-300 bg-blue-50/60'
          : 'border-transparent hover:bg-slate-50'
      }`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <Badge
          variant="outline"
          className={`mt-0.5 min-w-16 justify-center border-0 text-white ${methodColor(
            endpoint.method
          )}`}
        >
          {endpoint.method}
        </Badge>
        <div className="min-w-0">
          <div className="truncate font-mono text-sm font-semibold text-[#111827]">
            {endpoint.path}
          </div>
          {endpoint.summary && (
            <div className="text-muted-foreground truncate text-xs">
              {endpoint.summary}
            </div>
          )}
        </div>
      </div>

      <div className="ml-3 flex shrink-0 items-center gap-1">
        <Badge variant="secondary" className="text-[10px]">
          {endpoint.protocol || 'REST'}
        </Badge>
        <div
          className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => void copyToClipboard(endpoint.path, 'Path copied')}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() =>
              void copyToClipboard(
                buildFullUrl(baseUrl, endpoint.path),
                'Full URL copied'
              )
            }
            disabled={!baseUrl}
          >
            <Link2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
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
            <Terminal className="h-3.5 w-3.5" />
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="size-7">
              <EllipsisVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onSelect}>Open docs</DropdownMenuItem>
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

type EndpointTab = 'meta' | 'tryit' | 'samples' | 'connections'
const endpointTabs: { id: EndpointTab; label: string }[] = [
  { id: 'meta', label: 'Meta' },
  { id: 'tryit', label: 'Try it' },
  { id: 'samples', label: 'Samples' },
  { id: 'connections', label: 'Connections' },
]

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
  openApiRuntime: ReturnType<typeof createOpenApiRuntime>
  onClose: () => void
}) {
  const { updateServiceApiEndpoint, serviceId } =
    useServiceApiEndpointsContext()

  const [control, activeTab] = useBetterTabs(endpointTabs, 'meta')
  const [isMetaDirty, setIsMetaDirty] = useState(false)
  const [metaActions, setMetaActions] = useState<{
    submit: () => Promise<boolean>
    reset: () => void
  } | null>(null)
  const isSpecOwned =
    (endpoint.sourceType || '')
      .toLowerCase()
      .match(/openapi|swagger|spec|imported/) !== null
  const responses = parseStatusCodesMap(endpoint.statusCodes)
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

  return (
    <DynamicScrollArea
      topOffset={164}
      bottomOffset={12}
      className="sticky top-3 w-full overflow-y-auto rounded-lg border bg-white"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-mono text-sm font-semibold">
            {endpoint.method} {endpoint.path}
          </h3>

          <p className="text-muted-foreground text-xs">
            {buildFullUrl(
              baseUrl || getBaseFromUrl(endpoint.fullUrl, endpoint.path),
              endpoint.path
            )}
          </p>

          <p className="text-muted-foreground mt-1 text-[11px]">
            {updatedAt
              ? `Updated ${new Date(updatedAt).toLocaleString()}`
              : null}
          </p>
        </div>

        <div>
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
        {activeTab === 'meta' && (
          <>
            <section>
              <h4 className="mb-1 text-xs font-semibold tracking-wide uppercase">
                Auth requirement
              </h4>
              <p className="text-sm text-[#374151]">
                {authLabel(endpoint.auth)}
              </p>
            </section>

            <section>
              <h4 className="mb-2 text-xs font-semibold tracking-wide uppercase">
                API schema
              </h4>
              <EndpointSchemaView
                data={{
                  requestSchema: endpoint.requestSchema,
                  responseSchema: endpoint.responseSchema,
                  statusCodes: endpoint.statusCodes,
                  parameters: endpoint.parameters,
                }}
              />
            </section>

            {responses.length > 0 && (
              <section>
                <h4 className="mb-2 text-xs font-semibold tracking-wide uppercase">
                  Responses
                </h4>
                <div className="overflow-hidden rounded-md border">
                  {responses.map(([status, description]) => (
                    <div
                      key={status}
                      className="flex items-start justify-between gap-2 border-b px-3 py-2 text-sm last:border-b-0"
                    >
                      <span className="font-mono font-medium">{status}</span>
                      <span className="text-muted-foreground text-right">
                        {description || 'Response'}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <ConfigureApiEndpointMeta
              key={endpoint.endpointId}
              endpoint={endpoint.apiEndpoint}
              componentMeta={endpoint.componentMeta}
              readonly={readonly}
              className="px-0"
              hideFooter
              lockedFieldLabels={
                isSpecOwned ? ['method', 'url', 'protocol'] : []
              }
              onDirtyChange={setIsMetaDirty}
              onBindActions={setMetaActions}
            />
          </>
        )}

        {activeTab === 'tryit' && (
          <EndpointTryItTab
            method={endpoint.method}
            path={endpoint.path}
            baseUrl={baseUrl || getBaseFromUrl(endpoint.fullUrl, endpoint.path)}
            operationId={endpoint.operationId}
            authKind={
              openApiRuntime.hasSecuritySchemes
                ? openApiRuntime.operationAuth(endpoint.operationId)
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
          />
        )}

        {activeTab === 'connections' && (
          <ConfigureApiEndpointConnections endpoint={endpoint.apiEndpoint} />
        )}
      </div>

      <div className="sticky bottom-0 border-t bg-white px-4 py-3">
        {activeTab === 'meta' ? (
          <div className="flex items-center justify-end gap-2">
            <Button
              preset="outline"
              disabled={!isMetaDirty || readonly}
              onClick={() => metaActions?.reset()}
            >
              Cancel changes
            </Button>
            <Button
              preset="primary"
              disabled={!isMetaDirty || readonly}
              onClick={() => void metaActions?.submit()}
            >
              Update Endpoint
            </Button>
          </div>
        ) : null}
      </div>
    </DynamicScrollArea>
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
      { id: 'meta', label: 'Meta' },
      { id: 'samples', label: 'Samples' },
      { id: 'connections', label: 'Connections' },
    ],
    'meta'
  )
  const [isMetaDirty, setIsMetaDirty] = useState(false)
  const [metaActions, setMetaActions] = useState<{
    submit: () => Promise<boolean>
    reset: () => void
  } | null>(null)

  const nameField = fields.find(
    (field) => field?.label?.toLowerCase() === 'name'
  )
  const kindField = fields.find(
    (field) =>
      field?.label?.toLowerCase() === 'graphql operation type' ||
      field?.label?.toLowerCase() === 'operation type' ||
      field?.label?.toLowerCase() === 'kind'
  )

  const operationName = nameField?.componentFieldId
    ? (flattened[nameField.componentFieldId] as string)
    : 'N/A'
  const signature = getMetaValue(flattened, fields, ['signature'])
  const operationKind = kindField?.componentFieldId
    ? (flattened[kindField.componentFieldId] as string)
    : 'Query'
  const updatedAt =
    operation.apiEndpoint.updatedAt || operation.apiEndpoint.createdAt

  return (
    <DynamicScrollArea
      topOffset={164}
      bottomOffset={12}
      className="sticky top-3 w-full overflow-y-auto rounded-lg border bg-white"
    >
      <div className="sticky top-0 z-10 border-b bg-white px-4 py-3">
        <div className="mb-1 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <Badge
                variant="outline"
                className={`${getGraphQLOperationTypeColor(operationKind)} text-white`}
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
        {activeTab === 'meta' && (
          <ConfigureApiEndpointMeta
            key={operation.apiEndpoint.apiEndpointId}
            endpoint={operation.apiEndpoint}
            componentMeta={operation.componentMeta}
            readonly={readonly}
            className="px-0"
            hideFooter
            onDirtyChange={setIsMetaDirty}
            onBindActions={setMetaActions}
          />
        )}

        {activeTab === 'samples' && (
          <ConfigureApiEndpointSamples
            endpoint={operation.apiEndpoint}
            readonly={readonly}
          />
        )}

        {activeTab === 'connections' && (
          <ConfigureApiEndpointConnections endpoint={operation.apiEndpoint} />
        )}
      </div>

      <div className="sticky bottom-0 border-t bg-white px-4 py-3">
        {activeTab === 'meta' ? (
          <div className="flex items-center justify-end gap-2">
            <Button
              preset="outline"
              disabled={!isMetaDirty || readonly}
              onClick={() => metaActions?.reset()}
            >
              Cancel changes
            </Button>
            <Button
              preset="primary"
              disabled={!isMetaDirty || readonly}
              onClick={() => void metaActions?.submit()}
            >
              Update Operation
            </Button>
          </div>
        ) : null}
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
      { id: 'meta', label: 'Meta' },
      { id: 'samples', label: 'Samples' },
      { id: 'connections', label: 'Connections' },
    ],
    'meta'
  )
  const [isMetaDirty, setIsMetaDirty] = useState(false)
  const [metaActions, setMetaActions] = useState<{
    submit: () => Promise<boolean>
    reset: () => void
  } | null>(null)

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
  const updatedAt = method.apiEndpoint.updatedAt || method.apiEndpoint.createdAt
  const servicePath = packageName
    ? `${packageName}.${serviceName || ''}`
    : serviceName || 'N/A'

  return (
    <DynamicScrollArea
      topOffset={164}
      bottomOffset={12}
      className="sticky top-3 w-full overflow-y-auto rounded-lg border bg-white"
    >
      <div className="sticky top-0 z-10 border-b bg-white px-4 py-3">
        <div className="mb-1 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <Badge
                variant="outline"
                className={`${getGrpcStreamingTypeColor(streamingType)} text-white`}
              >
                {streamingType}
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
        {activeTab === 'meta' && (
          <ConfigureApiEndpointMeta
            key={method.apiEndpoint.apiEndpointId}
            endpoint={method.apiEndpoint}
            componentMeta={method.componentMeta}
            readonly={readonly}
            className="px-0"
            hideFooter
            onDirtyChange={setIsMetaDirty}
            onBindActions={setMetaActions}
          />
        )}

        {activeTab === 'samples' && (
          <ConfigureApiEndpointSamples
            endpoint={method.apiEndpoint}
            readonly={readonly}
          />
        )}

        {activeTab === 'connections' && (
          <ConfigureApiEndpointConnections endpoint={method.apiEndpoint} />
        )}
      </div>

      <div className="sticky bottom-0 border-t bg-white px-4 py-3">
        {activeTab === 'meta' ? (
          <div className="flex items-center justify-end gap-2">
            <Button
              preset="outline"
              disabled={!isMetaDirty || readonly}
              onClick={() => metaActions?.reset()}
            >
              Cancel changes
            </Button>
            <Button
              preset="primary"
              disabled={!isMetaDirty || readonly}
              onClick={() => void metaActions?.submit()}
            >
              Update Method
            </Button>
          </div>
        ) : null}
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

function methodColor(method: string): string {
  switch (method) {
    case 'GET':
      return 'bg-blue-500'
    case 'POST':
      return 'bg-green-500'
    case 'PUT':
      return 'bg-orange-500'
    case 'PATCH':
      return 'bg-yellow-500'
    case 'DELETE':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
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

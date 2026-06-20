'use client'

import {
  LegacyApiEndpoint,
  LegacyComponentMeta,
} from '@/features/services/api/api-v2-adapters'
import { normalizePath } from '@/utils/api/display'
import { flattenMetaData } from '@uigraph/sdk'
import { arrayNonNullable } from 'daily-code'

export type ApiOperationOption = {
  operationId: string
  label: string
}

type EndpointWithMeta = {
  apiEndpoint?: LegacyApiEndpoint | null
  componentMeta?: LegacyComponentMeta | null
}

type Protocol = 'rest' | 'graphql' | 'grpc'

function getMetaValue(
  metaData: Record<string, unknown>,
  fields: Array<{ label?: string | null; componentFieldId?: string | null }>,
  labels: string[]
): string | null {
  const labelsLower = new Set(labels.map((l) => l.toLowerCase()))
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

function deriveRestOperations(
  endpoints: EndpointWithMeta[]
): ApiOperationOption[] {
  return endpoints
    .filter((item) => item.apiEndpoint && item.componentMeta)
    .map((item) => {
      const endpoint = item.apiEndpoint!
      const meta = item.componentMeta!
      const fields = arrayNonNullable(meta.componentModalFields)
      const flattened = flattenMetaData(fields, fields)
      const url = getMetaValue(flattened, fields, ['url']) ?? ''
      const path = normalizePath(url, '')
      const method = (
        getMetaValue(flattened, fields, ['method']) ?? 'GET'
      ).toUpperCase()
      const summary =
        getMetaValue(flattened, fields, ['summary', 'label']) ?? ''
      const operationId =
        getMetaValue(flattened, fields, ['operation id', 'operationid']) ??
        endpoint.apiEndpointId ??
        ''
      const label = summary
        ? `${method} ${path} — ${summary}`
        : `${method} ${path}`
      return { operationId, label: label.trim() || operationId || 'Unnamed' }
    })
    .filter((op) => op.operationId.length > 0)
}

function deriveGraphQLOperations(
  endpoints: EndpointWithMeta[]
): ApiOperationOption[] {
  return endpoints
    .filter((item) => item.apiEndpoint && item.componentMeta)
    .map((item) => {
      const endpoint = item.apiEndpoint!
      const meta = item.componentMeta!
      const fields = arrayNonNullable(meta.componentModalFields)
      const flattened = flattenMetaData(fields, fields)
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
        : ''
      const kind = kindField?.componentFieldId
        ? (flattened[kindField.componentFieldId] as string)
        : 'Query'
      const signature = signatureField?.componentFieldId
        ? (flattened[signatureField.componentFieldId] as string)
        : ''
      const operationId = name || endpoint.apiEndpointId || ''
      const label = signature
        ? `${kind}: ${signature}`
        : name
          ? `${kind}: ${name}`
          : operationId || 'Unnamed'
      return { operationId, label }
    })
    .filter((op) => op.operationId.length > 0)
}

function deriveGrpcOperations(
  endpoints: EndpointWithMeta[]
): ApiOperationOption[] {
  return endpoints
    .filter((item) => item.apiEndpoint && item.componentMeta)
    .map((item) => {
      const endpoint = item.apiEndpoint!
      const meta = item.componentMeta!
      const fields = arrayNonNullable(meta.componentModalFields)
      const flattened = flattenMetaData(fields, fields)
      const methodNameField = fields.find(
        (f) =>
          f?.label?.toLowerCase() === 'grpc method name' ||
          f?.label?.toLowerCase() === 'method name'
      )
      const serviceNameField = fields.find(
        (f) =>
          f?.label?.toLowerCase() === 'grpc service name' ||
          f?.label?.toLowerCase() === 'service name'
      )
      const methodName = methodNameField?.componentFieldId
        ? (flattened[methodNameField.componentFieldId] as string)
        : 'N/A'
      const serviceName = serviceNameField?.componentFieldId
        ? (flattened[serviceNameField.componentFieldId] as string)
        : ''
      const operationId = serviceName
        ? `${serviceName}/${methodName}`
        : methodName
      const label = serviceName ? `${serviceName} / ${methodName}` : methodName
      return {
        operationId: operationId || endpoint.apiEndpointId || '',
        label: label || 'Unnamed',
      }
    })
    .filter((op) => op.operationId.length > 0)
}

/**
 * Derive a list of { operationId, label } from v1GetAPIEndpointsWithMeta
 * for use in test case operation selection. Works for REST (OpenAPI), GraphQL, and gRPC.
 */
export function deriveApiOperations(
  protocol: Protocol,
  endpointsWithMeta: EndpointWithMeta[]
): ApiOperationOption[] {
  const list = endpointsWithMeta.filter(
    (e) => e.apiEndpoint != null && e.componentMeta != null
  )
  switch (protocol) {
    case 'rest':
      return deriveRestOperations(list)
    case 'graphql':
      return deriveGraphQLOperations(list)
    case 'grpc':
      return deriveGrpcOperations(list)
    default:
      return deriveRestOperations(list)
  }
}

/**
 * Infer protocol from an API group (same fallbacks as service-api-endpoints context).
 */
export function getProtocolFromApiGroup(group: {
  protocol?: string | null
  graphqlSpecFileIds?: Array<string | null> | null
  grpcSpecFileIds?: Array<string | null> | null
  openApiSpecFileId?: string | null
  swaggerSpecFileId?: string | null
}): Protocol {
  if (group.protocol) {
    const p = group.protocol.toLowerCase()
    if (p === 'graphql') return 'graphql'
    if (p === 'grpc') return 'grpc'
    if (p === 'rest' || p === 'openapi' || p === 'swagger') return 'rest'
  }
  if (group.graphqlSpecFileIds && group.graphqlSpecFileIds.length > 0)
    return 'graphql'
  if (group.grpcSpecFileIds && group.grpcSpecFileIds.length > 0) return 'grpc'
  if (group.openApiSpecFileId || group.swaggerSpecFileId) return 'rest'
  return 'rest'
}

import { GT } from '@/api'
import { ComponentInputType } from '@uigraph/sdk'
import type { DashboardAPIEndpoint, DashboardAPIGroup } from './api-endpoints'
import type { DashboardAPIGroupVersion } from './api-group-version'
import { canonicalizeSampleJson, parseJsonDeep } from '@/utils/api/openapi-display'

export type LegacyApiEndpoint = {
  apiEndpointId?: string | null
  componentMetaId?: string | null
  createdAt?: string | null
  createdBy?: string | null
  deletedAt?: string | null
  deletedBy?: string | null
  exampleRequests?: (string | null)[] | null
  exampleResponses?: (string | null)[] | null
  order?: number | null
  serviceApiGroupId?: string | null
  updatedAt?: string | null
  updatedBy?: string | null
}

export type LegacyComponentMeta = {
  componentFlowDiagram?: string | null
  componentFlowDiagramName?: string | null
  componentId?: string | null
  componentMetaId?: string | null
  componentModalFields?: (GT.ComponentModalField | null)[] | null
  createdAt?: string | null
  createdBy?: string | null
  deletedAt?: string | null
  deletedBy?: string | null
  organizationId?: string | null
  updatedAt?: string | null
  updatedBy?: string | null
}

/** Legacy-shaped API group for components not yet fully migrated. */
export type LegacyAPIGroupView = {
  serviceApiGroupId: string
  serviceId: string
  name: string
  version: string
  protocol: string
  openApiSpecFileId?: string | null
  swaggerSpecFileId?: string | null
  graphqlSpecFileIds?: string[] | null
  grpcSpecFileIds?: string[] | null
  restEndpointsCount?: number | null
  graphQLOperationsCount?: number | null
  grpcRpcsCount?: number | null
  createdBy?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

function toExampleSamples(
  examplesField?: string | null,
  legacySchemaField?: string | null
): string[] | null {
  const fromExamples = parseExampleSamplesField(examplesField)
  if (fromExamples && fromExamples.length > 0) return fromExamples
  return parseExampleSamplesField(legacySchemaField)
}

function parseExampleSamplesField(value?: string | null): string[] | null {
  if (!value || value === '[]') return null

  const parsed = parseJsonDeep(value)
  if (parsed === null) return [value]

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) return null
    return parsed.map((item) =>
      typeof item === 'string'
        ? canonicalizeSampleJson(item)
        : JSON.stringify(item)
    )
  }

  if (typeof parsed === 'object') {
    return [JSON.stringify(parsed)]
  }

  return [value]
}

function metaField(
  label: string,
  value: string | null | undefined,
  order: number,
  type: string = ComponentInputType.TextInput
): GT.ComponentModalField {
  const componentFieldId = `api-${label.toLowerCase().replace(/\s+/g, '-')}`
  const text = value ?? ''
  return {
    componentFieldId,
    label,
    type,
    order,
    data: text ? [{ value: text }] : [],
  }
}

/** Legacy-shaped endpoint row used by service-apis and row components. */
export type LegacyEndpointWithMeta = {
  apiEndpoint: LegacyApiEndpoint & {
    apiEndpointId: string
    serviceApiGroupId: string
    componentMetaId: string
  }
  componentMeta: LegacyComponentMeta & {
    componentMetaId: string
    organizationId?: string | null
    componentModalFields: GT.ComponentModalField[]
  }
}

export type LegacyAPIGroupVersion = {
  versionId: string
  apiGroupId: string
  versionNumber: number
  label?: string | null
  createdBy?: string | null
  createdAt?: string | null
  isAutoVersion?: boolean | null
}

export function apiGroupToLegacy(group: DashboardAPIGroup): LegacyAPIGroupView {
  const protocol = (group.protocol ?? 'REST').toLowerCase()
  const specRef = group.specKey ?? undefined
  return {
    serviceApiGroupId: group.id,
    serviceId: group.serviceId,
    name: group.name,
    version: group.version,
    protocol: group.protocol,
    openApiSpecFileId: protocol === 'rest' ? specRef : undefined,
    swaggerSpecFileId: undefined,
    graphqlSpecFileIds:
      protocol === 'graphql' && specRef ? [specRef] : undefined,
    grpcSpecFileIds: protocol === 'grpc' && specRef ? [specRef] : undefined,
    createdBy: group.createdBy,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
  }
}

export function apiGroupVersionToLegacy(
  v: DashboardAPIGroupVersion
): LegacyAPIGroupVersion {
  return {
    versionId: v.id,
    apiGroupId: v.apiGroupId,
    versionNumber: v.versionNumber,
    label: v.label,
    createdBy: v.createdBy,
    createdAt: v.createdAt,
    isAutoVersion: v.isAutoVersion,
  }
}

type GrpcServiceMetadata = {
  packageName?: string
  serviceName?: string
  requestType?: string
  responseType?: string
}

function parseGrpcServiceMetadata(raw?: string | null): GrpcServiceMetadata {
  if (!raw) return {}
  try {
    return JSON.parse(raw) as GrpcServiceMetadata
  } catch {
    return {}
  }
}

function graphqlFields(
  endpoint: DashboardAPIEndpoint
): GT.ComponentModalField[] {
  return [
    metaField('Name', endpoint.operationId, 0),
    metaField('GraphQL Operation Type', endpoint.method, 1),
    metaField('Signature', endpoint.path, 2),
    metaField('Description', endpoint.description, 3),
    metaField(
      'Parameters',
      endpoint.parameters,
      4,
      ComponentInputType.CodeEditor
    ),
    metaField(
      'Request Schema',
      endpoint.requestBody,
      5,
      ComponentInputType.CodeEditor
    ),
    metaField(
      'Response Schema',
      endpoint.responses,
      6,
      ComponentInputType.CodeEditor
    ),
  ]
}

function grpcFields(endpoint: DashboardAPIEndpoint): GT.ComponentModalField[] {
  const grpcMeta = parseGrpcServiceMetadata(endpoint.parameters)
  return [
    metaField('gRPC Method Name', endpoint.operationId, 0),
    metaField('gRPC Service Name', grpcMeta.serviceName, 1),
    metaField('Package Name', grpcMeta.packageName, 2),
    metaField('gRPC RPC Type', endpoint.method, 3),
    metaField('Request Type', grpcMeta.requestType, 4),
    metaField('Response Type', grpcMeta.responseType, 5),
    metaField(
      'Proto Snippet',
      endpoint.summary,
      6,
      ComponentInputType.CodeEditor
    ),
    metaField('Description', endpoint.description, 7),
    metaField(
      'Request Schema',
      endpoint.requestBody,
      8,
      ComponentInputType.CodeEditor
    ),
    metaField(
      'Response Schema',
      endpoint.responses,
      9,
      ComponentInputType.CodeEditor
    ),
  ]
}

function restFields(endpoint: DashboardAPIEndpoint): GT.ComponentModalField[] {
  return [
    metaField('Method', endpoint.method, 0),
    metaField('URL', endpoint.path, 1),
    metaField('Summary', endpoint.summary, 2),
    metaField('Description', endpoint.description, 3),
    metaField(
      'Request Schema',
      endpoint.requestBody,
      4,
      ComponentInputType.CodeEditor
    ),
    metaField(
      'Response Schema',
      endpoint.responses,
      5,
      ComponentInputType.CodeEditor
    ),
    metaField(
      'Parameters',
      endpoint.parameters,
      6,
      ComponentInputType.CodeEditor
    ),
  ]
}

export function endpointToLegacyWithMeta(
  endpoint: DashboardAPIEndpoint,
  orgId: string,
  protocol: string = 'rest'
): LegacyEndpointWithMeta {
  const normalizedProtocol = protocol.toLowerCase()
  const fields =
    normalizedProtocol === 'graphql'
      ? graphqlFields(endpoint)
      : normalizedProtocol === 'grpc'
        ? grpcFields(endpoint)
        : restFields(endpoint)

  return {
    apiEndpoint: {
      apiEndpointId: endpoint.id,
      serviceApiGroupId: endpoint.apiGroupId,
      componentMetaId: endpoint.id,
      exampleRequests: toExampleSamples(
        endpoint.exampleRequests,
        endpoint.requestBody
      ),
      exampleResponses: toExampleSamples(
        endpoint.exampleResponses,
        endpoint.responses
      ),
      order: endpoint.order,
      createdAt: endpoint.createdAt,
      updatedAt: endpoint.updatedAt,
    },
    componentMeta: {
      componentMetaId: endpoint.id,
      organizationId: orgId,
      componentModalFields: fields,
    },
  }
}

export function endpointsToLegacyWithMeta(
  endpoints: DashboardAPIEndpoint[],
  orgId: string,
  protocol: string = 'rest'
): LegacyEndpointWithMeta[] {
  return endpoints.map((e) => endpointToLegacyWithMeta(e, orgId, protocol))
}

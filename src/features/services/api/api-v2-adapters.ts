import { V2 } from '@/api'
import { ComponentInputType } from '@uigraph/sdk'
import type {
  DashboardAPIEndpoint,
  DashboardAPIGroup,
} from './api-endpoints-v2'
import type { DashboardAPIGroupVersion } from './api-group-version-v2'

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
  componentModalFields?: (V2.ComponentModalField | null)[] | null
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

function toExampleSamples(value?: string | null): string[] | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value) as unknown
    if (Array.isArray(parsed)) {
      return parsed.map((item) =>
        typeof item === 'string' ? item : JSON.stringify(item)
      )
    }
    return [value]
  } catch {
    return [value]
  }
}

function metaField(
  label: string,
  value: string | null | undefined,
  order: number,
  type: string = ComponentInputType.TextInput
): V2.ComponentModalField {
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
    componentModalFields: V2.ComponentModalField[]
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

export function endpointToLegacyWithMeta(
  endpoint: DashboardAPIEndpoint,
  orgId: string
): LegacyEndpointWithMeta {
  const fields: V2.ComponentModalField[] = [
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

  return {
    apiEndpoint: {
      apiEndpointId: endpoint.id,
      serviceApiGroupId: endpoint.apiGroupId,
      componentMetaId: endpoint.id,
      exampleRequests: toExampleSamples(endpoint.requestBody),
      exampleResponses: toExampleSamples(endpoint.responses),
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
  orgId: string
): LegacyEndpointWithMeta[] {
  return endpoints.map((e) => endpointToLegacyWithMeta(e, orgId))
}

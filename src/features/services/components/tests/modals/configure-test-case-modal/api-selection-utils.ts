import {
  LegacyApiEndpoint,
  LegacyComponentMeta,
} from '@/features/services/api/api-v2-adapters'
import { normalizePath } from '@/utils/api/display'
import { flattenMetaData } from '@uigraph/sdk'
import { arrayNonNullable } from 'daily-code'

type EndpointWithMeta = {
  apiEndpoint?: LegacyApiEndpoint | null
  componentMeta?: LegacyComponentMeta | null
}

export type ParsedApiSpec = {
  serviceId: string
  apiGroupId: string
}

export type RestEndpointOption = {
  value: string
  label: string
  method: string
  authType: string
  authValue: string
  apiKeyHeader: string
  apiKeyValue: string
  headers: Array<{ key: string; value: string }>
  queryParams: Array<{ key: string; value: string }>
  requestBody: string
  expectedStatus: string
  responseBody: string
}

export function buildApiSpecValue(serviceId: string, apiGroupId: string) {
  return `${serviceId}:${apiGroupId}`
}

export function parseApiSpecValue(value?: string | null): ParsedApiSpec {
  if (!value) {
    return { serviceId: '', apiGroupId: '' }
  }

  const [serviceId = '', apiGroupId = ''] = value.split(':')
  return { serviceId, apiGroupId }
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
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
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

export function deriveRestEndpointOptions(
  endpointsWithMeta: EndpointWithMeta[]
): RestEndpointOption[] {
  return endpointsWithMeta
    .filter((item) => item.apiEndpoint && item.componentMeta)
    .map((item) => {
      const endpoint = item.apiEndpoint!
      const fields = arrayNonNullable(item.componentMeta!.componentModalFields)
      const flattened = flattenMetaData(fields, fields)
      const method = (
        getMetaValue(flattened, fields, ['method']) ?? 'GET'
      ).toUpperCase()
      const url = getMetaValue(flattened, fields, ['url']) ?? ''
      const path = normalizePath(url, '')
      const summary =
        getMetaValue(flattened, fields, ['summary', 'label']) ?? ''
      const authType = getAuthType(
        getMetaValue(flattened, fields, ['authentication'])
      )
      const parameters = getParameterDefaults(
        getMetaValue(flattened, fields, ['parameters']),
        authType
      )
      const requestBody = getBodyExample(
        endpoint.exampleRequests?.[0],
        getMetaValue(flattened, fields, ['request example']),
        getMetaValue(flattened, fields, ['request schema'])
      )
      const responseBody = getBodyExample(
        endpoint.exampleResponses?.[0],
        null,
        getMetaValue(flattened, fields, ['response schema']),
        ''
      )
      const label = summary
        ? `${method} ${path} - ${summary}`
        : `${method} ${path}`
      const headers = [...parameters.headers]

      if (
        requestBody &&
        !headers.some((header) => header.key.toLowerCase() === 'content-type')
      ) {
        headers.unshift({ key: 'Content-Type', value: 'application/json' })
      }

      return {
        value: endpoint.apiEndpointId ?? '',
        label: label.trim() || endpoint.apiEndpointId || 'Unnamed endpoint',
        method,
        authType,
        authValue: '',
        apiKeyHeader: parameters.apiKeyHeader,
        apiKeyValue: parameters.apiKeyValue,
        headers,
        queryParams: parameters.queryParams,
        requestBody,
        expectedStatus: getExpectedStatus(
          getMetaValue(flattened, fields, ['status codes'])
        ),
        responseBody,
      }
    })
    .filter((option) => option.value)
}

function getAuthType(value: string | null): string {
  const normalized = (value || '').toLowerCase()

  if (
    !normalized ||
    normalized.includes('none') ||
    normalized.includes('public')
  ) {
    return 'None'
  }
  if (normalized.includes('bearer') || normalized.includes('jwt')) {
    return 'Bearer Token'
  }
  if (normalized.includes('api key') || normalized.includes('api-key')) {
    return 'API Key'
  }
  if (normalized.includes('basic')) {
    return 'Basic Auth'
  }
  if (normalized.includes('oauth')) {
    return 'OAuth 2.0'
  }

  return ''
}

function getParameterDefaults(parametersJson: string | null, authType: string) {
  const headers: Array<{ key: string; value: string }> = []
  const queryParams: Array<{ key: string; value: string }> = []
  let apiKeyHeader = ''
  let apiKeyValue = ''

  if (!parametersJson) {
    return { headers, queryParams, apiKeyHeader, apiKeyValue }
  }

  try {
    const params = JSON.parse(parametersJson) as Array<{
      Name?: string
      In?: string
      Default?: string
      Schema?: { default?: unknown; example?: unknown }
    }>

    for (const param of params) {
      if (!param.Name) continue

      const value = String(
        param.Default ?? param.Schema?.default ?? param.Schema?.example ?? ''
      )

      if (param.In === 'query') {
        queryParams.push({ key: param.Name, value })
      }

      if (param.In === 'header') {
        const normalizedName = param.Name.toLowerCase()

        if (authType === 'Bearer Token' && normalizedName === 'authorization') {
          continue
        }

        if (
          authType === 'API Key' &&
          (normalizedName.includes('api-key') ||
            normalizedName.includes('apikey'))
        ) {
          apiKeyHeader = param.Name
          apiKeyValue = value
          continue
        }

        headers.push({ key: param.Name, value })
      }
    }
  } catch {
    return { headers, queryParams, apiKeyHeader, apiKeyValue }
  }

  return { headers, queryParams, apiKeyHeader, apiKeyValue }
}

function getBodyExample(
  sample: string | null | undefined,
  example: string | null,
  schemaJson: string | null,
  fallback = ''
) {
  const directExample = sample?.trim() || example?.trim()

  if (directExample) {
    try {
      return JSON.stringify(JSON.parse(directExample), null, 2)
    } catch {
      return directExample
    }
  }

  if (!schemaJson) {
    return fallback
  }

  try {
    const schema = JSON.parse(schemaJson) as {
      example?: unknown
      examples?: Record<string, { value?: unknown }>
      properties?: Record<string, { example?: unknown; default?: unknown }>
    }

    if (schema.example !== undefined) {
      return JSON.stringify(schema.example, null, 2)
    }

    if (schema.examples && Object.keys(schema.examples).length > 0) {
      const firstExample = Object.values(schema.examples)[0]
      if (firstExample?.value !== undefined) {
        return JSON.stringify(firstExample.value, null, 2)
      }
    }

    if (schema.properties) {
      const nextExample: Record<string, unknown> = {}

      for (const [key, property] of Object.entries(schema.properties)) {
        if (property.example !== undefined) {
          nextExample[key] = property.example
          continue
        }

        if (property.default !== undefined) {
          nextExample[key] = property.default
        }
      }

      if (Object.keys(nextExample).length > 0) {
        return JSON.stringify(nextExample, null, 2)
      }
    }
  } catch {
    return fallback
  }

  return fallback
}

function getExpectedStatus(statusCodesJson: string | null) {
  if (!statusCodesJson) {
    return ''
  }

  try {
    const parsed = JSON.parse(statusCodesJson) as Record<string, unknown>
    const codes = Object.keys(parsed).filter((key) => key.trim())
    const successCode = codes.find((code) => /^2\d\d$/.test(code))
    return successCode ?? codes.sort()[0] ?? ''
  } catch {
    return ''
  }
}

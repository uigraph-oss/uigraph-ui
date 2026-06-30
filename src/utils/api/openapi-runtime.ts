export type AuthKind = 'none' | 'bearer' | 'api-key' | 'oauth2' | 'other'

type SecurityScheme = {
  type?: string
  scheme?: string
  name?: string
  in?: string
}

type RawResponseContent = {
  schema?: Record<string, unknown>
  example?: unknown
  examples?: Record<string, { value?: unknown }>
}

type RawResponseSpec = {
  description?: string
  content?: Record<string, RawResponseContent>
  schema?: Record<string, unknown>
  examples?: Record<string, unknown>
}

type RawParameter = {
  name?: string
  in?: string
  required?: boolean
  description?: string
  schema?: Record<string, unknown>
}

type RawRequestBodyContent = {
  schema?: Record<string, unknown>
}

type RawRequestBody = {
  required?: boolean
  content?: Record<string, RawRequestBodyContent>
}

type RawOperation = {
  operationId?: string
  security?: Array<Record<string, string[]>>
  responses?: Record<string, RawResponseSpec>
  parameters?: RawParameter[]
  requestBody?: RawRequestBody
}

export type SpecResponseData = {
  schema: Record<string, unknown> | null
  example: string | null
  description: string | null
}

export type SpecRequestBodyData = {
  schema: Record<string, unknown> | null
  contentType: string
  required: boolean
}

export type SpecParameterData = {
  name: string
  in: string
  required: boolean
  description: string
  schema: Record<string, unknown> | null
}

type OpenApiSpecLike = {
  servers?: Array<{
    url?: string
    description?: string
    variables?: Record<
      string,
      {
        default?: string
        enum?: string[]
      }
    >
  }>
  components?: {
    securitySchemes?: Record<string, SecurityScheme>
    schemas?: Record<string, Record<string, unknown>>
    [key: string]: unknown
  }
  definitions?: Record<string, Record<string, unknown>>
  security?: Array<Record<string, string[]>>
  paths?: Record<
    string,
    Record<string, RawOperation> & { parameters?: RawParameter[] }
  >
}

type ServerConfig = NonNullable<OpenApiSpecLike['servers']>[number]

export type OpenApiRuntime = {
  servers: NonNullable<OpenApiSpecLike['servers']>
  defaultServer: ServerConfig | null
  envOptions: string[]
  defaultEnv: string | null
  securitySchemes: Record<string, SecurityScheme>
  hasSecuritySchemes: boolean
  basePath: string | null
  resolveBaseUrl: (
    envSelection: string,
    fallbackBaseUrl?: string | null
  ) => string
  resolveServerUrl: (
    server: ServerConfig | null | undefined,
    envSelection: string,
    fallbackBaseUrl?: string | null
  ) => string
  operationAuth: (operationId?: string | null) => AuthKind
  operationResponses: (
    operationId: string | null | undefined
  ) => Record<string, SpecResponseData>
  operationRequestBody: (
    operationId: string | null | undefined
  ) => SpecRequestBodyData | null
  operationParameters: (
    operationId: string | null | undefined
  ) => SpecParameterData[]
  /** Look up by HTTP method + path (e.g. "POST", "/auth/register"). More reliable than operationId. */
  operationRequestBodyByPath: (
    method: string,
    path: string
  ) => SpecRequestBodyData | null
  operationParametersByPath: (
    method: string,
    path: string
  ) => SpecParameterData[]
  operationResponsesByPath: (
    method: string,
    path: string
  ) => Record<string, SpecResponseData>
  operationAuthByPath: (method: string, path: string) => AuthKind
  /** Resolve a JSON Pointer $ref such as "#/components/schemas/Product" */
  resolveRef: (ref: string) => Record<string, unknown> | null
}

export function createOpenApiRuntime(
  spec: OpenApiSpecLike | null | undefined
): OpenApiRuntime {
  const servers = Array.isArray(spec?.servers) ? spec!.servers! : []
  const defaultServer = servers[0] ?? null
  const envOptions = getEnvironmentOptions(servers)
  const defaultEnv = envOptions[0] ?? null

  const securitySchemes = spec?.components?.securitySchemes ?? {}
  const hasSecuritySchemes = Object.keys(securitySchemes).length > 0
  const globalSecurity = spec?.security
  const operationAuthMap = buildOperationAuthMap(
    spec,
    securitySchemes,
    globalSecurity
  )
  const operationResponsesMap = buildOperationResponsesMap(spec)
  const operationRequestBodyMap = buildOperationRequestBodyMap(spec)
  const operationParametersMap = buildOperationParametersMap(spec)
  const pathMethodRequestBodyMap = buildPathMethodRequestBodyMap(spec)
  const pathMethodParametersMap = buildPathMethodParametersMap(spec)
  const pathMethodResponsesMap = buildPathMethodResponsesMap(spec)
  const pathMethodAuthMap = buildPathMethodAuthMap(
    spec,
    securitySchemes,
    globalSecurity
  )
  const globalAuth = inferAuthFromSecurityRequirements(
    globalSecurity,
    securitySchemes
  )

  // Extract base path from server URL (everything after domain, e.g., /project-manager)
  const basePath = extractBasePath(defaultServer?.url)

  return {
    servers,
    defaultServer,
    envOptions,
    defaultEnv,
    securitySchemes,
    hasSecuritySchemes,
    basePath,
    resolveBaseUrl(envSelection, fallbackBaseUrl) {
      return resolveBaseUrlFromServer(
        defaultServer,
        envSelection,
        fallbackBaseUrl
      )
    },
    resolveServerUrl(server, envSelection, fallbackBaseUrl) {
      return resolveBaseUrlFromServer(
        server ?? defaultServer,
        envSelection,
        fallbackBaseUrl
      )
    },
    operationAuth(operationId) {
      if (!hasSecuritySchemes) return 'none'
      if (!operationId) return globalAuth
      return operationAuthMap.get(operationId) ?? globalAuth
    },
    operationResponses(operationId) {
      if (!operationId) return {}
      return operationResponsesMap.get(operationId.trim()) ?? {}
    },
    operationRequestBody(operationId) {
      if (!operationId) return null
      return operationRequestBodyMap.get(operationId.trim()) ?? null
    },
    operationParameters(operationId) {
      if (!operationId) return []
      return operationParametersMap.get(operationId.trim()) ?? []
    },
    operationRequestBodyByPath(method, path) {
      return pathMethodRequestBodyMap.get(pathKey(method, path)) ?? null
    },
    operationParametersByPath(method, path) {
      return pathMethodParametersMap.get(pathKey(method, path)) ?? []
    },
    operationResponsesByPath(method, path) {
      return pathMethodResponsesMap.get(pathKey(method, path)) ?? {}
    },
    operationAuthByPath(method, path) {
      if (!hasSecuritySchemes) return 'none'
      return pathMethodAuthMap.get(pathKey(method, path)) ?? globalAuth
    },
    resolveRef(ref) {
      return resolveRefFromSpec(spec, ref)
    },
  }
}

/** Resolve a JSON Pointer $ref (e.g. "#/components/schemas/Product") against the spec. */
function resolveRefFromSpec(
  spec: OpenApiSpecLike | null | undefined,
  ref: string
): Record<string, unknown> | null {
  if (!spec || !ref.startsWith('#/')) return null
  const parts = ref.slice(2).split('/')
  let current: unknown = spec
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return null
    current = (current as Record<string, unknown>)[part]
  }
  if (current == null || typeof current !== 'object') return null
  return current as Record<string, unknown>
}

function pathKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`
}

function extractBasePath(serverUrl?: string | null): string | null {
  if (!serverUrl) return null
  try {
    const url = new URL(serverUrl.replace(/\{[^}]+\}/g, 'placeholder'))
    const pathname = url.pathname
    return pathname && pathname !== '/' ? pathname : null
  } catch {
    // Fallback: extract path manually
    const match = serverUrl.match(/https?:\/\/[^/]+(\/[^?]*)/i)
    if (match && match[1] && match[1] !== '/') {
      return match[1]
    }
    return null
  }
}

function getEnvironmentOptions(servers: OpenApiRuntime['servers']): string[] {
  for (const server of servers) {
    const vars = server.variables ?? {}
    const entries = Object.entries(vars)
    const envVar =
      entries.find(([key]) => /env|stage|environment/i.test(key)) ??
      entries.find(
        ([, value]) => Array.isArray(value.enum) && value.enum.length > 0
      )

    if (!envVar) continue
    const values = envVar[1].enum ?? []
    const unique = Array.from(
      new Set(values.map((value) => value.trim()).filter(Boolean))
    )
    if (unique.length > 0) return unique
  }
  return []
}

function resolveBaseUrlFromServer(
  server: OpenApiRuntime['defaultServer'],
  envSelection: string,
  fallbackBaseUrl?: string | null
): string {
  const rawUrl = server?.url?.trim()
  if (!rawUrl) return (fallbackBaseUrl || '').trim()

  const env = envSelection.trim().toLowerCase()
  const variables = server?.variables ?? {}
  const replacements: Record<string, string> = {}

  for (const [key, value] of Object.entries(variables)) {
    const varValue = value as { default?: string; enum?: string[] }
    const enumValues = varValue.enum ?? []
    const envMatch =
      enumValues.find((item: string) => item.toLowerCase() === env) ??
      enumValues.find((item: string) => item.toLowerCase().includes(env)) ??
      varValue.default ??
      enumValues[0] ??
      ''
    replacements[key] = envMatch
  }

  const resolved = rawUrl.replace(
    /\{([^}]+)\}/g,
    (_match: string, variableName: string) => {
      return replacements[variableName] ?? ''
    }
  )
  return resolved.trim() || (fallbackBaseUrl || '').trim()
}

const HTTP_METHODS = new Set([
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'head',
  'options',
  'trace',
])

function buildPathMethodRequestBodyMap(
  spec: OpenApiSpecLike | null | undefined
): Map<string, SpecRequestBodyData> {
  const map = new Map<string, SpecRequestBodyData>()
  const paths = spec?.paths ?? {}

  for (const [specPath, pathItem] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(pathItem ?? {})) {
      if (!HTTP_METHODS.has(method.toLowerCase())) continue
      const op = operation as RawOperation
      if (!op?.requestBody) continue

      const rb = op.requestBody
      let schema: Record<string, unknown> | null = null
      let contentType = 'application/json'

      if (rb.content) {
        const jsonContent = rb.content['application/json']
        if (jsonContent?.schema) {
          schema = jsonContent.schema
        } else {
          const first = Object.entries(rb.content)[0]
          if (first) {
            contentType = first[0]
            schema = first[1]?.schema ?? null
          }
        }
      }

      map.set(pathKey(method, specPath), {
        schema,
        contentType,
        required: rb.required ?? false,
      })
    }
  }
  return map
}

function buildPathMethodParametersMap(
  spec: OpenApiSpecLike | null | undefined
): Map<string, SpecParameterData[]> {
  const map = new Map<string, SpecParameterData[]>()
  const paths = spec?.paths ?? {}

  for (const [specPath, pathItem] of Object.entries(paths)) {
    const pathLevelParams: RawParameter[] =
      ((pathItem as Record<string, unknown>).parameters as RawParameter[]) ?? []

    for (const [method, operation] of Object.entries(pathItem ?? {})) {
      if (!HTTP_METHODS.has(method.toLowerCase())) continue
      const op = operation as RawOperation

      const merged = [...pathLevelParams, ...(op?.parameters ?? [])]
      const params: SpecParameterData[] = merged
        .filter((p) => p?.name)
        .map((p) => ({
          name: p.name ?? '',
          in: p.in ?? 'query',
          required: p.required ?? false,
          description: p.description ?? '',
          schema: p.schema ?? null,
        }))

      if (params.length > 0) {
        map.set(pathKey(method, specPath), params)
      }
    }
  }
  return map
}

function buildPathMethodResponsesMap(
  spec: OpenApiSpecLike | null | undefined
): Map<string, Record<string, SpecResponseData>> {
  const map = new Map<string, Record<string, SpecResponseData>>()
  const paths = spec?.paths ?? {}

  for (const [specPath, pathItem] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(pathItem ?? {})) {
      if (!HTTP_METHODS.has(method.toLowerCase())) continue
      const op = operation as RawOperation
      if (!op?.responses) continue

      const responseData: Record<string, SpecResponseData> = {}
      for (const [statusCode, resp] of Object.entries(op.responses)) {
        if (!resp) continue

        let schema: Record<string, unknown> | null = null
        let example: string | null = null
        const description = resp.description ?? null

        const jsonContent = resp.content?.['application/json']
        if (jsonContent) {
          if (jsonContent.schema) schema = jsonContent.schema
          if (jsonContent.example !== undefined) {
            try {
              example = JSON.stringify(jsonContent.example, null, 2)
            } catch {}
          } else if (jsonContent.examples) {
            const firstVal = Object.values(jsonContent.examples)[0]?.value
            if (firstVal !== undefined) {
              try {
                example = JSON.stringify(firstVal, null, 2)
              } catch {}
            }
          }
        }

        if (!schema && resp.schema) schema = resp.schema
        if (!example && resp.examples?.['application/json'] !== undefined) {
          try {
            example = JSON.stringify(resp.examples['application/json'], null, 2)
          } catch {}
        }

        // Always store every response code, even description-only ones
        responseData[statusCode] = { schema, example, description }
      }

      if (Object.keys(responseData).length > 0) {
        map.set(pathKey(method, specPath), responseData)
      }
    }
  }
  return map
}

function buildPathMethodAuthMap(
  spec: OpenApiSpecLike | null | undefined,
  schemes: Record<string, SecurityScheme>,
  globalSecurity: Array<Record<string, string[]>> | undefined
): Map<string, AuthKind> {
  const map = new Map<string, AuthKind>()
  const paths = spec?.paths ?? {}

  for (const [specPath, pathItem] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(pathItem ?? {})) {
      if (!HTTP_METHODS.has(method.toLowerCase())) continue
      const op = operation as RawOperation
      map.set(
        pathKey(method, specPath),
        resolveOperationAuth(op?.security, globalSecurity, schemes)
      )
    }
  }
  return map
}

function buildOperationAuthMap(
  spec: OpenApiSpecLike | null | undefined,
  schemes: Record<string, SecurityScheme>,
  globalSecurity: Array<Record<string, string[]>> | undefined
): Map<string, AuthKind> {
  const map = new Map<string, AuthKind>()
  const paths = spec?.paths ?? {}

  for (const pathItem of Object.values(paths)) {
    for (const [method, operation] of Object.entries(pathItem ?? {})) {
      if (method === 'parameters') continue
      const op = operation as RawOperation
      const operationId = op?.operationId?.trim()
      if (!operationId) continue
      map.set(
        operationId,
        resolveOperationAuth(op?.security, globalSecurity, schemes)
      )
    }
  }

  return map
}

function resolveOperationAuth(
  operationSecurity: Array<Record<string, string[]>> | undefined,
  globalSecurity: Array<Record<string, string[]>> | undefined,
  schemes: Record<string, SecurityScheme>
): AuthKind {
  const requirements =
    operationSecurity !== undefined ? operationSecurity : globalSecurity
  return inferAuthFromSecurityRequirements(requirements, schemes)
}

function buildOperationRequestBodyMap(
  spec: OpenApiSpecLike | null | undefined
): Map<string, SpecRequestBodyData> {
  const map = new Map<string, SpecRequestBodyData>()
  const paths = spec?.paths ?? {}

  for (const pathItem of Object.values(paths)) {
    for (const [method, operation] of Object.entries(pathItem ?? {})) {
      if (method === 'parameters') continue
      const op = operation as RawOperation
      if (!op?.requestBody) continue
      const operationId = op.operationId?.trim()
      if (!operationId) continue

      const rb = op.requestBody
      let schema: Record<string, unknown> | null = null
      let contentType = 'application/json'

      if (rb.content) {
        const jsonContent = rb.content['application/json']
        if (jsonContent?.schema) {
          schema = jsonContent.schema
        } else {
          const first = Object.entries(rb.content)[0]
          if (first) {
            contentType = first[0]
            schema = first[1]?.schema ?? null
          }
        }
      }

      map.set(operationId, {
        schema,
        contentType,
        required: rb.required ?? false,
      })
    }
  }
  return map
}

function buildOperationParametersMap(
  spec: OpenApiSpecLike | null | undefined
): Map<string, SpecParameterData[]> {
  const map = new Map<string, SpecParameterData[]>()
  const paths = spec?.paths ?? {}

  for (const pathItem of Object.values(paths)) {
    const pathLevelParams: RawParameter[] =
      ((pathItem as Record<string, unknown>).parameters as RawParameter[]) ?? []

    for (const [method, operation] of Object.entries(pathItem ?? {})) {
      if (method === 'parameters') continue
      const op = operation as RawOperation
      const operationId = op?.operationId?.trim()
      if (!operationId) continue

      const merged = [...pathLevelParams, ...(op.parameters ?? [])]

      const params: SpecParameterData[] = merged
        .filter((p) => p?.name)
        .map((p) => ({
          name: p.name ?? '',
          in: p.in ?? 'query',
          required: p.required ?? false,
          description: p.description ?? '',
          schema: p.schema ?? null,
        }))

      if (params.length > 0) {
        map.set(operationId, params)
      }
    }
  }
  return map
}

function buildOperationResponsesMap(
  spec: OpenApiSpecLike | null | undefined
): Map<string, Record<string, SpecResponseData>> {
  const map = new Map<string, Record<string, SpecResponseData>>()
  const paths = spec?.paths ?? {}

  for (const pathItem of Object.values(paths)) {
    if (!pathItem) continue
    for (const [method, operation] of Object.entries(pathItem)) {
      if (method === 'parameters') continue
      const op = operation as RawOperation
      if (!op) continue
      const operationId = op.operationId?.trim()
      if (!operationId || !op.responses) continue

      const responseData: Record<string, SpecResponseData> = {}
      for (const [statusCode, resp] of Object.entries(op.responses)) {
        if (!resp) continue

        let schema: Record<string, unknown> | null = null
        let example: string | null = null

        // OAS3: content['application/json'].schema / .example / .examples
        const jsonContent = resp.content?.['application/json']
        if (jsonContent) {
          if (jsonContent.schema) schema = jsonContent.schema
          if (jsonContent.example !== undefined) {
            try {
              example = JSON.stringify(jsonContent.example, null, 2)
            } catch {}
          } else if (jsonContent.examples) {
            const firstVal = Object.values(jsonContent.examples)[0]?.value
            if (firstVal !== undefined) {
              try {
                example = JSON.stringify(firstVal, null, 2)
              } catch {}
            }
          }
        }

        // Swagger 2 fallbacks
        if (!schema && resp.schema) schema = resp.schema
        if (!example && resp.examples?.['application/json'] !== undefined) {
          try {
            example = JSON.stringify(resp.examples['application/json'], null, 2)
          } catch {}
        }

        // Always store — even description-only responses matter for status pills
        responseData[statusCode] = {
          schema,
          example,
          description: resp.description ?? null,
        }
      }

      if (Object.keys(responseData).length > 0) {
        map.set(operationId, responseData)
      }
    }
  }
  return map
}

function inferAuthFromSecurityRequirements(
  requirements: Array<Record<string, string[]>> | undefined,
  schemes: Record<string, SecurityScheme>
): AuthKind {
  if (!requirements || requirements.length === 0) return 'none'

  const allSchemeNames = requirements.flatMap((item) => Object.keys(item))
  if (allSchemeNames.length === 0) return 'none'

  for (const schemeName of allSchemeNames) {
    const scheme = schemes[schemeName]
    if (!scheme) continue
    const normalizedType = (scheme.type || '').toLowerCase()
    const normalizedScheme = (scheme.scheme || '').toLowerCase()

    if (normalizedType === 'oauth2') return 'oauth2'
    if (normalizedType === 'apikey') return 'api-key'
    if (normalizedType === 'http' && normalizedScheme === 'bearer')
      return 'bearer'
    return 'other'
  }

  return 'other'
}

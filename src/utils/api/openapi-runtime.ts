export type AuthKind = 'none' | 'bearer' | 'api-key' | 'oauth2' | 'other'

type SecurityScheme = {
  type?: string
  scheme?: string
}

type OpenApiSpecLike = {
  servers?: Array<{
    url?: string
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
  }
  security?: Array<Record<string, string[]>>
  paths?: Record<
    string,
    Record<
      string,
      {
        operationId?: string
        security?: Array<Record<string, string[]>>
      }
    >
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
  operationAuth: (operationId?: string | null) => AuthKind
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
  const operationAuthMap = buildOperationAuthMap(spec, securitySchemes)
  const globalAuth = inferAuthFromSecurityRequirements(
    spec?.security,
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
    operationAuth(operationId) {
      if (!hasSecuritySchemes) return 'none'
      if (!operationId) return globalAuth
      return operationAuthMap.get(operationId) ?? globalAuth
    },
  }
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

function buildOperationAuthMap(
  spec: OpenApiSpecLike | null | undefined,
  schemes: Record<string, SecurityScheme>
): Map<string, AuthKind> {
  const map = new Map<string, AuthKind>()
  const paths = spec?.paths ?? {}

  for (const pathItem of Object.values(paths)) {
    for (const operation of Object.values(pathItem ?? {})) {
      const operationId = operation?.operationId?.trim()
      if (!operationId) continue
      map.set(
        operationId,
        inferAuthFromSecurityRequirements(operation?.security, schemes)
      )
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

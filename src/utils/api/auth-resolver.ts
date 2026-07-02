import type { AuthKind } from './openapi-runtime'

export type AuthConfig = {
  kind: AuthKind
  token?: string
  apiKey?: string
  apiKeyName?: string
  apiKeyIn?: 'header' | 'query'
}

export type AuthInjection = {
  headers: Record<string, string>
  queryParams: Record<string, string>
}

/**
 * Resolves auth configuration into headers and query params to inject into requests
 */
export function resolveAuth(config: AuthConfig | null): AuthInjection {
  if (!config || config.kind === 'none') {
    return { headers: {}, queryParams: {} }
  }

  if (config.kind === 'bearer') {
    if (!config.token) {
      return { headers: {}, queryParams: {} }
    }
    return {
      headers: { Authorization: `Bearer ${config.token}` },
      queryParams: {},
    }
  }

  if (config.kind === 'api-key') {
    if (!config.apiKey || !config.apiKeyName) {
      return { headers: {}, queryParams: {} }
    }

    if (config.apiKeyIn === 'query') {
      return {
        headers: {},
        queryParams: { [config.apiKeyName]: config.apiKey },
      }
    }

    // Default to header
    return {
      headers: { [config.apiKeyName]: config.apiKey },
      queryParams: {},
    }
  }

  if (config.kind === 'oauth2') {
    // Phase 2: OAuth2 is just "paste token" mode
    if (!config.token) {
      return { headers: {}, queryParams: {} }
    }
    return {
      headers: { Authorization: `Bearer ${config.token}` },
      queryParams: {},
    }
  }

  return { headers: {}, queryParams: {} }
}

/**
 * Infers auth config from OpenAPI securitySchemes
 */
export function inferAuthConfig(
  securitySchemes: Record<
    string,
    { type?: string; scheme?: string; name?: string; in?: string }
  >,
  selectedScheme?: string
): Pick<AuthConfig, 'apiKeyName' | 'apiKeyIn'> | null {
  if (!selectedScheme || !securitySchemes[selectedScheme]) {
    return null
  }

  const scheme = securitySchemes[selectedScheme]
  const type = (scheme.type || '').toLowerCase()

  if (type === 'apikey') {
    return {
      apiKeyName: scheme.name || 'x-api-key',
      apiKeyIn: scheme.in === 'query' ? 'query' : 'header',
    }
  }

  return null
}

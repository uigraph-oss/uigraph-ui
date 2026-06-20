export type OAuthProvider = {
  id: string
  providerName: string
  type: string
  displayName: string
  clientId: string
  clientSecret: string
  authUrl: string
  tokenUrl: string
  userinfoUrl: string
  apiUrl: string
  scopes: string
  allowedDomains: string
  allowSignUp: boolean
  emailClaim: string
  nameClaim: string
  subClaim: string
}

export type UpsertOAuthInput = {
  type: string
  displayName: string
  clientId: string
  clientSecret: string
  authUrl: string
  tokenUrl: string
  userinfoUrl: string
  scopes: string
  allowedDomains: string
  allowSignUp: boolean
  emailClaim: string
  nameClaim: string
  subClaim: string
}

async function parseError(res: Response): Promise<never> {
  let message = `Request failed (${res.status})`
  try {
    const body = (await res.json()) as { error?: string }
    if (body.error) {
      message = body.error
    }
  } catch {
    message = `Request failed (${res.status})`
  }
  throw new Error(message)
}

export async function listOAuthProviders(): Promise<OAuthProvider[]> {
  const res = await fetch('/api/v1/sso/oauth', { credentials: 'include' })
  if (!res.ok) {
    return parseError(res)
  }
  const data = (await res.json()) as { providers: OAuthProvider[] | null }
  return data.providers ?? []
}

export async function upsertOAuthProvider(
  providerName: string,
  input: UpsertOAuthInput
): Promise<void> {
  const res = await fetch(`/api/v1/sso/oauth/${providerName}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    return parseError(res)
  }
}

export async function deleteOAuthProvider(providerName: string): Promise<void> {
  const res = await fetch(`/api/v1/sso/oauth/${providerName}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) {
    return parseError(res)
  }
}

export type ProviderStatus = 'configured' | 'not-configured'

async function fetchStatus(path: string): Promise<ProviderStatus> {
  const res = await fetch(path, { credentials: 'include' })
  if (res.ok) {
    return 'configured'
  }
  if (res.status === 404) {
    return 'not-configured'
  }
  return parseError(res)
}

export function getLdapStatus(): Promise<ProviderStatus> {
  return fetchStatus('/api/v1/sso/ldap')
}

export function getSamlStatus(): Promise<ProviderStatus> {
  return fetchStatus('/api/v1/sso/saml')
}

export function getScimStatus(): Promise<ProviderStatus> {
  return fetchStatus('/api/v1/sso/scim')
}

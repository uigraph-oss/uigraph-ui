// REST client for service accounts. Service accounts are managed over the v1
// REST API (no GraphQL); requests authenticate via the session cookie.

export type ServiceAccount = {
  id: string
  orgId: string
  name: string
  description?: string
  scopes: string[]
  disabled: boolean
  isInternal: boolean
  createdAt: string
  updatedAt: string
}

export type ServiceAccountToken = {
  id: string
  serviceAccountId: string
  name: string
  prefix: string
  expiresAt?: string | null
  lastUsedAt?: string | null
  revoked: boolean
  createdAt: string
}

// Returned only once, at token creation time.
export type CreatedToken = {
  id: string
  name: string
  token: string
}

async function request<T>(
  method: string,
  url: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(url, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    let message = `${method} ${url} failed (${res.status})`
    try {
      const data = (await res.json()) as { error?: string }
      if (data.error) message = data.error
    } catch {
      // non-JSON error body — keep the default message
    }
    throw new Error(message)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

function base(orgId: string) {
  return `/api/v1/orgs/${orgId}/service-accounts`
}

export function listServiceAccounts(orgId: string) {
  return request<{ serviceAccounts: ServiceAccount[] | null }>(
    'GET',
    base(orgId)
  ).then((r) => r.serviceAccounts ?? [])
}

export function createServiceAccount(
  orgId: string,
  input: { name: string; description?: string; scopes: string[] }
) {
  return request<ServiceAccount>('POST', base(orgId), input)
}

export function updateServiceAccount(
  orgId: string,
  saId: string,
  input: {
    name: string
    description?: string
    scopes: string[]
    disabled: boolean
  }
) {
  return request<void>('PUT', `${base(orgId)}/${saId}`, input)
}

export function deleteServiceAccount(orgId: string, saId: string) {
  return request<void>('DELETE', `${base(orgId)}/${saId}`)
}

export async function setServiceAccountAvatar(
  orgId: string,
  saId: string,
  file: File
) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${base(orgId)}/${saId}/avatar`, {
    method: 'PUT',
    credentials: 'include',
    body: form,
  })
  if (!res.ok) {
    throw new Error(`upload avatar failed (${res.status})`)
  }
}

export function listTokens(orgId: string, saId: string) {
  return request<{ tokens: ServiceAccountToken[] | null }>(
    'GET',
    `${base(orgId)}/${saId}/tokens`
  ).then((r) => r.tokens ?? [])
}

export function createToken(
  orgId: string,
  saId: string,
  input: { name: string; expiresAt?: string }
) {
  return request<CreatedToken>('POST', `${base(orgId)}/${saId}/tokens`, input)
}

export function revokeToken(orgId: string, saId: string, tokenId: string) {
  return request<void>('DELETE', `${base(orgId)}/${saId}/tokens/${tokenId}`)
}

export function listScopes(orgId: string) {
  return request<{ scopes: string[] | null }>(
    'GET',
    `/api/v1/orgs/${orgId}/scopes`
  ).then((r) => r.scopes ?? [])
}

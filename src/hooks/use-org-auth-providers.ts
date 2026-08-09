import { useEffect, useState } from 'react'

export interface DiscoveredOrg {
  id: string
  name: string
  logoUrl: string
}

export interface OrgAuthProvider {
  id: string
  kind: string
  displayName: string
  iconUrl: string
  loginUrl: string
}

export async function discoverOrgs(email: string): Promise<DiscoveredOrg[]> {
  const res = await fetch('/api/v1/auth/discover-orgs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email }),
  })

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      message?: string
    } | null
    throw new Error(body?.message ?? 'Could not look up your organizations.')
  }

  const data = (await res.json()) as { orgs: DiscoveredOrg[] }
  return data.orgs
}

// Provider lists are per-org, so nothing here is cached across orgs: a stale
// cache would render another org's sign-in buttons.
// A workspace with no configured providers is a normal state, not a failure, so
// this never surfaces an error: the sign-in form simply falls back to password.
export function useOrgAuthProviders(orgId: string | null) {
  const [isLoading, setIsLoading] = useState(false)
  const [providers, setProviders] = useState<OrgAuthProvider[]>([])

  useEffect(() => {
    if (!orgId) {
      setProviders([])
      return
    }

    let cancelled = false

    void (async () => {
      try {
        setIsLoading(true)

        const res = await fetch(`/api/v1/auth/orgs/${orgId}/providers`, {
          credentials: 'include',
        })

        if (!res.ok) {
          throw new Error(`providers request failed: ${res.status}`)
        }

        const data = (await res.json()) as { providers: OrgAuthProvider[] }
        if (!cancelled) {
          setProviders(data.providers)
        }
      } catch {
        if (!cancelled) {
          setProviders([])
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [orgId])

  return { isLoading, providers }
}

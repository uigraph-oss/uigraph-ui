import { useAuthStore } from './use-auth-store'

export interface AuthenticatedUser {
  userId: string
  email: string
  name: string
  login: string
  kind: 'user' | 'service_account'
  isAdmin: boolean
  authProvider: string
}

export interface UserOrganization {
  id: string
  name: string
  slug: string
  role: string
}

export async function bootstrapSession() {
  try {
    const [meRes, orgsRes] = await Promise.all([
      fetch('/api/v1/auth/me', { credentials: 'include' }),
      fetch('/api/v1/auth/orgs', { credentials: 'include' }),
    ])

    if (!meRes.ok) {
      return useAuthStore.setState({
        status: 'unauthenticated',
        organizations: [],
        user: null,
      })
    }

    const me = (await meRes.json()) as {
      userId: string
      email: string
      name: string
      login: string
      kind: 'user' | 'service_account'
      isAdmin: boolean
      authProvider: string
    }

    let organizations: UserOrganization[] = []
    if (orgsRes.ok) {
      const orgsData = (await orgsRes.json()) as {
        orgs: UserOrganization[]
      }
      organizations = orgsData.orgs
    }

    useAuthStore.setState({
      status: 'authenticated',
      user: {
        userId: me.userId,
        email: me.email,
        name: me.name,
        login: me.login,
        kind: me.kind,
        isAdmin: me.isAdmin,
        authProvider: me.authProvider,
      },
      organizations,
    })
  } catch {
    useAuthStore.setState({
      status: 'unauthenticated',
      organizations: [],
      user: null,
    })
  }
}

export async function signIn(email: string, password: string) {
  const res = await fetch('/api/v1/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    throw new Error('Invalid email or password')
  }

  const data = (await res.json()) as {
    token: string
    mustChangePassword: boolean
  }

  await bootstrapSession()
  return { token: data.token, mustChangePassword: data.mustChangePassword }
}

export async function signOut() {
  try {
    await fetch('/api/v1/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
  } finally {
    useAuthStore.setState({
      status: 'unauthenticated',
      organizations: [],
      user: null,
    })
  }
}

export function changeOrganization(organizationId: string) {
  useAuthStore.setState({
    currentOrganizationId: organizationId,
    dashboard: 'organization',
  })
}

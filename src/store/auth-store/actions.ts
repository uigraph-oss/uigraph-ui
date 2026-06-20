import { clientV2 } from '@/api-v2/client'
import { GET_ME_AND_ORG_V2 } from './gql-v2'
import { useAuthStore } from './use-auth-store'

export async function bootstrapSession() {
  try {
    const { data } = await clientV2.query({ query: GET_ME_AND_ORG_V2 })

    useAuthStore.setState({
      status: 'authenticated',
      user: data.me,
      organizations: data.myOrgs,
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

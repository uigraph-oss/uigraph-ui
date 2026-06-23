import { graphql } from '@/api'
import { apolloClientGQL } from '@/api/client'
import { useAuthStore } from './use-auth-store'

const GET_ME_AND_ORG = graphql(`
  query MeAndOrgBootstrap {
    me {
      userId
      email
      name
      avatarUrl
      isServerAdmin
    }
    myOrgs {
      id
      name
      role
      logoUrl
    }
  }
`)

export async function bootstrapSession() {
  try {
    const { data } = await apolloClientGQL.query({ query: GET_ME_AND_ORG })

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

export async function refreshOrganizations() {
  const { data } = await apolloClientGQL.query({
    query: GET_ME_AND_ORG,
    fetchPolicy: 'network-only',
  })
  useAuthStore.setState({ organizations: data.myOrgs })
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

import {
  client,
  GET_ORGANIZATION_BY_SUBDOMAIN,
  privateClient,
  VERIFY_ORG_DOMAIN,
} from '@/api'

import type { OrganizationInfo } from '@/types'

export function getOrgNameFromHost(): string | null {
  if (typeof window === 'undefined') return null

  const hostname = window.location.hostname

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('workspace') || 'hello-kduf'
  }

  if (hostname.includes('.uigraph.app')) {
    const parts = hostname.split('.')
    if (parts.length >= 3) {
      return parts[0]
    }
  }

  return null
}

export async function verifyWorkspace(subdomain: string): Promise<boolean> {
  try {
    const result = await privateClient.query({
      query: VERIFY_ORG_DOMAIN,
      variables: { domainSlug: subdomain },
      fetchPolicy: 'network-only',
    })

    return result.data.VerifyOrgDomain === true
  } catch (error) {
    console.error('Error verifying workspace:', error)
    return false
  }
}

export async function verifyOrgDomain(domainSlug: string): Promise<boolean> {
  try {
    const result = await client.query({
      query: VERIFY_ORG_DOMAIN,
      variables: { domainSlug: domainSlug },
      fetchPolicy: 'network-only',
    })

    return result.data.VerifyOrgDomain === true
  } catch (error) {
    console.error('Error verifying organization domain:', error)
    return false
  }
}

export async function getOrganizationBySubdomain(
  subdomain: string
): Promise<OrganizationInfo | null> {
  try {
    const result = await client.query({
      query: GET_ORGANIZATION_BY_SUBDOMAIN,
      variables: { subdomain },
      fetchPolicy: 'network-only',
    })

    return result.data.GetOrganizationBySubdomain as OrganizationInfo
  } catch (error) {
    console.error('Error fetching organization by subdomain:', error)
    return null
  }
}

export async function getCurrentWorkspaceOrganization(): Promise<OrganizationInfo | null> {
  const subdomain = getOrgNameFromHost()
  if (!subdomain) {
    console.error('No subdomain found in URL')
    return null
  }

  return await getOrganizationBySubdomain(subdomain)
}

export function getBaseUrl(): string {
  if (typeof window === 'undefined') return ''

  const protocol = window.location.protocol
  const hostname = window.location.hostname

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:${window.location.port || '3000'}`
  }

  if (hostname.includes('.uigraph.app')) {
    return `${protocol}//uigraph.app`
  }

  return `${protocol}//${hostname}`
}

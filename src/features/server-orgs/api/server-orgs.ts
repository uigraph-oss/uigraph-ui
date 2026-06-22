import { graphql } from '@/api'

export type ServerOrg = {
  id: string
  name: string
  logoUrl?: string | null
  disabled: boolean
  createdAt: string
  updatedAt: string
}

export const SERVER_ORGS = graphql(`
  query ServerOrgs {
    orgs {
      id
      name
      logoUrl
      disabled
      createdAt
      updatedAt
    }
  }
`)

export async function setServerOrgLogo(orgId: string, file: File) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`/api/v1/orgs/${orgId}/logo`, {
    method: 'PUT',
    credentials: 'include',
    body: form,
  })
  if (!res.ok) {
    throw new Error(`upload logo failed (${res.status})`)
  }
}

export async function removeServerOrgLogo(orgId: string) {
  const res = await fetch(`/api/v1/orgs/${orgId}/logo`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`remove logo failed (${res.status})`)
  }
}

export const CREATE_SERVER_ORG = graphql(`
  mutation CreateServerOrg($input: CreateOrgInput!) {
    createOrg(input: $input) {
      id
      name
      disabled
      createdAt
      updatedAt
    }
  }
`)

export const UPDATE_SERVER_ORG = graphql(`
  mutation UpdateServerOrg($id: ID!, $input: UpdateOrgInput!) {
    updateOrg(id: $id, input: $input) {
      id
      name
      disabled
      createdAt
      updatedAt
    }
  }
`)

export const DELETE_SERVER_ORG = graphql(`
  mutation DeleteServerOrg($id: ID!) {
    deleteOrg(id: $id)
  }
`)

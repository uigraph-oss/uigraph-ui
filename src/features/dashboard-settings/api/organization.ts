import { graphql } from '@/api'

export const UPDATE_ORG = graphql(`
  mutation UpdateOrgV2($id: ID!, $input: UpdateOrgInput!) {
    updateOrg(id: $id, input: $input) {
      id
      name
      logoUrl
    }
  }
`)

export async function setOrgLogo(orgId: string, file: File) {
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

export async function removeOrgLogo(orgId: string) {
  const res = await fetch(`/api/v1/orgs/${orgId}/logo`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`remove logo failed (${res.status})`)
  }
}

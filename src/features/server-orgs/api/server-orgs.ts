import { graphql } from '@/api'
import { clientAxios } from '@/api/axios'
import { uploadFile } from '@/features/uploads/api/uploads'

export type ServerOrg = {
  id: string
  name: string
  logoUrl?: string | null
  disabled: boolean
  autoJoin: boolean
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
      autoJoin
      createdAt
      updatedAt
    }
  }
`)

export async function setServerOrgLogo(orgId: string, file: File) {
  const assetId = await uploadFile(orgId, file)
  await clientAxios.put(`/v1/server/orgs/${orgId}/logo`, {
    assetId,
    contentType: file.type,
  })
}

export async function removeServerOrgLogo(orgId: string) {
  await clientAxios.delete(`/v1/server/orgs/${orgId}/logo`)
}

export const CREATE_SERVER_ORG = graphql(`
  mutation CreateServerOrg($input: CreateServerOrgInput!) {
    createServerOrg(input: $input) {
      id
      name
      disabled
      autoJoin
      createdAt
      updatedAt
    }
  }
`)

export const UPDATE_SERVER_ORG = graphql(`
  mutation UpdateServerOrg($id: ID!, $input: UpdateServerOrgInput!) {
    updateServerOrg(id: $id, input: $input) {
      id
      name
      disabled
      autoJoin
      createdAt
      updatedAt
    }
  }
`)

export const DELETE_SERVER_ORG = graphql(`
  mutation DeleteServerOrg($id: ID!) {
    deleteServerOrg(id: $id)
  }
`)

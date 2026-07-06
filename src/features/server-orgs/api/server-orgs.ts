import { graphql } from '@/api'
import { apolloClientGQL } from '@/api/client'
import { putToPresigned } from '@/features/uploads/api/uploads'

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

export const PREPARE_SERVER_ORG_LOGO_UPLOAD = graphql(`
  mutation PrepareServerOrgLogoUpload($orgId: ID!) {
    prepareServerOrgLogoUpload(orgId: $orgId) {
      assetId
      uploadUrl
    }
  }
`)

export const SET_SERVER_ORG_LOGO = graphql(`
  mutation SetServerOrgLogo($orgId: ID!) {
    setServerOrgLogo(orgId: $orgId)
  }
`)

export const REMOVE_SERVER_ORG_LOGO = graphql(`
  mutation RemoveServerOrgLogo($orgId: ID!) {
    removeServerOrgLogo(orgId: $orgId)
  }
`)

export async function setServerOrgLogo(orgId: string, file: File) {
  await putToPresigned(async () => {
    const { data } = await apolloClientGQL.mutate({
      mutation: PREPARE_SERVER_ORG_LOGO_UPLOAD,
      variables: { orgId },
    })
    return {
      assetId: data?.prepareServerOrgLogoUpload?.assetId,
      uploadUrl: data?.prepareServerOrgLogoUpload?.uploadUrl,
    }
  }, file)

  await apolloClientGQL.mutate({
    mutation: SET_SERVER_ORG_LOGO,
    variables: { orgId },
  })
}

export async function removeServerOrgLogo(orgId: string) {
  await apolloClientGQL.mutate({
    mutation: REMOVE_SERVER_ORG_LOGO,
    variables: { orgId },
  })
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

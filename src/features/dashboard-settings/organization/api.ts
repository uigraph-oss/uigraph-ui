import { graphql } from '@/api'
import { apolloClientGQL } from '@/api/client'
import { putToPresigned } from '@/features/uploads/api/uploads'

export const UPDATE_ORGANIZATION = graphql(`
  mutation UpdateOrganizationSettings($id: ID!, $input: UpdateOrgInput!) {
    updateOrg(id: $id, input: $input) {
      id
      name
      logoUrl
    }
  }
`)

export const ORGANIZATION_DOMAINS = graphql(`
  query OrganizationDomains($orgId: ID!) {
    orgDomains(orgId: $orgId) {
      id
      orgId
      domain
    }
  }
`)

export const CREATE_ORGANIZATION_DOMAIN = graphql(`
  mutation CreateOrganizationDomain($orgId: ID!, $domain: String!) {
    createOrgDomain(orgId: $orgId, domain: $domain) {
      id
    }
  }
`)

export const DELETE_ORGANIZATION_DOMAIN = graphql(`
  mutation DeleteOrganizationDomain($orgId: ID!, $domainId: ID!) {
    deleteOrgDomain(orgId: $orgId, domainId: $domainId)
  }
`)

const PREPARE_ORGANIZATION_LOGO_UPLOAD = graphql(`
  mutation PrepareOrganizationLogoUpload($orgId: ID!) {
    prepareOrgLogoUpload(orgId: $orgId) {
      assetId
      uploadUrl
    }
  }
`)

const SET_ORGANIZATION_LOGO = graphql(`
  mutation SetOrganizationLogo($orgId: ID!) {
    setOrgLogo(orgId: $orgId)
  }
`)

const REMOVE_ORGANIZATION_LOGO = graphql(`
  mutation RemoveOrganizationLogo($orgId: ID!) {
    removeOrgLogo(orgId: $orgId)
  }
`)

export async function uploadOrganizationLogo(orgId: string, file: File) {
  await putToPresigned(async () => {
    const { data } = await apolloClientGQL.mutate({
      mutation: PREPARE_ORGANIZATION_LOGO_UPLOAD,
      variables: { orgId },
    })
    return {
      assetId: data?.prepareOrgLogoUpload.assetId,
      uploadUrl: data?.prepareOrgLogoUpload.uploadUrl,
    }
  }, file)

  await apolloClientGQL.mutate({
    mutation: SET_ORGANIZATION_LOGO,
    variables: { orgId },
  })
}

export async function removeOrganizationLogo(orgId: string) {
  await apolloClientGQL.mutate({
    mutation: REMOVE_ORGANIZATION_LOGO,
    variables: { orgId },
  })
}

import { graphql } from '@/api'

export type DashboardAPIGroupVersion = {
  id: string
  apiGroupId: string
  versionNumber: number
  label?: string | null
  specKey: string
  specHash: string
  isAutoVersion: boolean
  createdBy: string
  createdAt: string
}

export const API_GROUP_AND_VERSIONS = graphql(`
  query APIGroupAndVersions($orgId: ID!, $serviceId: ID!, $apiGroupId: ID!) {
    apiGroups(orgId: $orgId, serviceId: $serviceId) {
      id
      serviceId
      orgId
      name
      version
      label
      protocol
      specKey
      specHash
      createdBy
      updatedBy
      createdAt
      updatedAt
    }
    apiGroupVersions(
      orgId: $orgId
      serviceId: $serviceId
      apiGroupId: $apiGroupId
    ) {
      id
      apiGroupId
      versionNumber
      label
      specKey
      specHash
      isAutoVersion
      createdBy
      createdAt
    }
  }
`)

export const API_GROUP_VERSIONS = graphql(`
  query APIGroupVersions($orgId: ID!, $serviceId: ID!, $apiGroupId: ID!) {
    apiGroupVersions(
      orgId: $orgId
      serviceId: $serviceId
      apiGroupId: $apiGroupId
    ) {
      id
      apiGroupId
      versionNumber
      label
      specKey
      specHash
      isAutoVersion
      createdBy
      createdAt
    }
  }
`)

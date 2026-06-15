import { graphql } from '@/api-v2'

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

export const API_GROUP_AND_VERSIONS_V2 = graphql(`
  query APIGroupAndVersionsV2(
    $orgId: ID!
    $serviceId: ID!
    $apiGroupId: ID!
  ) {
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

export const API_GROUP_VERSIONS_V2 = graphql(`
  query APIGroupVersionsV2(
    $orgId: ID!
    $serviceId: ID!
    $apiGroupId: ID!
  ) {
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

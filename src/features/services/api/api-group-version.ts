import { graphql } from '@/api'

export const GET_SERVICE_API_GROUP_AND_VERSIONS_QUERY = graphql(`
  query GET_SERVICE_API_GROUP_AND_VERSIONS_QUERY(
    $serviceId: String!
    $apiGroupId: String!
  ) {
    v1GetServiceAPIGroups(serviceId: $serviceId) {
      serviceApiGroupId
      serviceId
      name
      version
      protocol
      openApiSpecFileId
      swaggerSpecFileId
      postmanCollectionFileId
      postmanEnvironmentFileId
      postmanVariableFileId
      serverlessFunctionsFileId
      graphqlSpecFileIds
      grpcSpecFileIds
      sourceType
      restEndpointsCount
      graphQLOperationsCount
      grpcRpcsCount
      createdAt
      updatedAt
      deletedAt
      createdBy
      updatedBy
      deletedBy
    }

    v1GetServiceAPIGroupVersions(apiGroupId: $apiGroupId) {
      versionId
      apiGroupId
      versionNumber
      label
      createdBy
      createdAt
      isAutoVersion
      apiGroup {
        serviceApiGroupId
        serviceId
        name
        version
        protocol
        openApiSpecFileId
        swaggerSpecFileId
        postmanCollectionFileId
        postmanEnvironmentFileId
        postmanVariableFileId
        serverlessFunctionsFileId
        graphqlSpecFileIds
        grpcSpecFileIds
        sourceType
        restEndpointsCount
        graphQLOperationsCount
        grpcRpcsCount
        createdAt
        updatedAt
        deletedAt
        createdBy
        updatedBy
        deletedBy
      }
    }
  }
`)

export const GET_SERVICE_API_GROUP_VERSIONS_QUERY = graphql(`
  query V1GetServiceAPIGroupVersions($apiGroupId: String!) {
    v1GetServiceAPIGroupVersions(apiGroupId: $apiGroupId) {
      versionId
      apiGroupId
      versionNumber
      label
      createdBy
      createdAt
      isAutoVersion
      apiGroup {
        serviceApiGroupId
        serviceId
        name
        version
        protocol
        openApiSpecFileId
        swaggerSpecFileId
        postmanCollectionFileId
        postmanEnvironmentFileId
        postmanVariableFileId
        serverlessFunctionsFileId
        graphqlSpecFileIds
        grpcSpecFileIds
        sourceType
        restEndpointsCount
        graphQLOperationsCount
        grpcRpcsCount
        createdAt
        updatedAt
        deletedAt
        createdBy
        updatedBy
        deletedBy
      }
    }
  }
`)

export const GET_SERVICE_API_GROUP_VERSION_QUERY = graphql(`
  query V1GetServiceAPIGroupVersion(
    $apiGroupId: String!
    $versionNumber: Int!
  ) {
    v1GetServiceAPIGroupVersion(
      apiGroupId: $apiGroupId
      versionNumber: $versionNumber
    ) {
      versionId
      apiGroupId
      versionNumber
      label
      createdBy
      createdAt
      isAutoVersion
      apiGroup {
        serviceApiGroupId
        serviceId
        name
        version
        protocol
        openApiSpecFileId
        swaggerSpecFileId
        postmanCollectionFileId
        postmanEnvironmentFileId
        postmanVariableFileId
        serverlessFunctionsFileId
        graphqlSpecFileIds
        grpcSpecFileIds
        sourceType
        restEndpointsCount
        graphQLOperationsCount
        grpcRpcsCount
        createdAt
        updatedAt
        deletedAt
        createdBy
        updatedBy
        deletedBy
      }
    }
  }
`)

export const CREATE_SERVICE_API_GROUP_VERSION_MUTATION = graphql(`
  mutation V1CreateServiceAPIGroupVersion(
    $apiGroupId: String!
    $input: CreateServiceAPIGroupVersionInput!
  ) {
    v1CreateServiceAPIGroupVersion(apiGroupId: $apiGroupId, input: $input) {
      versionId
      apiGroupId
      versionNumber
      label
      createdBy
      createdAt
      isAutoVersion
      apiGroup {
        serviceApiGroupId
        serviceId
        name
        version
        protocol
        openApiSpecFileId
        swaggerSpecFileId
        postmanCollectionFileId
        postmanEnvironmentFileId
        postmanVariableFileId
        serverlessFunctionsFileId
        graphqlSpecFileIds
        grpcSpecFileIds
        sourceType
        restEndpointsCount
        graphQLOperationsCount
        grpcRpcsCount
        createdAt
        updatedAt
        deletedAt
        createdBy
        updatedBy
        deletedBy
      }
    }
  }
`)

export const RESTORE_SERVICE_API_GROUP_VERSION_MUTATION = graphql(`
  mutation V1RestoreServiceAPIGroupVersion(
    $apiGroupId: String!
    $versionNumber: Int!
  ) {
    v1RestoreServiceAPIGroupVersion(
      apiGroupId: $apiGroupId
      versionNumber: $versionNumber
    ) {
      serviceApiGroupId
      serviceId
      name
      version
      protocol
      openApiSpecFileId
      swaggerSpecFileId
      postmanCollectionFileId
      postmanEnvironmentFileId
      postmanVariableFileId
      serverlessFunctionsFileId
      graphqlSpecFileIds
      grpcSpecFileIds
      sourceType
      restEndpointsCount
      graphQLOperationsCount
      grpcRpcsCount
      createdAt
      updatedAt
      deletedAt
      createdBy
      updatedBy
      deletedBy
    }
  }
`)

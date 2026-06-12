import { graphql } from '@/api'

export const GET_SERVICE_API_GROUPS_QUERY = graphql(`
  query V1GetServiceAPIGroups($serviceId: String!) {
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
  }
`)

export const CREATE_SERVICE_API_GROUP_MUTATION = graphql(`
  mutation V1CreateServiceAPIGroup($input: CreateServiceAPIGroupInput!) {
    v1CreateServiceAPIGroup(input: $input) {
      serviceApiGroupId
      serviceId
      name
      version
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

export const UPDATE_SERVICE_API_GROUP_MUTATION = graphql(`
  mutation V1UpdateServiceAPIGroup(
    $serviceApiGroupId: String!
    $input: UpdateServiceAPIGroupInput!
  ) {
    v1UpdateServiceAPIGroup(
      serviceApiGroupId: $serviceApiGroupId
      input: $input
    ) {
      serviceApiGroupId
      serviceId
      name
      version
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

export const DELETE_SERVICE_API_GROUP_MUTATION = graphql(`
  mutation V1DeleteServiceAPIGroup(
    $serviceApiGroupId: String!
    $organizationId: String!
  ) {
    v1DeleteServiceAPIGroup(
      serviceApiGroupId: $serviceApiGroupId
      organizationId: $organizationId
    )
  }
`)

export const GET_SERVICE_API_ENDPOINTS_QUERY = graphql(`
  query V1GetAPIEndpoints($serviceApiGroupId: String!) {
    v1GetAPIEndpoints(serviceApiGroupId: $serviceApiGroupId) {
      apiEndpointId
      serviceApiGroupId
      componentMetaId
      exampleRequests
      exampleResponses
      order
      createdAt
      updatedAt
      deletedAt
      createdBy
      updatedBy
      deletedBy
    }
  }
`)

export const CREATE_SERVICE_API_ENDPOINT_MUTATION = graphql(`
  mutation V1CreateServiceAPIEndpoint($input: CreateAPIEndpointInput!) {
    v1CreateServiceAPIEndpoint(input: $input) {
      apiEndpointId
      serviceApiGroupId
      componentMetaId
      exampleRequests
      exampleResponses
      order
      createdAt
      updatedAt
      deletedAt
      createdBy
      updatedBy
      deletedBy
    }
  }
`)

export const UPDATE_SERVICE_API_ENDPOINT_MUTATION = graphql(`
  mutation V1UpdateServiceAPIEndpoint(
    $apiEndpointId: String!
    $input: UpdateAPIEndpointInput!
  ) {
    v1UpdateServiceAPIEndpoint(apiEndpointId: $apiEndpointId, input: $input) {
      apiEndpointId
      serviceApiGroupId
      componentMetaId
      exampleRequests
      exampleResponses
      order
      createdAt
      updatedAt
      deletedAt
      createdBy
      updatedBy
      deletedBy
    }
  }
`)

export const DELETE_SERVICE_API_ENDPOINT_MUTATION = graphql(`
  mutation V1DeleteServiceAPIEndpoint(
    $apiEndpointId: String!
    $organizationId: String!
  ) {
    v1DeleteServiceAPIEndpoint(
      apiEndpointId: $apiEndpointId
      organizationId: $organizationId
    )
  }
`)

export const GET_SERVICE_API_ENDPOINTS_WITH_META_QUERY = graphql(`
  query V1GetAPIEndpointsWithMeta(
    $serviceApiGroupId: String!
    $versionNumber: Int
  ) {
    v1GetAPIEndpointsWithMeta(
      serviceApiGroupId: $serviceApiGroupId
      versionNumber: $versionNumber
    ) {
      apiEndpoint {
        apiEndpointId
        serviceApiGroupId
        componentMetaId
        exampleRequests
        exampleResponses
        order
        createdAt
        updatedAt
        deletedAt
        createdBy
        updatedBy
        deletedBy
      }
      componentMeta {
        componentMetaId
        organizationId
        componentId
        componentFlowDiagram
        componentFlowDiagramName
        createdBy
        updatedBy
        createdAt
        updatedAt
        deletedAt
        deletedBy
        componentModalFields {
          componentFieldId
          label
          type
          required
          isReadonly
          data
          options
          order
        }
      }
    }
  }
`)

export const UPDATE_SERVICE_API_ENDPOINT_META_MUTATION = graphql(`
  mutation V1UpdateComponentMeta(
    $componentMetaId: String!
    $input: UpdateComponentMetaInput!
  ) {
    v1UpdateComponentMeta(componentMetaId: $componentMetaId, input: $input) {
      componentMetaId
      organizationId
      componentId
      componentFlowDiagram
      componentFlowDiagramName
      createdBy
      updatedBy
      createdAt
      updatedAt
      deletedAt
      deletedBy
      componentModalFields {
        componentFieldId
        label
        type
        required
        isReadonly
        data
        options
        order
      }
    }
  }
`)

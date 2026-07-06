import { graphql } from '@/api'

export const API_ENDPOINT_BY_ID = graphql(`
  query ApiEndpointById($orgId: ID!, $id: ID!) {
    apiEndpointById(orgId: $orgId, id: $id) {
      id
      serviceId
      apiGroupId
      method
      path
      summary
      description
      tags
      parameters
      requestBody
      responses
      exampleRequests
      exampleResponses
      updatedAt
      createdAt
    }
  }
`)

export const TEST_PACK_BY_ID = graphql(`
  query TestPackById($orgId: ID!, $id: ID!) {
    testPackById(orgId: $orgId, id: $id) {
      testPackId
      serviceId
      name
      type
      updatedAt
    }
  }
`)

export const SERVICE_DOC_BY_ID = graphql(`
  query ServiceDocById($orgId: ID!, $id: ID!) {
    serviceDocById(orgId: $orgId, id: $id) {
      serviceId
      docId
    }
  }
`)

export const DOC_BY_ID = graphql(`
  query DocById($orgId: ID!, $id: ID!) {
    doc(orgId: $orgId, id: $id) {
      id
      fileUrl
      fileName
      fileType
    }
  }
`)

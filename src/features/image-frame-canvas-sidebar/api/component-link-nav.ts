import { graphql } from '@/api'

export const API_ENDPOINT_BY_ID = graphql(`
  query ApiEndpointById($orgId: ID!, $id: ID!) {
    apiEndpointById(orgId: $orgId, id: $id) {
      id
      serviceId
      apiGroupId
    }
  }
`)

export const TEST_PACK_BY_ID = graphql(`
  query TestPackById($orgId: ID!, $id: ID!) {
    testPackById(orgId: $orgId, id: $id) {
      testPackId
      serviceId
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

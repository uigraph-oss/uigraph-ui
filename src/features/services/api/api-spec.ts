import { graphql } from '@/api'

export const API_GROUP_SPEC = graphql(`
  query ApiGroupSpec($orgId: ID!, $serviceId: ID!, $apiGroupId: ID!) {
    apiGroupSpec(
      orgId: $orgId
      serviceId: $serviceId
      apiGroupId: $apiGroupId
    ) {
      apiGroupId
      fileName
      content
    }
  }
`)

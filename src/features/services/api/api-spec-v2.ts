import { graphql } from '@/api'

export const API_GROUP_SPEC_V2 = graphql(`
  query ApiGroupSpecV2($orgId: ID!, $serviceId: ID!, $apiGroupId: ID!) {
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

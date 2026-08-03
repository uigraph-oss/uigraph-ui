import { graphql } from '@/api'

export const SERVICE_COST_RESOURCES = graphql(`
  query ServiceCostResources($orgId: ID!, $serviceId: ID!) {
    serviceCostResources(orgId: $orgId, serviceId: $serviceId) {
      id
      externalResourceId
      name
      resourceType
      provider
      region
      environment
      status
      monthlyCostUsd
      tags
      matchedTags
      lastSyncedAt
    }
  }
`)

export const SERVICE_COST_TREND = graphql(`
  query ServiceCostTrend($orgId: ID!, $serviceId: ID!, $days: Int) {
    serviceCostTrend(orgId: $orgId, serviceId: $serviceId, days: $days) {
      date
      totalUsd
      awsUsd
      azureUsd
      gcpUsd
    }
  }
`)

export const SERVICE_COST_TAG_RULES = graphql(`
  query ServiceCostTagRules($orgId: ID!, $serviceId: ID!) {
    serviceCostTagRules(orgId: $orgId, serviceId: $serviceId) {
      id
      serviceId
      tagKey
      tagValue
      createdBy
      createdAt
    }
  }
`)

export const CREATE_SERVICE_COST_TAG_RULE = graphql(`
  mutation CreateServiceCostTagRule(
    $orgId: ID!
    $serviceId: ID!
    $tagKey: String!
    $tagValue: String!
  ) {
    createServiceCostTagRule(
      orgId: $orgId
      serviceId: $serviceId
      tagKey: $tagKey
      tagValue: $tagValue
    ) {
      id
      serviceId
      tagKey
      tagValue
      createdBy
      createdAt
    }
  }
`)

export const DELETE_SERVICE_COST_TAG_RULE = graphql(`
  mutation DeleteServiceCostTagRule(
    $orgId: ID!
    $serviceId: ID!
    $ruleId: ID!
  ) {
    deleteServiceCostTagRule(
      orgId: $orgId
      serviceId: $serviceId
      ruleId: $ruleId
    )
  }
`)

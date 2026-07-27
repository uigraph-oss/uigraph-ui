import { graphql } from '@/api'

export const ML_METRIC_COLUMNS = graphql(`
  query MlMetricColumns($orgId: ID!, $tableKind: String!) {
    mlMetricColumns(orgId: $orgId, tableKind: $tableKind) {
      tableKind
      metricKeys
    }
  }
`)

export const SET_ML_METRIC_COLUMNS = graphql(`
  mutation SetMlMetricColumns(
    $orgId: ID!
    $tableKind: String!
    $metricKeys: [String!]
  ) {
    setMlMetricColumns(
      orgId: $orgId
      tableKind: $tableKind
      metricKeys: $metricKeys
    ) {
      tableKind
      metricKeys
    }
  }
`)

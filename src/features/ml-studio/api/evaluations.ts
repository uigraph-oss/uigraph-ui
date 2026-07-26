import { graphql } from '@/api'

export const ML_VERSION_EVALUATIONS = graphql(`
  query MlVersionEvaluations($orgId: ID!, $versionId: ID!) {
    mlVersionEvaluations(orgId: $orgId, versionId: $versionId) {
      id
      versionId
      experimentId
      modelName
      version
      datasetId
      name
      type
      description
      summary
      evaluatedAt
      evaluator
      createdBy
      parameters
      metrics
    }
  }
`)

export const ML_EXPERIMENT_EVALUATIONS = graphql(`
  query MlExperimentEvaluations($orgId: ID!, $experimentId: ID!) {
    mlExperimentEvaluations(orgId: $orgId, experimentId: $experimentId) {
      id
      versionId
      experimentId
      modelName
      version
      datasetId
      name
      type
      description
      summary
      evaluatedAt
      evaluator
      createdBy
      parameters
      metrics
    }
  }
`)

export const ML_VERSION_EVALUATIONS_PAGE = graphql(`
  query MlVersionEvaluationsPage(
    $orgId: ID!
    $versionId: ID!
    $search: String
    $limit: Int
    $offset: Int
  ) {
    mlVersionEvaluationsPage(
      orgId: $orgId
      versionId: $versionId
      search: $search
      limit: $limit
      offset: $offset
    ) {
      total
      evaluations {
        id
        versionId
        experimentId
        modelName
        version
        datasetId
        name
        type
        description
        summary
        evaluatedAt
        evaluator
        createdBy
        parameters
        metrics
      }
    }
  }
`)

export const ML_EXPERIMENT_EVALUATIONS_PAGE = graphql(`
  query MlExperimentEvaluationsPage(
    $orgId: ID!
    $experimentId: ID!
    $search: String
    $limit: Int
    $offset: Int
  ) {
    mlExperimentEvaluationsPage(
      orgId: $orgId
      experimentId: $experimentId
      search: $search
      limit: $limit
      offset: $offset
    ) {
      total
      evaluations {
        id
        versionId
        experimentId
        modelName
        version
        datasetId
        name
        type
        description
        summary
        evaluatedAt
        evaluator
        createdBy
        parameters
        metrics
      }
    }
  }
`)

export const ML_EVALUATION = graphql(`
  query MlEvaluation($orgId: ID!, $id: ID!) {
    mlEvaluation(orgId: $orgId, id: $id) {
      id
      versionId
      experimentId
      modelName
      version
      datasetId
      name
      type
      description
      summary
      evaluatedAt
      evaluator
      createdBy
      parameters
      metrics
    }
  }
`)

export const LINK_ML_VERSION_EVALUATIONS = graphql(`
  mutation LinkMlVersionEvaluations(
    $orgId: ID!
    $versionId: ID!
    $evaluationIds: [ID!]!
  ) {
    linkMlVersionEvaluations(
      orgId: $orgId
      versionId: $versionId
      evaluationIds: $evaluationIds
    ) {
      id
      versionId
    }
  }
`)

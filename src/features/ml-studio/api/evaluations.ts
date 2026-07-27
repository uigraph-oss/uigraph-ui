import { graphql } from '@/api'

export const ML_STUDIO_EVALUATIONS = graphql(`
  query MlStudioEvaluations($orgId: ID!, $experimentId: ID, $projectId: ID) {
    mlEvaluations(
      orgId: $orgId
      experimentId: $experimentId
      projectId: $projectId
    ) {
      evaluations {
        id
        name
        type
        experimentId
        modelName
        version
        startedAt
        endedAt
        tags
        metrics
      }
      total
    }
  }
`)

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
      startedAt
      endedAt
      tags
      source
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
      startedAt
      endedAt
      tags
      source
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
        startedAt
        endedAt
        tags
        source
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
        startedAt
        endedAt
        tags
        source
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
      startedAt
      endedAt
      tags
      source
      createdBy
      parameters
      metrics
    }
  }
`)

export const CREATE_ML_EVALUATION = graphql(`
  mutation CreateMlEvaluation(
    $orgId: ID!
    $experimentId: ID!
    $input: CreateMlEvaluationInput!
  ) {
    createMlEvaluation(
      orgId: $orgId
      experimentId: $experimentId
      input: $input
    ) {
      id
    }
  }
`)

export const UPDATE_ML_EVALUATION = graphql(`
  mutation UpdateMlEvaluation(
    $orgId: ID!
    $id: ID!
    $input: UpdateMlEvaluationInput!
  ) {
    updateMlEvaluation(orgId: $orgId, id: $id, input: $input) {
      id
    }
  }
`)

export const DELETE_ML_EVALUATION = graphql(`
  mutation DeleteMlEvaluation($orgId: ID!, $id: ID!) {
    deleteMlEvaluation(orgId: $orgId, id: $id)
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

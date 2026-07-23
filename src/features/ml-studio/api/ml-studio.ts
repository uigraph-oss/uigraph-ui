import { graphql } from '@/api'

export const ML_STUDIO_PROJECTS = graphql(`
  query MlStudioProjects($orgId: ID!) {
    mlProjects(orgId: $orgId) {
      id
      name
      type
      description
      sourceType
      sourceUrl
      team
      email
    }
  }
`)

export const ML_STUDIO_MODELS = graphql(`
  query MlStudioModels($orgId: ID!) {
    mlModels(orgId: $orgId) {
      id
      projectId
      name
      description
      domain
      problemType
      tags
      owners
      license
      references
      intendedUse
      limitations
      ethicalConsiderations
      caveats
      productionVersionId
      createdAt
      updatedAt
    }
  }
`)

export const ML_STUDIO_VERSIONS = graphql(`
  query MlStudioVersions($orgId: ID!) {
    mlModelVersions(orgId: $orgId) {
      id
      modelId
      version
      description
      deploymentStatus
      runId
      createdAt
    }
  }
`)

export const ML_VERSION_DEPLOYMENT_UPDATES = graphql(`
  query MlVersionDeploymentUpdates($orgId: ID!, $versionId: ID!) {
    mlVersionDeploymentUpdates(orgId: $orgId, versionId: $versionId) {
      id
      versionId
      fromStatus
      toStatus
      changedBy
      changedAt
    }
  }
`)

export const ML_STUDIO_DEPLOYMENT_UPDATES = graphql(`
  query MlStudioDeploymentUpdates($orgId: ID!) {
    mlVersionDeploymentUpdates(orgId: $orgId) {
      id
      versionId
      fromStatus
      toStatus
      changedBy
      changedAt
    }
  }
`)

export const ML_STUDIO_EXPERIMENTS = graphql(`
  query MlStudioExperiments($orgId: ID!) {
    mlExperiments(orgId: $orgId) {
      id
      projectId
      name
      description
      status
      startedAt
    }
  }
`)

export const ML_STUDIO_RUNS = graphql(`
  query MlStudioRuns($orgId: ID!) {
    mlRuns(orgId: $orgId) {
      id
      experimentId
      name
      status
      startedAt
      endedAt
      duration
      notes
      parameters
      metrics
      datasetId
      series
    }
  }
`)

export const ML_STUDIO_ARTIFACTS = graphql(`
  query MlStudioArtifacts($orgId: ID!) {
    mlArtifacts(orgId: $orgId) {
      id
      runId
      name
      type
      uri
      size
      format
    }
  }
`)

export const ML_STUDIO_DATASETS = graphql(`
  query MlStudioDatasets($orgId: ID!, $experimentId: ID) {
    mlDatasets(orgId: $orgId, experimentId: $experimentId) {
      id
      experimentId
      name
      digest
      source
      sourceType
      context
      rowCount
      schema {
        name
        type
        description
      }
    }
  }
`)

export const ML_STUDIO_DEPLOYMENTS = graphql(`
  query MlStudioDeployments($orgId: ID!) {
    mlDeployments(orgId: $orgId) {
      id
      modelId
      versionId
      name
      environment
      status
      endpoint
      region
      deployedAt
      rolledBackAt
    }
  }
`)

export const ML_STUDIO_FINDINGS = graphql(`
  query MlStudioFindings($orgId: ID!) {
    mlFindings(orgId: $orgId) {
      id
      modelId
      versionId
      title
      summary
      description
      runIds
    }
  }
`)

export const UPDATE_ML_MODEL = graphql(`
  mutation UpdateMlModel(
    $orgId: ID!
    $id: ID!
    $domain: String
    $problemType: String
    $owners: String
    $license: String
    $references: [String!]
    $intendedUse: String
    $limitations: String
    $ethicalConsiderations: String
    $caveats: String
  ) {
    updateMlModel(
      orgId: $orgId
      id: $id
      domain: $domain
      problemType: $problemType
      owners: $owners
      license: $license
      references: $references
      intendedUse: $intendedUse
      limitations: $limitations
      ethicalConsiderations: $ethicalConsiderations
      caveats: $caveats
    ) {
      id
      domain
      problemType
      owners
      license
      references
      intendedUse
      limitations
      ethicalConsiderations
      caveats
    }
  }
`)

export const CREATE_ML_DEPLOYMENT = graphql(`
  mutation CreateMlDeployment($orgId: ID!, $input: CreateMlDeploymentInput!) {
    createMlDeployment(orgId: $orgId, input: $input) {
      id
    }
  }
`)

export const UPDATE_ML_DEPLOYMENT = graphql(`
  mutation UpdateMlDeployment(
    $orgId: ID!
    $id: ID!
    $input: UpdateMlDeploymentInput!
  ) {
    updateMlDeployment(orgId: $orgId, id: $id, input: $input) {
      id
    }
  }
`)

export const DELETE_ML_DEPLOYMENT = graphql(`
  mutation DeleteMlDeployment($orgId: ID!, $id: ID!) {
    deleteMlDeployment(orgId: $orgId, id: $id)
  }
`)

export const CREATE_ML_VERSION_DEPLOYMENT_UPDATE = graphql(`
  mutation CreateMlVersionDeploymentUpdate(
    $orgId: ID!
    $versionId: ID!
    $toStatus: String!
  ) {
    createMlVersionDeploymentUpdate(
      orgId: $orgId
      versionId: $versionId
      toStatus: $toStatus
    ) {
      id
      versionId
      fromStatus
      toStatus
      changedBy
      changedAt
    }
  }
`)

export const CREATE_ML_PROJECT = graphql(`
  mutation CreateMlProject($orgId: ID!, $input: CreateMlProjectInput!) {
    createMlProject(orgId: $orgId, input: $input) {
      id
    }
  }
`)

export const CREATE_ML_FINDING = graphql(`
  mutation CreateMlFinding($orgId: ID!, $input: CreateMlFindingInput!) {
    createMlFinding(orgId: $orgId, input: $input) {
      id
    }
  }
`)

export const UPDATE_ML_FINDING = graphql(`
  mutation UpdateMlFinding(
    $orgId: ID!
    $id: ID!
    $input: UpdateMlFindingInput!
  ) {
    updateMlFinding(orgId: $orgId, id: $id, input: $input) {
      id
    }
  }
`)

export const DELETE_ML_FINDING = graphql(`
  mutation DeleteMlFinding($orgId: ID!, $id: ID!) {
    deleteMlFinding(orgId: $orgId, id: $id)
  }
`)

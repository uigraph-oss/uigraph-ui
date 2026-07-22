export type ProblemType =
  | 'classification'
  | 'regression'
  | 'ranking'
  | 'generation'
  | 'embedding'
  | 'other'

export type Model = {
  id: string
  name: string
  description: string
  domain: string
  problemType: ProblemType
  tags: string[]
  owners: string
  license: string
  references: string[]
  intendedUse: string
  limitations: string
  ethicalConsiderations: string
  caveats: string
  createdAt: string
  updatedAt: string
  productionVersionId?: string
}

export type VersionStage = 'candidate' | 'staging' | 'production' | 'retired'
export type VersionStatus = 'draft' | 'released' | 'deprecated'

export type ModelVersion = {
  id: string
  modelId: string
  version: string
  description: string
  status: VersionStatus
  stage: VersionStage
  runId?: string
  createdAt: string
}

export type ExperimentStatus = 'active' | 'concluded' | 'archived'

export type Experiment = {
  id: string
  name: string
  description: string
  status: ExperimentStatus
  startedAt: string
}

export type RunStatus = 'running' | 'completed' | 'failed' | 'cancelled'

export type MetricPoint = {
  step: number
  value: number
}

export type Run = {
  id: string
  experimentId: string
  name: string
  status: RunStatus
  startedAt: string
  endedAt?: string
  duration: string
  notes: string
  parameters: Record<string, string | number>
  metrics: Record<string, number>
  series: Record<string, MetricPoint[]>
  datasetId?: string
  artifactIds: string[]
}

export type ArtifactType =
  | 'Model checkpoint'
  | 'Confusion matrix'
  | 'Notebook'
  | 'Plot'
  | 'ONNX'
  | 'GGUF'

export type Artifact = {
  id: string
  runId: string
  name: string
  type: ArtifactType
  uri: string
  size: string
  format: string
}

export type DatasetContext = 'training' | 'evaluation'

export type SchemaField = {
  name: string
  type: string
  description: string
}

export type Dataset = {
  id: string
  experimentId: string
  name: string
  digest: string
  source: string
  sourceType: string
  context: DatasetContext
  rowCount: number
  schema: SchemaField[]
}

export type DeploymentStatus =
  'live' | 'rolling-out' | 'rolled-back' | 'stopped'

export type Deployment = {
  id: string
  modelId: string
  versionId: string
  name: string
  environment: string
  status: DeploymentStatus
  endpoint: string
  region: string
  deployedAt: string
  rolledBackAt?: string
}

export type Finding = {
  id: string
  modelId: string
  versionId?: string
  title: string
  summary: string
  description: string
  runIds: string[]
}

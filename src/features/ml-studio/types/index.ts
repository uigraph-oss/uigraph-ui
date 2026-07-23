export type ProblemType =
  | 'classification'
  | 'regression'
  | 'ranking'
  | 'generation'
  | 'embedding'
  | 'other'

export type ProjectType = 'model' | 'training'

export type Project = {
  id: string
  name: string
  type: ProjectType
  description: string
  sourceType: string
  sourceUrl: string
  teamId: string | null
}

export type Model = {
  id: string
  projectId?: string
  name: string
  description: string
  domain: string
  problemType: ProblemType
  tags: string[]
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

export type ModelVersion = {
  id: string
  modelId: string
  version: string
  description: string
  deploymentStatus: VersionStage
  runId?: string
  createdAt: string
}

export type VersionDeploymentUpdate = {
  id: string
  versionId: string
  fromStatus?: VersionStage
  toStatus: VersionStage
  changedBy: string
  changedAt: string
}

export type ExperimentStatus = 'active' | 'concluded' | 'archived'

export type Experiment = {
  id: string
  projectId?: string
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
  updatedAt?: string
  syncedAt?: string
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
  downloadUri: string
  size: string
  format: string
  updatedAt?: string
  syncedAt?: string
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

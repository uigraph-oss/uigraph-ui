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
  considerations: string
  recommendations: string
  createdAt: string
  updatedAt: string
  productionVersionId?: string
  origin: ExperimentSource
}

export type ModelVersion = {
  id: string
  modelId: string
  version: string
  description: string
  runId?: string
  source: 'mlflow' | 'manual'
  createdAt: string
}

export type ExperimentStatus = 'active' | 'concluded' | 'archived'

export type ExperimentSource = 'mlflow' | 'manual'

export type Experiment = {
  id: string
  projectId?: string
  name: string
  description: string
  status: ExperimentStatus
  tags: string[]
  createdAt: string
  source: ExperimentSource
  createdBy?: string
  updatedBy?: string
}

export type RunStatus = 'running' | 'completed' | 'failed' | 'cancelled'

export type Run = {
  id: string
  experimentId: string
  name: string
  status: RunStatus
  startedAt: string
  endedAt: string | null
  notes: string
  parameters: Record<string, string | number>
  metrics: Record<string, number>
  datasetId?: string
  artifactIds: string[]
  source: ExperimentSource
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
  tags?: Record<string, string>
  origin: ExperimentSource
}

export type Finding = {
  id: string
  modelId: string
  versionId?: string
  title: string
  summary: string
  description: string
  runIds: string[]
  evaluationIds: string[]
}

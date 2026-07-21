export type ModelStatus = 'active' | 'inactive' | 'archived'
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
  owner: string
  status: ModelStatus
  domain: string
  problemType: ProblemType
  tags: string[]
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
  displayName: string
  description: string
  status: VersionStatus
  stage: VersionStage
  releaseNotes: string
  createdAt: string
  releasedAt?: string
}

export type ExperimentStatus = 'active' | 'concluded' | 'archived'

export type Experiment = {
  id: string
  modelId: string
  versionId: string
  name: string
  description: string
  goal: string
  hypothesis: string
  owner: string
  status: ExperimentStatus
  startedAt: string
  endedAt?: string
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
  trigger: string
  environment: string
  notes: string
  parameters: Record<string, string | number>
  metrics: Record<string, number>
  series: Record<string, MetricPoint[]>
  datasetId?: string
  modelArch: string
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
  description: string
  uri: string
  size: string
  format: string
  createdAt: string
}

export type DatasetType = 'tabular' | 'text' | 'image' | 'audio' | 'multimodal'

export type SchemaField = {
  name: string
  type: string
  description: string
}

export type SplitInfo = {
  train: number
  validation: number
  test: number
}

export type Dataset = {
  id: string
  modelId: string
  versionId: string
  name: string
  version: string
  description: string
  source: string
  type: DatasetType
  size: string
  rowCount: number
  schema: SchemaField[]
  split: SplitInfo
  license: string
  parentId?: string
  tags: string[]
  createdAt: string
}

export type MetricDirection = 'higher-is-better' | 'lower-is-better'
export type MetricCategory = 'quality' | 'performance' | 'cost' | 'business'

export type Metric = {
  id: string
  name: string
  value: number
  unit: string
  direction: MetricDirection
  category: MetricCategory
  measuredAt: string
}

export type EvaluationType =
  | 'Offline Benchmark'
  | 'Online A/B Test'
  | 'Human Review'
  | 'Production Monitoring'

export type Evaluation = {
  id: string
  modelId: string
  versionId: string
  name: string
  type: EvaluationType
  description: string
  summary: string
  evaluatedAt: string
  evaluator: string
  metrics: Metric[]
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

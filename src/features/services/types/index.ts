export interface Service {
  id: string
  name: string
  domain: string
  team: string
  environment: 'production' | 'staging' | 'development'
  status: 'healthy' | 'degraded' | 'down' | 'maintenance'
  description: string
  endpoints: number
  lastDeployed: string
  uptime: string
  tags?: string[]
  owner?: string
  repository?: string
  documentation?: string
  // New fields for production-ready cards
  domainArea?: string // e.g., "Auth", "Payments"
  updatedBy?: string // Actor who last updated
  specLinked?: boolean // Whether a tech spec is linked
  specCoverage?: {
    covered: number
    total: number
  }
  diagramCount?: number // Number of flow diagrams
}

export interface ServiceEndpoint {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  auth: 'none' | 'bearer' | 'api-key' | 'oauth'
  statusCodes: number[]
  tags: string[]
  lastUpdated: string
  sourceFile?: string
  description?: string
}

export interface ServiceDiagram {
  id: string
  name: string
  type: 'flow' | 'dependency'
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  version: string
  lastUpdated: string
}

export interface DiagramNode {
  id: string
  type:
    | 'decision'
    | 'api-call'
    | 'db-op'
    | 'external'
    | 'queue'
    | 'loop'
    | 'parallel'
  label: string
  position: { x: number; y: number }
  linkedEndpoint?: string
  linkedJob?: string
  linkedSchema?: string
  note?: string
}

export interface DiagramEdge {
  id: string
  source: string
  target: string
  label?: string
}

export interface ServiceDataSchema {
  id: string
  name: string
  type: 'database' | 'table' | 'collection'
  environment: string
  lastScanned: string
  tables?: DataTable[]
  columns?: DataColumn[]
  indexes?: DataIndex[]
}

export interface DataTable {
  name: string
  columns: DataColumn[]
  indexes: DataIndex[]
  primaryKey?: string
  sortKey?: string
}

export interface DataColumn {
  name: string
  type: string
  nullable: boolean
  description?: string
}

export interface DataIndex {
  name: string
  type: 'primary' | 'secondary' | 'global'
  columns: string[]
}

export interface ServiceJob {
  id: string
  name: string
  type: 'cron' | 'event' | 'queue'
  trigger: string
  sourceFile?: string
  lastUpdated: string
  linkedFlowNode?: string
}

export interface ServiceConfig {
  key: string
  description: string
  tags: string[]
  environments: Record<string, string>
  usedBy: string[]
}

export interface ServiceComment {
  id: string
  content: string
  author: string
  createdAt: string
  targetType: 'endpoint' | 'diagram' | 'schema' | 'job'
  targetId: string
  resolved: boolean
  replies?: ServiceComment[]
}

export interface ServiceOwner {
  id: string
  name: string
  email: string
  role: 'owner' | 'contributor' | 'reviewer'
  team: string
}

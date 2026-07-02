import { SchemaDialect } from '@uigraph/sdk'
import { Database, FileJson, Server, Table } from 'lucide-react'

export type NoSQLDialect = Exclude<
  SchemaDialect,
  'mysql' | 'sqlite' | 'postgresql'
>

export type StepId =
  | 'basic'
  | 'tableKeys'
  | 'indexes'
  | 'entities'
  | 'collections'
  | 'keyspaceTables'
  | 'partitioning'
  | 'review'

export type DialectConfig = {
  id: NoSQLDialect | (string & {})
  label: string
  description: string
  isNotAvailable: boolean
  icon: React.ComponentType<{ className?: string }>
  steps: StepId[]
}

export const DIALECTS: Record<string, DialectConfig> = {
  dynamodb: {
    id: 'dynamodb',
    label: 'DynamoDB',
    description: 'Amazon DynamoDB - NoSQL database service',
    isNotAvailable: false,
    icon: Table,
    steps: ['basic', 'tableKeys', 'indexes', 'entities'],
  },
  mongodb: {
    id: 'mongodb',
    label: 'MongoDB',
    description: 'MongoDB - Document database',
    isNotAvailable: false,
    icon: Database,
    steps: ['basic', 'collections', 'review'],
  },
  cassandra: {
    id: 'cassandra',
    label: 'Cassandra',
    description: 'Apache Cassandra - Wide-column store',
    isNotAvailable: true,
    icon: Server,
    steps: ['basic', 'keyspaceTables', 'partitioning', 'indexes'],
  },
  json: {
    id: 'json',
    label: 'NoSQL JSON / Other',
    description: 'Generic NoSQL JSON schema',
    isNotAvailable: true,
    icon: FileJson,
    steps: ['basic', 'collections'],
  },
} as const

export function getDialectConfig(dialectId: NoSQLDialect): DialectConfig {
  return DIALECTS[dialectId]
}

export function getStepLabel(stepId: StepId, dialectId?: NoSQLDialect): string {
  // DynamoDB-specific labels
  if (dialectId === 'dynamodb') {
    const dynamoLabels: Record<StepId, string> = {
      basic: 'Basic info',
      tableKeys: 'Primary keys',
      indexes: 'Indexes',
      entities: 'Attributes',
      collections: 'Collections',
      keyspaceTables: 'Keyspace & Tables',
      partitioning: 'Partitioning',
      review: 'Review',
    }
    return dynamoLabels[stepId] || stepId
  }

  // MongoDB-specific labels
  if (dialectId === 'mongodb') {
    const mongoLabels: Record<StepId, string> = {
      basic: 'Basic info',
      collections: 'Collections',
      review: 'Review',
      tableKeys: 'Table Keys',
      indexes: 'Indexes',
      entities: 'Entities',
      keyspaceTables: 'Keyspace & Tables',
      partitioning: 'Partitioning',
    }
    return mongoLabels[stepId] || stepId
  }

  // Default labels for other dialects
  const labels: Record<StepId, string> = {
    basic: 'Basic Info',
    tableKeys: 'Table Keys',
    indexes: 'Indexes',
    entities: 'Entities',
    collections: 'Collections',
    keyspaceTables: 'Keyspace & Tables',
    partitioning: 'Partitioning',
    review: 'Review',
  }
  return labels[stepId] || stepId
}

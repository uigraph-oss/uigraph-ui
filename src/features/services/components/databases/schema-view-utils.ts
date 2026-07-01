import { DynamoEditorSchema } from '@/features/diagram-portal/components/nosql-editor/nosql-schema'
import { arrayNonNullable } from 'daily-code'
import { z } from 'zod'
import { ServiceDbSchema } from '../../api/service-db'

export type SchemaViewKind =
  | 'sql'
  | 'dynamodb'
  | 'mongodb'
  | 'json-collections'
  | 'json-tables'
  | 'empty'

type JsonNoSQLSchema = {
  json?: {
    collections?: unknown[] | null
  } | null
}

export function getSchemaViewKind(db: ServiceDbSchema): SchemaViewKind {
  const dialect = (db.dialect ?? db.dbType ?? '').toLowerCase()
  const noSQLSchema = db.noSQLSchema as JsonNoSQLSchema | null | undefined

  if (db.noSQLSchema?.dynamo?.table) {
    return 'dynamodb'
  }

  if (arrayNonNullable(db.noSQLSchema?.mongo?.collections).length > 0) {
    return 'mongodb'
  }

  if (arrayNonNullable(noSQLSchema?.json?.collections).length > 0) {
    return 'json-collections'
  }

  if (['postgresql', 'postgres', 'mysql', 'sqlite'].includes(dialect)) {
    return 'sql'
  }

  if (dialect === 'json') {
    return arrayNonNullable(db.tables).length > 0 ? 'json-tables' : 'empty'
  }

  if (dialect === 'dynamodb' || dialect === 'mongodb') {
    return 'empty'
  }

  if (arrayNonNullable(db.tables).length > 0) {
    return 'sql'
  }

  return 'empty'
}

export function getSchemaUpdatedDate(db: ServiceDbSchema): Date | null {
  if (db.updatedAt) return new Date(db.updatedAt)
  if (db.createdAt) return new Date(db.createdAt)
  return null
}

function countDynamoAttributes(
  attrs: z.infer<typeof DynamoEditorSchema>['attributes']
): number {
  return attrs.reduce((count, attr) => {
    let nested = 0
    if (attr.fields?.length) nested += countDynamoAttributes(attr.fields)
    if (attr.itemFields?.length) nested += countDynamoAttributes(attr.itemFields)
    return count + 1 + nested
  }, 0)
}

export type SummaryStat = {
  label: string
  value: string | number
}

export function getSchemaSummaryStats(
  db: ServiceDbSchema,
  kind: SchemaViewKind
): SummaryStat[] {
  const databaseStat: SummaryStat = {
    label: 'Database',
    value: db.dbName ?? 'Untitled',
  }

  if (kind === 'dynamodb') {
    const table = db.noSQLSchema?.dynamo?.table
    const attributes = table?.attributes ?? []
    const gsis = table?.globalSecondaryIndexes ?? []

    return [
      databaseStat,
      { label: 'Table', value: table?.name?.trim() || 1 },
      { label: 'Attributes', value: countDynamoAttributes(attributes) },
      { label: 'GSIs', value: gsis.length },
    ]
  }

  if (kind === 'mongodb' || kind === 'json-collections') {
    const collections =
      kind === 'mongodb'
        ? arrayNonNullable(db.noSQLSchema?.mongo?.collections)
        : arrayNonNullable(
            (db.noSQLSchema as JsonNoSQLSchema | null)?.json?.collections
          )

    const totalFields = collections.reduce(
      (sum, collection) =>
        sum +
        arrayNonNullable(
          (collection as { fields?: unknown[] | null }).fields
        ).length,
      0
    )
    const totalIndexes = collections.reduce(
      (sum, collection) =>
        sum +
        arrayNonNullable(
          (collection as { indexes?: unknown[] | null }).indexes
        ).length,
      0
    )

    return [
      databaseStat,
      { label: 'Collections', value: collections.length },
      { label: 'Fields', value: totalFields },
      { label: 'Indexes', value: totalIndexes },
    ]
  }

  if (kind === 'json-tables') {
    const tables = arrayNonNullable(db.tables)
    const totalFields = tables.reduce(
      (sum, table) => sum + arrayNonNullable(table.columns).length,
      0
    )

    return [
      databaseStat,
      { label: 'Collections', value: tables.length },
      { label: 'Fields', value: totalFields },
      { label: 'Indexes', value: 0 },
    ]
  }

  const tables = arrayNonNullable(db.tables)
  const totalColumns = tables.reduce(
    (sum, table) => sum + arrayNonNullable(table.columns).length,
    0
  )
  const totalIndexes = tables.reduce(
    (sum, table) => sum + arrayNonNullable(table.indexes).length,
    0
  )

  return [
    databaseStat,
    { label: 'Tables', value: tables.length },
    { label: 'Columns', value: totalColumns },
    { label: 'Indexes', value: totalIndexes },
  ]
}

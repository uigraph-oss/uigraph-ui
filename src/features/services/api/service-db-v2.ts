import { GT } from '@/api'
import { graphql } from '@/api-v2'

export type LegacyServiceDb = GT.ServiceDb & {
  serviceDBId: string
  serviceId: string
  dbName: string
  dbType: string
  dialect: string
}

export const SERVICE_DBS_V2 = graphql(`
  query ServiceDBsV2($orgId: ID!, $serviceId: ID!) {
    serviceDBs(orgId: $orgId, serviceId: $serviceId) {
      id
      serviceId
      orgId
      dbName
      dbType
      dialect
      schemaJson
      source
      sourceTs
      createdBy
      updatedBy
      createdAt
      updatedAt
    }
  }
`)

export const SERVICE_DB_V2 = graphql(`
  query ServiceDBV2($orgId: ID!, $serviceId: ID!, $id: ID!) {
    serviceDB(orgId: $orgId, serviceId: $serviceId, id: $id) {
      id
      serviceId
      orgId
      dbName
      dbType
      dialect
      schemaJson
      source
      sourceTs
      createdBy
      updatedBy
      createdAt
      updatedAt
    }
  }
`)

export const CREATE_SERVICE_DB_V2 = graphql(`
  mutation CreateServiceDBV2(
    $orgId: ID!
    $serviceId: ID!
    $input: CreateServiceDBInput!
  ) {
    createServiceDB(orgId: $orgId, serviceId: $serviceId, input: $input) {
      id
      dbName
    }
  }
`)

export const UPDATE_SERVICE_DB_V2 = graphql(`
  mutation UpdateServiceDBV2(
    $orgId: ID!
    $serviceId: ID!
    $id: ID!
    $input: UpdateServiceDBInput!
  ) {
    updateServiceDB(orgId: $orgId, serviceId: $serviceId, id: $id, input: $input) {
      id
      dbName
    }
  }
`)

export const DELETE_SERVICE_DB_V2 = graphql(`
  mutation DeleteServiceDBV2($orgId: ID!, $serviceId: ID!, $id: ID!) {
    deleteServiceDB(orgId: $orgId, serviceId: $serviceId, id: $id)
  }
`)

type ParsedSchemaJson = {
  tables?: GT.DbTable[]
  noSQLSchema?: GT.ServiceDb['noSQLSchema']
  dbDiagramId?: string
  pgDumpFileId?: string
}

export function parseSchemaJson(
  schemaJson: string | null | undefined | ParsedSchemaJson
): ParsedSchemaJson {
  if (schemaJson == null || schemaJson === '') {
    return {}
  }

  try {
    let parsed: unknown =
      typeof schemaJson === 'string' ? JSON.parse(schemaJson) : schemaJson

    // Handle double-encoded JSON strings from older writes or API round-trips.
    if (typeof parsed === 'string') {
      parsed = JSON.parse(parsed)
    }

    if (typeof parsed !== 'object' || parsed === null) {
      return {}
    }

    return parsed as ParsedSchemaJson
  } catch {
    return {}
  }
}

export function serviceDBToLegacy(db: {
  id: string
  serviceId: string
  dbName: string
  dbType: string
  dialect: string
  schemaJson: string | null | undefined
  createdBy: string
  updatedBy?: string | null
  createdAt: string
  updatedAt: string
}): LegacyServiceDb {
  const parsed = parseSchemaJson(db.schemaJson)
  return {
    serviceDBId: db.id,
    serviceId: db.serviceId,
    dbName: db.dbName,
    dbType: db.dbType,
    dialect: db.dialect,
    tables: (parsed.tables ?? []) as GT.DbTable[],
    noSQLSchema: parsed.noSQLSchema ?? null,
    dbDiagramId: parsed.dbDiagramId,
    pgDumpFileId: parsed.pgDumpFileId,
    createdBy: db.createdBy,
    updatedBy: db.updatedBy,
    createdAt: db.createdAt,
    updatedAt: db.updatedAt,
  }
}

export function toCreateServiceDBInput(data: {
  dbName: string
  dbType: string
  dialect?: string
  tables?: unknown[]
  noSQLSchema?: unknown
  dbDiagramId?: string
  pgDumpFileId?: string
}) {
  return {
    dbName: data.dbName,
    dbType: data.dbType,
    dialect: data.dialect ?? '',
    schemaJson: JSON.stringify({
      tables: data.tables ?? [],
      noSQLSchema: data.noSQLSchema,
      dbDiagramId: data.dbDiagramId,
      pgDumpFileId: data.pgDumpFileId,
    }),
  }
}

export function toUpdateServiceDBInput(data: {
  dbName?: string
  dbType?: string
  dialect?: string
  tables?: unknown[]
  noSQLSchema?: unknown
  dbDiagramId?: string
  pgDumpFileId?: string
}) {
  return {
    dbName: data.dbName,
    dbType: data.dbType,
    dialect: data.dialect,
    schemaJson: JSON.stringify({
      tables: data.tables,
      noSQLSchema: data.noSQLSchema,
      dbDiagramId: data.dbDiagramId,
      pgDumpFileId: data.pgDumpFileId,
    }),
  }
}

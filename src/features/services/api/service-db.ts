import { graphql, V2 } from '@/api'
import {
  DynamoEditorSchema,
  MongoCollectionSchema,
} from '@/features/diagram-portal/components/nosql-editor/nosql-schema'
import { arrayNonNullable } from 'daily-code'
import { z } from 'zod'

export type ServiceDbActor = {
  id?: string | null
  name?: string | null
  avatarUrl?: string | null
}

export type DbColumn = V2.DbColumn
export type DbIndex = V2.DbIndex
export type DbTable = V2.DbTable

export type ServiceDbNoSQLSchema = {
  dynamo?: { table?: z.infer<typeof DynamoEditorSchema> | null } | null
  mongo?: {
    collections?: z.infer<typeof MongoCollectionSchema>[] | null
  } | null
} | null

export type ServiceDbSchema = {
  dbDiagramId?: string | null
  dbName?: string | null
  dbType?: string | null
  dialect?: string | null
  noSQLSchema?: ServiceDbNoSQLSchema
  pgDumpFileId?: string | null
  serviceDBId?: string | null
  serviceId?: string | null
  tables?: DbTable[] | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type LegacyServiceDb = ServiceDbSchema & {
  serviceDBId: string
  serviceId: string
  dbName: string
  dbType: string
  dialect: string
  createdByActor?: ServiceDbActor | null
  updatedByActor?: ServiceDbActor | null
}

export const SERVICE_DBS = graphql(`
  query ServiceDBsV2($orgId: ID!, $serviceId: ID!) {
    serviceDBs(orgId: $orgId, serviceId: $serviceId) {
      id
      serviceId
      orgId
      dbName
      dbType
      dialect
      tables {
        name
        columns {
          name
          type
          nullable
          isPrimaryKey
          unique
          autoIncrement
          defaultValue
          foreignKey
          description
        }
        indexes {
          name
          type
          fields
        }
      }
      noSQLSchema
      dbDiagramId
      pgDumpFileId
      source
      sourceTs
      createdBy
      updatedBy
      createdAt
      updatedAt
      createdByActor {
        id
        name
        avatarUrl
      }
      updatedByActor {
        id
        name
        avatarUrl
      }
    }
  }
`)

export const SERVICE_DB = graphql(`
  query ServiceDBV2($orgId: ID!, $serviceId: ID!, $id: ID!) {
    serviceDB(orgId: $orgId, serviceId: $serviceId, id: $id) {
      id
      serviceId
      orgId
      dbName
      dbType
      dialect
      tables {
        name
        columns {
          name
          type
          nullable
          isPrimaryKey
          unique
          autoIncrement
          defaultValue
          foreignKey
          description
        }
        indexes {
          name
          type
          fields
        }
      }
      noSQLSchema
      dbDiagramId
      pgDumpFileId
      source
      sourceTs
      createdBy
      updatedBy
      createdAt
      updatedAt
      createdByActor {
        id
        name
        avatarUrl
      }
      updatedByActor {
        id
        name
        avatarUrl
      }
    }
  }
`)

export const CREATE_SERVICE_DB = graphql(`
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

export const UPDATE_SERVICE_DB = graphql(`
  mutation UpdateServiceDBV2(
    $orgId: ID!
    $serviceId: ID!
    $id: ID!
    $input: UpdateServiceDBInput!
  ) {
    updateServiceDB(
      orgId: $orgId
      serviceId: $serviceId
      id: $id
      input: $input
    ) {
      id
      dbName
    }
  }
`)

export const DELETE_SERVICE_DB = graphql(`
  mutation DeleteServiceDBV2($orgId: ID!, $serviceId: ID!, $id: ID!) {
    deleteServiceDB(orgId: $orgId, serviceId: $serviceId, id: $id)
  }
`)

export function serviceDBToLegacy(db: {
  id: string
  serviceId: string
  dbName: string
  dbType: string
  dialect: string
  tables?: DbTable[] | null
  noSQLSchema?: unknown
  dbDiagramId?: string | null
  pgDumpFileId?: string | null
  createdAt: string
  updatedAt: string
  createdByActor?: ServiceDbActor | null
  updatedByActor?: ServiceDbActor | null
}): LegacyServiceDb {
  return {
    serviceDBId: db.id,
    serviceId: db.serviceId,
    dbName: db.dbName,
    dbType: db.dbType,
    dialect: db.dialect,
    tables: arrayNonNullable(db.tables),
    noSQLSchema: (db.noSQLSchema ?? null) as ServiceDbNoSQLSchema,
    dbDiagramId: db.dbDiagramId,
    pgDumpFileId: db.pgDumpFileId,
    createdAt: db.createdAt,
    updatedAt: db.updatedAt,
    createdByActor: db.createdByActor,
    updatedByActor: db.updatedByActor,
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

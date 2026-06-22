import { graphql } from '@/api'
import { DbTable, serviceDBToLegacy } from './service-db'

export const SERVICE_DB_VERSIONS = graphql(`
  query ServiceDBVersions($orgId: ID!, $serviceId: ID!, $serviceDbId: ID!) {
    serviceDBVersions(
      orgId: $orgId
      serviceId: $serviceId
      serviceDbId: $serviceDbId
    ) {
      id
      serviceDbId
      versionNumber
      label
      schemaJson
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
      isAutoVersion
      createdBy
      createdAt
      createdByActor {
        id
        name
        avatarUrl
      }
    }
  }
`)

export const CREATE_SERVICE_DB_VERSION = graphql(`
  mutation CreateServiceDBVersion(
    $orgId: ID!
    $serviceId: ID!
    $serviceDbId: ID!
    $input: CreateServiceDBVersionInput!
  ) {
    createServiceDBVersion(
      orgId: $orgId
      serviceId: $serviceId
      serviceDbId: $serviceDbId
      input: $input
    ) {
      id
      versionNumber
    }
  }
`)

export const RESTORE_SERVICE_DB_VERSION = graphql(`
  mutation RestoreServiceDBVersion(
    $orgId: ID!
    $serviceId: ID!
    $serviceDbId: ID!
    $versionId: ID!
  ) {
    restoreServiceDBVersion(
      orgId: $orgId
      serviceId: $serviceId
      serviceDbId: $serviceDbId
      versionId: $versionId
    ) {
      id
      dbName
    }
  }
`)

export function toCreateServiceDBVersionInput(data: {
  dbName?: string
  dbType?: string
  dialect?: string
  tables?: unknown[]
  noSQLSchema?: unknown
  dbDiagramId?: string
  pgDumpFileId?: string
  label?: string
  isAutoVersion?: boolean
}) {
  return {
    label: data.label,
    isAutoVersion: data.isAutoVersion,
    dbName: data.dbName,
    dbType: data.dbType,
    dialect: data.dialect,
    schemaJson: JSON.stringify({
      tables: data.tables ?? [],
      noSQLSchema: data.noSQLSchema,
      dbDiagramId: data.dbDiagramId,
      pgDumpFileId: data.pgDumpFileId,
    }),
  }
}

export function serviceDBVersionToLegacyWithDb(
  v: {
    id: string
    serviceDbId: string
    versionNumber: number
    label?: string | null
    schemaJson: string
    tables?: DbTable[] | null
    noSQLSchema?: unknown
    dbDiagramId?: string | null
    pgDumpFileId?: string | null
    isAutoVersion: boolean
    createdBy: string
    createdAt: string
    createdByActor?: {
      id?: string | null
      name?: string | null
      avatarUrl?: string | null
    } | null
  },
  serviceId: string,
  dbMeta?: { dbName?: string; dbType?: string; dialect?: string }
) {
  return {
    ...serviceDBVersionToLegacy(v),
    serviceDB: serviceDBToLegacy({
      id: v.serviceDbId,
      serviceId,
      dbName: dbMeta?.dbName ?? '',
      dbType: dbMeta?.dbType ?? '',
      dialect: dbMeta?.dialect ?? '',
      tables: v.tables,
      noSQLSchema: v.noSQLSchema,
      dbDiagramId: v.dbDiagramId,
      pgDumpFileId: v.pgDumpFileId,
      createdAt: v.createdAt,
      updatedAt: v.createdAt,
    }),
  }
}

export function serviceDBVersionToLegacy(v: {
  id: string
  serviceDbId: string
  versionNumber: number
  label?: string | null
  schemaJson: string
  isAutoVersion: boolean
  createdBy: string
  createdAt: string
  createdByActor?: {
    id?: string | null
    name?: string | null
    avatarUrl?: string | null
  } | null
}) {
  return {
    versionId: v.id,
    serviceDBId: v.serviceDbId,
    versionNumber: v.versionNumber,
    label: v.label,
    schemaJson: v.schemaJson,
    isAutoVersion: v.isAutoVersion,
    createdBy: v.createdBy,
    createdAt: v.createdAt,
    createdByActor: v.createdByActor ?? null,
  }
}

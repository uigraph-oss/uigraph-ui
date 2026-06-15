import { graphql } from '@/api-v2'
import { serviceDBToLegacy } from './service-db-v2'

export const SERVICE_DB_VERSIONS_V2 = graphql(`
  query ServiceDBVersionsV2(
    $orgId: ID!
    $serviceId: ID!
    $serviceDbId: ID!
  ) {
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
      source
      sourceTs
      isAutoVersion
      createdBy
      createdAt
    }
  }
`)

export const CREATE_SERVICE_DB_VERSION_V2 = graphql(`
  mutation CreateServiceDBVersionV2(
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

export const RESTORE_SERVICE_DB_VERSION_V2 = graphql(`
  mutation RestoreServiceDBVersionV2(
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
    isAutoVersion: boolean
    createdBy: string
    createdAt: string
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
      schemaJson: v.schemaJson,
      createdBy: v.createdBy,
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
  }
}

import { graphql } from '@/api'

export const GET_SERVICE_AND_DB_VERSIONS_QUERY = graphql(`
  query V1GetServiceAndDBVersions($serviceDBId: String!, $serviceId: String!) {
    v1GetServiceDB(serviceDBId: $serviceDBId, serviceId: $serviceId) {
      serviceDBId
      serviceId
      dbName
      dbType
      dialect
      dbDiagramId
      pgDumpFileId
      tables {
        name
        columns {
          name
          type
          nullable
          description
          isPrimaryKey
          defaultValue
          autoIncrement
          unique
          foreignKey
        }
        indexes {
          type
          name
          fields
        }
      }

      noSQLSchema
      createdBy
      updatedBy
      createdAt
      deletedAt
      deletedBy
      updatedAt
    }

    v1GetServiceDBVersions(serviceDBId: $serviceDBId) {
      versionId
      serviceDBId
      versionNumber
      label
      createdBy
      createdAt
      isAutoVersion

      serviceDB {
        serviceDBId
        serviceId
        dbName
        dbType
        dialect
        dbDiagramId
        pgDumpFileId
        tables {
          name
          columns {
            name
            type
            nullable
            description
            isPrimaryKey
            defaultValue
            autoIncrement
            unique
            foreignKey
          }
          indexes {
            type
            name
            fields
          }
        }

        noSQLSchema
        createdBy
        updatedBy
        createdAt
        deletedAt
        deletedBy
        updatedAt
      }
    }
  }
`)

export const CREATE_SERVICE_DB_VERSION_MUTATION = graphql(`
  mutation V1CreateServiceDBVersion(
    $serviceDBId: String!
    $input: UpdateServiceDBInput!
  ) {
    v1CreateServiceDBVersion(serviceDBId: $serviceDBId, input: $input) {
      versionId
      serviceDBId
      versionNumber
      label
      createdBy
      createdAt
      isAutoVersion
    }
  }
`)

export const RESTORE_SERVICE_DB_VERSION_MUTATION = graphql(`
  mutation V1RestoreServiceDBVersion(
    $serviceDBId: String!
    $versionNumber: Int!
  ) {
    v1RestoreServiceDBVersion(
      serviceDBId: $serviceDBId
      versionNumber: $versionNumber
    ) {
      serviceDBId
      serviceId
      dbName
      dbType
      dialect
      dbDiagramId
      pgDumpFileId
      createdBy
      updatedBy
      createdAt
      updatedAt
      deletedAt
      deletedBy
    }
  }
`)

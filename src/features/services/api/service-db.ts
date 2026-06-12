import { graphql } from '@/api'

export const GET_SERVICE_DB_QUERY = graphql(`
  query V1GetServiceDB($serviceDBId: String, $serviceId: String) {
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
  }
`)

export const CREATE_SERVICE_DB_MUTATION = graphql(`
  mutation V1CreateServiceDB($input: CreateServiceDBInput!) {
    v1CreateServiceDB(input: $input) {
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
`)

export const UPDATE_SERVICE_DB_MUTATION = graphql(`
  mutation V1UpdateServiceDB(
    $serviceDBId: String!
    $input: UpdateServiceDBInput!
  ) {
    v1UpdateServiceDB(serviceDBId: $serviceDBId, input: $input) {
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
`)

export const DELETE_SERVICE_DB_MUTATION = graphql(`
  mutation V1DeleteServiceDB($serviceDBId: String!) {
    v1DeleteServiceDB(serviceDBId: $serviceDBId)
  }
`)

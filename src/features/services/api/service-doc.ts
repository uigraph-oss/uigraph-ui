import { graphql } from '@/api'

export const GET_SERVICE_DOC_QUERY = graphql(`
  query V1GetServiceDoc($serviceDocId: String, $serviceId: String) {
    v1GetServiceDoc(serviceDocId: $serviceDocId, serviceId: $serviceId) {
      serviceDocId
      serviceId
      fileId
      fileURL
      fileName
      fileType
      description
      createdBy
      updatedBy
      createdAt
      updatedAt
      deletedAt
      deletedBy
    }
  }
`)

export const CREATE_SERVICE_DOC_MUTATION = graphql(`
  mutation V1CreateServiceDoc($input: CreateServiceDocInput!) {
    v1CreateServiceDoc(input: $input) {
      serviceDocId
      serviceId
      fileId
      fileURL
      fileName
      fileType
      description
      createdBy
      updatedBy
      createdAt
      updatedAt
      deletedAt
      deletedBy
    }
  }
`)

export const UPDATE_SERVICE_DOC_MUTATION = graphql(`
  mutation V1UpdateServiceDoc(
    $serviceDocId: String!
    $input: UpdateServiceDocInput!
  ) {
    v1UpdateServiceDoc(serviceDocId: $serviceDocId, input: $input) {
      serviceDocId
      serviceId
      fileId
      fileURL
      fileName
      fileType
      description
      createdBy
      updatedBy
      createdAt
      updatedAt
      deletedAt
      deletedBy
    }
  }
`)

export const DELETE_SERVICE_DOC_MUTATION = graphql(`
  mutation V1DeleteServiceDoc($serviceDocId: String!) {
    v1DeleteServiceDoc(serviceDocId: $serviceDocId)
  }
`)

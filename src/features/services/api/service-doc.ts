import { graphql } from '@/api'

export const SERVICE_DOCS = graphql(`
  query ServiceDocs($orgId: ID!, $serviceId: ID!) {
    serviceDocs(orgId: $orgId, serviceId: $serviceId) {
      serviceId
      docId
      orgId
      createdBy
      updatedBy
      createdAt
      updatedAt
      doc {
        id
        orgId
        fileAssetId
        fileUrl
        fileName
        fileType
        description
        contentHash
        createdAt
        updatedAt
      }
    }
  }
`)

export const CREATE_SERVICE_DOC = graphql(`
  mutation CreateServiceDoc(
    $orgId: ID!
    $serviceId: ID!
    $input: CreateServiceDocInput!
  ) {
    createServiceDoc(orgId: $orgId, serviceId: $serviceId, input: $input) {
      serviceId
      docId
    }
  }
`)

export const DELETE_SERVICE_DOC = graphql(`
  mutation DeleteServiceDoc($orgId: ID!, $serviceId: ID!, $docId: ID!) {
    deleteServiceDoc(orgId: $orgId, serviceId: $serviceId, docId: $docId)
  }
`)

export type ServiceLinkedDoc = {
  id: string
  fileAssetId?: string | null
  fileUrl?: string | null
  fileName?: string | null
  fileType?: string | null
  description?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

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

export async function readFileAsBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const i of bytes) {
    binary += String.fromCharCode(i)
  }
  return btoa(binary)
}

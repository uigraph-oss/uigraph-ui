import { graphql } from '@/api'

export const SERVICE_DOCS_V2 = graphql(`
  query ServiceDocsV2($orgId: ID!, $serviceId: ID!) {
    serviceDocs(orgId: $orgId, serviceId: $serviceId) {
      id
      serviceId
      orgId
      fileKey
      fileName
      fileType
      description
      contentHash
      createdBy
      updatedBy
      createdAt
      updatedAt
    }
  }
`)

export const CREATE_SERVICE_DOC_V2 = graphql(`
  mutation CreateServiceDocV2(
    $orgId: ID!
    $serviceId: ID!
    $input: CreateServiceDocInput!
  ) {
    createServiceDoc(orgId: $orgId, serviceId: $serviceId, input: $input) {
      id
      fileName
    }
  }
`)

export const UPDATE_SERVICE_DOC_V2 = graphql(`
  mutation UpdateServiceDocV2(
    $orgId: ID!
    $serviceId: ID!
    $id: ID!
    $input: UpdateServiceDocInput!
  ) {
    updateServiceDoc(
      orgId: $orgId
      serviceId: $serviceId
      id: $id
      input: $input
    ) {
      id
      fileName
    }
  }
`)

export const DELETE_SERVICE_DOC_V2 = graphql(`
  mutation DeleteServiceDocV2($orgId: ID!, $serviceId: ID!, $id: ID!) {
    deleteServiceDoc(orgId: $orgId, serviceId: $serviceId, id: $id)
  }
`)

export async function readFileAsBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const i of bytes) {
    binary += String.fromCharCode(i)
  }
  return btoa(binary)
}

export function serviceDocToLegacy(doc: {
  id: string
  serviceId: string
  fileKey: string
  fileName: string
  fileType: string
  description: string
  createdBy: string
  updatedBy?: string | null
  createdAt: string
  updatedAt: string
}) {
  return {
    serviceDocId: doc.id,
    serviceId: doc.serviceId,
    fileId: doc.fileKey,
    fileURL: doc.fileKey,
    fileName: doc.fileName,
    fileType: doc.fileType,
    description: doc.description,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

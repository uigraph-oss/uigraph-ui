import { graphql } from '@/api'
import { trackGTag } from '@/helpers/track'
import axios from 'axios'
import { privateClient } from './apollo-client'

type UploadProjectOptions = {
  orgId: string
  projectId: string

  source?: string
  fileName?: string
  fileType?: string
  fileExtension?: string
  description?: string
}

export async function uploadProjectFile(
  file: File,
  options: UploadProjectOptions
) {
  const fileExtension = file.name.split('.').pop() || ''

  const { data } = await privateClient.mutate({
    mutation: UPLOAD_PROJECT_FILE,
    variables: {
      source: 'web-client',
      fileName: file.name,
      fileType: file.type,
      fileExtension,
      ...options,
    },
  })

  const uploadFileId = data?.UploadProjectFile?.fileId
  if (!uploadFileId) throw new Error('Failed to get upload URL')

  const uploadUrl = data?.UploadProjectFile?.fileUploadURL
  if (!uploadUrl) throw new Error('Failed to get upload URL')

  await axios.put(uploadUrl, file, {
    headers: { 'Content-Type': file.type },
  })

  trackGTag('file_upload', {
    file_name: file.name,
    file_type: file.type,
    file_extension: fileExtension,
    file_size_mb: Math.round((file.size / 1024 / 1024) * 100) / 100,
  })

  return uploadFileId
}

const UPLOAD_PROJECT_FILE = graphql(`
  mutation UPLOAD_PROJECT_FILE(
    $orgId: String!
    $projectId: String!
    $source: String!
    $fileName: String!
    $fileType: String!
    $fileExtension: String!
    $description: String
  ) {
    UploadProjectFile(
      organizationId: $orgId
      projectId: $projectId
      input: {
        source: $source
        fileName: $fileName
        fileType: $fileType
        fileExtension: $fileExtension
        description: $description
      }
    ) {
      fileId
      fileName
      description
      fileExtension
      source
      fileType
      isUploaded
      fileUploadURL
    }
  }
`)

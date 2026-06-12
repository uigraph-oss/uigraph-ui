import { graphql } from '@/api'
import { trackGTag } from '@/helpers/track'
import axios from 'axios'
import { privateClient } from './apollo-client'

type UploadGlobalFileOptions = {
  source?: string
  fileName?: string
  fileType?: string
  fileExtension?: string
  description?: string
}

export async function uploadGlobalFile(
  file: File,
  options?: UploadGlobalFileOptions
) {
  const fileExtension = file.name.split('.').pop() || ''

  const { data } = await privateClient.mutate({
    mutation: UPLOAD_GLOBAL_FILE,
    variables: {
      input: {
        source: 'web-client',
        fileName: file.name,
        fileType: file.type,
        fileExtension,
        ...options,
      },
    },
  })

  const uploadFileId = data?.UploadFile?.fileId
  if (!uploadFileId) throw new Error('Failed to get upload URL')

  const uploadUrl = data?.UploadFile?.fileUploadURL
  if (!uploadUrl) throw new Error('Failed to get upload URL')

  await axios.put(uploadUrl, file, {
    headers: { 'Content-Type': file.type },
  })

  trackGTag('global_file_upload', {
    file_name: file.name,
    file_type: file.type,
    file_extension: fileExtension,
    file_size_mb: Math.round((file.size / 1024 / 1024) * 100) / 100,
  })

  return uploadFileId
}

const UPLOAD_GLOBAL_FILE = graphql(`
  mutation UPLOAD_GLOBAL_FILE($input: UploadFileInput!) {
    UploadFile(input: $input) {
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

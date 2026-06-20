import { graphql } from '@/api'
import { clientV2 } from '@/api/client'
import { env } from '@/env'
import axios from 'axios'

export const CREATE_ASSET_UPLOAD = graphql(`
  mutation CreateAssetUploadV2($orgId: ID!) {
    createAssetUpload(orgId: $orgId) {
      assetId
      uploadUrl
    }
  }
`)

export function assetUrlV2(assetId: string) {
  return `${env.assetsOrigin}/assets/${assetId}`
}

export async function uploadFileV2(orgId: string, file: File): Promise<string> {
  const { data } = await clientV2.mutate({
    mutation: CREATE_ASSET_UPLOAD,
    variables: { orgId },
  })

  const assetId = data?.createAssetUpload?.assetId
  const uploadUrl = data?.createAssetUpload?.uploadUrl
  if (!assetId || !uploadUrl) throw new Error('Failed to get upload URL')

  await axios.put(uploadUrl, file, {
    headers: { 'Content-Type': file.type },
  })

  return assetId
}

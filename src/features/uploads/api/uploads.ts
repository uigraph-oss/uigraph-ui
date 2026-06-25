import { graphql } from '@/api'
import { apolloClientGQL } from '@/api/client'
import { env } from '@/env'
import axios from 'axios'

export const CREATE_ASSET_UPLOAD = graphql(`
  mutation CreateAssetUpload($orgId: ID!) {
    createAssetUpload(orgId: $orgId) {
      assetId
      uploadUrl
    }
  }
`)

export function assetUrl(assetId: string) {
  return `${env.VITE_ASSETS_URL}/assets/${assetId}`
}

export async function uploadFile(orgId: string, file: File): Promise<string> {
  const { data } = await apolloClientGQL.mutate({
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

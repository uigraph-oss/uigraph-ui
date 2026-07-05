import { graphql } from '@/api'
import { apolloClientGQL } from '@/api/client'
import { useQuery } from '@apollo/client'
import axios from 'axios'

export const CREATE_ASSET_UPLOAD = graphql(`
  mutation CreateAssetUpload($orgId: ID!) {
    createAssetUpload(orgId: $orgId) {
      assetId
      uploadUrl
    }
  }
`)

export const ASSET_URL = graphql(`
  query AssetUrl($orgId: ID!, $assetId: ID!) {
    assetUrl(orgId: $orgId, assetId: $assetId)
  }
`)

export const ASSET_URLS = graphql(`
  query AssetUrls($orgId: ID!, $assetIds: [ID!]!) {
    assetUrls(orgId: $orgId, assetIds: $assetIds) {
      assetId
      url
    }
  }
`)

export function useAssetUrls(
  orgId: string | undefined,
  assetIds: string[]
): Record<string, string> {
  const { data } = useQuery(ASSET_URLS, {
    variables: { orgId: orgId ?? '', assetIds },
    skip: !orgId || assetIds.length === 0,
  })

  const map: Record<string, string> = {}
  for (const entry of data?.assetUrls ?? []) {
    map[entry.assetId] = entry.url
  }
  return map
}

export async function putToPresigned(
  prepare: () => Promise<{ assetId?: string; uploadUrl?: string }>,
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const { assetId, uploadUrl } = await prepare()
  if (!assetId || !uploadUrl) throw new Error('Failed to get upload URL')

  await axios.put(uploadUrl, file, {
    headers: { 'Content-Type': file.type },
    onUploadProgress: onProgress
      ? (event) => {
          if (event.total) {
            onProgress(Math.round((event.loaded / event.total) * 100))
          }
        }
      : undefined,
  })

  return assetId
}

export async function uploadFile(
  orgId: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  return putToPresigned(
    async () => {
      const { data } = await apolloClientGQL.mutate({
        mutation: CREATE_ASSET_UPLOAD,
        variables: { orgId },
      })
      return {
        assetId: data?.createAssetUpload?.assetId,
        uploadUrl: data?.createAssetUpload?.uploadUrl,
      }
    },
    file,
    onProgress
  )
}

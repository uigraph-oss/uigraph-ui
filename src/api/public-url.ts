import { graphql } from '@/api'
import { privateClient } from './apollo-client'

type PublicURLOptions = {
  retryCount?: number
  retryDelay?: number
}

export async function getFilePublicURL(
  fileId: string,
  { retryCount = 5, retryDelay = 750 }: PublicURLOptions = {}
) {
  let publicUrl: string | null = null
  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      const { data } = await privateClient.query({
        query: GET_FILE_PUBLIC_URL,
        variables: { fileId: fileId },
      })

      publicUrl = data.GetFilePublicUrlByID!
      break
    } catch {
      if (attempt < 4) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay))
      }
    }
  }

  if (!publicUrl) {
    throw new Error('Failed to fetch public URL after 5 attempts')
  }

  return publicUrl
}

const GET_FILE_PUBLIC_URL = graphql(`
  query GetFilePublicUrlByID_GLOBAL($fileId: String!) {
    GetFilePublicUrlByID(fileId: $fileId)
  }
`)

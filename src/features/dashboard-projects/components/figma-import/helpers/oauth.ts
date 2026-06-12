'use client'

const FIGMA_CLIENT_ID = process.env.NEXT_PUBLIC_FIGMA_CLIENT_ID || ''
const FIGMA_REDIRECT_URI = process.env.NEXT_PUBLIC_FIGMA_REDIRECT_URI || ''

const FIGMA_AUTH_URL = 'https://www.figma.com/oauth'

export interface FigmaTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  user_id: string
}

export function getFigmaAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: FIGMA_CLIENT_ID,
    redirect_uri: FIGMA_REDIRECT_URI,
    scope: 'file_content:read',
    state: state || '',
    response_type: 'code',
  })

  return `${FIGMA_AUTH_URL}?${params.toString()}`
}

'use client'

import { env } from '@/env'

export interface FigmaTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  user_id: string
}

export function getFigmaAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: env.VITE_FIGMA_CLIENT_ID,
    redirect_uri: env.VITE_FIGMA_REDIRECT_URI,
    scope: 'file_content:read',
    state: state || '',
    response_type: 'code',
  })

  return `https://www.figma.com/oauth?${params.toString()}`
}

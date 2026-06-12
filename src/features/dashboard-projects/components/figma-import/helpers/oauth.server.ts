const FIGMA_CLIENT_ID = process.env.NEXT_PUBLIC_FIGMA_CLIENT_ID || ''
const FIGMA_CLIENT_SECRET = process.env.NEXT_PUBLIC_FIGMA_CLIENT_SECRET || ''
const FIGMA_REDIRECT_URI = process.env.NEXT_PUBLIC_FIGMA_REDIRECT_URI || ''

export interface FigmaExchangeTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  user_id: string
}

export interface FigmaRefreshTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  user_id: string
}

export async function exchangeCodeForToken(
  code: string
): Promise<FigmaExchangeTokenResponse> {
  const response = await fetch('https://api.figma.com/v1/oauth/token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: FIGMA_CLIENT_ID,
      client_secret: FIGMA_CLIENT_SECRET,
      redirect_uri: FIGMA_REDIRECT_URI,
      grant_type: 'authorization_code',
      code,
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${FIGMA_CLIENT_ID}:${FIGMA_CLIENT_SECRET}`).toString('base64')}`,
    },
  })

  return await response.json()
}

export async function refreshFigmaToken(
  refreshToken: string
): Promise<FigmaRefreshTokenResponse> {
  const response = await fetch('https://api.figma.com/v1/oauth/token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: FIGMA_CLIENT_ID,
      client_secret: FIGMA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${FIGMA_CLIENT_ID}:${FIGMA_CLIENT_SECRET}`).toString('base64')}`,
    },
  })

  return await response.json()
}

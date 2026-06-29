export const FIGMA_CONNECT_URL = '/api/v1/figma/connect'

export interface FigmaNodeInfo {
  nodeId: string
  imageUrl: string
  name: string
}

export function isValidFigmaUrl(url: string): boolean {
  return /^https:\/\/www\.figma\.com\/[^\/]+\/[a-zA-Z0-9]+/.test(url)
}

export async function getFigmaStatus(): Promise<boolean> {
  const res = await fetch('/api/v1/figma/status', { credentials: 'include' })
  if (!res.ok) return false
  const data = (await res.json()) as { connected: boolean }
  return data.connected
}

export async function disconnectFigma(): Promise<void> {
  await fetch('/api/v1/figma/disconnect', {
    method: 'POST',
    credentials: 'include',
  })
}

export async function getFigmaNodeInfo(
  figmaUrl: string
): Promise<FigmaNodeInfo> {
  const res = await fetch(
    `/api/v1/figma/node-info?url=${encodeURIComponent(figmaUrl)}`,
    { credentials: 'include' }
  )
  if (!res.ok) {
    let message: string | undefined
    try {
      const data = (await res.json()) as { message?: string }
      message = data.message
    } catch {
      message = undefined
    }
    throw new FigmaImportError(
      message ?? 'Figma component import failed!',
      res.status
    )
  }
  return (await res.json()) as FigmaNodeInfo
}

export class FigmaImportError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'FigmaImportError'
    this.status = status
  }
}

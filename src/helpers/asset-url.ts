import { env } from '@/env'

export function assetUrl(
  assetId?: string | null,
  version?: string | null
): string | undefined {
  if (!assetId) return undefined
  const base = `${env.VITE_ASSETS_URL}/${assetId}`
  if (version) return `${base}?v=${version}`
  return base
}

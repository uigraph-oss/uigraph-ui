import { env } from '@/env'

// assetUrl builds the public, browser-readable URL for a stored asset. Every
// browser-facing blob (frame screenshot, diagram thumbnail, diagram image) is
// stored under a single asset id and served directly from object storage at
// ${assetsOrigin}/${assetId} — the app is never in the read path. This is the
// one and only place an asset URL is formed.
//
// `version` (a content hash) is appended as ?v= so the URL is cache-busted when
// a deterministic asset (e.g. a regenerated thumbnail) is overwritten in place.
export function assetUrl(
  assetId?: string | null,
  version?: string | null
): string | undefined {
  if (!assetId) return undefined
  const base = `${env.assetsOrigin}/${assetId}`
  if (version) return `${base}?v=${version}`
  return base
}

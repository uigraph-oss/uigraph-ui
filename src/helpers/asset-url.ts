export function assetUrl(
  assetId?: string | null,
  version?: string | null
): string | undefined {
  if (!assetId) return undefined
  const base = `/${assetId}`
  if (version) return `${base}?v=${version}`
  return base
}

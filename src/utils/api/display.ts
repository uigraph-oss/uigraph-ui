type DisplayMeta = {
  groupName?: string | null
  fallbackGroupName?: string
  releaseLabel?: string | null
  releaseVersionNumber?: number | null
  isWorkingCopy?: boolean
  protocol?: string | null
}

const PROTOCOL_TOKENS = /(openapi|graphql|grpc|rest)/gi

type OpenApiLikeSpec = {
  servers?: Array<{
    url?: string
    variables?: Record<
      string,
      {
        default?: string
        enum?: string[]
      }
    >
  }>
}

export function looksLikeSemver(value?: string | null): boolean {
  const normalized = value?.trim()
  if (!normalized) return false
  return /^\d+\.\d+\.\d+([+-][0-9A-Za-z.-]+)?$/.test(normalized)
}

export function stripProtocolFromGroupName(name?: string | null): string {
  const normalized = name?.trim()
  if (!normalized) return ''

  return normalized
    .replace(PROTOCOL_TOKENS, '')
    .replace(/[/-]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export function getDisplayGroup(meta: DisplayMeta): {
  label: string
  warning?: string
} {
  const fallback = meta.fallbackGroupName?.trim() || 'default'
  const groupCandidate = stripProtocolFromGroupName(meta.groupName)

  if (!groupCandidate) return { label: fallback }
  if (looksLikeSemver(groupCandidate)) {
    return {
      label: fallback,
      warning: 'Group name looks like a release; rename to public/internal.',
    }
  }

  return { label: groupCandidate }
}

export function getDisplayProtocol(
  meta: DisplayMeta
): 'OpenAPI' | 'GraphQL' | 'gRPC' | 'REST' | undefined {
  const protocol = meta.protocol?.trim().toLowerCase()
  if (protocol === 'graphql') return 'GraphQL'
  if (protocol === 'grpc') return 'gRPC'
  if (protocol === 'rest') return 'REST'

  const groupName = meta.groupName?.toLowerCase() ?? ''
  if (groupName.includes('openapi') || groupName.includes('swagger')) {
    return 'OpenAPI'
  }
  if (groupName.includes('graphql')) return 'GraphQL'
  if (groupName.includes('grpc')) return 'gRPC'
  if (groupName.includes('rest')) return 'REST'

  return undefined
}

export function getDisplayGroupName(meta: DisplayMeta): string {
  return getDisplayGroup(meta).label
}

export function getDisplayReleaseLabel(meta: DisplayMeta): string {
  if (meta.isWorkingCopy) return 'Working copy'

  const label = meta.releaseLabel?.trim()
  if (label) return label

  if (typeof meta.releaseVersionNumber === 'number') {
    return `Release ${meta.releaseVersionNumber}`
  }

  const groupName = stripProtocolFromGroupName(meta.groupName)
  if (groupName && looksLikeSemver(groupName)) return groupName

  return 'Latest'
}

export function normalizePath(
  path: string,
  basePathToStrip?: string | null
): string {
  const trimmed = path.trim()
  if (!trimmed) return '/'

  const withoutOrigin = trimmed.replace(/^https?:\/\/[^/]+/i, '')
  let normalized = withoutOrigin.startsWith('/')
    ? withoutOrigin
    : `/${withoutOrigin}`
  normalized = normalized.replace(/\/{2,}/g, '/')

  // Strip base path if provided (e.g., /project-manager from server URL)
  if (basePathToStrip) {
    const basePath = basePathToStrip.startsWith('/')
      ? basePathToStrip
      : `/${basePathToStrip}`
    if (normalized.startsWith(basePath)) {
      normalized = normalized.slice(basePath.length) || '/'
    }
  }

  return normalized
}

export function getResolvedBaseUrl(
  spec: OpenApiLikeSpec | null | undefined,
  selectedEnv: string,
  fallbackBaseUrl?: string | null
): string {
  const firstServer = spec?.servers?.[0]
  const rawServerUrl = firstServer?.url?.trim()

  if (!rawServerUrl) {
    return (fallbackBaseUrl || '').trim()
  }

  const variables = firstServer?.variables ?? {}
  const env = selectedEnv.toLowerCase()
  const replacements: Record<string, string> = {}

  for (const [key, value] of Object.entries(variables)) {
    const enumValues = value.enum ?? []
    const envMatch =
      enumValues.find((item) => item.toLowerCase().includes(env)) ??
      value.default ??
      enumValues[0] ??
      ''
    replacements[key] = envMatch
  }

  const resolved = rawServerUrl.replace(
    /\{([^}]+)\}/g,
    (_match, key: string) => {
      return replacements[key] ?? ''
    }
  )

  return resolved.trim() || (fallbackBaseUrl || '').trim()
}

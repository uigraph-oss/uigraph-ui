export type GitMetadata = {
  repo?: string
  branch?: string
  commit?: string
  targetRef?: string
  targetSha?: string
}

export function gitMetadata(metadata: unknown): GitMetadata {
  if (typeof metadata !== 'object' || metadata === null) {
    return {}
  }

  const git = (metadata as Record<string, unknown>).git

  if (typeof git !== 'object' || git === null) {
    return {}
  }

  const result: GitMetadata = {}

  for (const key of [
    'repo',
    'branch',
    'commit',
    'targetRef',
    'targetSha',
  ] as const) {
    const value = (git as Record<string, unknown>)[key]

    if (typeof value === 'string') {
      result[key] = value
    }
  }

  return result
}

export function metadataEntries(metadata: unknown): [string, string][] {
  if (typeof metadata !== 'object' || metadata === null) {
    return []
  }

  const entries: [string, string][] = []

  for (const [key, value] of Object.entries(metadata)) {
    if (key === 'git') {
      continue
    }

    if (typeof value === 'string') {
      entries.push([key, value])
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      entries.push([key, String(value)])
    } else {
      entries.push([key, JSON.stringify(value)])
    }
  }

  return entries
}

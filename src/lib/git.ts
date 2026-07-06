export function normalizeRepoUrl(url?: string | null): string | undefined {
  if (!url) return undefined
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (url.startsWith('https://gitlab.com:'))
      return url.replace('https://gitlab.com:', 'https://gitlab.com/')
    return url
  }
  if (url.startsWith('git@github.com:'))
    return `https://github.com/${url.replace('git@github.com:', '').replace(/\.git$/, '')}`
  if (url.startsWith('git@gitlab.com:'))
    return `https://gitlab.com/${url.replace('git@gitlab.com:', '').replace(/\.git$/, '')}`
  return url
}

export function commitUrl(
  repoUrl?: string | null,
  sha?: string | null
): string | undefined {
  if (!sha) return undefined
  const repo = normalizeRepoUrl(repoUrl)
  if (!repo) return undefined
  const base = repo.replace(/\.git$/, '').replace(/\/$/, '')
  if (base.includes('gitlab.com')) return `${base}/-/commit/${sha}`
  return `${base}/commit/${sha}`
}

export function formatMetric(value: number) {
  if (Number.isInteger(value)) return String(value)
  return Number(value.toPrecision(4)).toString()
}

export function artifactDownloadUrl(
  sourceUrl: string | undefined | null,
  uri: string
) {
  if (!uri) return ''
  if (/^https?:\/\//i.test(uri)) return uri
  const base = (sourceUrl ?? '').replace(/\/+$/, '')
  if (!base) return ''
  const mlflowArtifacts = uri.match(/^mlflow-artifacts:\/+(.*)$/i)
  if (mlflowArtifacts) {
    return `${base}/api/2.0/mlflow-artifacts/artifacts/${mlflowArtifacts[1]}`
  }
  return `${base}/${uri.replace(/^\/+/, '')}`
}

import {
  artifactTypeFromName,
  filenameFromContentDisposition,
  filenameFromUrl,
  formatFromName,
} from '../lib/artifact-metadata'

export type ResolvedLink = {
  name: string
  sizeBytes: number | null
  mimeType: string
  format: string
  type: string
}

export async function resolveLink(
  url: string,
  signal: AbortSignal
): Promise<ResolvedLink> {
  const proxied = `/gateway/v1/proxy?url=${encodeURIComponent(url)}`

  let res = await fetch(proxied, { method: 'HEAD', signal })
  if (res.status === 405) {
    res = await fetch(proxied, {
      method: 'GET',
      headers: { Range: 'bytes=0-0' },
      signal,
    })
  }
  if (!res.ok && res.status !== 206) {
    throw new Error(`Link returned ${res.status}`)
  }

  const name =
    filenameFromContentDisposition(res.headers.get('content-disposition')) ??
    filenameFromUrl(url)

  const contentLength = res.headers.get('content-length')
  const parsedLength = contentLength ? Number(contentLength) : NaN
  const sizeBytes = Number.isFinite(parsedLength) ? parsedLength : null

  return {
    name,
    sizeBytes,
    mimeType: res.headers.get('content-type')?.split(';')[0].trim() ?? '',
    format: formatFromName(name),
    type: artifactTypeFromName(name),
  }
}

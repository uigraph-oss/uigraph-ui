'use client'

import { apolloClientGQL } from '@/api/client'
import { Button } from '@/components/ui/button'
import { API_GROUP_SPEC } from '@/features/services/api/api-spec'
import { useCurrentOrganization } from '@/store/auth-store'
import { Download } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

type ApiSpecDownloadProps = {
  serviceId: string
  apiGroupId: string
  versionId?: string | null
}

async function fetchSpecContent(
  orgId: string,
  serviceId: string,
  apiGroupId: string,
  versionId?: string | null
): Promise<{
  content: string
  fileName: string | null
}> {
  const { data } = await apolloClientGQL.query({
    query: API_GROUP_SPEC,
    variables: { orgId, serviceId, apiGroupId, versionId },
    fetchPolicy: 'network-only',
  })

  const spec = data?.apiGroupSpec
  if (!spec) {
    throw new Error('Could not load spec content')
  }

  return {
    content: spec.content,
    fileName: spec.fileName ?? null,
  }
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function isYamlContent(content: string): boolean {
  const trimmed = content.trimStart()
  return (
    trimmed.startsWith('openapi:') ||
    trimmed.startsWith('swagger:') ||
    trimmed.startsWith('---') ||
    (!trimmed.startsWith('{') && !trimmed.startsWith('['))
  )
}

export function ApiSpecDownload({
  serviceId,
  apiGroupId,
  versionId,
}: ApiSpecDownloadProps) {
  const orgId = useCurrentOrganization()?.id
  const [isDownloading, setIsDownloading] = useState(false)

  async function handleDownload(format: 'original' | 'json' | 'yaml') {
    try {
      setIsDownloading(true)
      const { content, fileName } = await fetchSpecContent(
        orgId!,
        serviceId,
        apiGroupId,
        versionId
      )

      if (format === 'original') {
        const ext = isYamlContent(content) ? 'yaml' : 'json'
        const mime = ext === 'yaml' ? 'text/yaml' : 'application/json'
        downloadBlob(content, fileName ?? `api-spec.${ext}`, mime)
        return
      }

      if (format === 'json') {
        if (!isYamlContent(content)) {
          // Already JSON
          downloadBlob(
            content,
            fileName?.replace(/\.(ya?ml)$/i, '.json') ?? 'api-spec.json',
            'application/json'
          )
          return
        }

        // Convert YAML -> JSON
        const jsYaml = await import('js-yaml')
        const parsed = jsYaml.load(content)
        const jsonStr = JSON.stringify(parsed, null, 2)
        downloadBlob(
          jsonStr,
          fileName?.replace(/\.(ya?ml)$/i, '.json') ?? 'api-spec.json',
          'application/json'
        )
        return
      }

      if (format === 'yaml') {
        if (isYamlContent(content)) {
          // Already YAML
          downloadBlob(
            content,
            fileName?.replace(/\.(json)$/i, '.yaml') ?? 'api-spec.yaml',
            'text/yaml'
          )
          return
        }

        // Convert JSON -> YAML
        const jsYaml = await import('js-yaml')
        const parsed = JSON.parse(content)
        const yamlStr = jsYaml.dump(parsed, { indent: 2, lineWidth: 120 })
        downloadBlob(
          yamlStr,
          fileName?.replace(/\.(json)$/i, '.yaml') ?? 'api-spec.yaml',
          'text/yaml'
        )
        return
      }
    } catch (err) {
      console.error('Download failed:', err)
      toast.error('Failed to download spec file')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      preset="outline"
      disabled={isDownloading}
      onClick={() => void handleDownload('original')}
    >
      <Download className="h-4 w-4" />
      {isDownloading ? 'Downloading...' : 'Download'}
    </Button>
  )
}

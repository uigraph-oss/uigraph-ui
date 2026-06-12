'use client'

import { graphql, privateClient } from '@/api'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileJson, FileText } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

const GET_FILE_BY_ID_DOWNLOAD = graphql(`
  query GetFileByID_SpecDownload($fileId: String!) {
    GetFileByID(fileId: $fileId, download: true) {
      fileId
      fileName
      fileDownloadURL
    }
  }
`)

type ApiSpecDownloadProps = {
  specFileId: string
}

async function fetchSpecContent(specFileId: string): Promise<{
  content: string
  fileName: string | null
}> {
  const { data } = await privateClient.query({
    query: GET_FILE_BY_ID_DOWNLOAD,
    variables: { fileId: specFileId },
    fetchPolicy: 'network-only',
  })

  const downloadURL = data?.GetFileByID?.fileDownloadURL
  if (!downloadURL) {
    throw new Error('Could not get download URL')
  }

  const response = await fetch(downloadURL)
  if (!response.ok) {
    throw new Error(`Download failed: ${response.statusText}`)
  }

  const content = await response.text()
  return {
    content,
    fileName: data?.GetFileByID?.fileName ?? null,
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

export function ApiSpecDownload({ specFileId }: ApiSpecDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  async function handleDownload(format: 'original' | 'json' | 'yaml') {
    try {
      setIsDownloading(true)
      const { content, fileName } = await fetchSpecContent(specFileId)

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button preset="outline" disabled={isDownloading}>
          <Download className="h-4 w-4" />
          {isDownloading ? 'Downloading...' : 'Download'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => void handleDownload('original')}>
          <FileText className="h-4 w-4" />
          Original
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void handleDownload('json')}>
          <FileJson className="h-4 w-4" />
          JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void handleDownload('yaml')}>
          <FileText className="h-4 w-4" />
          YAML
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

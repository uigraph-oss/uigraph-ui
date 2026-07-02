import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export function HtmlRenderer({
  fileURL,
  fileName,
}: {
  fileURL: string
  fileName?: string | null
}) {
  const [content, setContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setContent(null)
    setError(null)

    fetch(fileURL)
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch file')
        return response.text()
      })
      .then((text) => {
        if (!cancelled) setContent(text)
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load file content')
      })

    return () => {
      cancelled = true
    }
  }, [fileURL])

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        <p className="mb-2">{error}</p>
        <a
          href={fileURL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          Download file instead
        </a>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#586378]" />
      </div>
    )
  }

  return (
    <iframe
      srcDoc={content}
      className="absolute inset-0 top-[72px] h-[calc(100%-72px)] w-full bg-white"
      title={fileName || 'HTML Preview'}
      sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
    />
  )
}

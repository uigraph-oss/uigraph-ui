import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export function TextRenderer({ fileURL }: { fileURL: string }) {
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
    <div className="overflow-hidden rounded-lg border bg-[#141925] p-6 dark:bg-gray-900">
      <div className="w-full overflow-x-auto">
        <pre className="font-mono text-sm break-words whitespace-pre-wrap">
          {content}
        </pre>
      </div>
    </div>
  )
}

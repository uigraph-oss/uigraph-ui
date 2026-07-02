import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

const LANGUAGE_MAP: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  rb: 'ruby',
  go: 'go',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  cs: 'csharp',
  php: 'php',
  swift: 'swift',
  kt: 'kotlin',
  rs: 'rust',
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',
  yml: 'yaml',
  yaml: 'yaml',
  json: 'json',
  xml: 'xml',
  html: 'html',
  css: 'css',
  scss: 'scss',
  sql: 'sql',
  graphql: 'graphql',
  dockerfile: 'dockerfile',
  md: 'markdown',
  markdown: 'markdown',
}

export function CodeRenderer({
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

  const ext = fileName?.split('.').pop()?.toLowerCase() || ''
  const language = LANGUAGE_MAP[ext] || 'text'

  return (
    <div className="overflow-hidden rounded-lg border bg-[#141925] dark:bg-gray-900">
      <div className="w-full overflow-x-auto">
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={language}
          PreTag="div"
          className="rounded-md"
          customStyle={{
            margin: 0,
            borderRadius: '0.5rem',
          }}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

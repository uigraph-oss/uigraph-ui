'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'

type ServiceDocPreviewModalProps = {
  fileURL?: string | null
  fileName?: string | null
  fileType?: string | null
}

export function ServiceDocPreviewModal({
  fileURL,
  fileName,
  fileType,
}: ServiceDocPreviewModalProps) {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (fileURL) {
      const normalizedFileType = fileType?.toLowerCase()
      const normalizedFileName = fileName?.toLowerCase() || ''

      // Skip fetching for files that can be displayed directly (HTML, PDF, images)
      if (
        normalizedFileType === 'html' ||
        normalizedFileType === 'pdf' ||
        normalizedFileType === 'image' ||
        normalizedFileName.endsWith('.html') ||
        normalizedFileName.endsWith('.htm') ||
        normalizedFileName.endsWith('.pdf') ||
        /\.(jpg|jpeg|png|gif|svg|webp|bmp|ico)$/i.test(normalizedFileName)
      ) {
        setLoading(false)
        setContent(null)
        setError(null)
      } else {
        void fetchContent()
      }
    } else {
      setContent(null)
      setError(null)
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileURL, fileType, fileName])

  async function fetchContent() {
    if (!fileURL) return

    const normalizedFileType = fileType?.toLowerCase()
    const normalizedFileName = fileName?.toLowerCase() || ''

    // For files that can be displayed directly, no need to fetch
    if (
      normalizedFileType === 'html' ||
      normalizedFileType === 'pdf' ||
      normalizedFileType === 'image' ||
      normalizedFileName.endsWith('.html') ||
      normalizedFileName.endsWith('.htm') ||
      normalizedFileName.endsWith('.pdf') ||
      /\.(jpg|jpeg|png|gif|svg|webp|bmp|ico)$/i.test(normalizedFileName)
    ) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(fileURL)
      if (!response.ok) {
        throw new Error('Failed to fetch file')
      }

      // Check if the content type is text-based

      const contentType = response.headers.get('content-type')

      if (
        contentType?.startsWith('text/') ||
        contentType?.includes('json') ||
        contentType?.includes('xml')
      ) {
        const text = await response.text()
        return setContent(text)
      }

      try {
        const text = await response.text()
        return setContent(text)
      } catch {}
    } catch (err) {
      console.error(err)
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load file content'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  function getLanguageFromFileName(fileName?: string | null): string {
    if (!fileName) return 'text'
    const ext = fileName.split('.').pop()?.toLowerCase() || ''
    const languageMap: Record<string, string> = {
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
    return languageMap[ext] || 'text'
  }

  function renderContent() {
    const normalizedFileType = fileType?.toLowerCase()
    const normalizedFileName = fileName?.toLowerCase() || ''

    // Render PDF files using iframe
    if (
      (normalizedFileType === 'pdf' || normalizedFileName.endsWith('.pdf')) &&
      fileURL
    ) {
      return (
        <div className="h-full w-full" style={{ minWidth: '100%' }}>
          <iframe
            src={`${fileURL}#toolbar=0`}
            className="h-full w-full"
            title={fileName || 'PDF Preview'}
            style={{
              width: '100%',
              minHeight: '85vh',
              border: 'none',
              display: 'block',
            }}
          />
        </div>
      )
    }

    // Render image files directly
    if (
      normalizedFileType === 'image' ||
      /\.(jpg|jpeg|png|gif|svg|webp|bmp|ico)$/i.test(normalizedFileName)
    ) {
      if (!fileURL) return null
      return (
        <div className="flex h-full w-full items-center justify-center p-6">
          <img
            src={fileURL}
            alt={fileName || 'Image Preview'}
            className="max-h-[80vh] max-w-full rounded-lg object-contain"
            style={{ maxHeight: '80vh' }}
          />
        </div>
      )
    }

    // Render HTML files using iframe for safety - no need to fetch content
    if (
      (normalizedFileType === 'html' ||
        normalizedFileName.endsWith('.html') ||
        normalizedFileName.endsWith('.htm')) &&
      fileURL
    ) {
      return (
        <iframe
          src={fileURL}
          className="absolute inset-0 top-[72px] h-[calc(100%-72px)] w-full"
          title={fileName || 'HTML Preview'}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      )
    }

    if (loading) {
      return (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#586378]" />
        </div>
      )
    }

    if (error) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <p className="mb-2">{error}</p>
          {fileURL && (
            <a
              href={fileURL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Download file instead
            </a>
          )}
        </div>
      )
    }

    if (!content) {
      return null
    }

    // Render Markdown/README files
    if (
      normalizedFileType === 'readme' ||
      normalizedFileType === 'markdown' ||
      normalizedFileName.endsWith('.md') ||
      normalizedFileName.endsWith('.markdown')
    ) {
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <div className="w-full overflow-x-auto px-2 *:first:mt-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <div className="overflow-x-auto">
                      <SyntaxHighlighter
                        {...props}
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-md"
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code
                      {...props}
                      className={className}
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        padding: '0.2em 0.4em',
                        borderRadius: '3px',
                        fontSize: '0.9em',
                      }}
                    >
                      {children}
                    </code>
                  )
                },
                h1: ({ children }) => (
                  <h1 className="mt-6 mb-4 text-3xl font-bold">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="mt-5 mb-3 text-2xl font-semibold">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mt-4 mb-2 text-xl font-semibold">
                    {children}
                  </h3>
                ),
                a: ({ children, href }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {children}
                  </a>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="my-4 border-l-4 border-[#3B4658] pl-4 italic">
                    {children}
                  </blockquote>
                ),
                ul: ({ children }) => (
                  <ul className="my-2 ml-6 list-disc">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="my-2 ml-6 list-decimal">{children}</ol>
                ),
                li: ({ children }) => <li className="my-1">{children}</li>,
                table: ({ children }) => (
                  <div className="my-4 w-full overflow-x-auto">
                    <table className="min-w-full border-collapse border border-[#3B4658]">
                      {children}
                    </table>
                  </div>
                ),
                img: ({ src, alt }) => (
                  <img
                    src={src}
                    alt={alt}
                    className="h-auto max-w-full rounded-md"
                    loading="lazy"
                  />
                ),
                th: ({ children }) => (
                  <th className="border border-[#3B4658] bg-[#1E2533] px-4 py-2 text-left font-semibold">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-[#3B4658] px-4 py-2">
                    {children}
                  </td>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      )
    }

    // Render code files with syntax highlighting
    const codeExtensions = [
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
      '.py',
      '.rb',
      '.go',
      '.java',
      '.cpp',
      '.c',
      '.cs',
      '.php',
      '.swift',
      '.kt',
      '.rs',
      '.sh',
      '.bash',
      '.zsh',
      '.yml',
      '.yaml',
      '.json',
      '.xml',
      '.css',
      '.scss',
      '.sql',
      '.graphql',
      '.dockerfile',
      '.vue',
      '.svelte',
      '.r',
      '.m',
      '.mm',
      '.h',
      '.hpp',
      '.cc',
      '.cxx',
      '.pl',
      '.pm',
      '.lua',
      '.dart',
      '.ex',
      '.exs',
      '.elm',
      '.clj',
      '.cljs',
      '.hs',
      '.ml',
      '.mli',
      '.fs',
      '.fsx',
      '.vb',
      '.ps1',
      '.psm1',
      '.psd1',
      '.coffee',
      '.litcoffee',
      '.iced',
      '.less',
      '.sass',
      '.styl',
      '.stylus',
      '.jade',
      '.pug',
      '.haml',
      '.erb',
      '.rhtml',
      '.slim',
      '.twig',
      '.liquid',
      '.mustache',
      '.hbs',
      '.handlebars',
      '.ejs',
      '.njk',
      '.nunjucks',
      '.jinja',
      '.jinja2',
    ]

    const isCodeFile = codeExtensions.some((ext) =>
      normalizedFileName.endsWith(ext)
    )

    if (isCodeFile) {
      const language = getLanguageFromFileName(fileName)
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

    // Fallback: show as plain text
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

  const normalizedFileType = fileType?.toLowerCase()
  const normalizedFileName = fileName?.toLowerCase() || ''
  const isHTML =
    normalizedFileType === 'html' ||
    normalizedFileName.endsWith('.html') ||
    normalizedFileName.endsWith('.htm')
  const isPDF =
    normalizedFileType === 'pdf' || normalizedFileName.endsWith('.pdf')
  const needsWideDialog = isHTML || isPDF

  return (
    <>
      <BetterDialogContent
        title={fileName || 'Document Preview'}
        description="Preview documentation file"
        className={needsWideDialog ? 'p-0' : ''}
      >
        <div
          style={
            needsWideDialog
              ? { padding: 0, margin: 0, width: '100%' }
              : { width: '100%' }
          }
        >
          {renderContent()}
        </div>
      </BetterDialogContent>
    </>
  )
}

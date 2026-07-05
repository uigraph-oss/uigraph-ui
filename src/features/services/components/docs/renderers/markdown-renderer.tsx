import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { Download01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { downloadFileUrl } from 'daily-code/browser'
import { toPng } from 'html-to-image'
import { Loader2 } from 'lucide-react'
import mermaid from 'mermaid'
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import {
  FiAlertCircle,
  FiAlertOctagon,
  FiAlertTriangle,
  FiCheck,
  FiCopy,
  FiInfo,
  FiLink,
} from 'react-icons/fi'
import { IoImageOutline } from 'react-icons/io5'
import { PiFileSvgLight, PiLightbulbFilamentLight } from 'react-icons/pi'
import { SiMermaid } from 'react-icons/si'
import ReactMarkdown, { type Components } from 'react-markdown'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { toast } from 'sonner'

import 'katex/dist/katex.min.css'
import 'react-photo-view/dist/react-photo-view.css'

// Raw HTML (e.g. hybrid tables with rowspan/colspan) is parsed by
// rehype-raw, then sanitized before rehype-katex injects its own
// (trusted, programmatically generated) markup — so KaTeX's output is
// never subject to the sanitizer, only user-authored HTML is.
const SANITIZE_SCHEMA = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    span: [
      ...(defaultSchema.attributes?.span ?? []),
      ['className', /^math(-inline|-display)?$/],
    ],
    div: [
      ...(defaultSchema.attributes?.div ?? []),
      ['className', /^math(-inline|-display)?$/],
    ],
  },
}

function isKvBlock(text: string): boolean {
  const lines = text.trim().split('\n').filter(Boolean)
  if (lines.length < 2) return false
  return lines.every((line) => /^[A-Za-z][^:\n]*:\s+.+/.test(line))
}

function KvBlock({ text }: { text: string }) {
  const pairs = text
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const colonIdx = line.indexOf(':')
      return {
        key: line.slice(0, colonIdx).trim(),
        value: line.slice(colonIdx + 1).trim(),
      }
    })

  return (
    <div className="border-border bg-card my-2 overflow-hidden rounded-lg border">
      {pairs.map(({ key, value }, i) => (
        <div
          key={i}
          className="border-border flex items-baseline gap-6 border-b px-3.5 py-2 last:border-b-0"
        >
          <span className="text-paragraph w-16 shrink-0 text-[12px]">
            {key}
          </span>
          <code className="text-foreground font-mono text-[12px]">{value}</code>
        </div>
      ))}
    </div>
  )
}

function getCodeLanguage(className?: string): string {
  const match = /language-(\w+)/.exec(className ?? '')
  return match?.[1] ?? 'text'
}

// ── Headings: stable slug ids + hover-to-copy anchor links ────────────────

const HeadingSlugsContext = createContext<Map<string, number> | null>(null)

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-') || 'section'
  )
}

function getPlainText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(getPlainText).join('')
  if (isValidElement(node)) {
    return getPlainText((node.props as { children?: ReactNode }).children)
  }
  return ''
}

function useHeadingSlug(children: ReactNode): string {
  const slugs = useContext(HeadingSlugsContext)
  const base = slugify(getPlainText(children))
  if (!slugs) return base

  const seen = slugs.get(base) ?? 0
  slugs.set(base, seen + 1)
  return seen === 0 ? base : `${base}-${seen}`
}

function copyHeadingLink(id: string) {
  const url = `${window.location.origin}${window.location.pathname}${window.location.search}#${id}`
  void navigator.clipboard.writeText(url)
  window.history.replaceState(null, '', `#${id}`)
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  toast.success('Link copied')
}

const HEADING_STYLES: Record<number, string> = {
  1: 'text-[1.75em] mt-9 mb-3 first:mt-0',
  2: 'text-[1.4em] mt-8 mb-2.5 first:mt-0',
  3: 'text-[1.2em] mt-6 mb-2 first:mt-0',
  4: 'text-[1.05em] mt-5 mb-1.5 first:mt-0',
  5: 'text-[0.92em] mt-4 mb-1 first:mt-0 text-muted-foreground uppercase tracking-wide',
  6: 'text-[0.85em] mt-4 mb-1 first:mt-0 text-muted-foreground uppercase tracking-wide',
}

function createHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  const Tag = `h${level}` as const

  return function Heading({ children }: { children?: ReactNode }) {
    const id = useHeadingSlug(children)

    return (
      <Tag
        id={id}
        className={cn(
          'group text-foreground scroll-mt-16 leading-[1.3] font-semibold tracking-tight',
          HEADING_STYLES[level]
        )}
      >
        {children}
        <a
          href={`#${id}`}
          aria-label="Copy link to heading"
          onClick={(e) => {
            e.preventDefault()
            copyHeadingLink(id)
          }}
          className="text-muted-foreground hover:text-primary ml-2 inline-block align-middle opacity-0 transition-opacity group-hover:opacity-100"
        >
          <FiLink className="size-[0.65em]" />
        </a>
      </Tag>
    )
  }
}

// ── Callouts: GitHub-style `> [!NOTE]` blockquote alerts ───────────────────

type CalloutKind = 'NOTE' | 'TIP' | 'IMPORTANT' | 'WARNING' | 'CAUTION'

const CALLOUT_CONFIG: Record<
  CalloutKind,
  { label: string; icon: typeof FiInfo; classes: string; iconClass: string }
> = {
  NOTE: {
    label: 'Note',
    icon: FiInfo,
    classes: 'border-blue-500/30 bg-blue-500/10',
    iconClass: 'text-blue-400',
  },
  TIP: {
    label: 'Tip',
    icon: PiLightbulbFilamentLight,
    classes: 'border-emerald-500/30 bg-emerald-500/10',
    iconClass: 'text-emerald-400',
  },
  IMPORTANT: {
    label: 'Important',
    icon: FiAlertCircle,
    classes: 'border-violet-500/30 bg-violet-500/10',
    iconClass: 'text-violet-400',
  },
  WARNING: {
    label: 'Warning',
    icon: FiAlertTriangle,
    classes: 'border-amber-500/30 bg-amber-500/10',
    iconClass: 'text-amber-400',
  },
  CAUTION: {
    label: 'Caution',
    icon: FiAlertOctagon,
    classes: 'border-red-500/30 bg-red-500/10',
    iconClass: 'text-red-400',
  },
}

const CALLOUT_MARKER_RE = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n?/i

function extractCallout(
  children: ReactNode
): { kind: CalloutKind; rest: ReactNode[] } | null {
  // react-markdown interleaves insignificant whitespace text nodes ("\n")
  // between block-level children, so the paragraph isn't necessarily index 0.
  const childArray = Children.toArray(children)
  const paragraphIndex = childArray.findIndex(isValidElement)
  const firstParagraph = childArray[paragraphIndex]
  if (paragraphIndex === -1 || !isValidElement(firstParagraph)) return null

  const pChildren = Children.toArray(
    (firstParagraph.props as { children?: ReactNode }).children
  )
  // Skip any purely-whitespace text nodes leading the paragraph.
  let textIndex = 0
  while (
    textIndex < pChildren.length &&
    typeof pChildren[textIndex] === 'string' &&
    (pChildren[textIndex] as string).trim() === ''
  ) {
    textIndex++
  }
  const firstText = pChildren[textIndex]
  if (typeof firstText !== 'string') return null

  const match = CALLOUT_MARKER_RE.exec(firstText)
  if (!match) return null

  const kind = match[1].toUpperCase() as CalloutKind
  const newPChildren = [...pChildren]
  newPChildren[textIndex] = firstText.slice(match[0].length)
  const newParagraph = cloneElement(
    firstParagraph as ReactElement<{ children?: ReactNode }>,
    {},
    ...newPChildren
  )

  const rest = [...childArray]
  rest[paragraphIndex] = newParagraph
  return { kind, rest }
}

const MERMAID_CACHE = new Map<string, string>()

function MermaidContent({ code }: { code: string }) {
  const [svg, setSvg] = useState<string>('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function render() {
      mermaid.initialize({
        suppressErrorRendering: true,
        startOnLoad: false,
        theme: 'dark',
      })

      if (MERMAID_CACHE.has(code)) {
        return setSvg(MERMAID_CACHE.get(code)!)
      }

      const { svg } = await mermaid.render(
        `mermaid-${Math.random().toString(36).slice(2)}`,
        code
      )

      MERMAID_CACHE.set(code, svg)
      setSvg(svg)
    }

    void render().catch(() => {})
  }, [code])

  function download(data: string, filename: string, type: string) {
    const blob = new Blob([data], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleDownloadSvg() {
    download(svg, 'diagram.svg', 'image/svg+xml')
  }

  async function handleDownloadPng() {
    const container = containerRef.current!
    if (!container) return toast.error('Diagram not ready')

    const svgElement = container.querySelector<HTMLElement>('svg')
    if (!svgElement) return toast.error('SVG element not found')

    try {
      const png = await toPng(svgElement, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#FFFFFF',
        style: { padding: '20px' },
      })

      const a = document.createElement('a')
      a.download = 'image.png'
      a.href = png
      a.click()
    } catch (err) {
      console.log(err, svg)
      toast.error('Failed to download PNG')
    }
  }

  function handleDownloadMermaid() {
    download(code, 'diagram.mmd', 'text/plain')
  }

  return (
    <div className="group border-border bg-card relative my-2 overflow-hidden rounded-lg border p-4">
      <div
        ref={containerRef}
        className="flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: svg }}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            preset="outline"
            className="absolute top-2 right-2 size-8! rounded-md p-0! opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
          >
            <HugeiconsIcon icon={Download01Icon} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleDownloadSvg}>
            <PiFileSvgLight />
            Download as SVG
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleDownloadPng}>
            <IoImageOutline />
            Download as PNG
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleDownloadMermaid}>
            <SiMermaid />
            Download as Mermaid
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function ImageBlock({ src, alt }: { src: string; alt?: string }) {
  return (
    <PhotoProvider>
      <div className="group relative w-fit">
        <PhotoView src={src}>
          <img
            alt={alt}
            src={src}
            className="border-stock/50 max-h-96 w-auto cursor-pointer rounded-md border object-contain"
          />
        </PhotoView>

        <Button
          preset="outline"
          className="absolute top-2 right-2 size-7! rounded-md p-1! opacity-0 group-hover:opacity-100"
          onClick={() => {
            downloadFileUrl(src, { filename: alt || 'image' })
          }}
        >
          <HugeiconsIcon icon={Download01Icon} />
        </Button>
      </div>
    </PhotoProvider>
  )
}

const OrderedListContext = createContext(false)
const ListDepthContext = createContext(0)

const MARKDOWN_COMPONENTS: Components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),

  blockquote: ({ children }) => {
    const callout = extractCallout(children)

    if (callout) {
      const {
        label,
        icon: Icon,
        classes,
        iconClass,
      } = CALLOUT_CONFIG[callout.kind]

      return (
        <div
          className={cn(
            'my-3 flex gap-2.5 rounded-lg border px-4 py-3',
            classes
          )}
        >
          <Icon className={cn('mt-0.5 size-4 shrink-0', iconClass)} />
          <div className="min-w-0 flex-1 [&>p]:mb-1.5 [&>p:last-child]:mb-0">
            <p className={cn('mb-1 text-[13px] font-semibold', iconClass)}>
              {label}
            </p>
            {callout.rest}
          </div>
        </div>
      )
    }

    return (
      <blockquote className="border-border bg-muted/40 text-muted-foreground my-2 border-l-2 py-1.5 pl-4">
        {children}
      </blockquote>
    )
  },

  del: ({ children }) => (
    <del className="text-muted-foreground decoration-1">{children}</del>
  ),

  input: ({ type, checked, disabled }) => {
    if (type !== 'checkbox') {
      return <input type={type} checked={checked} disabled={disabled} />
    }

    return (
      <span
        data-task-checkbox=""
        className={cn(
          'mr-0.5 -mb-[2.5px] inline-block size-4 rounded-[4px] border p-0.5 transition-colors',
          checked
            ? 'bg-primary border-none text-white'
            : 'border-border bg-transparent'
        )}
      >
        {checked && <FiCheck className="size-full" strokeWidth={3} />}
      </span>
    )
  },

  pre: ({ children }) => {
    const childArray = Children.toArray(children)
    if (childArray.length === 1 && isValidElement(childArray[0])) {
      const child = childArray[0] as ReactElement<{ className?: string }>
      return cloneElement(child, {
        className: cn(child.props.className, 'is-block'),
      })
    }
    return <>{children}</>
  },

  ol: ({ children }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const depth = useContext(ListDepthContext)

    return (
      <OrderedListContext.Provider value={true}>
        <ListDepthContext.Provider value={depth + 1}>
          <ol className={cn('step-list my-2.5', depth > 0 && 'pl-5')}>
            {children}
          </ol>
        </ListDepthContext.Provider>
      </OrderedListContext.Provider>
    )
  },

  ul: ({ children }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const depth = useContext(ListDepthContext)

    return (
      <OrderedListContext.Provider value={false}>
        <ListDepthContext.Provider value={depth + 1}>
          <ul className={cn('my-1.5 space-y-1.5', depth > 0 && 'pl-5')}>
            {children}
          </ul>
        </ListDepthContext.Provider>
      </OrderedListContext.Provider>
    )
  },

  li: ({ children }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const isOrdered = useContext(OrderedListContext)

    if (isOrdered) {
      return (
        <li className="step-item flex items-start gap-2.5">
          <div className="step-num bg-muted text-muted-foreground mt-[2px] flex size-[19px] shrink-0 items-center justify-center rounded-[4px] font-mono text-[10px] font-semibold" />
          <div className="step-body min-w-0 flex-1">{children}</div>
        </li>
      )
    }

    const childArray = Children.toArray(children)
    const firstValid = childArray.find(isValidElement) as
      ReactElement<{ type?: string; 'data-task-checkbox'?: string }> | undefined
    const hasCheckbox =
      firstValid?.props?.type === 'checkbox' ||
      firstValid?.props?.['data-task-checkbox'] !== undefined

    if (hasCheckbox) {
      return (
        <li className="flex items-start gap-2">
          <span className="flex-1">{children}</span>
        </li>
      )
    }

    return (
      <li className="flex items-start gap-2">
        <span className="bg-muted-foreground mt-[9px] size-1.5 shrink-0 rounded-full" />
        <span className="flex-1">{children}</span>
      </li>
    )
  },

  p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,

  strong: ({ children }) => (
    <strong className="text-foreground font-medium">{children}</strong>
  ),

  code: ({ className, children }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isCopied, setCopied] = useState(false)

    const codeText = String(children).replace(/\n$/, '')
    const isBlock =
      className?.includes('language-') || className?.includes('is-block')

    if (!isBlock) {
      return (
        <code className="bg-muted text-foreground rounded-[4px] px-1.5 py-0.5 font-mono text-[0.82em]">
          {children}
        </code>
      )
    }

    if (isKvBlock(codeText)) {
      return <KvBlock text={codeText} />
    }

    const codeLanguage = getCodeLanguage(className)

    if (codeLanguage === 'mermaid') {
      return <MermaidContent code={codeText} />
    }

    return (
      <div className="border-border bg-card my-2 overflow-hidden rounded-lg border">
        <div className="border-stock flex items-center justify-between border-b px-3 py-2">
          <span className="text-paragraph text-[11px] font-medium tracking-wide uppercase">
            {codeLanguage}
          </span>
          <Button
            type="button"
            preset="ghost"
            onClick={() => {
              void navigator.clipboard.writeText(codeText)

              setCopied(true)
              window.setTimeout(() => setCopied(false), 1200)
            }}
            className="h-7 rounded-md px-2! text-xs"
          >
            {isCopied ? (
              <>
                <FiCheck className="size-3.5" />
                Copied
              </>
            ) : (
              <>
                <FiCopy className="size-3.5" />
                Copy
              </>
            )}
          </Button>
        </div>
        <div className="better-scrollbar max-h-[22rem] overflow-auto px-3 py-2">
          <SyntaxHighlighter
            style={oneDark}
            language={codeLanguage}
            PreTag="div"
            customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
          >
            {codeText}
          </SyntaxHighlighter>
        </div>
      </div>
    )
  },

  a: ({ href, children }) => {
    if (!href) return <>{children}</>

    return (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={href}
        className="text-primary underline decoration-dashed decoration-1 underline-offset-4 hover:decoration-solid"
      >
        {children}
      </a>
    )
  },

  img: ({ src, alt }) => {
    if (!src || typeof src !== 'string') return null
    return <ImageBlock src={src} alt={alt} />
  },

  table: ({ children }) => (
    <div className="border-border my-4 overflow-hidden rounded-lg border">
      <table className="text-foreground w-full border-collapse text-sm">
        {children}
      </table>
    </div>
  ),

  thead: ({ children }) => (
    <thead className="border-border bg-muted/40 border-b">{children}</thead>
  ),

  tbody: ({ children }) => (
    <tbody className="divide-border divide-y">{children}</tbody>
  ),

  tr: ({ children }) => (
    <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
  ),

  th: ({ children, style }) => (
    <th
      className="text-muted-foreground px-4 py-3 text-left text-[13px] font-semibold"
      style={style}
    >
      {children}
    </th>
  ),

  hr: () => <hr className="border-border my-3 border-0 border-t" />,

  td: ({ children, style }) => (
    <td
      className="text-foreground/80 px-4 py-3 text-left text-[14px] leading-relaxed"
      style={style}
    >
      {children}
    </td>
  ),
}

const MARKDOWN_DOC_STYLE = `
  .markdown-doc .step-list {
    counter-reset: step-counter;
    list-style: none;
    padding: 0;
    margin-top: 10px;
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .markdown-doc .step-num {
    counter-increment: step-counter;
  }

  .markdown-doc .step-num::after {
    content: counter(step-counter);
  }

  .markdown-doc .step-body > p {
    margin: 0;
  }

  .markdown-doc .step-body > p:not(:last-child) {
    margin-bottom: 6px;
  }

  .markdown-doc .katex-display {
    margin: 0.75em 0;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 2px 0;
  }

  .markdown-doc .katex {
    font-size: 1.05em;
  }
`

export function MarkdownRenderer({ fileURL }: { fileURL: string }) {
  const [content, setContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- reset slug counts whenever content changes
  const headingSlugs = useMemo(() => new Map<string, number>(), [content])

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
    <div className="markdown-doc text-foreground mx-auto max-w-[820px] px-2 text-[15px] leading-[1.75]">
      <style>{MARKDOWN_DOC_STYLE}</style>
      <HeadingSlugsContext.Provider value={headingSlugs}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[
            rehypeRaw,
            [rehypeSanitize, SANITIZE_SCHEMA],
            rehypeKatex,
          ]}
          components={MARKDOWN_COMPONENTS}
        >
          {content}
        </ReactMarkdown>
      </HeadingSlugsContext.Provider>
    </div>
  )
}

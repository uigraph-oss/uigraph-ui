import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import { FiCheck, FiCopy } from 'react-icons/fi'
import ReactMarkdown, { type Components } from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'

const OrderedListContext = createContext(false)
const ListDepthContext = createContext(0)

const HEADING_STYLES: Record<number, string> = {
  1: 'text-[1.4em] mt-7 mb-2.5 first:mt-0',
  2: 'text-[1.2em] mt-6 mb-2 first:mt-0',
  3: 'text-[1.05em] mt-5 mb-2 first:mt-0',
  4: 'text-[0.95em] mt-4 mb-1.5 first:mt-0',
  5: 'text-[0.9em] mt-4 mb-1 first:mt-0 text-paragraph uppercase tracking-wide',
  6: 'text-[0.85em] mt-4 mb-1 first:mt-0 text-paragraph uppercase tracking-wide',
}

function createHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  const Tag = `h${level}` as const

  return function Heading({ children }: { children?: ReactNode }) {
    return (
      <Tag
        className={cn(
          'text-foreground leading-[1.3] font-semibold tracking-tight',
          HEADING_STYLES[level]
        )}
      >
        {children}
      </Tag>
    )
  }
}

function getCodeLanguage(className?: string): string {
  const match = /language-(\w+)/.exec(className ?? '')
  return match?.[1] ?? 'text'
}

const REPORT_COMPONENTS: Components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),

  p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,

  strong: ({ children }) => (
    <strong className="text-foreground font-medium">{children}</strong>
  ),

  del: ({ children }) => (
    <del className="text-paragraph decoration-1">{children}</del>
  ),

  blockquote: ({ children }) => (
    <blockquote className="border-stock bg-muted/20 text-paragraph my-2 border-l-2 py-1.5 pl-4">
      {children}
    </blockquote>
  ),

  hr: () => <hr className="border-stock my-3 border-0 border-t" />,

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

    const codeLanguage = getCodeLanguage(className)

    return (
      <div className="border-stock bg-shading-gray/60 my-2 overflow-hidden rounded-lg border">
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
            codeTagProps={{
              style: {
                display: 'block',
                background: 'transparent',
                textShadow: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                lineHeight: '1.6',
              },
            }}
          >
            {codeText}
          </SyntaxHighlighter>
        </div>
      </div>
    )
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
          <div className="step-num bg-muted text-paragraph mt-[2px] flex size-[19px] shrink-0 items-center justify-center rounded-[4px] font-mono text-[10px] font-semibold" />
          <div className="step-body min-w-0 flex-1">{children}</div>
        </li>
      )
    }

    return (
      <li className="flex items-start gap-2">
        <span className="bg-paragraph mt-[9px] size-1.5 shrink-0 rounded-full" />
        <span className="min-w-0 flex-1">{children}</span>
      </li>
    )
  },

  a: ({ href, children }) => {
    if (!href) {
      return <>{children}</>
    }

    return (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={href}
        className="text-foreground underline decoration-dashed decoration-1 underline-offset-4 hover:decoration-solid"
      >
        {children}
      </a>
    )
  },

  table: ({ children }) => (
    <div className="border-stock my-4 overflow-x-auto rounded-lg border">
      <table className="text-foreground w-full border-collapse text-sm">
        {children}
      </table>
    </div>
  ),

  thead: ({ children }) => (
    <thead className="border-stock bg-muted/40 border-b">{children}</thead>
  ),

  tbody: ({ children }) => (
    <tbody className="divide-stock divide-y">{children}</tbody>
  ),

  tr: ({ children }) => (
    <tr className="hover:bg-muted/20 transition-colors">{children}</tr>
  ),

  th: ({ children, style }) => (
    <th
      className="text-paragraph px-4 py-3 text-left text-[13px] font-semibold"
      style={style}
    >
      {children}
    </th>
  ),

  td: ({ children, style }) => (
    <td
      className="text-foreground/80 px-4 py-3 text-left text-[14px] leading-relaxed"
      style={style}
    >
      {children}
    </td>
  ),
}

const REPORT_STYLE = `
  .agent-report .step-list {
    counter-reset: step-counter;
    list-style: none;
    padding: 0;
    margin-top: 10px;
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .agent-report .step-num {
    counter-increment: step-counter;
  }

  .agent-report .step-num::after {
    content: counter(step-counter);
  }

  .agent-report .step-body > p {
    margin: 0;
  }

  .agent-report .step-body > p:not(:last-child) {
    margin-bottom: 6px;
  }
`

export function ReportMarkdown({ content }: { content: string }) {
  return (
    <div className="agent-report text-paragraph min-w-0 text-sm leading-[1.75]">
      <style>{REPORT_STYLE}</style>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={REPORT_COMPONENTS}>
        {content}
      </ReactMarkdown>
    </div>
  )
}

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
import { Components } from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { getAnchorSourceHref } from '../helpers/parse-source'
import { getCodeLanguage, isKvBlock, KvBlock } from './code-block'
import { ImageBlock } from './image-block'
import { MermaidContent } from './mermaid-content'

const OrderedListContext = createContext(false)

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

export const MARKDOWN_COMPONENTS: Components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),

  blockquote: ({ children }) => (
    <blockquote className="border-border bg-muted/40 text-muted-foreground my-2 border-l-2 py-1.5 pl-4">
      {children}
    </blockquote>
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

  ol: ({ children }) => (
    <OrderedListContext.Provider value={true}>
      <ol className="step-list my-2.5">{children}</ol>
    </OrderedListContext.Provider>
  ),

  ul: ({ children }) => (
    <OrderedListContext.Provider value={false}>
      <ul className="my-1.5 space-y-1.5">{children}</ul>
    </OrderedListContext.Provider>
  ),

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
        href={getAnchorSourceHref(href)}
        className="text-primary underline decoration-dashed decoration-1 underline-offset-4 hover:decoration-solid"
      >
        {children}
      </a>
    )
  },

  img: ({ src, alt }) => {
    if (!src) return null
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

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
} from 'react'
import { FiCheck, FiCopy } from 'react-icons/fi'
import { Components } from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { getAnchorSourceHref } from '../helpers/parse-source'
import { getCodeLanguage, isKvBlock, KvBlock } from './code-block'
import { ImageBlock } from './image-block'
import { MermaidContent } from './mermaid-content'

const OrderedListContext = createContext(false)

export const MARKDOWN_COMPONENTS: Components = {
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-black/15 bg-black/3 py-1.5 pl-4 text-black/75">
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
            : 'border-black/20 bg-transparent'
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
          <div className="step-num mt-[2px] flex size-[19px] shrink-0 items-center justify-center rounded-[4px] bg-black/[0.06] font-mono text-[10px] font-semibold text-black/40" />
          <div className="step-body min-w-0 flex-1">{children}</div>
        </li>
      )
    }

    const childArray = Children.toArray(children)
    const firstValid = childArray.find(isValidElement) as
      | ReactElement<{ type?: string; 'data-task-checkbox'?: string }>
      | undefined
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
        <span className="mt-[9px] size-1.5 shrink-0 rounded-full bg-black/25" />
        <span className="flex-1">{children}</span>
      </li>
    )
  },

  p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,

  strong: ({ children }) => (
    <strong className="font-medium text-[#111110]">{children}</strong>
  ),

  code: ({ className, children }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isCopied, setCopied] = useState(false)

    const codeText = String(children).replace(/\n$/, '')
    const isBlock =
      className?.includes('language-') || className?.includes('is-block')

    if (!isBlock) {
      return (
        <code className="rounded-[4px] bg-black/[0.06] px-1.5 py-0.5 font-mono text-[0.82em] text-[#111110]">
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
      <div className="my-2 overflow-hidden rounded-lg border border-[#e6e6e6] bg-[#f8fafc]">
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
            style={oneLight}
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
    <div className="my-4 overflow-hidden rounded-lg border border-black/10">
      <table className="w-full border-collapse text-sm text-[#111110]">
        {children}
      </table>
    </div>
  ),

  thead: ({ children }) => (
    <thead className="border-b border-black/10 bg-black/[0.03]">
      {children}
    </thead>
  ),

  tbody: ({ children }) => (
    <tbody className="divide-y divide-black/[0.06]">{children}</tbody>
  ),

  tr: ({ children }) => (
    <tr className="transition-colors hover:bg-black/[0.02]">{children}</tr>
  ),

  th: ({ children, style }) => (
    <th
      className="px-4 py-3 text-left text-[13px] font-semibold text-black/70"
      style={style}
    >
      {children}
    </th>
  ),

  hr: () => <hr className="my-3 border-0 border-t border-black/10" />,

  td: ({ children, style }) => (
    <td
      className="px-4 py-3 text-left text-[14px] leading-relaxed text-black/80"
      style={style}
    >
      {children}
    </td>
  ),
}

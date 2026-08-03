import type { Components } from 'react-markdown'

export const REPORT_MARKDOWN_COMPONENTS: Components = {
  h1: ({ children }) => (
    <h3 className="text-foreground mt-6 mb-2 text-base font-semibold first:mt-0">
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h4 className="text-foreground mt-6 mb-2 text-sm font-semibold first:mt-0">
      {children}
    </h4>
  ),
  h3: ({ children }) => (
    <h5 className="text-foreground mt-5 mb-1.5 text-sm font-medium first:mt-0">
      {children}
    </h5>
  ),
  h4: ({ children }) => (
    <h6 className="text-paragraph mt-4 mb-1.5 text-xs font-semibold tracking-wide uppercase first:mt-0">
      {children}
    </h6>
  ),

  p: ({ children }) => (
    <p className="text-paragraph my-2 text-sm leading-relaxed first:mt-0 last:mb-0">
      {children}
    </p>
  ),

  ul: ({ children }) => (
    <ul className="text-paragraph my-2 list-disc space-y-1 pl-5 text-sm marker:text-[#4b5568]">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="text-paragraph my-2 list-decimal space-y-1 pl-5 text-sm marker:font-mono marker:text-[#4b5568]">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,

  strong: ({ children }) => (
    <strong className="text-foreground font-semibold">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,

  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-foreground underline underline-offset-2"
    >
      {children}
    </a>
  ),

  code: ({ children, className }) => {
    if (className?.startsWith('language-')) {
      return (
        <code className="text-paragraph font-mono text-xs">{children}</code>
      )
    }

    return (
      <code className="bg-muted/40 text-foreground rounded px-1.5 py-0.5 font-mono text-[13px]">
        {children}
      </code>
    )
  },

  pre: ({ children }) => (
    <pre className="border-stock bg-shading-gray/60 my-3 max-h-80 overflow-auto rounded-md border p-3">
      {children}
    </pre>
  ),

  blockquote: ({ children }) => (
    <blockquote className="border-stock text-paragraph my-3 border-l-2 pl-4">
      {children}
    </blockquote>
  ),

  hr: () => <hr className="border-stock my-5" />,

  table: ({ children }) => (
    <div className="border-stock my-3 overflow-x-auto rounded-md border">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-stock text-paragraph border-b text-left text-xs tracking-wide uppercase">
      {children}
    </thead>
  ),
  tr: ({ children }) => (
    <tr className="border-stock/60 border-b last:border-b-0">{children}</tr>
  ),
  th: ({ children }) => <th className="px-4 py-2 font-medium">{children}</th>,
  td: ({ children }) => (
    <td className="text-paragraph px-4 py-2 align-top">{children}</td>
  ),
}

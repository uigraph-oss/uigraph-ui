import 'highlight.js/styles/atom-one-dark.css'
import 'quill/dist/quill.bubble.css'
import 'quill/dist/quill.snow.css'

import { useAutoRef } from '@/hooks/use-auto-ref'
import { cn } from '@/lib/utils'
import hljs from 'highlight.js'
import Quill, { Delta } from 'quill'
import { useEffect, useRef } from 'react'
import styles from './editor.module.scss'

type QuillRichTextEditorProps = {
  value: Delta | string
  setValue: (value: Delta) => void
  readonly?: boolean
  noOverflow?: boolean
  className?: string
}

export function QuillRichTextEditor({
  value,
  setValue,
  className,
  readonly = false,
  noOverflow = false,
}: Omit<QuillRichTextEditorProps, 'className'> & { className?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const helpersRef = useAutoRef({ setValue, value })

  useEffect(() => {
    const container = containerRef.current!
    if (!container) return console.error('Editor container is not defined')

    const quill = new Quill(container, {
      theme: 'snow',
      readOnly: readonly,
      modules: {
        syntax: {
          hljs,
          interval: 500,
          languages: hljs.listLanguages().map((lang) => ({
            key: lang,
            label: lang[0].toUpperCase() + lang.slice(1),
          })),
        },
        toolbar: readonly
          ? false
          : [
              { header: 1 },
              { header: 2 },
              { header: 3 },
              'bold',
              'italic',
              'underline',
              'code-block',
              { list: 'ordered' },
              { list: 'bullet' },
              'blockquote',
              'link',
            ],
      },
    })

    if (typeof helpersRef.current.value === 'string') {
      quill.setText(helpersRef.current.value)
    } else {
      quill.setContents(helpersRef.current.value)
    }

    function fillLastCodeBlock() {
      const quillEditor = container.querySelector('.ql-editor')!
      if (!quillEditor) return

      const codeBlockClass = 'ql-code-block-container'
      const lastChild = quillEditor.lastElementChild
      const isLastChildCodeBlock = lastChild?.classList.contains(codeBlockClass)
      if (!isLastChildCodeBlock) return

      quillEditor.append(document.createElement('p'))
    }

    fillLastCodeBlock()

    if (!readonly) {
      quill.on('text-change', () => {
        const delta = quill.getContents()
        helpersRef.current.setValue(delta)
        fillLastCodeBlock()
      })
    }
  }, [helpersRef, readonly])

  return (
    <div
      className={cn(styles.root, noOverflow && styles.noOverflow, className)}
    >
      <div ref={containerRef} />
    </div>
  )
}

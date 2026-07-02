import { cn } from '@/lib/utils'
import { EditorContent } from '@tiptap/react'
import { useTiptapEditor } from '../hooks/use-tiptap-editor'

const darkEditorClassName =
  'border-[#2A3242] bg-[#1E2533] text-[#F4F7FC] shadow-none ring-0 focus-within:ring-0 [&_.ProseMirror]:text-[#F4F7FC] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-[#828DA3] [&_.mention]:bg-[#3B6BFF]/20 [&_.mention]:text-[#93B4FF]'

export function InputEditor({
  value,
  setValue,
  className,
  forceFocus = false,
  theme = 'default',
}: {
  value: string
  setValue: (value: string) => void
  className?: string
  forceFocus?: boolean
  theme?: 'default' | 'dark'
}) {
  const editor = useTiptapEditor({ value, setValue, theme })

  return (
    <div
      className={cn(
        'border-stock rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-all',
        'ring-stock ring-0 focus-within:ring-2',
        theme === 'dark' && darkEditorClassName,
        className
      )}
      onMouseDownCapture={(e) => {
        if (forceFocus) {
          e.stopPropagation()
          e.nativeEvent.stopImmediatePropagation()
        }
      }}
      onDrop={(e) => {
        if (forceFocus) {
          e.stopPropagation()
          e.nativeEvent.stopImmediatePropagation()
        }
      }}
    >
      <EditorContent
        editor={editor}
        className="prose max-w-none cursor-text text-sm [&_.ProseMirror]:min-h-[64px] [&_.ProseMirror]:whitespace-pre-wrap [&_.ProseMirror]:outline-none"
      />
    </div>
  )
}

export function InputRenderer({
  value,
  theme = 'default',
}: {
  value: string
  theme?: 'default' | 'dark'
}) {
  const editor = useTiptapEditor({
    value,
    setValue: () => {},
    editable: false,
    theme,
  })
  return (
    <EditorContent
      editor={editor}
      className={cn(
        'prose max-w-none text-sm',
        theme === 'dark' &&
          'text-[#F4F7FC] [&_.ProseMirror]:text-[#F4F7FC] [&_.mention]:bg-[#3B6BFF]/20 [&_.mention]:text-[#93B4FF]'
      )}
    />
  )
}

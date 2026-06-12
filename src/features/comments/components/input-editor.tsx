import { cn } from '@/lib/utils'
import { EditorContent } from '@tiptap/react'
import { useTiptapEditor } from '../hooks/use-tiptap-editor'

export function InputEditor({
  value,
  setValue,
  className,
  forceFocus = false,
}: {
  value: string
  setValue: (value: string) => void
  className?: string
  forceFocus?: boolean
}) {
  const editor = useTiptapEditor({ value, setValue })

  return (
    <div
      className={cn(
        'border-stock rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-all',
        'ring-stock ring-0 focus-within:ring-2',
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

export function InputRenderer({ value }: { value: string }) {
  const editor = useTiptapEditor({ value, setValue: () => {}, editable: false })
  return <EditorContent editor={editor} className="prose max-w-none text-sm" />
}

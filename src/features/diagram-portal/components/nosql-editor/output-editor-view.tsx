import { CodeMirrorRaw } from '@/components/code-mirror'
import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

type OutputEditorViewProps = {
  editorValue: string
  hasEditorChanges: boolean
  setEditorValue: (value: string) => void
  applyEditorChanges: () => void
}

export function OutputEditorView({
  editorValue,
  hasEditorChanges,
  setEditorValue,
  applyEditorChanges,
}: OutputEditorViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(0)

  useEffect(() => {
    const container = containerRef.current!
    if (!container) return

    function handleResize() {
      setContainerHeight(container.clientHeight)
    }

    const observer = new ResizeObserver(handleResize)
    observer.observe(container)
    handleResize()

    return () => observer.disconnect()
  }, [containerRef])

  return (
    <div ref={containerRef} className="relative h-full">
      <CodeMirrorRaw
        basicSetup={{
          lineNumbers: false,
          foldGutter: false,
          foldKeymap: false,
          searchKeymap: false,
        }}
        value={editorValue ?? ''}
        onChange={setEditorValue}
        className={'[&_.cm-editor]:p-1'}
        height={`${containerHeight}px`}
        disableWordWrap
      />

      {hasEditorChanges ? (
        <Button
          key="apply"
          preset="primary"
          className="absolute top-3 right-3 h-9 px-3!"
          onClick={applyEditorChanges}
        >
          Apply
        </Button>
      ) : (
        <Button
          key="copy"
          preset="outline"
          className="absolute top-3 right-3 h-9 px-3!"
          onClick={async () => {
            await navigator.clipboard.writeText(editorValue)
            toast.success('JSON copied')
          }}
        >
          Copy
        </Button>
      )}
    </div>
  )
}

import { CodeMirrorRaw } from '@/components/code-mirror'
import { Delta } from 'quill'
import { lazy, Suspense } from 'react'

export * from './components/basic-input'
export * from './components/check-input'
export * from './components/date-picker'
export * from './components/field'
export * from './components/file-input'
export * from './components/number-input'
export * from './components/select'
export * from './components/tag-input'
export * from './constants/component-type'

const QuillRichTextEditor = lazy(() =>
  import('./components/quill-rte/editor').then((mod) => ({
    default: mod.QuillRichTextEditor,
  }))
)

type RichTextEditorProps = {
  value: Delta | string
  setValue: (value: Delta) => void
  readonly?: boolean
  noOverflow?: boolean
  className?: string
}

export function RichTextEditor(props: RichTextEditorProps) {
  return (
    <Suspense>
      <QuillRichTextEditor {...props} />
    </Suspense>
  )
}

export function CodeMirrorWrapped({
  value,
  height = '10rem',
  readonly = false,
  setValue,
}: {
  value: string
  height?: string
  readonly?: boolean
  setValue: (value: string) => void
}) {
  return (
    <CodeMirrorRaw
      height={height}
      value={value ?? ''}
      onChange={setValue}
      readOnly={readonly}
    />
  )
}

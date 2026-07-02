import { cn } from '@/lib/utils'
import { css } from '@codemirror/lang-css'
import { go } from '@codemirror/lang-go'
import { html } from '@codemirror/lang-html'
import { EditorView } from '@codemirror/view'
import { vscodeDark } from '@uiw/codemirror-themes-all'
import ReactCodeMirror, { ReactCodeMirrorProps } from '@uiw/react-codemirror'
import { arrayNonNullable } from 'daily-code'
import { useMemo } from 'react'

const meEditorTheme = EditorView.theme({
  '&': {
    backgroundColor: '#1E2533',
  },

  '.cm-scroller': {
    backgroundColor: '#1E2533',
  },

  '.cm-gutters': {
    backgroundColor: '#141925',
    borderRight: '1px solid #2A3242',
    fontFamily: "'Fira Code', monospace",
  },

  '.cm-gutterElement': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'end',
  },

  '.cm-activeLineGutter': {
    backgroundColor: '#1E2533',
  },
})

const meFontFamilyTheme = EditorView.theme({
  '.cm-content ': {
    fontFamily: "'Fira Code', monospace",
    padding: '0',
    lineHeight: '1.6',
  },
})

type CodeMirrorRawProps = ReactCodeMirrorProps & {
  fontSize?: number
  lineHeight?: number
  fontWeight?: number
  disableWordWrap?: boolean
}

const defaultExtensions = [
  go(),
  css(),
  html(),
  meEditorTheme,
  vscodeDark,
  meFontFamilyTheme,
]

export function CodeMirrorRaw({
  className,
  fontSize,
  lineHeight,
  disableWordWrap = false,
  ...props
}: CodeMirrorRawProps) {
  const codeMirrorExtensions = useMemo(() => {
    const extensions = [
      ...defaultExtensions,
      disableWordWrap ? null : EditorView.lineWrapping,
      EditorView.theme({
        '.cm-content ': {
          fontSize: fontSize?.toString() ? `${fontSize}px !important` : '',
          lineHeight: lineHeight?.toString() ? `${lineHeight} !important` : '',
        },
      }),
    ]

    return arrayNonNullable(extensions)
  }, [disableWordWrap, fontSize, lineHeight])

  return (
    <ReactCodeMirror
      theme="none"
      width="100%"
      onKeyDown={(e) => e.stopPropagation()}
      extensions={codeMirrorExtensions}
      {...props}
      className={cn('cursor-text text-[14px]', className)}
    />
  )
}

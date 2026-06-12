import { Delta } from 'quill'

export function parseRichTextOps(value: string | null | undefined) {
  if (!value) return null
  try {
    const ops = JSON.parse(value)
    return Array.isArray(ops) ? ops : null
  } catch {
    return null
  }
}

export function isRichTextValue(value: string | null | undefined) {
  return parseRichTextOps(value) !== null
}

export function toDelta(value: string | null | undefined): Delta | string {
  const ops = parseRichTextOps(value)
  return ops ? new Delta(ops) : (value ?? '')
}

export function toPlainText(value: string | null | undefined) {
  const ops = parseRichTextOps(value)
  if (!ops) return value ?? ''

  const text = ops
    .map((op) => (typeof op.insert === 'string' ? op.insert : ''))
    .join('')

  return text.endsWith('\n') ? text.slice(0, -1) : text
}

export function toRichTextString(value: string | null | undefined) {
  return JSON.stringify(new Delta().insert(value || '\n').ops)
}

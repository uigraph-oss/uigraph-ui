type FieldMessageProps = {
  message?: unknown
}

export function FieldMessage({ message }: FieldMessageProps) {
  const text = typeof message === 'string' ? message : undefined

  if (!text) return null

  return <p className="mt-2 min-h-4 text-xs text-red-500">{text ?? '\u00A0'}</p>
}

export function isKvBlock(text: string): boolean {
  const lines = text.trim().split('\n').filter(Boolean)
  if (lines.length < 2) return false
  return lines.every((line) => /^[A-Za-z][^:\n]*:\s+.+/.test(line))
}

export function KvBlock({ text }: { text: string }) {
  const pairs = text
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const colonIdx = line.indexOf(':')
      return {
        key: line.slice(0, colonIdx).trim(),
        value: line.slice(colonIdx + 1).trim(),
      }
    })

  return (
    <div className="my-2 overflow-hidden rounded-lg border border-black/8 bg-white">
      {pairs.map(({ key, value }, i) => (
        <div
          key={i}
          className="flex items-baseline gap-6 border-b border-black/6 px-3.5 py-2 last:border-b-0"
        >
          <span className="text-paragraph w-16 shrink-0 text-[12px]">
            {key}
          </span>
          <code className="font-mono text-[12px] text-[#111110]">{value}</code>
        </div>
      ))}
    </div>
  )
}

export function getCodeLanguage(className?: string): string {
  const match = /language-(\w+)/.exec(className ?? '')
  return match?.[1] ?? 'text'
}

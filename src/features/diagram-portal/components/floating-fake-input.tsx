import { cn } from '@/lib/utils'

export function FakeFloatingInput({
  value,
  onChange,
  className,
  placeholder = '—',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <div className="relative isolate flex h-8 w-full items-center">
      <p
        className={cn(
          'text-foreground border border-transparent px-1 text-[12px] leading-[1.5] font-normal',
          className
        )}
      >
        {value || <span className="text-muted-foreground">{placeholder}</span>}
      </p>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => event.stopPropagation()}
        className={cn(
          'text-foreground border-primary bg-input absolute inset-0 size-full border px-1 text-[12px] leading-[1.5] font-normal opacity-0 transition-all duration-100 outline-none focus:opacity-100',
          className
        )}
      />
    </div>
  )
}

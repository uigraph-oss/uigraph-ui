import { cn } from '@/lib/utils'

const displayClassName =
  'text-[#F4F7FC] border border-transparent px-1 text-[12px] leading-[1.5] font-normal'

const inputClassName =
  'text-[#F4F7FC] border-primary absolute inset-0 size-full border bg-[#1E2533] px-1 text-[12px] leading-[1.5] font-normal opacity-0 transition-all duration-100 outline-none focus:opacity-100'

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
      <p className={cn(displayClassName, className)}>
        {value || <span className="text-[#828DA3]">{placeholder}</span>}
      </p>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => event.stopPropagation()}
        className={cn(inputClassName, className)}
      />
    </div>
  )
}

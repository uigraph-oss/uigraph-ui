'use client'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

type SecretAuthInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SecretAuthInput({
  value,
  onChange,
  placeholder,
  className,
}: SecretAuthInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative w-full">
      <Input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn('pr-10', className)}
        autoComplete="off"
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute top-1/2 right-2.5 flex -translate-y-1/2 cursor-pointer items-center text-[#828DA3] transition-colors hover:text-[#D2D9E6]"
        aria-label={visible ? 'Hide value' : 'Show value'}
      >
        {visible ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  )
}

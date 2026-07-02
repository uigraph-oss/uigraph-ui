import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Copy01Icon, Tick01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { ComponentProps, useState } from 'react'

type CopyButtonProps = ComponentProps<typeof Button> & {
  text: string
  onCopySuccess?: () => void
}

export function CopyButton({
  text,
  disabled,
  className,
  onCopySuccess,
  ...props
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false)

  const isDisabled = disabled || !text

  return (
    <Button
      type="button"
      preset="ghost"
      disabled={isDisabled}
      className={cn(
        'text-paragraph size-6 p-0! hover:bg-transparent disabled:opacity-50',
        isCopied && 'cursor-default',
        className
      )}
      onClick={(e) => {
        props.onClick?.(e)

        if (isCopied || isDisabled) return

        void navigator.clipboard.writeText(text)

        onCopySuccess?.()
        setIsCopied(true)
        window.setTimeout(() => setIsCopied(false), 1200)
      }}
      {...props}
    >
      {isCopied ? (
        <HugeiconsIcon
          icon={Tick01Icon}
          className="size-[80%]! text-green-600"
        />
      ) : (
        <HugeiconsIcon icon={Copy01Icon} className="mt-[1px] size-[70%]!" />
      )}
    </Button>
  )
}

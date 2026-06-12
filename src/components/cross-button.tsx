import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'

export function CrossButton({
  className,
  ...props
}: Omit<ComponentProps<'button'>, 'children'>) {
  return (
    <button
      className={cn(
        'bg-shading-gray hover:bg-destructive/10 text-paragraph hover:text-destructive flex size-10 items-center justify-center rounded-[0.75rem] transition-all',
        className
      )}
      {...props}
    >
      <svg
        fill="none"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
        className="size-[60%] transition-all"
      >
        <path
          d="M15.5281 4.02002L4.32812 15.22M4.32812 4.02002L15.5281 15.22"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

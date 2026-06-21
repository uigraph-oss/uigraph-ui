import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },

      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },

      preset: {
        primary:
          "h-[2.7938125rem] [&_svg:not([class*='size-'])]:size-[1.125rem] [&_[role='svg']]:size-[1.125rem] rounded-[0.80315625rem] px-4 has-[>svg]:px-4 font-normal shadow-none leading-[1.33] bg-primary text-primary-foreground hover:bg-primary/90",

        outline:
          "h-[2.7938125rem] [&_svg:not([class*='size-'])]:size-[1.125rem] [&_[role='svg']]:size-[1.125rem] rounded-[0.80315625rem] px-4 has-[>svg]:px-4 font-normal shadow-none leading-[1.33] border border-stock bg-transparent text-foreground/80 hover:text-foreground hover:bg-stock",

        ghost:
          "h-[2.7938125rem] [&_svg:not([class*='size-'])]:size-[1.125rem] [&_[role='svg']]:size-[1.125rem] rounded-[0.80315625rem] px-4 has-[>svg]:px-4 font-normal shadow-none leading-[1.33] bg-transparent text-foreground hover:text-foreground hover:bg-stock",

        destructive:
          "h-[2.7938125rem] [&_svg:not([class*='size-'])]:size-[1.125rem] [&_[role='svg']]:size-[1.125rem] rounded-[0.80315625rem] px-4 has-[>svg]:px-4 font-normal shadow-none leading-[1.33] bg-destructive text-white hover:bg-destructive/90",

        link: "h-auto [&_svg:not([class*='size-'])]:size-[1.125rem] [&_[role='svg']]:size-[1.125rem] [&_svg]:shrink-0 px-2 has-[>svg]:px-2 py-1 p-0 text-sm font-medium bg-transparent border-none shadow-none hover:bg-transparent hover:underline text-primary hover:text-primary/80",
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)
/**
 * DO NOT USE THE `variant` PROPERTY. USE THE `preset` PROPERTY INSTEAD.
 */
function Button({
  className,
  variant,
  preset,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, preset, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

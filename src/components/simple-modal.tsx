import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { ComponentProps, ReactNode } from 'react'

import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { CrossButton } from './cross-button'

export type SimpleModalBaseProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  className?: string
}

export type SimpleModalProps = SimpleModalBaseProps & {
  title: ReactNode
  footer?: ReactNode
  description?: ReactNode
  contentClassName?: string
}

export function SimpleModalBase({
  open,
  onOpenChange,

  children,
  className,
}: SimpleModalBaseProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'bg-shading border-stock h-full max-h-full w-full max-w-full grid-rows-[auto_1fr_auto] gap-0 overflow-hidden rounded-none border p-0 sm:h-auto sm:max-h-[95%] sm:max-w-[min(43rem,95%)] sm:rounded-[1rem]',
          className
        )}
      >
        <DialogClose asChild>
          <CrossButton className="absolute top-3 right-3" />
        </DialogClose>

        {children}
      </DialogContent>
    </Dialog>
  )
}

export function SimpleModalContent({
  children,
  className,
  hasFooter,
  ...props
}: ComponentProps<'div'> & { hasFooter?: boolean }) {
  return (
    <div
      {...props}
      className={cn(
        'custom-scrollbar max-h-full overflow-auto p-6',
        hasFooter && 'pb-0',
        className
      )}
    >
      {children}
    </div>
  )
}

export function SimpleModalHeader({
  title,
  description,
  className,
  ...props
}: Omit<ComponentProps<typeof DialogHeader>, 'title' | 'description'> & {
  title: ReactNode
  description?: ReactNode
}) {
  return (
    <DialogHeader
      {...props}
      className={cn('border-stock h-[6.1rem] border-b p-6', className)}
    >
      <DialogTitle asChild>
        <h3>{title}</h3>
      </DialogTitle>

      {description && (
        <DialogDescription asChild>
          <p className="text-paragraph mt-2 text-sm">{description}</p>
        </DialogDescription>
      )}
    </DialogHeader>
  )
}

export function SimpleModalFooter({
  children,
  className,
  ...props
}: ComponentProps<typeof DialogFooter>) {
  return (
    <DialogFooter
      {...props}
      className={cn(
        'border-stock flex-row justify-end p-6 pt-2 pb-3 sm:pb-6',
        className
      )}
    >
      {children}
    </DialogFooter>
  )
}

export function SimpleModal({
  title,
  description,
  contentClassName,

  footer,
  children,

  ...props
}: SimpleModalProps) {
  return (
    <SimpleModalBase {...props}>
      <SimpleModalHeader title={title} description={description} />

      <SimpleModalContent hasFooter={!!footer} className={contentClassName}>
        {children}
      </SimpleModalContent>

      {footer && <SimpleModalFooter>{footer}</SimpleModalFooter>}
    </SimpleModalBase>
  )
}

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { ComponentProps, ReactNode } from 'react'
import styles from './better-dialog.module.css'
import { Button } from './ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

export type BetterDialogProviderProps = ComponentProps<typeof Dialog> & {
  className?: string
  trigger?: ReactNode
}

type BetterDialogContentProps = {
  className?: string
  children: ReactNode

  /**
   * @ignore Internal prop, do not use.
   */
  _headerContent?: ReactNode
  /**
   * @ignore Internal prop, do not use.
   */
  _headerClassName?: string

  /**
   * @ignore Internal prop, do not use.
   */
  _footerContent?: ReactNode
  /**
   * @ignore Internal prop, do not use.
   */
  _footerClassName?: string

  title?: ReactNode
  description?: ReactNode

  footerCancel?: ReactNode | true
  footerSubmit?: ReactNode | true
  footerSubmitIcon?: ReactNode
  footerSubmitLoading?: boolean
  footerAlign?: 'start' | 'end' | 'center' | 'between'
  onFooterSubmitClick?: () => void
}

export function BetterDialogProvider({
  className,
  children,
  trigger,
  ...props
}: BetterDialogProviderProps) {
  return (
    <Dialog {...props}>
      {trigger}

      <DialogContent
        showCloseButton={false}
        className={cn(
          'flex h-full max-h-full w-full max-w-full flex-col gap-0 overflow-hidden rounded-none border-0 border-[#E5E7E9] bg-[#F9FBFC] p-0 outline-none sm:h-auto sm:max-h-[90vh] sm:max-w-[min(var(--width,45rem),90%)] sm:rounded-[1rem] sm:border',
          className
        )}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

export function BetterDialogContent({
  children,
  className,

  _headerContent: headerContent,
  _footerContent: footerContent,

  title,
  description,

  footerCancel,
  footerSubmit,
  footerSubmitIcon,
  footerSubmitLoading,
  footerAlign = 'end',
  onFooterSubmitClick,
}: BetterDialogContentProps) {
  const header = headerContent ? (
    headerContent
  ) : title || description ? (
    <DialogHeader className="flex min-h-18 w-full flex-row items-center justify-between border-b border-[#E5E7E9] px-6">
      <div className="flex flex-col gap-1">
        <DialogTitle className="text-base font-medium">{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </div>

      <BetterDialogCloseButton />
    </DialogHeader>
  ) : null

  const footer = footerContent ? (
    footerContent
  ) : footerCancel || footerSubmit ? (
    <DialogFooter
      className={cn(
        'flex w-full flex-row items-center gap-3 p-6 pt-3',
        footerAlign === 'between' && 'justify-between sm:justify-between',
        footerAlign === 'center' && 'justify-center sm:justify-center',
        footerAlign === 'start' && 'justify-start sm:justify-start',
        footerAlign === 'end' && 'justify-end sm:justify-end'
      )}
    >
      {footerCancel && (
        <DialogClose asChild>
          <Button preset="outline">
            {footerCancel === true ? 'Cancel' : footerCancel}
          </Button>
        </DialogClose>
      )}

      {footerSubmit && (
        <Button
          preset="primary"
          onClick={onFooterSubmitClick}
          disabled={footerSubmitLoading}
        >
          {!footerSubmitLoading && footerSubmitIcon}
          {footerSubmitLoading && <Loader2 className="size-4 animate-spin" />}
          {footerSubmit === true ? 'Submit' : footerSubmit}
        </Button>
      )}
    </DialogFooter>
  ) : null

  return (
    <>
      {header}

      <div
        className={cn(
          'w-full flex-1 overflow-auto p-6',
          footer && 'pb-3',
          styles.content,
          className
        )}
      >
        {children}
      </div>

      {footer}
    </>
  )
}

export function BetterDialogCloseButton({
  className,
  ...props
}: ComponentProps<'button'>) {
  return (
    <DialogClose asChild {...props}>
      <button
        className={cn(
          'flex size-[1em] cursor-pointer items-center justify-center rounded-[0.3em] bg-[#F6F6F6] text-sm text-[2.5rem] text-[#6B7480] transition-all hover:bg-red-100 hover:text-red-700',
          className
        )}
      >
        <svg
          width="0.4em"
          height="0.4em"
          fill="none"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.7434 1.1709L0.743408 15.1709M0.743408 1.1709L14.7434 15.1709"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all"
          />
        </svg>
      </button>
    </DialogClose>
  )
}

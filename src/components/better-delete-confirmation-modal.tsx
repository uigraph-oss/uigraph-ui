'use client'

import deleteImg from '@/assets/images/delete-02.png'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { useState } from 'react'
import { toast } from 'sonner'
import { SuperCircleLoader } from './loader'

interface DeleteConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void

  onConfirm: () => Promise<unknown>

  title: string
  description: string

  cancelButtonText?: string
  deleteButtonText?: string
  errorMessage?: string
}

export function BetterDeleteConfirmationModal({
  open,
  onOpenChange,

  onConfirm,

  title,
  description,

  cancelButtonText = 'Cancel',
  deleteButtonText = 'Permanently Delete',
  errorMessage = 'Failed to delete item. Please try again later.',
}: DeleteConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 rounded-[16px] border border-[#E5E7E9] bg-[#F9FBFC] p-0 sm:max-w-[463px]">
        <div className="p-6 text-center">
          <img src={deleteImg.src} alt="trash" className="mx-auto mb-4" />

          <DialogTitle asChild>
            <h3 className="text-textPrimary pt-8 text-[1rem] leading-[1.33] font-semibold">
              {title}
            </h3>
          </DialogTitle>

          <DialogDescription asChild>
            <p className="text-textSecondary pt-4 text-sm leading-[1.33] font-normal">
              {description}
            </p>
          </DialogDescription>

          <div className="grid grid-cols-2 gap-2 pt-8">
            <Button
              preset="outline"
              className="bg-destructive/20 text-destructive border-destructive/20 hover:bg-destructive/30 hover:text-destructive h-14"
              disabled={isLoading}
              onClick={async () => {
                setIsLoading(true)
                try {
                  await onConfirm()
                  onOpenChange(false)
                } catch {
                  toast.error(errorMessage)
                } finally {
                  setIsLoading(false)
                }
              }}
            >
              {isLoading && <SuperCircleLoader />}
              {deleteButtonText}
            </Button>

            <Button
              preset="primary"
              className="h-14"
              disabled={isLoading}
              onClick={() => onOpenChange(false)}
            >
              {cancelButtonText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

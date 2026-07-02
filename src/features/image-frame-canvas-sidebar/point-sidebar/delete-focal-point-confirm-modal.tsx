'use client'

import deleteImg from '@/assets/images/delete-02.png'
import { SimpleModalBase } from '@/components'
import { SuperCircleLoader } from '@/components/loader'
import { Button } from '@/components/ui/button'
import { DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useState } from 'react'

interface DeleteConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
}

export function DeleteFocalPointConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
}: DeleteConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <SimpleModalBase
      open={open}
      onOpenChange={onOpenChange}
      className={'!max-w-[463px]'}
    >
      <div className="p-6 text-center">
        <img src={deleteImg} alt="trash" className="mx-auto mb-4" />

        <DialogTitle className="text-textPrimary pt-8 text-[1rem] leading-[1.33] font-semibold">
          Do you want to delete this focal point meta data?
        </DialogTitle>

        <DialogDescription className="text-textSecondary pt-4 text-sm leading-[1.33] font-normal">
          Deleting this focal point meta data is a permanent action and cannot
          be undone. Please think carefully before proceeding.
        </DialogDescription>

        <div className="flex space-x-3 pt-8 *:flex-1">
          <Button
            variant="outline"
            className="h-14 rounded-[13px] border border-[#CD454380] bg-[#CD45434D] text-sm font-normal text-[#E92A19] hover:bg-[#CD4543] hover:text-white"
            onClick={async () => {
              setIsLoading(true)
              await onConfirm()
              setIsLoading(false)
              onOpenChange(false)
            }}
          >
            {isLoading && <SuperCircleLoader />}
            Permanently Delete
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className="h-14 rounded-[13px] text-sm font-normal text-white"
          >
            Cancel
          </Button>
        </div>
      </div>
    </SimpleModalBase>
  )
}

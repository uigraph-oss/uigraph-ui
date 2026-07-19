'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { LuTriangleAlert } from 'react-icons/lu'
import { useChatSession } from '../contexts/chat-session-context'

export function ChatConfigErrorDialog() {
  const { configError, dismissConfigError } = useChatSession()

  return (
    <AlertDialog
      open={!!configError}
      onOpenChange={(open) => !open && dismissConfigError()}
    >
      <AlertDialogContent className="border-stock max-w-md gap-0 overflow-hidden rounded-2xl bg-[#141925] p-0">
        <div className="from-destructive/12 flex flex-col items-center bg-gradient-to-b to-transparent px-6 pt-8 pb-6 text-center">
          <div className="bg-destructive/10 ring-destructive/15 mb-4 flex size-14 items-center justify-center rounded-2xl ring-8">
            <LuTriangleAlert className="text-destructive size-6" />
          </div>
          <AlertDialogHeader className="items-center gap-2 space-y-0 text-center sm:text-center">
            <AlertDialogTitle className="text-lg font-semibold text-[#F4F7FC]">
              {configError?.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-paragraph max-w-sm text-sm leading-relaxed">
              {configError?.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <AlertDialogFooter className="border-stock border-t bg-[#0F131C]/60 px-6 py-4">
          <AlertDialogAction
            onClick={dismissConfigError}
            className="bg-primary hover:bg-primary/90 h-10 w-full rounded-lg font-medium text-white shadow-none"
          >
            Got it
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { BetterDialogProvider } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { FrameLinkV2 } from '@/features/dashboard-pages/api/links'
import { cn } from '@/lib/utils'
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { LuLink } from 'react-icons/lu'
import { toast } from 'sonner'
import { getViewPointPositionStyle } from '../helpers'
import { EditLinkModal } from './edit-link-modal'
import { SvgDot } from './svg-dot'

type LinkedPageDotProps = {
  contentSize: 'sm' | 'md'
  pageLink: FrameLinkV2

  deletePageLink: () => Promise<void>
  updatePageLink: (data: { label: string }) => Promise<void>
}

export function LinkedPageDot({
  contentSize,
  pageLink,
  deletePageLink,
  updatePageLink,
}: LinkedPageDotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  return (
    <>
      <Tooltip
        open={isEditModalOpen || isDeleteModalOpen ? true : isOpen}
        onOpenChange={setIsOpen}
      >
        <TooltipTrigger asChild>
          <a
            target="_blank"
            rel="noreferrer"
            href={`/dashboard/frame/${pageLink.targetFrameId}`}
            style={getViewPointPositionStyle({
              x: pageLink.locationX!,
              y: pageLink.locationY!,
            })}
            className={cn(
              'group text-primary absolute block -translate-x-1/2 -translate-y-1/2 rounded-full',
              contentSize === 'sm' && 'text-[1.5rem]',
              contentSize === 'md' && 'text-[3rem]'
            )}
          >
            <SvgDot />

            <div className="absolute inset-0 flex items-center justify-center">
              <LuLink className="size-[0.25em] text-white transition-all group-hover:text-white" />
            </div>
          </a>
        </TooltipTrigger>

        <TooltipContent className="text-foreground bg-white shadow-lg [&>span>svg]:hidden!">
          <div className="flex items-center gap-3">
            <p className="text-lg font-medium">{pageLink.label ?? 'N/A'}</p>

            <div className="flex items-center gap-1">
              <Button
                preset="outline"
                className="size-8"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Pencil />
              </Button>
              <Button
                preset="destructive"
                className="size-8"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <Trash2 />
              </Button>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>

      <BetterDeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={async () => {
          await deletePageLink()
          toast.success('Link deleted')
        }}
        title="Delete linked page?"
        description="Deleting this link removes it from the canvas. This action cannot be undone."
      />

      <BetterDialogProvider
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      >
        <EditLinkModal
          defaultValues={{ label: pageLink.label ?? '' }}
          onSubmit={async ({ label }: { label: string }) => {
            try {
              await updatePageLink({ label })
              toast.success('Label updated')
              setIsEditModalOpen(false)
            } catch {
              toast.error('Failed to update label')
            }
          }}
        />
      </BetterDialogProvider>
    </>
  )
}

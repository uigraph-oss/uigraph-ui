import { GT } from '@/api'
import { SuperCircleLoader } from '@/components/loader'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast } from 'sonner'
import { DeleteFocalPointConfirmationModal } from '../point-sidebar/delete-focal-point-confirm-modal'
import { BasicSection } from './basic-section'
import { ComponentsSection } from './components-section'

export type GroupSidebarDetailsProps = {
  page: GT.Page
  frameGroup: GT.PageGroup
  frameGroupPoints: GT.FocalPoint[]
  updateFrameGroup: (input: GT.UpdatePageGroupInput) => Promise<void>
  deleteFrameGroup: () => Promise<void>
}

export function GroupSidebarDetails({
  frameGroup,
  frameGroupPoints,
  updateFrameGroup,
  deleteFrameGroup,
}: GroupSidebarDetailsProps) {
  const [isDeletingFrameGroup, setIsDeletingFrameGroup] = useState(false)
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
    useState(false)

  return (
    <div>
      <BasicSection
        frameGroup={frameGroup}
        updateFrameGroup={updateFrameGroup}
      />

      <ComponentsSection focalPoints={frameGroupPoints} />

      <div className="px-4 pb-2">
        <Button
          size="lg"
          variant="destructive"
          className="text-destructive ring-destructive w-full rounded-lg bg-white ring hover:text-white"
          disabled={isDeletingFrameGroup}
          onClick={async () => setIsDeleteConfirmModalOpen(true)}
        >
          <SuperCircleLoader loading={isDeletingFrameGroup} />
          Delete Frame Group
        </Button>

        <DeleteFocalPointConfirmationModal
          open={isDeleteConfirmModalOpen}
          onOpenChange={setIsDeleteConfirmModalOpen}
          onConfirm={async () => {
            try {
              setIsDeletingFrameGroup(true)

              await deleteFrameGroup()

              toast.success('Frame group deleted successfully')
            } catch {
              toast.error(
                'Failed to delete frame group. Please try again later.'
              )
            } finally {
              setIsDeletingFrameGroup(false)
            }
          }}
        />
      </div>
    </div>
  )
}

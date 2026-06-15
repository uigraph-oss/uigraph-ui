import { SuperCircleLoader } from '@/components/loader'
import { Button } from '@/components/ui/button'
import { FocalPointV2 } from '@/features/dashboard-pages/api/focal-point-v2'
import { FrameGroupV2 } from '@/features/dashboard-pages/api/frame-group-v2'
import { DashboardFrame } from '@/features/dashboard-projects/api'
import { useState } from 'react'
import { toast } from 'sonner'
import { DeleteFocalPointConfirmationModal } from '../point-sidebar/delete-focal-point-confirm-modal'
import { BasicSection } from './basic-section'
import { ComponentsSection } from './components-section'

export type FrameGroupUpdateInput = {
  name?: string
  description?: string
  locationX?: number
  locationY?: number
  width?: number
  height?: number
  order?: number
}

export type GroupSidebarDetailsProps = {
  frame: DashboardFrame
  frameGroup: FrameGroupV2
  frameGroupPoints: FocalPointV2[]
  updateFrameGroup: (input: FrameGroupUpdateInput) => Promise<void>
  deleteFrameGroup: () => Promise<void>
}

export function GroupSidebarDetails({
  frame,
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

      <ComponentsSection
        focalPoints={frameGroupPoints}
        mapId={frame.mapId ?? ''}
      />

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

'use client'

import { GridScrollBody } from '@/components/grid-scroll-body'
import { FocalPointSidebarContextProvider } from '@/features/image-frame-canvas-sidebar/contexts/focal-point-sidebar-context'
import { GroupSidebar } from '@/features/image-frame-canvas-sidebar/group-sidebar/group-sidebar'
import { FocalPointSidebar } from '@/features/image-frame-canvas-sidebar/point-sidebar/focal-point-sidebar'
import { cn } from '@/lib/utils'
import { useFocalPointContext } from '../context/focal-point-context'
import { FocalPointCanvas } from './focal-point-canvas'
import { FocalPointPresetToolbar } from './focal-point-preset-toolbar'

export function FocalPointEditor() {
  const {
    frame,
    mapId,
    preset,
    setPreset,

    updateFocalPoint,
    deleteFocalPoint,

    selectedFocalPoint,
    selectedFrameGroup,
    selectedFrameGroupPoints,
    updateFrameGroup,
    deleteFrameGroup,
  } = useFocalPointContext()

  const isSidebarOpen = Boolean(selectedFrameGroup || selectedFocalPoint)

  return (
    <div className={'h-full p-4'}>
      <div
        id="focal-point-editor"
        className={cn(
          'grid h-full transition-[grid-template-columns,gap]',
          isSidebarOpen
            ? 'grid-cols-[1fr_27.25rem] gap-2'
            : 'grid-cols-[1fr_0] gap-0'
        )}
      >
        <div className="relative grid">
          <GridScrollBody className="border-stock bg-shading-gray flex-1 rounded-[0.75rem] border p-4 transition-opacity duration-200">
            <div className="p-2">
              <FocalPointCanvas />
            </div>
          </GridScrollBody>

          <FocalPointPresetToolbar preset={preset} setPreset={setPreset} />
        </div>

        <div className="h-full overflow-hidden">
          {selectedFocalPoint && (
            <GridScrollBody className="border-stock h-full w-[27.25rem] rounded-[0.75rem] border bg-[#141925]">
              <FocalPointSidebarContextProvider
                focalPoint={selectedFocalPoint}
                mapId={mapId}
              >
                <FocalPointSidebar
                  focalPoint={selectedFocalPoint}
                  updateFocalPoint={updateFocalPoint}
                  deleteFocalPoint={deleteFocalPoint}
                />
              </FocalPointSidebarContextProvider>
            </GridScrollBody>
          )}

          {selectedFrameGroup && (
            <GridScrollBody className="border-stock h-full w-[27.25rem] rounded-[0.75rem] border bg-[#141925]">
              <GroupSidebar
                frame={frame!}
                frameGroup={selectedFrameGroup}
                frameGroupPoints={selectedFrameGroupPoints}
                updateFrameGroup={async (input) => {
                  await updateFrameGroup(selectedFrameGroup.id, input)
                }}
                deleteFrameGroup={async () => {
                  await deleteFrameGroup(selectedFrameGroup.id)
                }}
              />
            </GridScrollBody>
          )}
        </div>
      </div>
    </div>
  )
}

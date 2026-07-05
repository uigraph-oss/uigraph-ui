'use client'

import { GridScrollBody } from '@/components/grid-scroll-body'
import { FocalPointSidebarContextProvider } from '@/features/image-frame-canvas-sidebar/contexts/focal-point-sidebar-context'
import { GroupSidebar } from '@/features/image-frame-canvas-sidebar/group-sidebar/group-sidebar'
import { FocalPointSidebar } from '@/features/image-frame-canvas-sidebar/point-sidebar/focal-point-sidebar'
import { cn } from '@/lib/utils'
import { FaMobileAlt, FaTabletAlt } from 'react-icons/fa'
import { LuFullscreen } from 'react-icons/lu'
import { useFocalPointContext } from '../context/focal-point-context'
import { FocalPointCanvas } from './focal-point-canvas'

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
    <div className={'h-full p-4 pt-2'}>
      <div
        id="focal-point-editor"
        className={cn(
          'grid h-full transition-[grid-template-columns,gap]',
          isSidebarOpen
            ? 'grid-cols-[1fr_27.25rem] gap-2'
            : 'grid-cols-[1fr_0] gap-0'
        )}
      >
        <div className="relative grid grid-rows-[auto_1fr] gap-2">
          <div className="flex items-center gap-1 justify-self-center">
            <button
              onClick={() => setPreset(preset === 'mobile' ? null : 'mobile')}
              className={cn(
                'flex size-8 items-center justify-center rounded-[0.625rem] border border-[#2A3242] text-[#F4F7FC] transition-colors [&>svg]:size-3.5',
                preset === 'mobile'
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'hover:bg-[#1E2533]'
              )}
            >
              <FaMobileAlt />
            </button>

            <button
              onClick={() => setPreset(preset === 'tablet' ? null : 'tablet')}
              className={cn(
                'flex size-8 items-center justify-center rounded-[0.625rem] border border-[#2A3242] text-[#F4F7FC] transition-colors [&>svg]:size-3.5',
                preset === 'tablet'
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'hover:bg-[#1E2533]'
              )}
            >
              <FaTabletAlt />
            </button>

            <button
              onClick={() => setPreset(preset === 'desktop' ? null : 'desktop')}
              className={cn(
                'flex size-8 items-center justify-center rounded-[0.625rem] border border-[#2A3242] text-[#F4F7FC] transition-colors [&>svg]:size-3.5',
                preset === 'desktop'
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'hover:bg-[#1E2533]'
              )}
            >
              <LuFullscreen className="scale-125" />
            </button>
          </div>

          <GridScrollBody className="border-stock bg-shading-gray min-h-0 rounded-[0.75rem] border border-[#2A3242] p-4 transition-opacity duration-200">
            <div className="p-4">
              <FocalPointCanvas />
            </div>
          </GridScrollBody>
        </div>

        <div className="h-full overflow-hidden">
          {selectedFocalPoint && (
            <GridScrollBody className="border-stock h-full w-[27.25rem] rounded-[0.75rem] border border-[#2A3242] bg-[#141925]">
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
            <GridScrollBody className="border-stock h-full w-[27.25rem] rounded-[0.75rem] border border-[#2A3242] bg-[#141925]">
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

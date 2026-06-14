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
    <div className={'h-full p-4 pt-6'}>
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
          <GridScrollBody className="border-stock flex-1 rounded-[0.75rem] border bg-[#f2f2f2] p-4 transition-opacity duration-200">
            <div className="p-4">
              <FocalPointCanvas />
            </div>
          </GridScrollBody>

          <div className="absolute top-3 right-3 flex h-12 items-center gap-1 rounded-2xl border border-[#E5E5E5] bg-white p-1">
            <button
              onClick={() => setPreset(preset === 'mobile' ? null : 'mobile')}
              className={cn(
                'border-stock flex size-10 items-center justify-center rounded-[0.8125rem] border transition-colors [&>svg]:size-4',
                preset === 'mobile'
                  ? 'bg-primary/10 text-primary border-none'
                  : 'hover:bg-stock'
              )}
            >
              <FaMobileAlt />
            </button>

            <button
              onClick={() => setPreset(preset === 'tablet' ? null : 'tablet')}
              className={cn(
                'border-stock flex size-10 items-center justify-center rounded-[0.8125rem] border transition-colors [&>svg]:size-4',
                preset === 'tablet'
                  ? 'bg-primary/10 text-primary border-none'
                  : 'hover:bg-stock'
              )}
            >
              <FaTabletAlt />
            </button>

            <button
              onClick={() => setPreset(preset === 'desktop' ? null : 'desktop')}
              className={cn(
                'border-stock flex size-10 items-center justify-center rounded-[0.8125rem] border transition-colors [&>svg]:size-4',
                preset === 'desktop'
                  ? 'bg-primary/10 text-primary border-none'
                  : 'hover:bg-stock'
              )}
            >
              <LuFullscreen className="scale-125" />
            </button>
          </div>
        </div>

        <div className="h-full overflow-hidden">
          {selectedFocalPoint && (
            <GridScrollBody className="border-stock h-full w-[27.25rem] rounded-[0.75rem] border bg-white">
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
            <GridScrollBody className="border-stock h-full w-[27.25rem] rounded-[0.75rem] border bg-white">
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

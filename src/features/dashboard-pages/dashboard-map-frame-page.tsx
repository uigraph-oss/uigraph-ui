'use client'

import { SuperCircleLoader } from '@/components/loader'
import { SectionLoader } from '@/components/section-loader'
import { Button } from '@/components/ui/button'
import { DashboardPageSectionLayout } from '@/features/dashboard'
import { LuLink, LuX } from 'react-icons/lu'
import { RxGroup } from 'react-icons/rx'
import { CirclePlusIcon } from '../../assets/svgs/component-icons'
import { FocalPointEditor } from './components/focal-point-editor'
import {
  FocalPointContextProvider,
  useFocalPointContext,
} from './context/focal-point-context'

export function DashboardMapFramePage() {
  return (
    <FocalPointContextProvider>
      <FocalPointPageInner />
    </FocalPointContextProvider>
  )
}

function FocalPointPageInner() {
  const {
    newPoint,
    setNewPoint,

    frame,
    frameLoading,

    map,
    mapLoading,

    drawRectMode,
    setDrawRectMode,
  } = useFocalPointContext()

  return (
    <DashboardPageSectionLayout
      noPadding
      title="Focal Point"
      description="Allows users to add focal points to an image and input related metadata like implementation and quality details."
      crumbs={[
        { to: `/dashboard/maps`, label: 'Maps' },
        {
          to: `/dashboard/maps/${map?.id}`,
          label: mapLoading ? (
            <SuperCircleLoader />
          ) : (
            (map?.name ?? 'Untitled Map')
          ),
        },
        {
          to: `/dashboard/frame/${frame?.id}`,
          label: frameLoading ? (
            <SuperCircleLoader />
          ) : (
            (frame?.name ?? 'Frame')
          ),
        },
      ]}
      headerContent={
        frame && (
          <div className="flex items-center gap-2">
            <Button
              preset={newPoint?.type === 'link' ? 'destructive' : 'primary'}
              onClick={() =>
                setNewPoint((prev) =>
                  prev ? null : { type: 'link', position: null }
                )
              }
            >
              {newPoint?.type === 'link' ? (
                <>
                  <LuX />
                  Cancel Link Point
                </>
              ) : (
                <>
                  <LuLink />
                  Link Point
                </>
              )}
            </Button>

            <Button
              preset={drawRectMode ? 'destructive' : 'primary'}
              onClick={() =>
                setDrawRectMode((prev) =>
                  prev ? null : { type: 'group', position: null }
                )
              }
            >
              {drawRectMode ? (
                <>
                  <LuX />
                  Cancel Group
                </>
              ) : (
                <>
                  <RxGroup />
                  Add Group
                </>
              )}
            </Button>

            <Button
              preset={newPoint?.type === 'focal' ? 'destructive' : 'primary'}
              onClick={() =>
                setNewPoint((prev) =>
                  prev ? null : { type: 'focal', position: null }
                )
              }
            >
              {newPoint?.type === 'focal' ? (
                <>
                  <LuX />
                  Cancel Focal Point
                </>
              ) : (
                <>
                  <CirclePlusIcon />
                  Add Focal Point
                </>
              )}
            </Button>
          </div>
        )
      }
    >
      {frame ? (
        <FocalPointEditor />
      ) : (
        <>
          {frameLoading ? (
            <SectionLoader />
          ) : (
            <div className="text-center text-gray-500">Frame not found</div>
          )}
        </>
      )}
    </DashboardPageSectionLayout>
  )
}

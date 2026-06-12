'use client'

import { GT } from '@/api'
import { CommentIcon, NoteIcon } from '@/assets/svgs/component-icons'
import { CrossButton } from '@/components/cross-button'
import { SuperLogoLoader } from '@/components/loader'
import { useCanvasTarget } from '@/features/image-frame-canvas/hooks/use-canvas-target'
import { useState } from 'react'
import { CommentsContextProvider } from '../../comments/contexts/comments-context'
import { CommentsSection } from '../comments/comments-section'
import { useFocalPointSidebarContext } from '../contexts/focal-point-sidebar-context'
import { FocalPointDetails, FocalPointDetailsApi } from './focal-point-details'

type FocalPointDrawerProps = FocalPointDetailsApi & {
  focalPoint: GT.FocalPoint
}

export function FocalPointSidebar({
  focalPoint,
  updateFocalPoint,
  deleteFocalPoint,
}: FocalPointDrawerProps) {
  const canvasTarget = useCanvasTarget()
  const { pointMetaLoading } = useFocalPointSidebarContext()
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details')

  return (
    <>
      <div className="border-stock flex h-14 items-center justify-between border-b px-4 py-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Focal Point Details
        </h2>

        <CrossButton onClick={canvasTarget.clearTarget} className={'size-8'} />
      </div>

      <div className="border-stock flex items-center justify-start gap-2.5 border-b px-4 py-2">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex h-10 items-center gap-2 rounded-[0.75rem] border px-4 text-sm font-medium transition-colors ${
            activeTab === 'details'
              ? 'bg-primary border-primary text-white'
              : 'text-paragraph border-stock bg-transparent'
          }`}
        >
          <NoteIcon className="text-base" />
          Details
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={`flex h-10 items-center gap-2 rounded-[0.75rem] border px-4 text-sm font-medium transition-colors ${
            activeTab === 'comments'
              ? 'bg-primary border-primary text-white'
              : 'text-paragraph border-stock bg-transparent'
          }`}
        >
          <CommentIcon className="text-base" />
          Comments
        </button>
      </div>

      <div className="flex-1 overflow-auto pb-2">
        {pointMetaLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <SuperLogoLoader />
          </div>
        ) : (
          <>
            {activeTab === 'details' ? (
              <FocalPointDetails
                focalPoint={focalPoint}
                unselectFocalPoint={canvasTarget.clearTarget}
                updateFocalPoint={updateFocalPoint}
                deleteFocalPoint={deleteFocalPoint}
              />
            ) : (
              <CommentsContextProvider resourceId={focalPoint.focalPointId!}>
                <CommentsSection />
              </CommentsContextProvider>
            )}
          </>
        )}
      </div>
    </>
  )
}

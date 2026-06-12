import { CommentIcon, NoteIcon } from '@/assets/svgs/component-icons'
import { CrossButton } from '@/components/cross-button'
import { CommentsContextProvider } from '@/features/comments/contexts/comments-context'
import { useCanvasTarget } from '@/features/image-frame-canvas/hooks/use-canvas-target'
import { useState } from 'react'
import { CommentsSection } from '../comments/comments-section'
import {
  GroupSidebarDetails,
  GroupSidebarDetailsProps,
} from './group-sidebar-details'

type GroupSidebarProps = GroupSidebarDetailsProps

export function GroupSidebar({
  page,
  frameGroup,
  frameGroupPoints,
  updateFrameGroup,
  deleteFrameGroup,
}: GroupSidebarProps) {
  const canvasTarget = useCanvasTarget()
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details')

  return (
    <>
      <div className="border-stock flex h-14 items-center justify-between border-b px-4 py-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Frame Group Details
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
        {activeTab === 'details' ? (
          <GroupSidebarDetails
            page={page}
            frameGroup={frameGroup}
            frameGroupPoints={frameGroupPoints}
            updateFrameGroup={updateFrameGroup}
            deleteFrameGroup={deleteFrameGroup}
          />
        ) : (
          <CommentsContextProvider resourceId={frameGroup.pageGroupId!}>
            <CommentsSection />
          </CommentsContextProvider>
        )}
      </div>
    </>
  )
}

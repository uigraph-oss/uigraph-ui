'use client'

import { CommentIcon, NoteIcon } from '@/assets/svgs/component-icons'

type TestInspectorTabsProps = {
  activeTab: 'details' | 'runs' | 'comments'
  onTabChange: (tab: 'details' | 'runs' | 'comments') => void
}

export function TestInspectorTabs({
  activeTab,
  onTabChange,
}: TestInspectorTabsProps) {
  return (
    <div className="flex items-center justify-start gap-2.5 border-b border-gray-200 px-4 py-2">
      <button
        onClick={() => onTabChange('details')}
        className={`flex h-10 items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-150 ${
          activeTab === 'details'
            ? 'border-blue-200 bg-blue-50 text-blue-600'
            : 'border-gray-200 bg-transparent text-gray-500 hover:bg-gray-100'
        }`}
      >
        <NoteIcon className="text-base" />
        Details
      </button>

      <button
        onClick={() => onTabChange('comments')}
        className={`flex h-10 items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-150 ${
          activeTab === 'comments'
            ? 'border-blue-200 bg-blue-50 text-blue-600'
            : 'border-gray-200 bg-transparent text-gray-500 hover:bg-gray-100'
        }`}
      >
        <CommentIcon className="text-base" />
        Comments
      </button>
    </div>
  )
}

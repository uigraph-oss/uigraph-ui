'use client'

import { cn } from '@/lib/utils'
import { Grid3X3, Move } from 'lucide-react'

export type ViewMode = 'grid' | 'canvas'

interface ViewModeToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function ViewModeToggle({
  viewMode,
  onViewModeChange,
}: ViewModeToggleProps) {
  return (
    <div className="min-w-[160px] rounded-full bg-gray-100 p-1">
      <div className="relative isolate grid grid-cols-2 rounded-[inherit]">
        <div
          className={cn(
            'absolute inset-y-0 left-0 z-0 h-full w-1/2 rounded-[inherit] bg-white shadow-sm transition-transform duration-300',
            viewMode === 'canvas' && 'translate-x-full'
          )}
        />

        <button
          type="button"
          aria-pressed={viewMode === 'grid'}
          onClick={() => onViewModeChange('grid')}
          className={cn(
            'relative z-10 flex h-8 flex-1 items-center justify-center rounded-[inherit] px-3 text-gray-900 transition-colors duration-200 focus:outline-none',
            viewMode === 'grid' ? '' : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <Grid3X3 className="mr-1 h-4 w-4" />
          Grid
        </button>

        <button
          type="button"
          aria-pressed={viewMode === 'canvas'}
          onClick={() => onViewModeChange('canvas')}
          className={cn(
            'relative z-10 flex h-8 flex-1 items-center justify-center rounded-[inherit] px-3 text-gray-900 transition-colors duration-200 focus:outline-none',
            viewMode === 'canvas' ? '' : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <Move className="mr-1 h-4 w-4" />
          Canvas
        </button>
      </div>
    </div>
  )
}

import { SuperCircleLoader } from '@/components/loader'
import { cn } from '@/lib/utils'
import {
  ResetLayoutViewIcon,
  SaveLayoutIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from './assets/icons'

type CanvasToolbarProps = {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void

  onSaveLayout: () => void
  isSaveLayoutLoading?: boolean
  isSaveLayoutDisabled?: boolean

  onResetLayout: () => void
  isResetLayoutDisabled?: boolean
  isResetLayoutLoading?: boolean
}

const toolbarButtonClassName =
  'flex h-full items-center gap-1.5 rounded-[0.8125rem] border border-[#2A3242] px-[0.803125rem] text-sm text-[#F4F7FC] transition-colors hover:bg-[#1E2533] disabled:cursor-not-allowed disabled:text-[#828DA3] disabled:opacity-60'

const iconButtonClassName =
  'flex size-10 items-center justify-center rounded-[0.8125rem] border border-[#2A3242] text-[#F4F7FC] transition-colors hover:bg-[#1E2533]'

export function CanvasToolbar({
  zoom,
  onZoomIn,
  onZoomOut,
  onSaveLayout,
  onResetLayout,
  isSaveLayoutLoading,
  isSaveLayoutDisabled,
  isResetLayoutDisabled,
  isResetLayoutLoading,
}: CanvasToolbarProps) {
  return (
    <div className="absolute top-6 right-6 flex h-12 gap-4 rounded-2xl border border-[#2A3242] bg-[#141925] p-1 shadow-sm">
      <button
        onClick={onSaveLayout}
        disabled={isSaveLayoutDisabled || isSaveLayoutLoading}
        className={toolbarButtonClassName}
      >
        {isSaveLayoutLoading ? (
          <SuperCircleLoader className="text-base" />
        ) : (
          <SaveLayoutIcon className="text-base" />
        )}
        Save Layout
      </button>

      <div className="flex h-full items-center gap-3">
        <button onClick={onZoomIn} className={iconButtonClassName}>
          <ZoomInIcon className="text-base" />
        </button>

        <span className="flex w-9 items-center justify-center text-sm text-[#F4F7FC]">
          {Math.round(zoom * 100)}%
        </span>

        <button onClick={onZoomOut} className={iconButtonClassName}>
          <ZoomOutIcon className="text-base" />
        </button>
      </div>

      <button
        onClick={onResetLayout}
        disabled={isResetLayoutDisabled || isResetLayoutLoading}
        className={cn(toolbarButtonClassName, 'disabled:hover:bg-transparent')}
      >
        {isResetLayoutLoading ? (
          <SuperCircleLoader className="text-base" />
        ) : (
          <ResetLayoutViewIcon className="text-base" />
        )}
        Reset View
      </button>
    </div>
  )
}

import { SuperCircleLoader } from '@/components/loader'
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
    <div className="absolute top-6 right-6 flex h-12 gap-6 rounded-2xl border border-[#E5E5E5] bg-white p-1">
      <button
        onClick={onSaveLayout}
        disabled={isSaveLayoutDisabled || isSaveLayoutLoading}
        className="text-foreground disabled:text-paragraph flex h-full items-center gap-1.5 rounded-[0.8125rem] border border-[#F2F2F2] px-[0.803125rem] text-sm"
      >
        {isSaveLayoutLoading ? (
          <SuperCircleLoader className="text-base" />
        ) : (
          <SaveLayoutIcon className="text-base" />
        )}
        Save Layout
      </button>

      <div className="text-paragraph flex h-full items-center gap-3">
        <button
          onClick={onZoomIn}
          className="flex size-10 items-center justify-center rounded-[0.8125rem] border border-[#F2F2F2]"
        >
          <ZoomInIcon className="text-base" />
        </button>

        <span className="text-foreground flex w-9 items-center justify-center text-sm">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={onZoomOut}
          className="flex size-10 items-center justify-center rounded-[0.8125rem] border border-[#F2F2F2]"
        >
          <ZoomOutIcon className="text-base" />
        </button>
      </div>

      <button
        onClick={onResetLayout}
        disabled={isResetLayoutDisabled || isResetLayoutLoading}
        className="text-foreground disabled:text-paragraph flex h-full items-center gap-1.5 rounded-[0.8125rem] border border-[#F2F2F2] px-[0.803125rem] text-sm"
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

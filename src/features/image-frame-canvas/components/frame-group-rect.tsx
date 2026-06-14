import { FrameGroupV2 } from '@/features/dashboard-pages/api/frame-group-v2'
import { DashboardFrame } from '@/features/dashboard-projects/api'
import { cn } from '@/lib/utils'
import { getViewPointPositionStyle, getViewPointSizeStyle } from '../helpers'

type FrameGroupRectProps = {
  contentSize: 'sm' | 'md'
  frame: DashboardFrame
  frameGroup: FrameGroupV2
  isSelected: boolean
  onClick: () => void
}

export function FrameGroupRect({
  contentSize,
  frameGroup,
  isSelected,
  onClick,
}: FrameGroupRectProps) {
  return (
    <div
      className="absolute"
      style={{
        ...getViewPointPositionStyle({
          x: frameGroup.locationX!,
          y: frameGroup.locationY!,
        }),
        ...getViewPointSizeStyle(frameGroup.width!, frameGroup.height!),
      }}
    >
      <button
        key={frameGroup.id}
        onClick={onClick}
        className={cn(
          'border-primary/50 block size-full rounded-md bg-transparent transition-colors',

          isSelected
            ? 'bg-primary/25 border-primary/80'
            : 'hover:bg-primary/20',

          contentSize === 'sm' && 'border',
          contentSize === 'md' && 'border-2'
        )}
      />
    </div>
  )
}

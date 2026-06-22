import { FocalPoint } from '@/features/dashboard-pages/api/focal-point'
import { cn } from '@/lib/utils'
import { getViewPointPositionStyle } from '../helpers'
import { SvgDot } from './svg-dot'

type FocalPointDotProps = {
  contentSize: 'sm' | 'md'
  focalPoint: FocalPoint
  onClick: () => void
}

export function FocalPointDot({
  contentSize,
  focalPoint,
  onClick,
}: FocalPointDotProps) {
  return (
    <button
      onClick={onClick}
      style={getViewPointPositionStyle({
        x: focalPoint.locationX!,
        y: focalPoint.locationY!,
      })}
      className={cn(
        'group text-primary absolute block -translate-x-1/2 -translate-y-1/2 rounded-full',
        contentSize === 'sm' && 'text-[1.5rem]',
        contentSize === 'md' && 'text-[3rem]'
      )}
    >
      <SvgDot />
    </button>
  )
}

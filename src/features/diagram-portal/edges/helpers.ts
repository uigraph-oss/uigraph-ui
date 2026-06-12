import { EdgeMarker, EdgeMarkerType, MarkerType } from '@xyflow/react'
import { TCustomEdgeMarkerType } from './index'

export function createEdgeMarker(
  marker: Partial<TCustomEdgeMarkerType> | undefined
): EdgeMarkerType | undefined {
  if (!marker?.type || (marker.type as string) === 'none') return undefined

  if (
    marker.type === MarkerType.Arrow ||
    marker.type === MarkerType.ArrowClosed
  ) {
    return {
      color: 'context-stroke',
      strokeWidth: 1.5,
      ...marker,
    } as EdgeMarker
  }

  return marker.type
}

export function parseEdgeMarker(
  marker: string | EdgeMarkerType | EdgeMarker | undefined
): TCustomEdgeMarkerType | undefined {
  if (!marker) return

  if (typeof marker === 'string') {
    return { type: marker as MarkerType }
  }

  return marker as TCustomEdgeMarkerType
}

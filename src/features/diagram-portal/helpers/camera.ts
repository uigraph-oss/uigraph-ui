import { ReactFlowInstance } from '@xyflow/react'

export const MIN_ZOOM = 0.02
export const MAX_ZOOM = 8

export const ZOOM_STEP = 1.25
export const FOCUS_MAX_ZOOM = 1.5

export const ZOOM_DURATION = 200
export const FIT_DURATION = 300

export const ZOOM_PRESETS = [0.02, 0.05, 0.1, 0.25, 0.5, 1, 2, 4, 8]

export function clampZoom(zoom: number) {
  if (zoom < MIN_ZOOM) return MIN_ZOOM
  if (zoom > MAX_ZOOM) return MAX_ZOOM

  return zoom
}

export function zoomBy(rf: ReactFlowInstance, factor: number) {
  void rf.zoomTo(clampZoom(rf.getZoom() * factor), {
    duration: ZOOM_DURATION,
    interpolate: 'linear',
  })
}

export function zoomToPercent(rf: ReactFlowInstance, zoom: number) {
  void rf.zoomTo(clampZoom(zoom), {
    duration: ZOOM_DURATION,
    interpolate: 'linear',
  })
}

export function fitAllNodes(rf: ReactFlowInstance) {
  if (rf.getNodes().length === 0) {
    void rf.zoomTo(1, { duration: FIT_DURATION, interpolate: 'linear' })
    return
  }

  void rf.fitView({
    padding: { top: '80px', left: '20px', right: '20px', bottom: '20px' },
    minZoom: MIN_ZOOM,
    maxZoom: MAX_ZOOM,
    duration: FIT_DURATION,
  })
}

export function focusNodes(rf: ReactFlowInstance, nodeIds: string[]) {
  if (nodeIds.length === 0) return

  void rf.fitView({
    nodes: nodeIds.map((id) => ({ id })),
    padding: 0.2,
    minZoom: MIN_ZOOM,
    maxZoom: FOCUS_MAX_ZOOM,
    duration: FIT_DURATION,
  })
}

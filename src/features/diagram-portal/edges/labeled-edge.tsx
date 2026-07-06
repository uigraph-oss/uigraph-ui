import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  getSimpleBezierPath,
  getSmoothStepPath,
  getStraightPath,
} from '@xyflow/react'

type PathType = 'bezier' | 'straight' | 'smoothstep' | 'step' | 'simplebezier'

export function createLabeledEdge(pathType: PathType) {
  return function LabeledEdge({
    id,
    data,
    label,
    style,
    markerEnd,
    markerStart,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  }: EdgeProps) {
    const params = {
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
    }

    let edgePath: string
    let labelX: number
    let labelY: number

    if (pathType === 'straight') {
      ;[edgePath, labelX, labelY] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
      })
    } else if (pathType === 'smoothstep') {
      ;[edgePath, labelX, labelY] = getSmoothStepPath(params)
    } else if (pathType === 'step') {
      ;[edgePath, labelX, labelY] = getSmoothStepPath({
        ...params,
        borderRadius: 0,
      })
    } else if (pathType === 'simplebezier') {
      ;[edgePath, labelX, labelY] = getSimpleBezierPath(params)
    } else if (pathType === 'bezier') {
      ;[edgePath, labelX, labelY] = getBezierPath(params)
    } else {
      throw new Error(`Unknown edge path type: ${pathType}`)
    }

    const labelFontSize = (data?.labelFontSize as number | undefined) ?? 12

    const reverseAnimation = Boolean(data?.reverseAnimation)

    return (
      <>
        <BaseEdge
          id={id}
          path={edgePath}
          style={
            reverseAnimation
              ? { ...style, animationDirection: 'reverse' }
              : style
          }
          markerEnd={markerEnd}
          markerStart={markerStart}
        />
        {label && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                fontSize: labelFontSize,
                lineHeight: 1.2,
                padding: '2px 6px',
                borderRadius: 4,
                background: '#ffffff',
                color: '#1e2533',
                pointerEvents: 'none',
                userSelect: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    )
  }
}

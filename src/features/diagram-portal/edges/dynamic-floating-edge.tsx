import { EdgeProps, getBezierPath, useInternalNode } from '@xyflow/react'
import { useEffect, useRef, useState } from 'react'
import { getEdgeParams } from '../helpers/floating-edge'

export function DynamicFloatingEdge({
  id,
  label,
  style,
  source,
  target,
  markerEnd,
  markerStart,
}: EdgeProps) {
  const sourceNode = useInternalNode(source)
  const targetNode = useInternalNode(target)

  const textRef = useRef<SVGTextElement>(null)
  const [bbox, setBbox] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (textRef.current) {
      const { width, height } = textRef.current.getBBox()
      setBbox({ width, height })
    }
  }, [label])

  if (!sourceNode || !targetNode) {
    return null
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode
  )

  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  })

  const labelX = (sx + tx) / 2
  const labelY = (sy + ty) / 2

  return (
    <g>
      <path
        id={id}
        d={edgePath}
        className="react-flow__edge-path"
        style={{
          stroke: 'transparent',
          strokeWidth: 20,
        }}
      />
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={style}
      />
      {label && (
        <>
          <rect
            x={labelX - bbox.width / 2 - 4}
            y={labelY - bbox.height / 2 - 2}
            width={bbox.width + 8}
            height={bbox.height + 4}
            fill="#1e2533"
            rx={4}
            ry={4}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          />
          <text
            ref={textRef}
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#f4f7fc"
            style={{
              pointerEvents: 'none',
              userSelect: 'none',
              fontSize: 12,
            }}
          >
            {label}
          </text>
        </>
      )}
    </g>
  )
}

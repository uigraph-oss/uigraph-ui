'use client'

import {
  getNodesBounds,
  getViewportForBounds,
  useReactFlow,
  ViewportPortal,
} from '@xyflow/react'
import { useEffect, useState } from 'react'
import { getVisualNodesBounds } from './helpers/visual-nodes-bounds'

const IMAGE_PADDING = 60

export function DebugNodeBounds() {
  const reactFlowInstance = useReactFlow()
  const [debugBounds, setDebugBounds] = useState<{
    nodesBounds: { x: number; y: number; width: number; height: number }
    captureBounds: { x: number; y: number; width: number; height: number }
    visualBounds: { x: number; y: number; width: number; height: number }
  } | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      const nodes = reactFlowInstance.getNodes()

      if (nodes.length === 0) {
        setDebugBounds(null)
        return
      }

      const nodesBounds = getNodesBounds(nodes)
      const paddedWidth = nodesBounds.width + IMAGE_PADDING
      const paddedHeight = nodesBounds.height + IMAGE_PADDING

      const viewport = getViewportForBounds(
        nodesBounds,
        paddedWidth,
        paddedHeight,
        1,
        1,
        IMAGE_PADDING
      )

      setDebugBounds({
        nodesBounds,
        visualBounds: getVisualNodesBounds(nodes),
        captureBounds: {
          x: -viewport.x / viewport.zoom,
          y: -viewport.y / viewport.zoom,
          width: paddedWidth / viewport.zoom,
          height: paddedHeight / viewport.zoom,
        },
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [reactFlowInstance])

  if (!debugBounds) return null

  return (
    <ViewportPortal>
      <div
        className="pointer-events-none absolute border-2 border-red-500"
        style={{
          left: debugBounds.nodesBounds.x,
          top: debugBounds.nodesBounds.y,
          width: debugBounds.nodesBounds.width,
          height: debugBounds.nodesBounds.height,
        }}
      >
        <div className="absolute -top-6 left-0 bg-red-500 px-1 text-xs whitespace-nowrap text-white">
          nodesBounds {Math.round(debugBounds.nodesBounds.x)},
          {Math.round(debugBounds.nodesBounds.y)}{' '}
          {Math.round(debugBounds.nodesBounds.width)}x
          {Math.round(debugBounds.nodesBounds.height)}
        </div>
      </div>

      <div
        className="pointer-events-none absolute border-2 border-dashed border-lime-400"
        style={{
          left: debugBounds.captureBounds.x,
          top: debugBounds.captureBounds.y,
          width: debugBounds.captureBounds.width,
          height: debugBounds.captureBounds.height,
        }}
      >
        <div className="absolute -bottom-6 left-0 bg-lime-400 px-1 text-xs whitespace-nowrap text-black">
          captureBounds {Math.round(debugBounds.captureBounds.x)},
          {Math.round(debugBounds.captureBounds.y)}{' '}
          {Math.round(debugBounds.captureBounds.width)}x
          {Math.round(debugBounds.captureBounds.height)}
        </div>
      </div>

      <div
        className="pointer-events-none absolute border-2 border-cyan-400"
        style={{
          left: debugBounds.visualBounds.x,
          top: debugBounds.visualBounds.y,
          width: debugBounds.visualBounds.width,
          height: debugBounds.visualBounds.height,
        }}
      >
        <div className="absolute -top-6 right-0 bg-cyan-400 px-1 text-xs whitespace-nowrap text-black">
          visualBounds {Math.round(debugBounds.visualBounds.x)},
          {Math.round(debugBounds.visualBounds.y)}{' '}
          {Math.round(debugBounds.visualBounds.width)}x
          {Math.round(debugBounds.visualBounds.height)}
        </div>
      </div>
    </ViewportPortal>
  )
}

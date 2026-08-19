import { useReactFlow, useStore } from '@xyflow/react'
import { useEffect } from 'react'
import {
  computeFrameAutoLayout,
  FrameLabelSide,
} from '../helpers/frame-auto-layout'

/** Shrink-wraps a frame around its children once, then clears the flag. */
export function useFrameAutoLayout(
  id: string,
  autoLayout: boolean,
  labelSide: FrameLabelSide
) {
  const { getNodes, setNodes } = useReactFlow()

  const childrenSignature = useStore((store) => {
    let signature = ''
    store.nodeLookup.forEach((node) => {
      if (node.parentId !== id) return
      const width = node.measured?.width ?? node.width ?? 0
      const height = node.measured?.height ?? node.height ?? 0
      signature += `${node.id},${node.position.x},${node.position.y},${width},${height};`
    })
    return signature
  })

  useEffect(() => {
    if (!autoLayout) return

    const nodes = getNodes()
    const children = nodes.filter((node) => node.parentId === id)

    if (children.some((child) => child.measured?.width === undefined)) return

    const updated = computeFrameAutoLayout(nodes, id, labelSide)

    setNodes(
      (updated ?? nodes).map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, autoLayout: undefined } }
          : node
      )
    )
  }, [autoLayout, childrenSignature, id, labelSide, getNodes, setNodes])
}

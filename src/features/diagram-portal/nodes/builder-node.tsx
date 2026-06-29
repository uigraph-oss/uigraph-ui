import { getFocalPointComponentIcon } from '@/helpers/get-component-icon'
import {
  Node,
  NodeProps,
  NodeResizer,
  OnResize,
  useReactFlow,
} from '@xyflow/react'
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { getFlowDiagramComponentIcon } from '../constants/flow-diagram-node'
import { useComponentField } from '../hooks/use-component-field'
import { TComponentField } from '../types/component-fields'
import { NodeBuilderCore } from './components/node-builder'
import { NodeDataGenerator } from './types/node.types'

export type BuilderNodeData = NodeDataGenerator<{
  componentId: string
  componentName?: string
  componentFields: TComponentField[]
  contentWidth?: number
  scale?: number
}>

export type TBuilderNode = Node<BuilderNodeData, 'builder'>

export const BUILDER_MIN_WIDTH = 240
export const BUILDER_MAX_WIDTH = 1000
export const BUILDER_DEFAULT_WIDTH = 400

export function BuilderNode({ id, data, selected }: NodeProps<TBuilderNode>) {
  const { updateNode, updateNodeData } = useReactFlow()
  const contentRef = useRef<HTMLDivElement>(null)

  const [contentHeight, setContentHeight] = useState<number | null>(null)

  useLayoutEffect(() => {
    const element = contentRef.current
    if (!element) return

    function measure() {
      setContentHeight((prev) =>
        prev === element!.offsetHeight ? prev : element!.offsetHeight
      )
    }

    const observer = new ResizeObserver(measure)
    observer.observe(element)
    measure()

    return () => observer.disconnect()
  }, [])

  const scale = data.scale ?? 1
  const contentWidth = data.contentWidth ?? BUILDER_DEFAULT_WIDTH

  const applied = useRef<{ width: number; height: number } | undefined>(
    undefined
  )
  useLayoutEffect(() => {
    if (!contentWidth || contentHeight == null) return
    const width = Math.round(contentWidth * scale)
    const height = Math.round(contentHeight * scale)
    if (applied.current?.width === width && applied.current?.height === height)
      return
    applied.current = { width, height }
    updateNode(id, { width, height })
  }, [contentWidth, contentHeight, scale, id, updateNode])

  const contentWidthRef = useRef(contentWidth)
  contentWidthRef.current = contentWidth

  const onResize = useCallback<OnResize>(
    (_, params) => {
      const base = contentWidthRef.current
      if (!base) return
      updateNodeData(id, { scale: params.width / base })
    },
    [id, updateNodeData]
  )

  const componentIcon = useMemo(() => {
    const fcIcon = getFocalPointComponentIcon({
      component: data.componentId,
      fallbackIcon: false,
    })

    if (fcIcon)
      return (
        <div className="flex items-center justify-center bg-[#1E2533] [&>svg]:size-full">
          {fcIcon}
        </div>
      )

    const cIcon = getFlowDiagramComponentIcon(data.componentName)
    return (
      <div className="bg-stock/60 flex items-center justify-center [&>svg]:text-3xl">
        {cIcon}
      </div>
    )
  }, [data.componentId, data.componentName])

  const name = useComponentField<string>(data.componentFields, {
    label: 'Name',
  })
  const label = useComponentField<string>(data.componentFields, {
    label: 'Label',
  })
  const description = useComponentField<string>(data.componentFields, {
    label: 'Description',
  })

  const contentSize =
    contentHeight != null && contentWidth > 0
      ? { width: contentWidth, height: contentHeight }
      : null

  return (
    <>
      <NodeResizer isVisible={selected} keepAspectRatio onResize={onResize} />

      <NodeBuilderCore
        name={name ?? ''}
        label={label ?? ''}
        description={description ?? ''}
        fields={data.componentFields}
        selected={selected}
        icon={componentIcon}
        scale={contentSize ? scale : undefined}
        contentSize={contentSize}
        contentRef={contentRef}
      />
    </>
  )
}

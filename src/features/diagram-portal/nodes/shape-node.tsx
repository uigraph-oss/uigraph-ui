import { useAutoRef } from '@/hooks/use-auto-ref'
import { buildMetaData } from '@uigraph/sdk'
import { Node, NodeProps, NodeResizer, useReactFlow } from '@xyflow/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { SHAPE_COMPONENTS_LIST } from '../constants/shape-components-list'
import { useComponentField } from '../hooks/use-component-field'
import { NodeContainer } from './components/node-card'
import { ShapeSvgProps } from './components/shape-components'
import { NodeDataGenerator } from './types/node.types'

export const SHAPE_COMPONENTS_MAP = Object.fromEntries(
  SHAPE_COMPONENTS_LIST.map((s) => [s.id, s.Component])
)

export type ShapeNodeData = NodeDataGenerator<
  Omit<ShapeSvgProps, 'width' | 'height'> & {
    shape: keyof typeof SHAPE_COMPONENTS_MAP
    textColor?: string
    textFontSize?: number
  }
>

export type TShapeNode = Node<ShapeNodeData, 'shape'>

export function ShapeNode({
  id,
  data,
  width,
  height,
  selected,
}: NodeProps<TShapeNode>) {
  const { updateNodeData, updateNode } = useReactFlow()

  const name = useComponentField<string>(data.componentFields, {
    componentFieldId: 'name',
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const [containerSize, setContainerSize] = useState<{
    width: number
    height: number
  } | null>(null)

  const shapeComponent = useMemo(() => {
    return (
      SHAPE_COMPONENTS_LIST.find((s) => s.id === data.shape) ??
      SHAPE_COMPONENTS_LIST[0]
    )
  }, [data.shape])

  const textColor = useMemo(() => {
    if (data?.textColor) return data.textColor
    const fill = data?.fill
    if (typeof fill !== 'string') return undefined
    const hex = fill.trim().replace('#', '')
    if (hex.length !== 6) return undefined
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    if (luminance > 0.6) return '#0f172a'
    return undefined
  }, [data?.textColor, data?.fill])

  const textInset = useMemo(() => {
    if (!shapeComponent?.getTextInset || !width || !height) {
      return {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      }
    }

    return shapeComponent.getTextInset({ width, height })
  }, [shapeComponent, width, height])

  useEffect(() => {
    const container = containerRef.current!
    if (!container) return

    function handleResize() {
      setContainerSize({
        width: container.clientWidth,
        height: container.clientHeight,
      })
    }

    const observer = new ResizeObserver(handleResize)
    observer.observe(container)
    handleResize()

    return () => observer.disconnect()
  }, [])

  const shapeWidth =
    containerSize?.width && width
      ? Math.max(containerSize.width, width)
      : undefined

  const shapeHeight =
    containerSize?.height && height
      ? Math.max(containerSize.height, height)
      : undefined

  const helpersRef = useAutoRef({
    width,
    height,
    shapeWidth,
    shapeHeight,
  })

  return (
    <NodeContainer
      ref={containerRef}
      selected={selected}
      onDoubleClick={() => inputRef.current?.focus()}
      className="relative flex size-full min-h-fit min-w-fit items-center justify-center [&>svg]:size-full!"
    >
      <NodeResizer
        isVisible={selected}
        keepAspectRatio={shapeComponent?.isAspectLocked ?? false}
      />

      {shapeComponent && (
        <div className="absolute inset-0 -z-10 [&>svg]:size-full">
          <shapeComponent.Component
            {...data}
            strokeStyle={
              data.strokeAnimation === 'dash' ? 'dashed' : data.strokeStyle
            }
            width={shapeWidth}
            height={shapeHeight}
          />
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: /* css */ `
          @keyframes stroke-fake-animation {
            from { stroke-dashoffset: 0; }
            to { stroke-dashoffset: 100%; }
          }`,
        }}
      />

      <TextareaAutosize
        ref={inputRef}
        value={name ?? ''}
        className="text-foreground w-full resize-none overflow-hidden border-none bg-transparent text-center text-sm break-words outline-none"
        style={{
          marginTop: textInset.top,
          marginLeft: textInset.left,
          marginRight: textInset.right,
          marginBottom: textInset.bottom,
          fontSize: data?.textFontSize || 14,
          color: textColor,
        }}
        onChange={(e) => {
          const newValue = e.target.value
          updateNodeData(id, {
            componentFields: buildMetaData(data.componentFields ?? [], {
              name: newValue,
            }),
          })

          const currentHeight = helpersRef.current.height
          const newHeight = e.target.clientHeight

          if (currentHeight && currentHeight > newHeight) return
          updateNode(id, { height: newHeight })
        }}
      />
    </NodeContainer>
  )
}

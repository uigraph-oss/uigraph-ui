import { getFocalPointComponentIcon } from '@/helpers/get-component-icon'
import { Node, NodeProps } from '@xyflow/react'
import { useMemo } from 'react'
import { getFlowDiagramComponentIcon } from '../constants/flow-diagram-node'
import { useComponentField } from '../hooks/use-component-field'
import { TComponentField } from '../types/component-fields'
import { NodeBuilderCore } from './components/node-builder'
import { NodeDataGenerator } from './types/node.types'

export type BuilderNodeData = NodeDataGenerator<{
  componentId: string
  componentName?: string
  componentFields: TComponentField[]
}>

export type TBuilderNode = Node<BuilderNodeData, 'builder'>

export function BuilderNode({ data, selected }: NodeProps<TBuilderNode>) {
  const componentIcon = useMemo(() => {
    const fcIcon = getFocalPointComponentIcon({
      component: data.componentId,
      fallbackIcon: false,
    })

    if (fcIcon)
      return (
        <div className="bg-stock/60 flex items-center justify-center [&>svg]:size-full">
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

  return (
    <NodeBuilderCore
      name={name ?? ''}
      label={label ?? ''}
      description={description ?? ''}
      fields={data.componentFields}
      selected={selected}
      icon={componentIcon}
    />
  )
}

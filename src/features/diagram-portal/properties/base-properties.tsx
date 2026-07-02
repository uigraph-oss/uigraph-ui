import { TextAreaInput, TextInput } from '@/features/component-meta'
import { useEffectState } from '@/hooks/use-effect-state'
import { Node } from '@xyflow/react'
import { useSingleSelectedNode } from '../hooks/use-single-selected-node'
import { Field } from './field'

type BaseNode = Node<{
  name?: string
  label?: string
  description?: string
  shapeName?: string
}>

export function BaseProperties() {
  const { node, data, updateData } = useSingleSelectedNode<BaseNode>()

  const [localName, setLocalName] = useEffectState<string>(data?.name || '')
  const [localLabel, setLocalLabel] = useEffectState<string>(data?.label || '')
  const [localDescription, setLocalDescription] = useEffectState<string>(
    data?.description || ''
  )

  // For cloud nodes and shape nodes, only show the Name field
  if (node?.type === 'cloud' || node?.type === 'shape') {
    return (
      <Field label="Name">
        <TextInput
          value={localName}
          placeholder="Enter component name"
          onChange={(value) => {
            setLocalName(value)
            updateData({ name: value, shapeName: value })
          }}
        />
      </Field>
    )
  }

  return (
    <>
      <Field label="Name">
        <TextInput
          value={localName}
          placeholder="Enter component name"
          onChange={(value) => {
            setLocalName(value)
            updateData({ name: value })
          }}
        />
      </Field>

      <Field label="Label">
        <TextInput
          value={localLabel}
          placeholder="Enter component label"
          onChange={(value) => {
            setLocalLabel(value)
            updateData({ label: value })
          }}
        />
      </Field>

      <Field label="Description">
        <TextAreaInput
          value={localDescription}
          placeholder="Add a description..."
          onChange={(value) => {
            setLocalDescription(value)
            updateData({ description: value })
          }}
        />
      </Field>
    </>
  )
}

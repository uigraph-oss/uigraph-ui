import { useEffectState } from 'daily-code/react'
import { useSingleSelectedNode } from '../hooks/use-single-selected-node'
import { TableNodeData, TTableNode } from '../nodes/table-node'
import { SliderNumberField } from './components/slider-number-field'

export function TableStyle() {
  const { data, updateData } = useSingleSelectedNode<TTableNode>()
  const [localData, setLocalData] = useEffectState(data)
  function updateLocalData(newData: Partial<TableNodeData>) {
    setLocalData((prev) => {
      const updatedData = { ...prev, ...newData }
      updateData(updatedData)
      return updatedData
    })
  }

  return (
    <>
      <SliderNumberField
        label="Border Radius"
        min={0}
        max={100}
        step={1}
        value={localData?.borderRadius ?? 8}
        onChange={(val) => updateLocalData({ borderRadius: val })}
      />
    </>
  )
}

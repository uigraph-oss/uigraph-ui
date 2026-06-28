import { useEffectState } from '@/hooks/use-effect-state'
import { useSingleSelectedNode } from '../hooks/use-single-selected-node'
import {
  BUILDER_DEFAULT_WIDTH,
  BUILDER_MAX_WIDTH,
  BUILDER_MIN_WIDTH,
  TBuilderNode,
} from '../nodes/builder-node'
import { SliderNumberField } from './components/slider-number-field'

export function NodeBuilderStyle() {
  const { data, updateData } = useSingleSelectedNode<TBuilderNode>()

  const [width, setWidth] = useEffectState<number>(
    data?.contentWidth ?? BUILDER_DEFAULT_WIDTH
  )

  if (!data) return null

  return (
    <SliderNumberField
      label="Width"
      min={BUILDER_MIN_WIDTH}
      max={BUILDER_MAX_WIDTH}
      step={2}
      value={width}
      onChange={(value) => {
        setWidth(value)
        updateData({ contentWidth: value }, true)
      }}
    />
  )
}

import { ColorPickerInput } from '@/features/component-meta'
import { useEffectState } from 'daily-code/react'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { useSingleSelectedNode } from '../hooks/use-single-selected-node'
import {
  DEFAULT_TITLE_FONT_SIZE,
  SEQUENCE_PARTICIPANT_COLOR,
  TSequenceParticipantNode,
} from '../nodes/sequence-participant-node'
import { SliderNumberField } from './components/slider-number-field'
import { Field } from './field'

const FONT_SIZE_MIN = 8
const FONT_SIZE_MAX = 40

export function NodeSequenceParticipantStyle() {
  const { nodes, setNodes } = useFlowDiagramContext()
  const { data, updateData } = useSingleSelectedNode<TSequenceParticipantNode>()

  const [localColor, setLocalColor] = useEffectState<string>(
    data?.color ?? SEQUENCE_PARTICIPANT_COLOR
  )

  const participant = nodes.find((n) => n.type === 'sequenceParticipant')

  const titleFontSize =
    (participant?.data?.titleFontSize as number | undefined) ??
    DEFAULT_TITLE_FONT_SIZE

  function handleChangeTitleFontSize(fontSize: number) {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.type !== 'sequenceParticipant') return n
        return { ...n, data: { ...n.data, titleFontSize: fontSize } }
      })
    )
  }

  return (
    <>
      <Field label="Color">
        <ColorPickerInput
          value={localColor}
          className="border-stock border-1 border-solid"
          onChange={(value) => {
            setLocalColor(value)
            updateData({ color: value })
          }}
        />
      </Field>

      <div className="-mx-4 space-y-3 border-t border-[#2A3242] px-4 pt-4">
        <p className="text-xs font-normal text-[#828DA3]">Global Styling</p>

        <SliderNumberField
          min={FONT_SIZE_MIN}
          max={FONT_SIZE_MAX}
          step={1}
          label="Participant Font Size"
          value={titleFontSize}
          onChange={handleChangeTitleFontSize}
        />
      </div>
    </>
  )
}

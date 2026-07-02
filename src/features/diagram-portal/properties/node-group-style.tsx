import { Label } from '@/components/ui/label'
import { ColorPickerInput } from '@/features/component-meta'
import { useEffectState } from '../../../hooks/use-effect-state'
import { CustomSwitch } from '../components/ui'
import { useSingleSelectedNode } from '../hooks/use-single-selected-node'
import { TGroupNode } from '../nodes'
import { Field } from './field'

export function NodeGroupStyle() {
  const { data, updateData } = useSingleSelectedNode<TGroupNode>()!

  const [localBackgroundColor, setLocalBackgroundColor] =
    useEffectState<string>(data?.backgroundColor ?? '')

  const [localBorderColor, setLocalBorderColor] = useEffectState<string>(
    data?.borderColor ?? ''
  )

  if (!data) return null

  return (
    <>
      <Field label="Background Color">
        <ColorPickerInput
          value={
            localBackgroundColor == 'transparent' ? '' : localBackgroundColor
          }
          className="border-stock border-1 border-solid"
          onChange={(value) => {
            setLocalBackgroundColor(value)
            updateData({ backgroundColor: value || 'transparent' })
          }}
        />
      </Field>

      <Field label="Border Color">
        <ColorPickerInput
          value={localBorderColor}
          className="border-stock border-1 border-solid"
          onChange={(value) => {
            setLocalBorderColor(value)
            updateData({ borderColor: value })
          }}
        />
      </Field>

      <div className="flex items-center justify-between gap-3">
        <Label className="text-sm font-normal text-[#F4F7FC]">
          Auto Layout
        </Label>
        <CustomSwitch
          checked={data.autoLayout ?? false}
          onCheckedChange={(checked) => {
            updateData({ autoLayout: checked })
          }}
        />
      </div>
    </>
  )
}

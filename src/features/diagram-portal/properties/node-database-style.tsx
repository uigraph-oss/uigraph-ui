import { ColorPickerInput } from '@/features/component-meta'
import { useEffectState } from 'daily-code/react'
import { useSingleSelectedNode } from '../hooks/use-single-selected-node'
import { TDatabaseTableSQLNode } from '../nodes/database-table-node-sql'
import { Field } from './field'

export function NodeDatabaseStyle() {
  const { data, updateData } = useSingleSelectedNode<TDatabaseTableSQLNode>()

  const [localFill, setLocalFill] = useEffectState<string>(
    data?.style?.baseColor ?? ''
  )

  return (
    <>
      <Field label="Color">
        <ColorPickerInput
          value={localFill}
          className="border-stock border-1 border-solid"
          onChange={(value) => {
            setLocalFill(value)
            updateData({
              style: {
                ...(data?.style ?? {}),
                baseColor: value,
              },
            })
          }}
        />
      </Field>
    </>
  )
}

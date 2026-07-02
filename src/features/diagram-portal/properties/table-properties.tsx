import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ComponentInputType } from '@/features/component-meta'
import { buildMetaData } from '@uigraph/sdk'
import { useEffectState } from 'daily-code/react'
import { Plus, Trash2 } from 'lucide-react'
import { useComponentField } from '../hooks/use-component-field'
import { useSingleSelectedNode } from '../hooks/use-single-selected-node'
import {
  DEFAULT_TABLE_COLUMNS,
  DEFAULT_TABLE_ROWS,
  TableNodeData,
  TTableNode,
} from '../nodes/table-node'

const inputClassName =
  'h-8 w-full rounded-[0.5rem] border border-[#2A3242] bg-transparent px-3 text-sm text-[#F4F7FC] placeholder:text-[#828DA3] focus:outline-none'

const cellInputClassName =
  'h-7 w-full rounded-[0.5rem] border border-[#2A3242] bg-transparent px-2 text-xs text-[#F4F7FC] placeholder:text-[#828DA3] focus:outline-none'

export function TableProperties() {
  const { data, updateData } = useSingleSelectedNode<TTableNode>()
  const [localData, setLocalData] = useEffectState(data)
  const name = useComponentField<string>(localData?.componentFields, {
    componentFieldId: 'name',
  })

  function updateLocalData(newData: Partial<TableNodeData>) {
    setLocalData((prev) => {
      const updatedData = { ...prev, ...newData }
      updateData(updatedData)
      return updatedData
    })
  }

  const columns =
    localData?.columns && localData.columns.length
      ? localData.columns
      : DEFAULT_TABLE_COLUMNS
  const rowsSource =
    localData?.rows && localData.rows.length
      ? localData.rows
      : DEFAULT_TABLE_ROWS
  const rows = rowsSource.map((row) =>
    columns.map((_, columnIndex) => row?.[columnIndex] ?? '')
  )

  function handleColumnLabelChange(index: number, value: string) {
    const nextColumns = columns.map((column, colIndex) =>
      colIndex === index ? value : column
    )
    updateLocalData({ columns: nextColumns })
  }

  function handleCellChange(
    rowIndex: number,
    columnIndex: number,
    value: string
  ) {
    const nextRows = rows.map((row, r) =>
      row.map((cell, c) => {
        if (r === rowIndex && c === columnIndex) return value
        return cell
      })
    )
    updateLocalData({ rows: nextRows })
  }

  function handleAddRow() {
    const nextRows = [...rows, columns.map(() => '')]
    updateLocalData({ rows: nextRows })
  }

  function handleAddColumn() {
    const nextColumns = [...columns, `Column ${columns.length + 1}`]
    const nextRows = rows.map((row) => [...row, ''])
    updateLocalData({ columns: nextColumns, rows: nextRows })
  }

  function handleRemoveRow(index: number) {
    if (rows.length <= 1) return
    const nextRows = rows.filter((_, rowIndex) => rowIndex !== index)
    updateLocalData({ rows: nextRows })
  }

  function handleRemoveColumn(index: number) {
    if (columns.length <= 1) return
    const nextColumns = columns.filter(
      (_, columnIndex) => columnIndex !== index
    )
    const nextRows = rows.map((row) =>
      row.filter((_, columnIndex) => columnIndex !== index)
    )
    updateLocalData({ columns: nextColumns, rows: nextRows })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs text-[#828DA3]">Table name</Label>
        <Input
          value={name ?? ''}
          onChange={(event) => {
            const existingFields =
              localData?.componentFields ?? data?.componentFields ?? []
            const hasNameField = existingFields.some(
              (field) => field?.componentFieldId === 'name'
            )
            const fields = hasNameField
              ? existingFields
              : [
                  ...existingFields,
                  {
                    componentFieldId: 'name',
                    type: ComponentInputType.TextInput,
                    label: 'Name',
                    isReadonly: false,
                    data: [{ value: '' }],
                  },
                ]

            updateLocalData({
              componentFields: buildMetaData(fields, {
                name: event.target.value,
              }),
            })
          }}
          className={inputClassName}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-[#F4F7FC]">
            Columns
          </Label>
          <span className="text-[11px] text-[#828DA3]">{columns.length}</span>
        </div>
        <div className="space-y-1.5">
          {columns.map((column, columnIndex) => (
            <div
              key={`column-${columnIndex}`}
              className="flex items-center gap-1.5"
            >
              <Input
                value={column}
                onChange={(event) =>
                  handleColumnLabelChange(columnIndex, event.target.value)
                }
                className={`${inputClassName} flex-1 text-xs`}
              />
              <Button
                size="icon"
                preset="ghost"
                className="size-7 text-[#828DA3] hover:text-[#F4F7FC]"
                disabled={columns.length <= 1}
                onClick={() => handleRemoveColumn(columnIndex)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          preset="outline"
          className="h-8 w-full"
          onClick={handleAddColumn}
        >
          <Plus className="mr-1 h-3 w-3" />
          Add column
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-[#F4F7FC]">Rows</Label>
          <span className="text-[11px] text-[#828DA3]">{rows.length}</span>
        </div>
        <div className="space-y-2">
          {rows.map((row, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className="rounded-xl border border-[#2A3242] bg-[#1E2533] p-2"
            >
              <div className="mb-1 flex items-center justify-between text-[11px] text-[#828DA3]">
                <span>Row {rowIndex + 1}</span>
                <Button
                  size="icon"
                  preset="ghost"
                  className="size-6 text-[#828DA3] hover:text-[#F4F7FC]"
                  disabled={rows.length <= 1}
                  onClick={() => handleRemoveRow(rowIndex)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-1">
                {columns.map((column, columnIndex) => (
                  <Input
                    key={`cell-${rowIndex}-${columnIndex}`}
                    value={row[columnIndex] ?? ''}
                    placeholder={column || `Column ${columnIndex + 1}`}
                    onChange={(event) =>
                      handleCellChange(
                        rowIndex,
                        columnIndex,
                        event.target.value
                      )
                    }
                    className={cellInputClassName}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <Button preset="outline" className="h-8 w-full" onClick={handleAddRow}>
          <Plus className="mr-1 h-3 w-3" />
          Add row
        </Button>
      </div>
    </div>
  )
}

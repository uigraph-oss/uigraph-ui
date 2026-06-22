import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
        <Label className="text-paragraph text-xs">Table name</Label>
        <Input
          value={name ?? ''}
          onChange={(event) =>
            updateLocalData({
              componentFields: buildMetaData(
                localData?.componentFields ?? data?.componentFields ?? [],
                {
                  name: event.target.value,
                }
              ),
            })
          }
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-paragraph text-xs font-semibold">
            Columns
          </Label>
          <span className="text-muted-foreground text-[11px]">
            {columns.length}
          </span>
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
                className="h-8 flex-1 text-xs"
              />
              <Button
                size="icon"
                variant="ghost"
                className="text-paragraph h-7 w-7"
                disabled={columns.length <= 1}
                onClick={() => handleRemoveColumn(columnIndex)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          size="sm"
          variant="secondary"
          className="h-8 w-full"
          onClick={handleAddColumn}
        >
          <Plus className="mr-1 h-3 w-3" />
          Add column
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-paragraph text-xs font-semibold">Rows</Label>
          <span className="text-muted-foreground text-[11px]">
            {rows.length}
          </span>
        </div>
        <div className="space-y-2">
          {rows.map((row, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className="border-stock bg-card rounded-xl border p-2"
            >
              <div className="text-paragraph mb-1 flex items-center justify-between text-[11px]">
                <span>Row {rowIndex + 1}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-paragraph h-6 w-6"
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
                    className="h-7 text-xs"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <Button
          size="sm"
          variant="secondary"
          className="h-8 w-full"
          onClick={handleAddRow}
        >
          <Plus className="mr-1 h-3 w-3" />
          Add row
        </Button>
      </div>
    </div>
  )
}

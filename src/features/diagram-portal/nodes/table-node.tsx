import { CirclePlusIcon } from '@/assets/svgs'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { buildMetaData } from '@uigraph/sdk'
import { Node, NodeProps, useReactFlow } from '@xyflow/react'
import { useEffectState } from 'daily-code/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRef } from 'react'
import { HiOutlineTrash } from 'react-icons/hi2'
import { RxTable } from 'react-icons/rx'
import { FakeFloatingInput } from '../components/floating-fake-input'
import { useComponentField } from '../hooks/use-component-field'
import { NodeCard } from './components/node-card'
import { NodeDataGenerator } from './types/node.types'

export const DEFAULT_TABLE_COLUMNS = ['Task', 'Owner', 'Status', 'Due']
export const DEFAULT_TABLE_ROWS = [
  ['Website revamp', 'Amara', 'In progress', 'May 12'],
  ['Marketing sync', 'Liu', 'Blocked', 'May 15'],
  ['QA review', 'Nia', 'Ready', 'May 17'],
  ['Launch prep', 'Theo', 'Planned', 'May 20'],
]

export type TableNodeData = NodeDataGenerator<{
  borderRadius?: number
  columns?: string[]
  rows?: string[][]
}>

export type TTableNode = Node<TableNodeData, 'table'>

export function TableNode({ id, data, selected }: NodeProps<TTableNode>) {
  const { updateNodeData } = useReactFlow()
  const name = useComponentField<string>(data.componentFields, {
    componentFieldId: 'name',
  })

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [localName, setLocalName] = useEffectState(name ?? 'Untitled table')
  const [localData, setLocalData] = useEffectState<TableNodeData>(
    data ?? {
      columns: [],
      rows: [],
    }
  )

  function update(next: Partial<TableNodeData>) {
    setLocalData((prev) => {
      const merged = {
        ...(prev ?? {}),
        ...next,
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        updateNodeData(id, merged)
      }, 200)

      return merged
    })
  }

  function handleColumnLabelChange(columnIndex: number, value: string) {
    const nextColumns = localData?.columns?.map((column, index) =>
      index === columnIndex ? value : column
    )

    update({ columns: nextColumns })
  }

  function handleCellChange(
    rowIndex: number,
    columnIndex: number,
    value: string
  ) {
    const nextRows = localData?.rows?.map((row, currentRowIndex) => {
      if (currentRowIndex !== rowIndex) return row
      const safeRow = Array.isArray(row) ? [...row] : []
      safeRow[columnIndex] = value
      return safeRow
    })

    update({ rows: nextRows })
  }

  function handleAddRow() {
    const emptyRow = localData?.columns?.map(() => '') ?? []
    update({ rows: [...(localData?.rows ?? []), emptyRow] })
  }

  function handleAddColumn() {
    const nextColumns = [
      ...(localData?.columns ?? []),
      `Column ${(localData?.columns?.length ?? 0) + 1}`,
    ]
    const nextRows = localData?.rows?.map((row) => [...(row ?? []), '']) ?? []
    update({ columns: nextColumns, rows: nextRows })
  }

  function handleRemoveRow(rowIndex: number) {
    const nextRows = localData?.rows?.filter((_, index) => index !== rowIndex)
    update({ rows: nextRows })
  }

  function handleRemoveColumn(columnIndex: number) {
    const nextColumns = localData?.columns?.filter(
      (_, index) => index !== columnIndex
    )
    const nextRows = localData?.rows?.map((row) =>
      row?.filter((_, index) => index !== columnIndex)
    )
    update({ columns: nextColumns, rows: nextRows })
  }

  return (
    <NodeCard
      selected={selected}
      className="relative isolate rounded-[0.5rem] bg-[#141925]"
      style={{ borderRadius: data?.borderRadius ?? 8 }}
    >
      <div className="flex h-full flex-col rounded-[inherit] border border-[#2A3242] bg-[#141925] text-xs text-[#F4F7FC]">
        <div className="flex items-center gap-2 border-b border-[#2A3242] p-2">
          <div className="pl-2">
            <RxTable className="size-4 text-[#828DA3]" />
          </div>

          <div className="mr-auto">
            <FakeFloatingInput
              value={localName}
              onChange={(value) => {
                setLocalName(value)
                update({
                  componentFields: buildMetaData(
                    localData?.componentFields ?? data.componentFields ?? [],
                    {
                      name: value,
                    }
                  ),
                })
              }}
              placeholder="Untitled table"
              className={cn(
                'cursor-grab rounded font-semibold',
                selected && 'cursor-text active:cursor-grabbing'
              )}
            />
          </div>

          <p className="text-paragraph min-w-fit text-xs">
            {localData?.columns?.length} column
            {localData?.columns?.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="relative">
          <Table className="border-stock border-t text-xs [&_tr:hover]:bg-[#1E2533]/60">
            <TableHeader>
              <TableRow>
                <TableHead className="h-9 w-10 p-0 px-2 text-center text-[11px] text-[#828DA3]">
                  #
                </TableHead>

                {localData?.columns?.map((column, columnIndex) => (
                  <TableHead
                    key={`col-${columnIndex}`}
                    className="relative h-auto p-0 pr-7 text-[11px] text-[#828DA3]"
                  >
                    <FakeFloatingInput
                      value={String(column)}
                      onChange={(value) =>
                        handleColumnLabelChange(columnIndex, value)
                      }
                      placeholder={`Column ${columnIndex + 1}`}
                      className={cn(
                        'min-w-32 cursor-grab font-medium',
                        selected && 'cursor-text active:cursor-grabbing'
                      )}
                    />

                    {selected && (
                      <Button
                        variant="ghost"
                        onClick={() => handleRemoveColumn(columnIndex)}
                        className="hover:bg-destructive/10 hover:text-destructive absolute top-1.5 right-0.5 size-6 text-red-800/70 [&_svg]:size-3!"
                      >
                        <HiOutlineTrash />
                      </Button>
                    )}
                  </TableHead>
                ))}

                <TableHead className="size-9">
                  {selected && (
                    <Button
                      variant="ghost"
                      onClick={handleAddColumn}
                      className="absolute top-0.5 right-0.5 z-10 size-8 px-1!"
                    >
                      <CirclePlusIcon />
                    </Button>
                  )}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {localData?.rows?.length ? (
                localData?.rows?.map((row, rowIndex) => (
                  <TableRow
                    key={`row-${rowIndex}`}
                    className="relative isolate last:border-none [&_td]:align-middle"
                  >
                    <TableCell className="w-10 px-2 py-1 text-center text-[11px] text-[#828DA3]">
                      {rowIndex + 1}
                    </TableCell>

                    {localData?.columns?.map((_, columnIndex) => (
                      <TableCell
                        key={`cell-${rowIndex}-${columnIndex}`}
                        className="p-0"
                      >
                        <FakeFloatingInput
                          value={String(row?.[columnIndex] ?? '')}
                          onChange={(value) =>
                            handleCellChange(rowIndex, columnIndex, value)
                          }
                          className={cn(
                            'cursor-grab',
                            selected && 'cursor-text active:cursor-grabbing'
                          )}
                        />
                      </TableCell>
                    ))}

                    <TableCell className="size-9">
                      {selected && (
                        <Button
                          variant="ghost"
                          onClick={() => handleRemoveRow(rowIndex)}
                          className="text-destructive/70 hover:bg-destructive/10 hover:text-destructive absolute top-0.5 right-0.5 z-10 size-8 px-1! [&_svg]:size-3!"
                        >
                          <HiOutlineTrash />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={Math.max((localData?.columns?.length ?? 0) + 1, 1)}
                    className="px-2 py-3 text-center text-[12px] text-[#828DA3]"
                  >
                    No rows yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div
              exit={{ opacity: 0, height: 0 }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: '48px' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="border-stock flex w-full items-center justify-center overflow-hidden border-t px-2"
            >
              <Button
                preset="outline"
                className="h-8 w-full shadow-none"
                onClick={handleAddRow}
              >
                <CirclePlusIcon /> Add Row
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NodeCard>
  )
}

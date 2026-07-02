import { TParsedTable } from '@uigraph/sdk'
import { Node, NodeProps } from '@xyflow/react'
import { DataTableView } from './components/data-table-view'

export type DataTableInterfaceNodeData = {
  table: TParsedTable
}

export type TDataTableInterfaceNode = Node<
  DataTableInterfaceNodeData,
  'dataTableInterface'
>

export function DataTableInterfaceNode({
  data,
}: NodeProps<TDataTableInterfaceNode>) {
  return (
    <div className="outline-stock [.selected_&]:outline-primary rounded-[0.5rem] bg-[#141925] outline [.selected_&]:shadow-[0_24px_40px_0_rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-between gap-2 border-b border-[#2A3242] px-3 py-2">
        <div className="font-semibold text-[#F4F7FC]">{data.table.name}</div>
        <div className="rounded-full bg-[#1E2533] px-2 py-0.5 text-xs text-[#828DA3]">
          {data.table.columns.length} cols
        </div>
      </div>

      <DataTableView data={data} />
    </div>
  )
}

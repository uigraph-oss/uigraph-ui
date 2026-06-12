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
    <div className="outline-stock [.selected_&]:outline-primary rounded-[0.5rem] bg-white outline [.selected_&]:shadow-[0_24px_40px_0_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
        <div className="font-semibold">{data.table.name}</div>
        <div className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
          {data.table.columns.length} cols
        </div>
      </div>

      <DataTableView data={data} />
    </div>
  )
}

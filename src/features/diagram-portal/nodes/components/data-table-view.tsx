import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTableInterfaceNodeData } from '../data-table-node'

export function DataTableView({ data }: { data: DataTableInterfaceNodeData }) {
  function getTypeBadgeClasses(type: string) {
    const t = type.toLowerCase()
    if (/(char|text|varchar|string)/.test(t))
      return 'bg-violet-50 text-violet-700 border-violet-200'
    if (/(int|serial|decimal|numeric|float|double|real|number)/.test(t))
      return 'bg-blue-50 text-blue-700 border-blue-200'
    if (/(bool)/.test(t))
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (/(date|time|timestamp)/.test(t))
      return 'bg-amber-50 text-amber-700 border-amber-200'
    if (/(uuid)/.test(t)) return 'bg-slate-100 text-slate-700 border-slate-200'
    if (/(json|jsonb)/.test(t))
      return 'bg-teal-50 text-teal-700 border-teal-200'
    return 'bg-gray-50 text-gray-700 border-gray-200'
  }
  return (
    <>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%] px-3 py-2 text-xs text-slate-500">
                Column
              </TableHead>
              <TableHead className="w-[15%] px-3 py-2 text-xs text-slate-500">
                Type
              </TableHead>
              <TableHead className="w-[10%] px-3 py-2 text-xs text-slate-500">
                Null
              </TableHead>
              <TableHead className="w-[20%] px-3 py-2 text-xs text-slate-500">
                Default
              </TableHead>
              <TableHead className="w-[7.5%] px-3 py-2 text-xs text-slate-500">
                Key
              </TableHead>
              <TableHead className="w-[7.5%] px-3 py-2 text-xs text-slate-500">
                FK to
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.table.columns.map((column) => {
              const isPk = data.table.primaryKeys.includes(column.name)
              const fk = data.table.foreignKeys.find(
                (f) => f.columnName === column.name
              )
              return (
                <TableRow
                  key={column.name}
                  className="odd:bg-slate-50/30 hover:bg-slate-50"
                >
                  <TableCell className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{column.name}</span>
                      {column.description ? (
                        <span className="text-[11px] text-slate-500">
                          {column.description}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2 text-slate-700">
                    <Badge
                      variant="outline"
                      className={`border px-2 py-0.5 text-xs font-medium ${getTypeBadgeClasses(column.type)}`}
                    >
                      {column.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    {column.nullable ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        YES
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs text-rose-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        NO
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-slate-900">
                    {column.defaultValue ? (
                      <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        {column.defaultValue}
                      </code>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <div className="flex flex-wrap gap-1.5">
                      {isPk ? (
                        <Badge
                          variant="secondary"
                          className="border border-sky-200 bg-sky-50 px-1.5 py-0 text-[11px] text-sky-700"
                        >
                          PK
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    {fk ? (
                      <Badge
                        variant="outline"
                        className="border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs text-teal-700"
                      >
                        {fk.referencedTable}.{fk.referencedColumn}
                      </Badge>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 gap-2 border-t border-slate-100 px-3 py-2">
        {data.table.primaryKeys.length > 0 ? (
          <div>
            <div className="mb-1 text-xs text-slate-500">Primary keys</div>
            <div className="flex flex-wrap gap-1.5">
              {data.table.primaryKeys.map((pk) => (
                <Badge
                  key={pk}
                  variant="secondary"
                  className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs text-sky-700"
                >
                  {pk}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        {data.table.foreignKeys.length > 0 ? (
          <div>
            <div className="mb-1 text-xs text-slate-500">Foreign keys</div>
            <div className="grid gap-1">
              {data.table.foreignKeys.map((fk) => (
                <div
                  key={`${fk.columnName}->${fk.referencedTable}.${fk.referencedColumn}`}
                  className="text-sm text-slate-900"
                >
                  <Badge
                    variant="outline"
                    className="mr-1 border border-teal-200 bg-teal-50 px-1.5 py-0 text-[11px] text-teal-700"
                  >
                    {fk.columnName}
                  </Badge>
                  <span className="mx-1 text-slate-400">→</span>
                  <Badge
                    variant="outline"
                    className="border border-teal-200 bg-teal-50 px-1.5 py-0 text-[11px] text-teal-700"
                  >
                    {fk.referencedTable}.{fk.referencedColumn}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {data.table.indexes.length > 0 ? (
          <div>
            <div className="mb-1 text-xs text-slate-500">Indexes</div>
            <div className="grid gap-1">
              {data.table.indexes.map((idx) => (
                <div
                  key={idx.name}
                  className="flex flex-wrap items-center gap-2 text-sm"
                >
                  <span className="font-medium">{idx.name}</span>
                  {idx.unique ? (
                    <Badge
                      variant="secondary"
                      className="border border-amber-200 bg-amber-100 px-1.5 py-0 text-[11px] text-amber-700"
                    >
                      UNIQUE
                    </Badge>
                  ) : null}
                  <div className="flex flex-wrap gap-1">
                    {idx.columns.map((c) => (
                      <code
                        key={c}
                        className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700"
                      >
                        {c}
                      </code>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}

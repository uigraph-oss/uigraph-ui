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
    if (/(uuid)/.test(t))
      return 'bg-accent/40 text-secondary-foreground border-stock'
    if (/(json|jsonb)/.test(t))
      return 'bg-teal-50 text-teal-700 border-teal-200'
    return 'bg-accent/30 text-secondary-foreground border-stock'
  }
  return (
    <>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-paragraph w-[40%] px-3 py-2 text-xs">
                Column
              </TableHead>
              <TableHead className="text-paragraph w-[15%] px-3 py-2 text-xs">
                Type
              </TableHead>
              <TableHead className="text-paragraph w-[10%] px-3 py-2 text-xs">
                Null
              </TableHead>
              <TableHead className="text-paragraph w-[20%] px-3 py-2 text-xs">
                Default
              </TableHead>
              <TableHead className="text-paragraph w-[7.5%] px-3 py-2 text-xs">
                Key
              </TableHead>
              <TableHead className="text-paragraph w-[7.5%] px-3 py-2 text-xs">
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
                  className="odd:bg-accent/30/30 hover:bg-accent/30"
                >
                  <TableCell className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{column.name}</span>
                      {column.description ? (
                        <span className="text-paragraph text-[11px]">
                          {column.description}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-secondary-foreground px-3 py-2">
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
                  <TableCell className="text-foreground px-3 py-2">
                    {column.defaultValue ? (
                      <code className="bg-accent/40 text-secondary-foreground rounded px-2 py-0.5 text-xs">
                        {column.defaultValue}
                      </code>
                    ) : (
                      <span className="text-muted-foreground">-</span>
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
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="border-stock grid grid-cols-1 gap-2 border-t px-3 py-2">
        {data.table.primaryKeys.length > 0 ? (
          <div>
            <div className="text-paragraph mb-1 text-xs">Primary keys</div>
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
            <div className="text-paragraph mb-1 text-xs">Foreign keys</div>
            <div className="grid gap-1">
              {data.table.foreignKeys.map((fk) => (
                <div
                  key={`${fk.columnName}->${fk.referencedTable}.${fk.referencedColumn}`}
                  className="text-foreground text-sm"
                >
                  <Badge
                    variant="outline"
                    className="mr-1 border border-teal-200 bg-teal-50 px-1.5 py-0 text-[11px] text-teal-700"
                  >
                    {fk.columnName}
                  </Badge>
                  <span className="text-muted-foreground mx-1">→</span>
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
            <div className="text-paragraph mb-1 text-xs">Indexes</div>
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
                        className="bg-accent/40 text-secondary-foreground rounded px-1.5 py-0.5 text-xs"
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

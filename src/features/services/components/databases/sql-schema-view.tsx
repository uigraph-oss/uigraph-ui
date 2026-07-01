import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { arrayNonNullable } from 'daily-code'
import { ChevronDown } from 'lucide-react'
import { DbTable } from '../../../api/service-db'
import { SchemaViewShell } from './schema-view-shared'
import { CiViewTable } from 'react-icons/ci'

export function SqlSchemaView({
  db,
  contentOnly = false,
}: {
  db: {
    dbName?: string | null
    dbType?: string | null
    dialect?: string | null
    tables?: DbTable[] | null
    createdAt?: string | null
    updatedAt?: string | null
  }
  contentOnly?: boolean
}) {
  const tables = arrayNonNullable(db.tables)

  const body =
    tables.length === 0 ? (
      <div className="flex min-h-[140px] items-center justify-center text-sm text-[#828DA3]">
        No tables found
      </div>
    ) : (
      <div className="divide-y divide-[#2A3242]">
        {tables.map((table, index) => (
          <SqlTablePanel
            key={table.name ?? index}
            table={table}
            defaultOpen={index === 0}
          />
        ))}
      </div>
    )

  if (contentOnly) return body

  return (
    <SchemaViewShell
      db={db}
      kind="sql"
      sectionTitle="Tables"
      sectionIcon={<CiViewTable className="size-5" />}
    >
      {body}
    </SchemaViewShell>
  )
}

function SqlTablePanel({
  table,
  defaultOpen,
}: {
  table: DbTable
  defaultOpen: boolean
}) {
  const columns = arrayNonNullable(table.columns)
  const indexes = arrayNonNullable(table.indexes)

  return (
    <Collapsible defaultOpen={defaultOpen} className="group">
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-[#1A2030]/60">
        <div className="min-w-0">
          <div className="text-[0.975rem] font-medium text-[#F4F7FC]">
            {table.name ?? 'Untitled table'}
          </div>
          <div className="mt-1 text-sm text-[#828DA3]">
            {columns.length} columns
            {indexes.length > 0 ? ` · ${indexes.length} indexes` : ''}
          </div>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-[#828DA3] transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent className="border-t border-[#2A3242] px-5 pb-5">
        {columns.length > 0 ? (
          <div className="overflow-hidden rounded-[0.5rem] border border-[#2A3242]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="h-11 w-[25%] px-3!">Name</TableHead>
                  <TableHead className="h-11 w-[15%] px-3!">Type</TableHead>
                  <TableHead className="h-11 w-[10%] px-3!">Unique</TableHead>
                  <TableHead className="h-11 w-[10%] px-3!">Nullable</TableHead>
                  <TableHead className="h-11 w-[10%] px-3!">Primary</TableHead>
                  <TableHead className="h-11 w-[10%] px-3!">Foreign</TableHead>
                  <TableHead className="h-11 w-[20%] px-3!">
                    Default value
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {columns.map((column, columnIndex) => (
                  <TableRow key={column.name ?? columnIndex}>
                    <TableCell className="h-11 w-[25%] max-w-[200px] truncate px-3! text-sm text-[#F4F7FC]">
                      {column.name ?? 'Unnamed column'}
                    </TableCell>
                    <TableCell className="h-11 w-[15%] px-3!">
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {column.type ?? 'unknown'}
                      </span>
                    </TableCell>
                    <TableCell className="h-11 w-[10%] px-3!">
                      {column.unique ? 'Yes' : 'No'}
                    </TableCell>
                    <TableCell className="h-11 w-[10%] px-3!">
                      {column.nullable ? 'Yes' : 'No'}
                    </TableCell>
                    <TableCell className="h-11 w-[10%] px-3!">
                      {column.isPrimaryKey ? (
                        <Badge className="rounded-md px-2 py-0.5 text-[11px]">
                          PK
                        </Badge>
                      ) : (
                        <span className="text-paragraph/50">-</span>
                      )}
                    </TableCell>
                    <TableCell className="h-11 w-[10%] px-3!">
                      {column.foreignKey ? (
                        <Badge className="rounded-md px-2 py-0.5 text-[11px]">
                          FK
                        </Badge>
                      ) : (
                        <span className="text-paragraph/50">-</span>
                      )}
                    </TableCell>
                    <TableCell className="h-11 w-[20%] max-w-[200px] truncate px-3!">
                      <span className="text-paragraph">
                        {column.defaultValue ?? (
                          <span className="text-paragraph/50">-</span>
                        )}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-[#828DA3]">No columns found</p>
        )}

        {indexes.length > 0 && (
          <div className="mt-4 rounded-[0.5rem] border border-[#2A3242] px-3.5 py-3">
            <div className="text-[13px] text-[#F4F7FC]">Indexes</div>
            <div className="mt-2 space-y-2">
              {indexes.map((indexDef) => (
                <div
                  key={indexDef.name}
                  className="rounded-lg bg-[#1E2533] px-3 py-2 text-sm text-[#F4F7FC]"
                >
                  <div>{indexDef.name}</div>
                  <div className="text-[12px] text-[#828DA3]">
                    {indexDef.type ?? 'index'} •{' '}
                    {arrayNonNullable(indexDef.fields).join(', ') || 'no fields'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}

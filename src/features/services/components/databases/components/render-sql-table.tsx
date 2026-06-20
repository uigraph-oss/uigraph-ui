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
import { DbTable } from '../../../api/service-db'

export function RenderSQLTable({ tables }: { tables: DbTable[] }) {
  return (
    <div>
      {tables.length === 0 ? (
        <div className="flex min-h-[140px] items-center justify-center text-sm text-[#939395]">
          No tables found
        </div>
      ) : (
        <div className="divide-y">
          {tables.map((t, i) => {
            const columns = arrayNonNullable(t?.columns)
            const indexes = arrayNonNullable(t?.indexes)

            return (
              <div key={t?.name ?? String(i)} className="p-4 pt-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-2">
                  <div className="min-w-0 text-[0.975rem] font-medium text-[#161616]">
                    {t?.name ?? 'Untitled table'}
                  </div>
                  <div className="flex shrink-0 items-center gap-4 text-sm text-[#6B7280]">
                    <div>{columns.length} columns</div>
                    {indexes.length > 0 && <div>{indexes.length} indexes</div>}
                  </div>
                </div>

                {columns.length > 0 ? (
                  <div className="border-stock rounded-[0.5rem] border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="h-11 w-[25%] px-3!">
                            Name
                          </TableHead>
                          <TableHead className="h-11 w-[15%] px-3!">
                            Type
                          </TableHead>

                          <TableHead className="h-11 w-[10%] px-3!">
                            Unique
                          </TableHead>
                          <TableHead className="h-11 w-[10%] px-3!">
                            Nullable
                          </TableHead>
                          <TableHead className="h-11 w-[10%] px-3!">
                            Primary
                          </TableHead>
                          <TableHead className="h-11 w-[10%] px-3!">
                            Foreign
                          </TableHead>
                          <TableHead className="h-11 w-[20%] px-3!">
                            Default value
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {columns.map((column, index) => (
                          <TableRow key={column?.name ?? index}>
                            <TableCell className="h-11 w-[25%] max-w-[200px] truncate px-3! text-sm text-[#161616]">
                              {column?.name ?? 'Unnamed column'}
                            </TableCell>
                            <TableCell className="h-11 w-[15%] px-3!">
                              <span className="text-muted-foreground font-mono text-[11px]">
                                {column?.type ?? 'unknown'}
                              </span>
                            </TableCell>

                            <TableCell className="h-11 w-[10%] px-3!">
                              {column?.unique ? 'Yes' : 'No'}
                            </TableCell>
                            <TableCell className="h-11 w-[10%] px-3!">
                              {column?.nullable ? 'Yes' : 'No'}
                            </TableCell>
                            <TableCell className="h-11 w-[10%] px-3!">
                              {column?.isPrimaryKey ? (
                                <Badge className="rounded-md px-2 py-0.5 text-[11px]">
                                  PK
                                </Badge>
                              ) : (
                                <span className="text-paragraph/50">-</span>
                              )}
                            </TableCell>
                            <TableCell className="h-11 w-[10%] px-3!">
                              {column?.foreignKey ? (
                                <Badge className="rounded-md px-2 py-0.5 text-[11px]">
                                  FK
                                </Badge>
                              ) : (
                                <span className="text-paragraph/50">-</span>
                              )}
                            </TableCell>
                            <TableCell className="h-11 w-[20%] max-w-[200px] truncate px-3!">
                              <span className="text-paragraph">
                                {column?.defaultValue ?? (
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
                  <p className="text-paragraph text-sm">No columns found</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MongoCollectionSchema } from '@/features/diagram-portal/components/nosql-editor/nosql-schema'
import { RxCornerBottomLeft } from 'react-icons/rx'
import z from 'zod'

export function RenderMongoCollections({
  collections,
}: {
  collections: z.infer<typeof MongoCollectionSchema>[]
}) {
  function getFieldType(
    field: z.infer<typeof MongoCollectionSchema>['fields'][0]
  ) {
    const baseType = field.type || 'unknown'
    if (baseType === 'array' && field.itemType) {
      return `array [${field.itemType}]`
    }
    return baseType
  }

  function renderFieldRows(
    fields: z.infer<typeof MongoCollectionSchema>['fields'],
    depth = 0,
    rows: Array<{
      field: z.infer<typeof MongoCollectionSchema>['fields'][0]
      depth: number
    }> = []
  ) {
    if (!fields || fields.length === 0) return rows

    fields.forEach((field) => {
      rows.push({ field, depth })
      if (field.fields && field.fields.length > 0) {
        renderFieldRows(field.fields, depth + 1, rows)
      }
      if (field.itemFields && field.itemFields.length > 0) {
        renderFieldRows(field.itemFields, depth + 1, rows)
      }
    })

    return rows
  }

  if (!collections || collections.length === 0) {
    return (
      <div className="flex min-h-[140px] items-center justify-center text-sm text-[#828DA3]">
        No collections found
      </div>
    )
  }

  return (
    <div className="divide-y">
      {collections.map((collection, index) => {
        const fields = collection.fields || []
        const indexes = collection.indexes || []
        const fieldRows = renderFieldRows(fields)

        return (
          <div
            key={collection.id ?? collection.name ?? index}
            className="p-4 pt-2.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-2">
              <div className="flex items-center gap-2 text-[0.975rem] font-medium text-[#F4F7FC]">
                {collection.name || (
                  <span className="text-paragraph text-xs">
                    Untitled collection
                  </span>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-4 text-sm text-[#828DA3]">
                <div>{fields.length} fields</div>
                {indexes.length > 0 && <div>{indexes.length} indexes</div>}
              </div>
            </div>

            {fieldRows.length > 0 ? (
              <div className="border-stock rounded-[0.5rem] border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="h-11 w-[50%] px-3!">Name</TableHead>
                      <TableHead className="h-11 w-[50%] px-3!">Type</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {fieldRows.map(({ field, depth }, rowIndex) => (
                      <TableRow key={field.id ?? `${field.name}-${rowIndex}`}>
                        <TableCell className="h-11 w-[50%] max-w-[200px] truncate px-3! text-sm text-[#F4F7FC]">
                          <div
                            className="flex items-center"
                            style={{ paddingLeft: `${depth * 16}px` }}
                          >
                            {depth > 0 && (
                              <RxCornerBottomLeft className="text-paragraph/20 -mt-1.5 mr-0.5 size-6 self-start" />
                            )}
                            {field.name || (
                              <span className="text-paragraph text-xs">
                                Unnamed field
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="h-11 w-[50%] px-3!">
                          <span className="text-muted-foreground font-mono text-[11px]">
                            {getFieldType(field)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-paragraph text-sm">No fields found</p>
            )}

            {indexes.length > 0 && (
              <div className="mt-4 rounded-[0.5rem] border border-[#2A3242] px-3.5 py-3">
                <div className="text-[13px] text-[#F4F7FC]">Indexes</div>
                <div className="mt-2 space-y-2.5">
                  {indexes.map((idx) => (
                    <div
                      key={idx.id ?? idx.name}
                      className="rounded-lg bg-[#1E2533] px-3 py-2 text-sm text-[#F4F7FC]"
                    >
                      <div className="text-[13px] text-[#F4F7FC]">
                        {idx.name}
                      </div>
                      <div className="text-[12px] text-[#828DA3]">
                        {idx.unique ? 'unique' : 'non-unique'} • fields:{' '}
                        {idx.fields
                          .map(
                            (f) =>
                              `${f.fieldName}${f.order === -1 ? ' (desc)' : ''}`
                          )
                          .join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

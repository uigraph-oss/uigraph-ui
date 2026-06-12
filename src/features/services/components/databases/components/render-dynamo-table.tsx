import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DynamoEditorSchema } from '@/features/diagram-portal/components/nosql-editor/nosql-schema'
import { RxCornerBottomLeft } from 'react-icons/rx'
import z from 'zod'

export function RenderDynamoTable({
  tables,
}: {
  tables: z.infer<typeof DynamoEditorSchema>
}) {
  function getAttributeType(
    attr: z.infer<typeof DynamoEditorSchema>['attributes'][0]
  ) {
    const baseType = attr.type || 'unknown'
    if (baseType === 'array' && attr.itemType) {
      return `array [${attr.itemType}]`
    }
    return baseType
  }

  function renderAttributeRows(
    attrs: z.infer<typeof DynamoEditorSchema>['attributes'],
    depth = 0,
    rows: Array<{
      attr: z.infer<typeof DynamoEditorSchema>['attributes'][0]
      depth: number
    }> = []
  ) {
    if (!attrs || attrs.length === 0) return rows

    attrs.forEach((attr) => {
      rows.push({ attr, depth })
      if (attr.fields && attr.fields.length > 0) {
        renderAttributeRows(attr.fields, depth + 1, rows)
      }
      if (attr.itemFields && attr.itemFields.length > 0) {
        renderAttributeRows(attr.itemFields, depth + 1, rows)
      }
    })

    return rows
  }

  if (!tables) {
    return null
  }

  const attributes = tables.attributes || []
  const attributeRows = renderAttributeRows(attributes)

  return (
    <div className="divide-y">
      <div className="p-4 pt-2.5">
        <div className="space-y-4">
          {tables.primaryKey ? (
            <div className="border-stock rounded-[0.5rem] border px-3 py-2.5">
              <div className="text-foreground text-left text-sm font-medium">
                Primary key
              </div>
              <div className="text-foreground mt-2.5 space-y-1.5 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-paragraph">Partition:</span>
                  <span>{tables.primaryKey.partitionKey}</span>
                  {tables.primaryKey.partitionKeyType && (
                    <span className="text-muted-foreground font-mono text-[11px]">
                      ({tables.primaryKey.partitionKeyType})
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-paragraph">Sort:</span>
                  <span>{tables.primaryKey.sortKey}</span>
                  {tables.primaryKey.sortKeyType && (
                    <span className="text-muted-foreground font-mono text-[11px]">
                      ({tables.primaryKey.sortKeyType})
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {tables.globalSecondaryIndexes &&
          tables.globalSecondaryIndexes.length > 0 ? (
            <div className="border-stock rounded-[0.5rem] border px-3 py-2.5">
              <div className="text-foreground text-left text-sm font-medium">
                Global secondary indexes
              </div>
              <div className="mt-2.5 space-y-2">
                {tables.globalSecondaryIndexes.map((gsi) => (
                  <div
                    key={gsi.id ?? gsi.name}
                    className="text-foreground bg-shading border-stock/30 rounded-lg border px-3 py-2.5 text-sm"
                  >
                    <div className="text-foreground text-sm">{gsi.name}</div>
                    <div className="text-paragraph mt-1.5 text-[11px]">
                      <span className="text-paragraph">PK:</span>{' '}
                      <span>{gsi.partitionKey}</span>
                      {gsi.partitionKeyType && (
                        <span className="text-muted-foreground font-mono">
                          {' '}
                          ({gsi.partitionKeyType})
                        </span>
                      )}
                      {gsi.sortKey && (
                        <>
                          <span className="text-paragraph mx-1.5">•</span>
                          <span className="text-paragraph">SK:</span>{' '}
                          <span>{gsi.sortKey}</span>
                          {gsi.sortKeyType && (
                            <span className="text-muted-foreground font-mono">
                              {' '}
                              ({gsi.sortKeyType})
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {attributeRows.length > 0 ? (
            <div className="border-stock rounded-[0.5rem] border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-11 w-[50%] px-3!">Name</TableHead>
                    <TableHead className="h-11 w-[50%] px-3!">Type</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {attributeRows.map(({ attr, depth }, rowIndex) => (
                    <TableRow key={attr.id ?? `${attr.name}-${rowIndex}`}>
                      <TableCell className="text-foreground h-11 w-[50%] max-w-[200px] truncate px-3! text-sm">
                        <div
                          className="flex items-center"
                          style={{ paddingLeft: `${depth * 16}px` }}
                        >
                          {depth > 0 && (
                            <RxCornerBottomLeft className="text-paragraph/20 -mt-1.5 mr-0.5 size-6 self-start" />
                          )}
                          {attr.name || (
                            <span className="text-paragraph text-xs">
                              Unnamed attribute
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="h-11 w-[50%] px-3!">
                        <span className="text-muted-foreground font-mono text-[11px]">
                          {getAttributeType(attr)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-paragraph text-sm">No attributes found</p>
          )}
        </div>
      </div>
    </div>
  )
}

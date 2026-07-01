import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MongoCollectionSchema } from '@/features/diagram-portal/components/nosql-editor/nosql-schema'
import { arrayNonNullable } from 'daily-code'
import { ChevronDown } from 'lucide-react'
import { RxCornerBottomLeft } from 'react-icons/rx'
import { z } from 'zod'
import { ServiceDbSchema } from '../../api/service-db'
import { SchemaEmptyState, SchemaViewShell } from './schema-view-shared'
import { BsCollection } from 'react-icons/bs'

type CollectionIndex = {
  id?: string
  name?: string
  unique?: boolean
  fields?: Array<string | { fieldName?: string; order?: number }>
}

type CollectionField = {
  id?: string
  name?: string
  type?: string
  itemType?: string
  fields?: CollectionField[]
  itemFields?: CollectionField[]
}

type NormalizedCollection = {
  id: string
  name: string
  fields: CollectionField[]
  indexes: CollectionIndex[]
}

function normalizeMongoCollections(
  collections: z.infer<typeof MongoCollectionSchema>[]
): NormalizedCollection[] {
  return collections.map((collection, index) => ({
    id: collection.id ?? collection.name ?? String(index),
    name: collection.name || 'Untitled collection',
    fields: collection.fields ?? [],
    indexes: collection.indexes ?? [],
  }))
}

function normalizeJsonCollections(collections: unknown[]): NormalizedCollection[] {
  return collections.map((collection, index) => {
    const item = collection as {
      id?: string
      name?: string
      fields?: CollectionField[]
      indexes?: CollectionIndex[]
    }

    return {
      id: item.id ?? item.name ?? String(index),
      name: item.name || 'Untitled collection',
      fields: arrayNonNullable(item.fields),
      indexes: arrayNonNullable(item.indexes),
    }
  })
}

function getFieldType(field: CollectionField) {
  const baseType = field.type || 'unknown'
  if (baseType === 'array' && field.itemType) {
    return `array [${field.itemType}]`
  }
  return baseType
}

function renderFieldRows(
  fields: CollectionField[],
  depth = 0,
  rows: Array<{ field: CollectionField; depth: number }> = []
) {
  fields.forEach((field) => {
    rows.push({ field, depth })
    if (field.fields?.length) renderFieldRows(field.fields, depth + 1, rows)
    if (field.itemFields?.length)
      renderFieldRows(field.itemFields, depth + 1, rows)
  })
  return rows
}

function formatIndexFields(fields: CollectionIndex['fields']) {
  return arrayNonNullable(fields)
    .map((field) =>
      typeof field === 'string'
        ? field
        : `${field.fieldName ?? 'field'}${field.order === -1 ? ' (desc)' : ''}`
    )
    .join(', ')
}

function NosqlCollectionPanel({
  collection,
  defaultOpen,
}: {
  collection: NormalizedCollection
  defaultOpen: boolean
}) {
  const fieldRows = renderFieldRows(collection.fields)

  return (
    <Collapsible defaultOpen={defaultOpen} className="group">
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-[#1A2030]/60">
        <div className="min-w-0">
          <div className="text-[0.975rem] font-medium text-[#F4F7FC]">
            {collection.name}
          </div>
          <div className="mt-1 text-sm text-[#828DA3]">
            {collection.fields.length} fields
            {collection.indexes.length > 0
              ? ` · ${collection.indexes.length} indexes`
              : ''}
          </div>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-[#828DA3] transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent className="border-t border-[#2A3242] px-5 pb-5">
        {fieldRows.length > 0 ? (
          <div className="overflow-hidden rounded-[0.5rem] border border-[#2A3242]">
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
                    <TableCell className="h-11 w-[50%] max-w-[240px] truncate px-3! text-sm text-[#F4F7FC]">
                      <div
                        className="flex items-center"
                        style={{ paddingLeft: `${depth * 16}px` }}
                      >
                        {depth > 0 && (
                          <RxCornerBottomLeft className="text-paragraph/20 -mt-1.5 mr-0.5 size-6 self-start" />
                        )}
                        {field.name || (
                          <span className="text-xs text-[#828DA3]">
                            Unnamed field
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="h-11 w-[50%] px-3!">
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {getFieldType(field)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-[#828DA3]">No fields found</p>
        )}

        {collection.indexes.length > 0 && (
          <div className="mt-4 rounded-[0.5rem] border border-[#2A3242] px-3.5 py-3">
            <div className="text-[13px] text-[#F4F7FC]">Indexes</div>
            <div className="mt-2 space-y-2">
              {collection.indexes.map((indexDef) => (
                <div
                  key={indexDef.id ?? indexDef.name}
                  className="rounded-lg bg-[#1E2533] px-3 py-2 text-sm text-[#F4F7FC]"
                >
                  <div>{indexDef.name ?? 'Unnamed index'}</div>
                  <div className="text-[12px] text-[#828DA3]">
                    {indexDef.unique ? 'unique' : 'non-unique'} • fields:{' '}
                    {formatIndexFields(indexDef.fields) || 'none'}
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

function NosqlCollectionsBody({
  collections,
  emptyKind,
}: {
  collections: NormalizedCollection[]
  emptyKind: 'mongodb' | 'json-collections' | 'json-tables'
}) {
  if (collections.length === 0) {
    return <SchemaEmptyState kind={emptyKind} />
  }

  return (
    <div className="divide-y divide-[#2A3242]">
      {collections.map((collection, index) => (
        <NosqlCollectionPanel
          key={collection.id}
          collection={collection}
          defaultOpen={index === 0}
        />
      ))}
    </div>
  )
}

export function MongoSchemaView({
  db,
  contentOnly = false,
}: {
  db: ServiceDbSchema
  contentOnly?: boolean
}) {
  const collections = normalizeMongoCollections(
    arrayNonNullable(db.noSQLSchema?.mongo?.collections)
  )

  const body = (
    <NosqlCollectionsBody collections={collections} emptyKind="mongodb" />
  )

  if (contentOnly) return body

  return (
    <SchemaViewShell
      db={db}
      kind="mongodb"
      sectionTitle="Collections"
      sectionIcon={<BsCollection className="size-4" />}
    >
      {body}
    </SchemaViewShell>
  )
}

export function JsonCollectionsSchemaView({
  db,
  contentOnly = false,
}: {
  db: ServiceDbSchema
  contentOnly?: boolean
}) {
  const noSQLSchema = db.noSQLSchema as {
    json?: { collections?: unknown[] | null }
  } | null

  const collections = normalizeJsonCollections(
    arrayNonNullable(noSQLSchema?.json?.collections)
  )

  const body = (
    <NosqlCollectionsBody
      collections={collections}
      emptyKind="json-collections"
    />
  )

  if (contentOnly) return body

  return (
    <SchemaViewShell
      db={db}
      kind="json-collections"
      sectionTitle="Collections"
      sectionIcon={<BsCollection className="size-4" />}
    >
      {body}
    </SchemaViewShell>
  )
}

export function JsonTablesSchemaView({
  db,
  contentOnly = false,
}: {
  db: ServiceDbSchema
  contentOnly?: boolean
}) {
  const collections = arrayNonNullable(db.tables).map((table, index) => ({
    id: table.name ?? String(index),
    name: table.name ?? 'Untitled collection',
    fields: arrayNonNullable(table.columns).map((column, columnIndex) => ({
      id: column.name ?? String(columnIndex),
      name: column.name ?? 'Unnamed field',
      type: column.type ?? 'unknown',
    })),
    indexes: arrayNonNullable(table.indexes).map((indexDef) => ({
      id: indexDef.name ?? '',
      name: indexDef.name ?? 'Unnamed index',
      unique: indexDef.type?.toLowerCase().includes('unique') ?? false,
      fields: arrayNonNullable(indexDef.fields),
    })),
  }))

  const body = (
    <NosqlCollectionsBody collections={collections} emptyKind="json-tables" />
  )

  if (contentOnly) return body

  return (
    <SchemaViewShell
      db={db}
      kind="json-tables"
      sectionTitle="Collections"
      sectionIcon={<BsCollection className="size-4" />}
    >
      {body}
    </SchemaViewShell>
  )
}

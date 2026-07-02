import { cn } from '@/lib/utils'
import { TableAST } from '@uigraph/sdk'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import z from 'zod'
import { MongoCollectionSchema } from '../../components/nosql-editor/nosql-schema'
import { DataSource } from '../../types/db-flow'

type DataNodeNoSQLContentProps = {
  table: TableAST
  isForcedOpen: boolean

  dataSource: DataSource
  mongoCollectionSource: z.infer<typeof MongoCollectionSchema>
}

export function DataNodeNoSQLContent({
  dataSource,
  isForcedOpen,
  mongoCollectionSource,
}: DataNodeNoSQLContentProps) {
  type FieldNode = {
    id: string
    name: string
    type: string
    children: unknown[] | null
  }

  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }

  function getString(value: unknown): string | null {
    return typeof value === 'string' ? value : null
  }

  function getBoolean(value: unknown): boolean | null {
    return typeof value === 'boolean' ? value : null
  }

  function getArray(value: unknown): unknown[] | null {
    return Array.isArray(value) ? value : null
  }

  function getRecord(value: unknown): Record<string, unknown> | null {
    return isRecord(value) ? value : null
  }

  function buildFieldNodes(fields: unknown[], path: string): FieldNode[] {
    const result: FieldNode[] = []

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i]
      const rec = getRecord(field)
      if (!rec) continue

      const name = getString(rec.name)
      const type = getString(rec.type)
      if (!name || !type || getBoolean(rec.required) === null) continue

      const nestedFields =
        type === 'object'
          ? getArray(rec.fields)
          : type === 'array'
            ? null
            : null

      const itemType = type === 'array' ? getString(rec.itemType) : null
      const itemFields =
        type === 'array' && itemType === 'object'
          ? getArray(rec.itemFields)
          : null

      const children =
        type === 'object'
          ? nestedFields
          : type === 'array' && itemType === 'object'
            ? itemFields
            : null

      result.push({
        id: `${path}/${name}`,
        name,
        type:
          type === 'array'
            ? itemType
              ? itemType === 'object'
                ? 'object[]'
                : `${itemType}[]`
              : 'array'
            : type,
        children,
      })
    }

    return result
  }

  const dynamo =
    dataSource.dialect === 'dynamodb'
      ? {
          sourceRec: getRecord(dataSource.sourceContent),
        }
      : null

  const dynamoDetails = dynamo?.sourceRec
    ? {
        primaryKey: getRecord(dynamo.sourceRec.primaryKey),
        globalSecondaryIndexes:
          getArray(dynamo.sourceRec.globalSecondaryIndexes) ?? [],
      }
    : null

  const collectionFields =
    dataSource.dialect === 'mongodb' && mongoCollectionSource
      ? getArray(getRecord(mongoCollectionSource)?.fields)
      : null

  const dynamoAttributes = dynamo?.sourceRec
    ? getArray(dynamo.sourceRec.attributes)
    : null

  const collectionNodes = collectionFields
    ? buildFieldNodes(collectionFields, 'collection')
    : []
  const attributeNodes = dynamoAttributes
    ? buildFieldNodes(dynamoAttributes, 'dynamodb')
    : []

  const [openNodeIds, setOpenNodeIds] = useState(() => {
    const initialNodes = dynamoDetails ? attributeNodes : collectionNodes
    return new Set(
      initialNodes
        .filter((node) => (node.children?.length ?? 0) > 0)
        .map((node) => node.id)
    )
  })

  function toggleNode(nodeId: string) {
    setOpenNodeIds((prev) => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }

  function renderTree(nodes: FieldNode[], depth: number) {
    return nodes.map((node) => {
      const children = node.children
        ? buildFieldNodes(node.children, node.id)
        : []
      const hasChildren = children.length > 0
      const isOpen = isForcedOpen || (hasChildren && openNodeIds.has(node.id))

      const leftPadding = depth * 12

      return (
        <div key={node.id}>
          {hasChildren ? (
            <>
              <button
                type="button"
                onClick={() => toggleNode(node.id)}
                className="border-stock hover:bg-accent/30 block w-full border-b px-4 py-2 text-left transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    className="flex min-w-0 flex-1 items-center gap-2"
                    style={{ paddingLeft: leftPadding }}
                  >
                    <span className="text-foreground truncate font-mono text-sm font-medium">
                      {node.name}
                    </span>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <span className="text-paragraph font-mono text-xs">
                      {node.type}
                    </span>
                    <ChevronRight
                      className={cn(
                        'text-muted-foreground h-3.5 w-3.5 transition-transform',
                        isOpen && 'rotate-90'
                      )}
                    />
                  </div>
                </div>
              </button>

              {isOpen ? renderTree(children, depth + 1) : null}
            </>
          ) : (
            <div className="border-stock hover:bg-accent/30 border-b px-4 py-2 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <div
                  className="flex min-w-0 flex-1 items-center gap-2"
                  style={{ paddingLeft: leftPadding }}
                >
                  <span className="text-foreground truncate font-mono text-sm font-medium">
                    {node.name}
                  </span>
                </div>
                <span className="text-paragraph flex-shrink-0 font-mono text-xs">
                  {node.type}
                </span>
              </div>
            </div>
          )}
        </div>
      )
    })
  }

  if (dynamoDetails) {
    const pk = dynamoDetails.primaryKey
      ? getString(dynamoDetails.primaryKey.partitionKey)
      : null
    const pkType = dynamoDetails.primaryKey
      ? getString(dynamoDetails.primaryKey.partitionKeyType)
      : null
    const sk = dynamoDetails.primaryKey
      ? getString(dynamoDetails.primaryKey.sortKey)
      : null
    const skType = dynamoDetails.primaryKey
      ? getString(dynamoDetails.primaryKey.sortKeyType)
      : null
    const gsis = dynamoDetails.globalSecondaryIndexes

    return (
      <div>
        <div className="border-stock bg-accent/30 text-secondary-foreground border-b px-4 py-2 text-xs font-semibold">
          Keys
        </div>

        <div className="border-stock hover:bg-accent/30 border-b px-4 py-2 transition-colors">
          <div className="flex items-center justify-between gap-2">
            <span className="text-foreground truncate font-mono text-sm font-medium">
              PK
            </span>
            <span className="text-paragraph flex-shrink-0 font-mono text-xs">
              {pk ? `${pk}${pkType ? ` (${pkType})` : ''}` : '—'}
            </span>
          </div>
        </div>

        <div className="border-stock hover:bg-accent/30 border-b px-4 py-2 transition-colors">
          <div className="flex items-center justify-between gap-2">
            <span className="text-foreground truncate font-mono text-sm font-medium">
              SK
            </span>
            <span className="text-paragraph flex-shrink-0 font-mono text-xs">
              {sk ? `${sk}${skType ? ` (${skType})` : ''}` : '—'}
            </span>
          </div>
        </div>

        <div className="border-stock bg-accent/30 text-secondary-foreground border-b px-4 py-2 text-xs font-semibold">
          GSIs ({gsis.length})
        </div>

        {gsis.length > 0 ? (
          gsis.map((gsi, idx) => {
            const rec = getRecord(gsi)
            const name = rec ? getString(rec.name) : null
            const gsiPk = rec ? getString(rec.partitionKey) : null
            const gsiPkType = rec ? getString(rec.partitionKeyType) : null
            const gsiSk = rec ? getString(rec.sortKey) : null
            const gsiSkType = rec ? getString(rec.sortKeyType) : null

            const right = [
              gsiPk ? `${gsiPk}${gsiPkType ? ` (${gsiPkType})` : ''}` : null,
              gsiSk ? `${gsiSk}${gsiSkType ? ` (${gsiSkType})` : ''}` : null,
            ]
              .filter((part) => part !== null)
              .join(' / ')

            return (
              <div
                key={`${name ?? 'gsi'}-${idx}`}
                className="border-stock hover:bg-accent/30 border-b px-4 py-2 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    title={name ?? `gsi_${idx + 1}`}
                    className="text-foreground max-w-[16ch] shrink-0 truncate font-mono text-sm font-medium"
                  >
                    {name ?? `gsi_${idx + 1}`}
                  </span>

                  <span
                    title={right}
                    className="text-paragraph flex-1 flex-shrink-0 truncate font-mono text-xs"
                  >
                    {right || '—'}
                  </span>
                </div>
              </div>
            )
          })
        ) : (
          <div className="border-stock text-paragraph border-b px-4 py-2 text-sm">
            No GSIs
          </div>
        )}

        <div className="border-stock bg-accent/30 text-secondary-foreground border-b px-4 py-2 text-xs font-semibold">
          Attributes
        </div>

        {attributeNodes.length > 0 ? (
          renderTree(attributeNodes, 0)
        ) : (
          <div className="border-stock text-paragraph border-b px-4 py-2 text-sm">
            No attributes
          </div>
        )}
      </div>
    )
  }

  if (collectionFields) {
    return (
      <div>
        {collectionNodes.length > 0 ? (
          renderTree(collectionNodes, 0)
        ) : (
          <div className="border-stock text-paragraph border-b px-4 py-2 text-sm">
            No fields
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-[200px]">
      <div className="border-stock text-paragraph border-b px-4 py-2 text-sm">
        Unsupported schema
      </div>
    </div>
  )
}

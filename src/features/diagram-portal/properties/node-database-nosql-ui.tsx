import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  DynamoEditorSchema,
  MongoEditorSchema,
} from '../components/nosql-editor/nosql-schema'
import { useDatabaseTable } from '../hooks/use-database-table'
import { generateUUID } from '../utils/uuid'
import { DatabaseColumnInput } from './components/database-column-input'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getRecord(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? value : null
}

function getArray(value: unknown): unknown[] | null {
  return Array.isArray(value) ? value : null
}

function getString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function getBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null
}

function parseTypeInput(input: string): {
  type: string
  itemType: string | null
} {
  const trimmed = input.trim()
  if (!trimmed) return { type: '', itemType: null }
  if (trimmed.endsWith('[]')) {
    const base = trimmed.slice(0, -2).trim()
    return { type: 'array', itemType: base || 'string' }
  }
  return { type: trimmed, itemType: null }
}

type Props = ReturnType<typeof useDatabaseTable> & {
  tableName: string
  readOnly?: boolean
}

export function NodeDatabaseNosqlPropertiesUI({
  table,
  tableName,
  dataSource,
  mongoCollectionSource,
  setDataSource,
  readOnly,
}: Props) {
  const [openGsiId, setOpenGsiId] = useState<string | null>(null)

  const activeSource = useMemo(() => {
    if (dataSource?.dialect === 'mongodb') return mongoCollectionSource
    if (dataSource?.dialect === 'dynamodb') return dataSource.sourceContent
    return null
  }, [dataSource?.dialect, dataSource?.sourceContent, mongoCollectionSource])

  const dynamoAttributes = useMemo(() => {
    if (dataSource?.dialect !== 'dynamodb') return []
    const root = getRecord(activeSource)
    if (!root) return []
    const attrsRaw = getArray(root.attributes) ?? []
    const attributes = attrsRaw
      .map(getRecord)
      .filter((v): v is Record<string, unknown> => Boolean(v))
    return attributes.map((a, index) => ({
      id: getString(a.id) ?? `${index}`,
      name: getString(a.name) ?? '',
      type: getString(a.type) ?? '',
    }))
  }, [activeSource, dataSource?.dialect])

  const visualColumns = useMemo(() => {
    if (!activeSource) return []

    if (dataSource?.dialect === 'dynamodb') {
      const root = getRecord(activeSource)
      if (!root) return []

      const attrsRaw = getArray(root.attributes) ?? []
      const attributes = attrsRaw
        .map(getRecord)
        .filter((v): v is Record<string, unknown> => Boolean(v))

      const primaryKey = getRecord(root.primaryKey)
      const partitionKey = primaryKey
        ? (getString(primaryKey.partitionKey) ?? '')
        : ''
      const sortKey = primaryKey ? (getString(primaryKey.sortKey) ?? '') : ''

      return attributes.map((attr, index) => {
        const id = getString(attr.id) ?? `${index}`
        const name = getString(attr.name) ?? ''
        const type = getString(attr.type) ?? ''
        const required = getBoolean(attr.required) ?? false
        const itemType = type === 'array' ? getString(attr.itemType) : null

        return {
          id,
          name,
          type:
            type === 'array' ? (itemType ? `${itemType}[]` : 'array') : type,
          nullable: !required,
          isPrimaryKey:
            (partitionKey !== '' && name === partitionKey) ||
            (sortKey !== '' && name === sortKey),
        }
      })
    }

    const collection = getRecord(activeSource)
    if (!collection) return []
    const fieldsRaw = getArray(collection.fields) ?? []
    const fields = fieldsRaw
      .map(getRecord)
      .filter((v): v is Record<string, unknown> => Boolean(v))

    return fields.map((field, index) => {
      const id = getString(field.id) ?? `${index}`
      const name = getString(field.name) ?? ''
      const type = getString(field.type) ?? ''
      const required = getBoolean(field.required) ?? false
      const itemType = type === 'array' ? getString(field.itemType) : null

      return {
        id,
        name,
        type: type === 'array' ? (itemType ? `${itemType}[]` : 'array') : type,
        nullable: !required,
        isPrimaryKey: false,
      }
    })
  }, [activeSource, dataSource?.dialect])

  function addVisualColumn() {
    if (!dataSource || !activeSource) return

    if (dataSource.dialect === 'dynamodb') {
      const root = getRecord(activeSource)
      if (!root) return

      const nextAttribute: Record<string, unknown> = {
        id: generateUUID(),
        name: `new_field_${visualColumns.length + 1}`,
        type: 'string',
        required: false,
      }

      const attrsRaw = getArray(root.attributes) ?? []

      const nextUnknown: unknown = {
        ...root,
        attributes: [...attrsRaw, nextAttribute],
      }

      try {
        const next = DynamoEditorSchema.parse(nextUnknown)
        setDataSource({ sourceContent: next, modifiedAt: Date.now() })
        toast.success('Column added')
      } catch {
        toast.error('Invalid schema update')
      }
      return
    }

    if (dataSource.dialect === 'mongodb') {
      const collection = getRecord(activeSource)
      if (!collection) return

      const nextField: Record<string, unknown> = {
        id: generateUUID(),
        name: `new_field_${visualColumns.length + 1}`,
        type: 'string',
        required: false,
      }

      try {
        const fieldsRaw = getArray(collection.fields) ?? []
        const updatedCollection: Record<string, unknown> = {
          ...collection,
          fields: [...fieldsRaw, nextField],
        }
        const prevRoot = MongoEditorSchema.parse(dataSource.sourceContent)
        const nextUnknown: unknown = {
          ...prevRoot,
          collections: prevRoot.collections.map((c) =>
            c.id === getString(updatedCollection.id) ? updatedCollection : c
          ),
        }
        const next = MongoEditorSchema.parse(nextUnknown)
        setDataSource({ sourceContent: next, modifiedAt: Date.now() })
        toast.success('Column added')
      } catch {
        toast.error('Invalid schema update')
      }
      return
    }
  }

  function removeVisualColumn(columnId: string) {
    if (visualColumns.length <= 1) {
      toast.error('Cannot remove the last column')
      return
    }

    if (!dataSource || !activeSource) return

    if (dataSource.dialect === 'dynamodb') {
      const root = getRecord(activeSource)
      if (!root) return

      const pkRec = getRecord(root.primaryKey)
      const partitionKey = pkRec ? (getString(pkRec.partitionKey) ?? '') : ''
      const sortKey = pkRec ? (getString(pkRec.sortKey) ?? '') : ''

      let removedName: string | null = null
      const attrsRaw = getArray(root.attributes) ?? []
      const nextAttrs: unknown[] = []
      for (let i = 0; i < attrsRaw.length; i++) {
        const a = attrsRaw[i]
        const rec = getRecord(a)
        if (rec && getString(rec.id) === columnId) {
          removedName = getString(rec.name)
          continue
        }
        nextAttrs.push(a)
      }

      const nextUnknown: unknown = {
        ...root,
        attributes: nextAttrs,
        primaryKey: pkRec
          ? {
              ...pkRec,
              partitionKey:
                removedName && partitionKey === removedName ? '' : partitionKey,
              sortKey: removedName && sortKey === removedName ? '' : sortKey,
            }
          : root.primaryKey,
      }

      try {
        const next = DynamoEditorSchema.parse(nextUnknown)
        setDataSource({ sourceContent: next, modifiedAt: Date.now() })
        toast.success('Column removed')
      } catch {
        toast.error('Invalid schema update')
      }

      return
    }

    if (dataSource.dialect === 'mongodb') {
      const collection = getRecord(activeSource)
      if (!collection) return
      try {
        const fieldsRaw = getArray(collection.fields) ?? []
        const nextFields: unknown[] = []
        for (let i = 0; i < fieldsRaw.length; i++) {
          const f = fieldsRaw[i]
          const rec = getRecord(f)
          if (rec && getString(rec.id) === columnId) continue
          nextFields.push(f)
        }
        const updatedCollection: Record<string, unknown> = {
          ...collection,
          fields: nextFields,
        }
        const prevRoot = MongoEditorSchema.parse(dataSource.sourceContent)
        const nextUnknown: unknown = {
          ...prevRoot,
          collections: prevRoot.collections.map((c) =>
            c.id === getString(updatedCollection.id) ? updatedCollection : c
          ),
        }
        const next = MongoEditorSchema.parse(nextUnknown)
        setDataSource({ sourceContent: next, modifiedAt: Date.now() })
        toast.success('Column removed')
      } catch {
        toast.error('Invalid schema update')
      }
      return
    }
  }

  function updateVisualColumn(
    columnId: string,
    updates: {
      name?: string
      type?: string
      nullable?: boolean
      isPrimaryKey?: boolean
    }
  ) {
    if (!dataSource || !activeSource) return

    if (dataSource.dialect === 'dynamodb') {
      const root = getRecord(activeSource)
      if (!root) return

      const pkRec = getRecord(root.primaryKey)
      const partitionKey = pkRec ? (getString(pkRec.partitionKey) ?? '') : ''
      const sortKey = pkRec ? (getString(pkRec.sortKey) ?? '') : ''

      let oldName = ''
      let nextName = ''

      const attrsRaw = getArray(root.attributes) ?? []
      const nextAttrs: unknown[] = []
      let found = false

      for (let i = 0; i < attrsRaw.length; i++) {
        const a = attrsRaw[i]
        const rec = getRecord(a)
        if (!rec || getString(rec.id) !== columnId) {
          nextAttrs.push(a)
          continue
        }

        found = true
        oldName = getString(rec.name) ?? ''
        nextName = updates.name ?? oldName
        const nextNullable =
          updates.nullable ?? !(getBoolean(rec.required) ?? false)
        const parsed = updates.type ? parseTypeInput(updates.type) : null
        const currentType = getString(rec.type) ?? ''
        const currentItemType =
          currentType === 'array' ? getString(rec.itemType) : null
        const nextType = parsed ? parsed.type : currentType
        const nextItemType =
          parsed && parsed.type === 'array'
            ? (parsed.itemType ?? currentItemType ?? 'string')
            : null

        const nextAttr: Record<string, unknown> = {
          ...rec,
          name: nextName,
          required: !nextNullable,
          type: nextType,
        }
        if (nextType === 'array') {
          nextAttr.itemType = nextItemType ?? 'string'
        } else {
          delete nextAttr.itemType
          delete nextAttr.itemFields
          delete nextAttr.fields
        }
        nextAttrs.push(nextAttr)
      }

      if (!found) return

      const shouldBePk = updates.isPrimaryKey
      let nextPartitionKey = partitionKey
      let nextSortKey = sortKey

      if (shouldBePk === true) {
        if (!nextPartitionKey || nextPartitionKey === oldName) {
          nextPartitionKey = nextName
        } else if (!nextSortKey || nextSortKey === oldName) {
          nextSortKey = nextName
        } else {
          nextPartitionKey = nextName
        }
      }

      if (shouldBePk === false) {
        if (nextPartitionKey === oldName) nextPartitionKey = ''
        if (nextSortKey === oldName) nextSortKey = ''
      }

      if (updates.name && partitionKey === oldName) nextPartitionKey = nextName
      if (updates.name && sortKey === oldName) nextSortKey = nextName

      const nextUnknown: unknown = {
        ...root,
        attributes: nextAttrs,
        primaryKey: pkRec
          ? { ...pkRec, partitionKey: nextPartitionKey, sortKey: nextSortKey }
          : root.primaryKey,
      }

      try {
        const next = DynamoEditorSchema.parse(nextUnknown)
        setDataSource({ sourceContent: next, modifiedAt: Date.now() })
      } catch {
        toast.error('Invalid schema update')
      }
      return
    }

    if (dataSource.dialect !== 'mongodb') return
    const collection = getRecord(activeSource)
    if (!collection) return

    const fieldsRaw = getArray(collection.fields) ?? []
    const nextFields: unknown[] = []
    let found = false

    try {
      for (let i = 0; i < fieldsRaw.length; i++) {
        const f = fieldsRaw[i]
        const rec = getRecord(f)
        if (!rec || getString(rec.id) !== columnId) {
          nextFields.push(f)
          continue
        }

        found = true
        const oldName = getString(rec.name) ?? ''
        const nextName = updates.name ?? oldName
        const nextNullable =
          updates.nullable ?? !(getBoolean(rec.required) ?? false)
        const parsed = updates.type ? parseTypeInput(updates.type) : null
        const currentType = getString(rec.type) ?? ''
        const currentItemType =
          currentType === 'array' ? getString(rec.itemType) : null
        const nextType = parsed ? parsed.type : currentType
        const nextItemType =
          parsed && parsed.type === 'array'
            ? (parsed.itemType ?? currentItemType ?? 'string')
            : null

        const nextField: Record<string, unknown> = {
          ...rec,
          name: nextName,
          required: !nextNullable,
          type: nextType,
        }
        if (nextType === 'array') {
          nextField.itemType = nextItemType ?? 'string'
        } else {
          delete nextField.itemType
          delete nextField.itemFields
        }
        if (nextType !== 'object') {
          delete nextField.fields
        }

        nextFields.push(nextField)
      }

      if (!found) return

      const updatedCollection: Record<string, unknown> = {
        ...collection,
        fields: nextFields,
      }

      const prevRoot = MongoEditorSchema.parse(dataSource.sourceContent)
      const nextUnknown: unknown = {
        ...prevRoot,
        collections: prevRoot.collections.map((c) =>
          c.id === getString(updatedCollection.id) ? updatedCollection : c
        ),
      }
      const next = MongoEditorSchema.parse(nextUnknown)
      setDataSource({ sourceContent: next, modifiedAt: Date.now() })
    } catch {
      toast.error('Invalid schema update')
    }
  }

  function updateDynamoPrimaryKey(updates: {
    partitionKey?: string
    sortKey?: string
    partitionKeyType?: string
    sortKeyType?: string
  }) {
    if (dataSource?.dialect !== 'dynamodb') return
    const root = getRecord(activeSource)
    if (!root) return
    const pkRec = getRecord(root.primaryKey)
    if (!pkRec) return

    const nextUnknown: unknown = {
      ...root,
      primaryKey: {
        ...pkRec,
        ...updates,
      },
    }

    try {
      const next = DynamoEditorSchema.parse(nextUnknown)
      setDataSource({ sourceContent: next, modifiedAt: Date.now() })
    } catch {
      toast.error('Invalid schema update')
    }
  }

  function addDynamoGsi() {
    if (dataSource?.dialect !== 'dynamodb') return
    const root = getRecord(activeSource)
    if (!root) return
    const gsisRaw = getArray(root.globalSecondaryIndexes) ?? []
    const firstAttr = dynamoAttributes.find((a) => a.name.trim() !== '')
    const nextGsi: Record<string, unknown> = {
      id: generateUUID(),
      name: `gsi_${gsisRaw.length + 1}`,
      partitionKey: firstAttr?.name ?? '',
    }
    const nextUnknown: unknown = {
      ...root,
      globalSecondaryIndexes: [...gsisRaw, nextGsi],
    }
    try {
      const next = DynamoEditorSchema.parse(nextUnknown)
      setDataSource({ sourceContent: next, modifiedAt: Date.now() })
      toast.success('GSI added')
    } catch {
      toast.error('Invalid schema update')
    }
  }

  function removeDynamoGsi(gsiId: string) {
    if (dataSource?.dialect !== 'dynamodb') return
    const root = getRecord(activeSource)
    if (!root) return
    const gsisRaw = getArray(root.globalSecondaryIndexes) ?? []
    const nextGsis: unknown[] = []
    for (let i = 0; i < gsisRaw.length; i++) {
      const g = gsisRaw[i]
      const rec = getRecord(g)
      if (rec && getString(rec.id) === gsiId) continue
      nextGsis.push(g)
    }
    const nextUnknown: unknown = { ...root, globalSecondaryIndexes: nextGsis }
    try {
      const next = DynamoEditorSchema.parse(nextUnknown)
      setDataSource({ sourceContent: next, modifiedAt: Date.now() })
      toast.success('GSI removed')
    } catch {
      toast.error('Invalid schema update')
    }
  }

  function updateDynamoGsi(
    gsiId: string,
    updates: Partial<{
      name: string
      partitionKey: string
      partitionKeyType: string
      sortKey: string
      sortKeyType: string
    }>
  ) {
    if (dataSource?.dialect !== 'dynamodb') return
    const root = getRecord(activeSource)
    if (!root) return
    const gsisRaw = getArray(root.globalSecondaryIndexes) ?? []
    const nextGsis: unknown[] = []
    let found = false
    for (let i = 0; i < gsisRaw.length; i++) {
      const g = gsisRaw[i]
      const rec = getRecord(g)
      if (!rec || getString(rec.id) !== gsiId) {
        nextGsis.push(g)
        continue
      }
      found = true
      nextGsis.push({ ...rec, ...updates })
    }
    if (!found) return
    const nextUnknown: unknown = { ...root, globalSecondaryIndexes: nextGsis }
    try {
      const next = DynamoEditorSchema.parse(nextUnknown)
      setDataSource({ sourceContent: next, modifiedAt: Date.now() })
    } catch {
      toast.error('Invalid schema update')
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">
          {dataSource?.dialect === 'dynamodb'
            ? 'Table Name'
            : 'Collection Name'}
        </Label>
        <Input
          className="!h-11 rounded-[0.8rem] shadow-none"
          value={table?.name ?? ''}
          readOnly={readOnly}
          onChange={(e) => {
            const nextName = e.target.value
            if (!dataSource || !activeSource) return

            const nextSchemaAst = {
              ...dataSource.schemaAst,
              tables: dataSource.schemaAst.tables.map((t) =>
                t.name === tableName ? { ...t, name: nextName } : t
              ),
            }

            if (dataSource.dialect === 'dynamodb') {
              const root = getRecord(activeSource)
              if (!root) return

              const nextUnknown: unknown = {
                ...root,
                name: nextName,
              }
              try {
                const next = DynamoEditorSchema.parse(nextUnknown)
                setDataSource({
                  sourceContent: next,
                  schemaAst: nextSchemaAst,
                  modifiedAt: Date.now(),
                })
              } catch {
                toast.error('Invalid schema update')
              }
              return
            }

            try {
              const collection = getRecord(activeSource)
              if (!collection) return
              const updatedCollection: Record<string, unknown> = {
                ...collection,
                name: nextName,
              }
              const prevRoot = MongoEditorSchema.parse(dataSource.sourceContent)
              const nextUnknown: unknown = {
                ...prevRoot,
                collections: prevRoot.collections.map((c) =>
                  c.id === getString(updatedCollection.id)
                    ? updatedCollection
                    : c
                ),
              }
              const next = MongoEditorSchema.parse(nextUnknown)
              setDataSource({
                sourceContent: next,
                schemaAst: nextSchemaAst,
                modifiedAt: Date.now(),
              })
            } catch {
              toast.error('Invalid schema update')
            }
          }}
        />
      </div>

      {dataSource?.dialect === 'dynamodb' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Partition Key (PK)</Label>
            <DatabaseColumnInput
              column={{
                name:
                  getString(
                    getRecord(getRecord(activeSource)?.primaryKey)?.partitionKey
                  ) ?? '',
                type:
                  getString(
                    getRecord(getRecord(activeSource)?.primaryKey)
                      ?.partitionKeyType
                  ) ?? '',
                nullable: false,
                isPrimaryKey: true,
                isForeignKey: false,
              }}
              readOnly={readOnly}
              triggerRemove={() => updateDynamoPrimaryKey({ partitionKey: '' })}
              triggerChanges={(updates) =>
                updateDynamoPrimaryKey({
                  partitionKey: updates.name,
                  partitionKeyType: updates.type,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Sort Key (SK)</Label>
            <DatabaseColumnInput
              column={{
                name:
                  getString(
                    getRecord(getRecord(activeSource)?.primaryKey)?.sortKey
                  ) ?? '',
                type:
                  getString(
                    getRecord(getRecord(activeSource)?.primaryKey)?.sortKeyType
                  ) ?? '',
                nullable: false,
                isPrimaryKey: false,
                isForeignKey: false,
              }}
              readOnly={readOnly}
              triggerRemove={() => updateDynamoPrimaryKey({ sortKey: '' })}
              triggerChanges={(updates) =>
                updateDynamoPrimaryKey({
                  sortKey: updates.name,
                  sortKeyType: updates.type,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">
                GSI (
                {getArray(getRecord(activeSource)?.globalSecondaryIndexes)
                  ?.length ?? 0}
                )
              </Label>
              {!readOnly && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={addDynamoGsi}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {(getArray(getRecord(activeSource)?.globalSecondaryIndexes) ?? [])
                .map(getRecord)
                .filter((v): v is Record<string, unknown> => Boolean(v))
                .map((gsi, index) => {
                  const id = getString(gsi.id) ?? `${index}`
                  const name = getString(gsi.name) ?? ''
                  const partitionKey = getString(gsi.partitionKey) ?? ''
                  const sortKey = getString(gsi.sortKey) ?? ''
                  const partitionKeyType = getString(gsi.partitionKeyType) ?? ''
                  const sortKeyType = getString(gsi.sortKeyType) ?? ''
                  const isOpen = openGsiId === id

                  return (
                    <div
                      key={id}
                      className="border-stock bg-card space-y-2 rounded border p-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          className="min-w-0 flex-1 truncate text-left font-mono text-xs font-medium"
                          onClick={() =>
                            setOpenGsiId((prev) => (prev === id ? null : id))
                          }
                        >
                          {name || `gsi_${index + 1}`}
                        </button>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-paragraph h-5 w-5 p-0"
                            onClick={() =>
                              setOpenGsiId((prev) => (prev === id ? null : id))
                            }
                          >
                            <ChevronDown
                              className={`h-3 w-3 transition-transform ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </Button>
                          {!readOnly && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeDynamoGsi(id)}
                              className="text-muted-foreground h-5 w-5 p-0 hover:text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {isOpen ? (
                        <div className="space-y-3 border-t pt-1">
                          <div className="space-y-2">
                            <Label className="text-xs">Index Name</Label>
                            <Input
                              className="bg-input !h-11 w-full rounded-[0.8rem] shadow-none"
                              value={name}
                              readOnly={readOnly}
                              onChange={(e) =>
                                updateDynamoGsi(id, { name: e.target.value })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">
                              GSI Partition Key (PK)
                            </Label>
                            <DatabaseColumnInput
                              column={{
                                name: partitionKey,
                                type: partitionKeyType,
                                nullable: false,
                                isPrimaryKey: true,
                                isForeignKey: false,
                              }}
                              readOnly={readOnly}
                              triggerRemove={() =>
                                updateDynamoGsi(id, {
                                  partitionKey: '',
                                  partitionKeyType: '',
                                })
                              }
                              triggerChanges={(updates) =>
                                updateDynamoGsi(id, {
                                  partitionKey: updates.name,
                                  partitionKeyType: updates.type,
                                })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">GSI Sort Key (SK)</Label>
                            <DatabaseColumnInput
                              column={{
                                name: sortKey,
                                type: sortKeyType,
                                nullable: false,
                                isPrimaryKey: false,
                                isForeignKey: false,
                              }}
                              readOnly={readOnly}
                              triggerRemove={() =>
                                updateDynamoGsi(id, {
                                  sortKey: '',
                                  sortKeyType: '',
                                })
                              }
                              triggerChanges={(updates) =>
                                updateDynamoGsi(id, {
                                  sortKey: updates.name,
                                  sortKeyType: updates.type,
                                })
                              }
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">
            {dataSource?.dialect === 'dynamodb' ? 'Attributes' : 'Columns'} (
            {visualColumns.length})
          </Label>
          {!readOnly && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs"
              onClick={addVisualColumn}
            >
              <Plus className="mr-1 h-3 w-3" />
              Add
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {visualColumns.map((column) => (
            <DatabaseColumnInput
              key={column.id}
              column={{
                name: column.name,
                type: column.type,
                nullable: column.nullable,
                isPrimaryKey: false,
                isForeignKey: false,
              }}
              readOnly={readOnly}
              triggerRemove={() => removeVisualColumn(column.id)}
              triggerChanges={(updates) =>
                updateVisualColumn(column.id, updates)
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}

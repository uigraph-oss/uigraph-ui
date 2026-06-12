import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { generateUUID } from 'daily-code'
import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { useEditorContext } from './editor-context'
import { MongoCollectionRecursiveCard } from './mongo-collection-recursive-card'
import {
  MongoCollectionSchema,
  MongoIndexFieldSchema,
  MongoIndexSchema,
  MongoNestedFieldSchema,
} from './nosql-schema'

export function EditorStepMongoDBCollections() {
  const { mongoSchema, setMongoSchema } = useEditorContext()

  const mongoCollections = mongoSchema.collections
  function setMongoCollections(
    updater: (
      prev: Array<z.infer<typeof MongoCollectionSchema>>
    ) => Array<z.infer<typeof MongoCollectionSchema>>
  ) {
    setMongoSchema({
      ...mongoSchema,
      collections: updater(mongoSchema.collections),
    })
  }
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    string | null
  >(null)
  const [activeTab, setActiveTab] = useState<'fields' | 'indexes'>('fields')
  const [sampleDoc, setSampleDoc] = useState('')

  const [expandedFields, setExpandedFields] = useState<
    Map<string, Set<string>>
  >(new Map())

  const selectedCollection = mongoCollections.find(
    (c) => c.id === selectedCollectionId
  )

  function toggleFieldExpanded(collectionId: string, fieldId: string) {
    setExpandedFields((prev) => {
      const next = new Map(prev)
      const prevSet = prev.get(collectionId)
      const fieldSet = new Set(prevSet ?? [])

      if (fieldSet.has(fieldId)) {
        fieldSet.delete(fieldId)
      } else {
        fieldSet.add(fieldId)
      }

      next.set(collectionId, fieldSet)
      return next
    })
  }

  function collapseField(collectionId: string, fieldId: string) {
    setExpandedFields((prev) => {
      const next = new Map(prev)
      const prevSet = prev.get(collectionId)
      const fieldSet = new Set(prevSet ?? [])
      fieldSet.delete(fieldId)
      next.set(collectionId, fieldSet)
      return next
    })
  }

  function normalizeMongoField(
    field: z.infer<typeof MongoNestedFieldSchema>,
    patch: Partial<z.infer<typeof MongoNestedFieldSchema>>
  ): z.infer<typeof MongoNestedFieldSchema> {
    const next: z.infer<typeof MongoNestedFieldSchema> = { ...field, ...patch }

    if (next.type !== 'object') {
      next.fields = undefined
    }

    if (next.type !== 'array') {
      next.itemType = undefined
      next.itemFields = undefined
    } else if (!next.itemType) {
      next.itemType = 'string'
    }

    if (next.type !== 'reference') {
      next.refCollectionId = undefined
    }

    if (next.itemType !== 'object') {
      next.itemFields = undefined
    }

    return next
  }

  function addCollection() {
    const id = generateUUID()
    const collectionNumber = mongoCollections.length + 1
    const newCollection: z.infer<typeof MongoCollectionSchema> = {
      id,
      name: `collection_${collectionNumber}`,
      tags: '',
      description: '',
      fields: [],
      indexes: [],
    }
    setMongoCollections((prev) => [...prev, newCollection])
    setSelectedCollectionId(id)
    setActiveTab('fields')
  }

  function removeCollection(collectionId: string) {
    const remaining = mongoCollections.filter(
      (collection) => collection.id !== collectionId
    )

    setMongoCollections((prev) =>
      prev.filter((collection) => collection.id !== collectionId)
    )

    setExpandedFields((prev) => {
      const next = new Map(prev)
      next.delete(collectionId)
      return next
    })
    setSelectedCollectionId((prev) => {
      if (prev === collectionId) {
        return remaining[0]?.id ?? null
      }
      return prev
    })
    setActiveTab('fields')
  }

  function updateCollection(
    collectionId: string,
    patch: Partial<z.infer<typeof MongoCollectionSchema>>
  ) {
    setMongoCollections((prev) =>
      prev.map((collection) =>
        collection.id === collectionId
          ? { ...collection, ...patch }
          : collection
      )
    )
  }

  function updateCollectionName(collectionId: string, newName: string) {
    if (!newName || newName.trim() === '') {
      toast.error('Collection name cannot be empty')
      return
    }
    if (newName.includes(' ')) {
      toast.error('Collection name cannot contain spaces')
      return
    }
    updateCollection(collectionId, { name: newName.trim() })
  }

  function addField(collectionId: string) {
    setMongoCollections((prev) =>
      prev.map((collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              fields: [
                ...collection.fields,
                {
                  id: generateUUID(),
                  name: '',
                  type: 'string',
                  required: false,
                },
              ],
            }
          : collection
      )
    )
  }

  function replaceFields(
    collectionId: string,
    nextFields: Array<z.infer<typeof MongoNestedFieldSchema>>
  ) {
    setMongoCollections((prev) =>
      prev.map((collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              fields: nextFields.map((field) => {
                const existing = collection.fields.find(
                  (item) => item.id === field.id
                )
                return existing ? { ...existing, ...field } : field
              }),
            }
          : collection
      )
    )
  }

  function addIndex(collectionId: string) {
    setMongoCollections((prev) =>
      prev.map((collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              indexes: [
                ...collection.indexes,
                {
                  id: generateUUID(),
                  name: '',
                  fields: [],
                  unique: false,
                },
              ],
            }
          : collection
      )
    )
  }

  function updateIndex(
    collectionId: string,
    indexId: string,
    patch: Partial<z.infer<typeof MongoIndexSchema>>
  ) {
    setMongoCollections((prev) =>
      prev.map((collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              indexes: collection.indexes.map((index) =>
                index.id === indexId ? { ...index, ...patch } : index
              ),
            }
          : collection
      )
    )
  }

  function removeIndex(collectionId: string, indexId: string) {
    setMongoCollections((prev) =>
      prev.map((collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              indexes: collection.indexes.filter(
                (index) => index.id !== indexId
              ),
            }
          : collection
      )
    )
  }

  function addIndexField(collectionId: string, indexId: string) {
    const collection = mongoCollections.find((c) => c.id === collectionId)
    if (!collection) return

    const index = collection.indexes.find((i) => i.id === indexId)
    if (!index) return

    updateIndex(collectionId, indexId, {
      fields: [
        ...index.fields,
        {
          id: generateUUID(),
          fieldName: '',
          order: 1,
        },
      ],
    })
  }

  function updateIndexField(
    collectionId: string,
    indexId: string,
    fieldId: string,
    patch: Partial<z.infer<typeof MongoIndexFieldSchema>>
  ) {
    const collection = mongoCollections.find((c) => c.id === collectionId)
    if (!collection) return

    const index = collection.indexes.find((i) => i.id === indexId)
    if (!index) return

    updateIndex(collectionId, indexId, {
      fields: index.fields.map((field) =>
        field.id === fieldId ? { ...field, ...patch } : field
      ),
    })
  }

  function removeIndexField(
    collectionId: string,
    indexId: string,
    fieldId: string
  ) {
    const collection = mongoCollections.find((c) => c.id === collectionId)
    if (!collection) return

    const index = collection.indexes.find((i) => i.id === indexId)
    if (!index) return

    updateIndex(collectionId, indexId, {
      fields: index.fields.filter((field) => field.id !== fieldId),
    })
  }

  function inferFieldsFromSample() {
    if (!selectedCollection) return
    try {
      const parsed = JSON.parse(sampleDoc || '{}')
      const source = Array.isArray(parsed) ? parsed[0] || {} : parsed
      if (!source || typeof source !== 'object') {
        toast.error('Sample document must be an object')
        return
      }
      const entries = Object.entries(source as Record<string, unknown>)
      if (!entries.length) {
        toast.error('Sample document is empty')
        return
      }

      function inferField(
        key: string,
        value: unknown
      ): z.infer<typeof MongoNestedFieldSchema> {
        const field: z.infer<typeof MongoNestedFieldSchema> = {
          id: generateUUID(),
          name: key,
          type: Array.isArray(value)
            ? 'array'
            : value === null
              ? 'mixed'
              : typeof value === 'number'
                ? 'number'
                : typeof value === 'boolean'
                  ? 'boolean'
                  : typeof value === 'object'
                    ? 'object'
                    : 'string',
          required: true,
        }

        if (Array.isArray(value)) {
          field.type = 'array'
          if (value.length > 0) {
            const firstItem = value[0]
            field.itemType =
              typeof firstItem === 'number'
                ? 'number'
                : typeof firstItem === 'boolean'
                  ? 'boolean'
                  : typeof firstItem === 'object' && firstItem !== null
                    ? 'object'
                    : 'string'

            if (
              typeof firstItem === 'object' &&
              firstItem !== null &&
              !Array.isArray(firstItem)
            ) {
              field.itemFields = Object.entries(
                firstItem as Record<string, unknown>
              ).map(([nestedKey, nestedValue]) =>
                inferField(nestedKey, nestedValue)
              )
            }
          } else {
            field.itemType = 'string'
          }
        } else if (
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value)
        ) {
          field.fields = Object.entries(value as Record<string, unknown>).map(
            ([nestedKey, nestedValue]) => inferField(nestedKey, nestedValue)
          )
        }

        return field
      }

      const inferred = entries.map(([key, value]) => inferField(key, value))

      const existingFieldNames = new Set(
        selectedCollection.fields.map((f) => f.name)
      )
      const newFields = inferred.filter((f) => !existingFieldNames.has(f.name))

      updateCollection(selectedCollection.id, {
        fields: [...selectedCollection.fields, ...newFields],
      })
      toast.success(`Inferred ${newFields.length} new field(s) from sample`)
    } catch {
      toast.error('Invalid JSON sample')
    }
  }

  const topLevelFieldNames =
    selectedCollection?.fields
      .filter((f) => f.name.trim() !== '')
      .map((f) => f.name) || []

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Collections</p>
          <Button
            preset="primary"
            className="h-10 px-3!"
            onClick={addCollection}
          >
            <Plus className="h-4 w-4" />
            Add collection
          </Button>
        </div>

        {mongoCollections.length === 0 ? (
          <div className="rounded-lg border bg-gray-50 p-8 text-center">
            <p className="text-sm text-gray-600">No collections yet.</p>
            <p className="mt-1 text-xs text-gray-500">
              Click &quot;Add collection&quot; to define your first collection.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2">
            {mongoCollections.map((collection) => {
              const isSelected = selectedCollectionId === collection.id
              const fieldsCount = collection.fields.length
              const indexesCount = collection.indexes.length

              return (
                <div
                  key={collection.id}
                  className={cn(
                    'cursor-pointer rounded-lg border p-3 transition-colors',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  )}
                  onClick={() => {
                    setSelectedCollectionId(collection.id)
                    setActiveTab('fields')
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-gray-900">
                        {collection.name || 'Unnamed collection'}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {fieldsCount} field{fieldsCount !== 1 ? 's' : ''} ·{' '}
                        {indexesCount} index{indexesCount !== 1 ? 'es' : ''}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive h-8 w-8"
                      onClick={(event) => {
                        event.stopPropagation()
                        removeCollection(collection.id)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {selectedCollection && (
        <div className="space-y-4 rounded-lg border p-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">
                Collection name
              </label>
              <Input
                className="border-stock text-foreground h-[3.5rem] w-full rounded-[1rem] border bg-white px-4 text-sm"
                value={selectedCollection.name}
                onChange={(event) =>
                  updateCollection(selectedCollection.id, {
                    name: event.target.value,
                  })
                }
                onBlur={(event) =>
                  updateCollectionName(
                    selectedCollection.id,
                    event.target.value
                  )
                }
                placeholder="collection_name"
              />
              <p className="text-xs text-gray-500">
                Use lowercase and underscores; no spaces.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">
                Tags
              </label>
              <Input
                className="border-stock text-foreground h-[3.5rem] w-full rounded-[1rem] border bg-white px-4 text-sm"
                value={selectedCollection.tags}
                onChange={(event) =>
                  updateCollection(selectedCollection.id, {
                    tags: event.target.value,
                  })
                }
                placeholder="billing,finance"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">
                Description
              </label>
              <Textarea
                className="border-stock text-foreground w-full rounded-[1rem] border bg-white p-4 text-sm"
                value={selectedCollection.description}
                onChange={(event) =>
                  updateCollection(selectedCollection.id, {
                    description: event.target.value,
                  })
                }
                placeholder="Collection description"
                rows={3}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab('fields')}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors',
                activeTab === 'fields'
                  ? 'border-primary text-primary border-b-2'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Fields
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('indexes')}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors',
                activeTab === 'indexes'
                  ? 'border-primary text-primary border-b-2'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Indexes
            </button>
          </div>

          {activeTab === 'fields' && (
            <div className="space-y-4">
              {selectedCollection.fields.length === 0 ? (
                <div className="rounded-lg border bg-gray-50 p-4 text-center">
                  <p className="text-sm text-gray-600">
                    No fields yet. Click &quot;Add field&quot; to define the
                    document structure.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border bg-gray-50 p-3">
                  <MongoCollectionRecursiveCard
                    isFirstLevel
                    fields={selectedCollection.fields}
                    parentLabel="Fields"
                    onChange={(nextFields) =>
                      replaceFields(selectedCollection.id, nextFields)
                    }
                    normalizeField={normalizeMongoField}
                    expanded={
                      expandedFields.get(selectedCollection.id) ||
                      new Set<string>()
                    }
                    onToggle={(id) =>
                      toggleFieldExpanded(selectedCollection.id, id)
                    }
                    onCollapse={(id) =>
                      collapseField(selectedCollection.id, id)
                    }
                    allowItemFields
                    addLabel="Add field"
                    collections={mongoCollections}
                    currentCollectionId={selectedCollection.id}
                  />
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  preset="primary"
                  className="h-10 px-3!"
                  onClick={() => addField(selectedCollection.id)}
                >
                  <Plus className="h-4 w-4" />
                  Add field
                </Button>
              </div>

              <div className="space-y-2 rounded-lg border bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-700">
                      Sample document inference
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Paste one or more example JSON documents. We&apos;ll infer
                      fields and types for this collection.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    preset="outline"
                    onClick={inferFieldsFromSample}
                  >
                    Infer fields
                  </Button>
                </div>
                <Textarea
                  className="border-stock text-foreground h-32 w-full rounded-[1rem] border bg-white p-4 text-sm"
                  value={sampleDoc}
                  onChange={(event) => setSampleDoc(event.target.value)}
                  placeholder="Paste a sample JSON document"
                />
              </div>
            </div>
          )}

          {activeTab === 'indexes' && (
            <div className="space-y-4">
              {selectedCollection.indexes.length === 0 ? (
                <div className="rounded-lg border bg-gray-50 p-4 text-center">
                  <p className="text-sm text-gray-600">
                    No indexes yet. Click &quot;Add index&quot; to define one.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedCollection.indexes.map((index) => (
                    <div
                      key={index.id}
                      className="space-y-3 rounded-lg border bg-gray-50 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-1 space-y-2">
                          <label className="text-xs font-semibold text-gray-700">
                            Index name
                          </label>
                          <Input
                            className="border-stock text-foreground h-[3.5rem] rounded-[1rem] border bg-white px-4 text-sm"
                            value={index.name}
                            onChange={(event) =>
                              updateIndex(selectedCollection.id, index.id, {
                                name: event.target.value,
                              })
                            }
                            placeholder="status_1"
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                          <Checkbox
                            checked={index.unique}
                            onCheckedChange={(checked) =>
                              updateIndex(selectedCollection.id, index.id, {
                                unique: checked === true,
                              })
                            }
                          />
                          <span className="text-xs text-gray-700">Unique</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="grid grid-cols-[2fr_1fr_auto] gap-3 border-b border-gray-200 px-2 pb-2">
                          <div className="text-xs font-semibold tracking-tight text-gray-500 uppercase">
                            FIELD
                          </div>
                          <div className="text-xs font-semibold tracking-tight text-gray-500 uppercase">
                            ORDER
                          </div>
                          <div className="text-xs font-semibold tracking-tight text-gray-500 uppercase"></div>
                        </div>

                        {index.fields.length === 0 ? (
                          <div className="rounded-lg border bg-white p-4 text-center">
                            <p className="text-sm text-gray-600">
                              No index fields yet.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2 pt-2">
                            {index.fields.map((indexField) => (
                              <div
                                key={indexField.id}
                                className="grid grid-cols-[2fr_1fr_auto] items-center gap-3"
                              >
                                <Select
                                  value={indexField.fieldName}
                                  onValueChange={(value) =>
                                    updateIndexField(
                                      selectedCollection.id,
                                      index.id,
                                      indexField.id,
                                      { fieldName: value }
                                    )
                                  }
                                >
                                  <SelectTrigger className="border-stock text-foreground h-[3.5rem] rounded-[1rem] border bg-white px-4 text-sm">
                                    <SelectValue placeholder="Field" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {topLevelFieldNames.map((fieldName) => (
                                      <SelectItem
                                        key={fieldName}
                                        value={fieldName}
                                      >
                                        {fieldName}
                                      </SelectItem>
                                    ))}
                                    {topLevelFieldNames.length === 0 && (
                                      <SelectItem value="" disabled>
                                        Add fields first
                                      </SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>
                                <Select
                                  value={indexField.order === 1 ? '1' : '-1'}
                                  onValueChange={(value) =>
                                    updateIndexField(
                                      selectedCollection.id,
                                      index.id,
                                      indexField.id,
                                      { order: value === '1' ? 1 : -1 }
                                    )
                                  }
                                >
                                  <SelectTrigger className="border-stock text-foreground h-[3.5rem] rounded-[1rem] border bg-white px-4 text-sm">
                                    <SelectValue placeholder="Order" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1">
                                      Ascending (1)
                                    </SelectItem>
                                    <SelectItem value="-1">
                                      Descending (-1)
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <div className="flex items-center justify-center">
                                  {index.fields.length > 1 && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        removeIndexField(
                                          selectedCollection.id,
                                          index.id,
                                          indexField.id
                                        )
                                      }
                                      className="h-8 w-8 p-0"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <Button
                            preset="outline"
                            className="h-10 px-3!"
                            onClick={() =>
                              addIndexField(selectedCollection.id, index.id)
                            }
                          >
                            <Plus className="h-4 w-4" />
                            Add index field
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              removeIndex(selectedCollection.id, index.id)
                            }
                            className="text-destructive hover:text-destructive/90"
                          >
                            Remove index
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  preset="primary"
                  className="h-10 px-3!"
                  onClick={() => addIndex(selectedCollection.id)}
                >
                  <Plus className="h-4 w-4" />
                  Add index
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedCollection && mongoCollections.length > 0 && (
        <div className="rounded-lg border bg-gray-50 p-8 text-center">
          <p className="text-sm text-gray-600">
            Select a collection to edit fields and indexes
          </p>
        </div>
      )}
    </div>
  )
}

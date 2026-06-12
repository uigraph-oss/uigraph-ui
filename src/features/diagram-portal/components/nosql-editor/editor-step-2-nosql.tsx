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
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { useEditorContext } from './editor-context'
import {
  DocumentCollectionSchema,
  DocumentIndexSchema,
  NestedFieldSchema,
  NoSqlFieldSchema,
} from './nosql-schema'

export function EditorStep2NoSQL() {
  const { jsonSchema, setJsonSchema } = useEditorContext()

  const documentCollections = jsonSchema.collections
  function setDocumentCollections(
    updater: (
      prev: Array<z.infer<typeof DocumentCollectionSchema>>
    ) => Array<z.infer<typeof DocumentCollectionSchema>>
  ) {
    setJsonSchema({
      ...jsonSchema,
      collections: updater(jsonSchema.collections),
    })
  }
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    string | null
  >(null)

  const [documentEditorTab, setDocumentEditorTab] = useState<
    'fields' | 'indexes'
  >('fields')

  const [sampleDoc, setSampleDoc] = useState('')

  const [expandedObjectFields, setExpandedObjectFields] = useState<
    Map<string, Set<string>>
  >(new Map())

  const selectedCollection = useMemo(
    () =>
      documentCollections.find(
        (collection) => collection.id === selectedCollectionId
      ) || null,
    [documentCollections, selectedCollectionId]
  )

  function addCollection() {
    const id = generateUUID()
    const next = {
      id,
      name: `collection_${documentCollections.length + 1}`,
      description: '',
      tags: '',
      fields: [],
      indexes: [],
    }
    setDocumentCollections((prev) => [...prev, next])
    setSelectedCollectionId(id)
  }

  function updateCollection(
    collectionId: string,
    patch: Partial<z.infer<typeof DocumentCollectionSchema>>
  ) {
    setDocumentCollections((prev) =>
      prev.map((collection) =>
        collection.id === collectionId
          ? { ...collection, ...patch }
          : collection
      )
    )
  }

  function addField(collectionId: string) {
    setDocumentCollections((prev) =>
      prev.map((collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              fields: [
                ...collection.fields,
                {
                  id: generateUUID(),
                  name: '',
                  type: '',
                  required: false,
                  isArray: false,
                },
              ],
            }
          : collection
      )
    )
  }

  function updateObjectFields(
    collectionId: string,
    fieldId: string,
    fields: Array<z.infer<typeof NestedFieldSchema>>
  ) {
    setDocumentCollections((prev) =>
      prev.map((collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              fields: collection.fields.map((field) =>
                field.id === fieldId ? { ...field, fields } : field
              ),
            }
          : collection
      )
    )
  }

  function addNestedField(collectionId: string, fieldId: string) {
    const collection = documentCollections.find((c) => c.id === collectionId)
    if (!collection) return

    const field = collection.fields.find((f) => f.id === fieldId)
    if (!field) return

    const currentFields = field.fields || []
    updateObjectFields(collectionId, fieldId, [
      ...currentFields,
      {
        id: generateUUID(),
        name: '',
        type: '',
        required: false,
      },
    ])
  }

  function updateNestedField(
    collectionId: string,
    fieldId: string,
    nestedFieldId: string,
    patch: Partial<z.infer<typeof NestedFieldSchema>>
  ) {
    const collection = documentCollections.find((c) => c.id === collectionId)
    if (!collection) return

    const field = collection.fields.find((f) => f.id === fieldId)
    if (!field || !field.fields) return

    updateObjectFields(
      collectionId,
      fieldId,
      field.fields.map((nestedField) =>
        nestedField.id === nestedFieldId
          ? { ...nestedField, ...patch }
          : nestedField
      )
    )
  }

  function removeNestedField(
    collectionId: string,
    fieldId: string,
    nestedFieldId: string
  ) {
    const collection = documentCollections.find((c) => c.id === collectionId)
    if (!collection) return

    const field = collection.fields.find((f) => f.id === fieldId)
    if (!field || !field.fields) return

    updateObjectFields(
      collectionId,
      fieldId,
      field.fields.filter((f) => f.id !== nestedFieldId)
    )
  }

  function toggleFieldExpanded(collectionId: string, fieldId: string) {
    setExpandedObjectFields((prev) => {
      const next = new Map(prev)
      const fieldSet = next.get(collectionId) || new Set<string>()

      if (fieldSet.has(fieldId)) {
        fieldSet.delete(fieldId)
      } else {
        fieldSet.add(fieldId)
      }

      next.set(collectionId, fieldSet)
      return next
    })
  }

  function isFieldExpanded(collectionId: string, fieldId: string): boolean {
    const fieldSet = expandedObjectFields.get(collectionId)
    return fieldSet?.has(fieldId) || false
  }

  function updateField(
    collectionId: string,
    fieldId: string,
    patch: Partial<z.infer<typeof NoSqlFieldSchema>>
  ) {
    setDocumentCollections((prev) =>
      prev.map((collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              fields: collection.fields.map((field) => {
                if (field.id === fieldId) {
                  const updated = { ...field, ...patch }
                  if (patch.type && patch.type !== 'object') {
                    updated.fields = undefined
                  }
                  if (patch.type && patch.type !== 'array') {
                    updated.itemType = undefined
                    updated.itemFields = undefined
                  } else if (patch.type === 'array' && !updated.itemType) {
                    updated.itemType = 'string'
                  }
                  return updated
                }
                return field
              }),
            }
          : collection
      )
    )
  }

  function removeField(collectionId: string, fieldId: string) {
    setDocumentCollections((prev) =>
      prev.map((collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              fields: collection.fields.filter((field) => field.id !== fieldId),
            }
          : collection
      )
    )
  }

  function addIndex(collectionId: string) {
    setDocumentCollections((prev) =>
      prev.map((collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              indexes: [
                ...collection.indexes,
                {
                  id: generateUUID(),
                  name: `idx_${collection.indexes.length + 1}`,
                  fields: [],
                  unique: false,
                  ttl: '',
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
    patch: Partial<z.infer<typeof DocumentIndexSchema>>
  ) {
    setDocumentCollections((prev) =>
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
    setDocumentCollections((prev) =>
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
      ): z.infer<typeof NoSqlFieldSchema> {
        const field: z.infer<typeof NoSqlFieldSchema> = {
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
          isArray: false,
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

      updateCollection(selectedCollection.id, { fields: inferred })
      toast.success('Fields inferred from sample')
    } catch {
      toast.error('Invalid JSON sample')
    }
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Collections</p>
        <Button size="sm" onClick={addCollection}>
          <Plus className="h-4 w-4" />
          Add Collection
        </Button>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="w-full max-w-[320px] space-y-2 rounded-lg border p-2">
          {documentCollections.length === 0 && (
            <div className="text-paragraph p-2 text-xs">No collections yet</div>
          )}
          {documentCollections.map((collection) => (
            <div
              key={collection.id}
              className={cn(
                'cursor-pointer rounded border p-2 text-sm',
                selectedCollectionId === collection.id
                  ? 'border-primary bg-blue-50'
                  : 'border-stock'
              )}
              onClick={() => setSelectedCollectionId(collection.id)}
            >
              <Input
                className="border-stock text-foreground h-[3.5rem] w-full rounded-[1rem] border bg-white px-4 text-sm"
                value={collection.name}
                onChange={(event) =>
                  updateCollection(collection.id, {
                    name: event.target.value,
                  })
                }
              />
              <p className="text-paragraph mt-1 text-xs">
                {collection.fields.length} fields • {collection.indexes.length}{' '}
                indexes
              </p>
            </div>
          ))}
        </div>
        <div className="flex-1 space-y-3 rounded-lg border p-3">
          {selectedCollection ? (
            <>
              <div className="flex flex-wrap gap-3">
                <div className="min-w-[220px] flex-1 space-y-2">
                  <label className="text-xs font-semibold text-gray-700">
                    Display label
                  </label>
                  <Input
                    className="border-stock text-foreground h-[3.5rem] w-full rounded-[1rem] border bg-white px-4 text-sm"
                    value={selectedCollection.label || ''}
                    onChange={(event) =>
                      updateCollection(selectedCollection.id, {
                        label: event.target.value,
                      })
                    }
                    placeholder="Invoices"
                  />
                </div>
                <div className="min-w-[220px] flex-1 space-y-2">
                  <label className="text-xs font-semibold text-gray-700">
                    Tags
                  </label>
                  <Input
                    className="border-stock text-foreground h-[3.5rem] w-full rounded-[1rem] border bg-white px-4 text-sm"
                    value={selectedCollection.tags || ''}
                    onChange={(event) =>
                      updateCollection(selectedCollection.id, {
                        tags: event.target.value,
                      })
                    }
                    placeholder="billing,finance"
                  />
                </div>
                <div className="w-full space-y-2">
                  <label className="text-xs font-semibold text-gray-700">
                    Description
                  </label>
                  <Textarea
                    className="border-stock text-foreground w-full rounded-[1rem] border bg-white p-4 text-sm"
                    value={selectedCollection.description || ''}
                    onChange={(event) =>
                      updateCollection(selectedCollection.id, {
                        description: event.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    preset={
                      documentEditorTab === 'fields' ? 'primary' : 'outline'
                    }
                    onClick={() => setDocumentEditorTab('fields')}
                  >
                    Fields
                  </Button>
                  <Button
                    size="sm"
                    preset={
                      documentEditorTab === 'indexes' ? 'primary' : 'outline'
                    }
                    onClick={() => setDocumentEditorTab('indexes')}
                  >
                    Indexes
                  </Button>
                </div>
                {documentEditorTab === 'fields' && (
                  <Button
                    size="sm"
                    onClick={() => addField(selectedCollection.id)}
                  >
                    <Plus className="h-4 w-4" />
                    Add field
                  </Button>
                )}
                {documentEditorTab === 'indexes' && (
                  <Button
                    size="sm"
                    onClick={() => addIndex(selectedCollection.id)}
                  >
                    <Plus className="h-4 w-4" />
                    Add index
                  </Button>
                )}
              </div>
              {documentEditorTab === 'fields' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Fields</p>
                      <Button
                        size="sm"
                        onClick={() => addField(selectedCollection.id)}
                      >
                        <Plus className="h-4 w-4" />
                        Add Field
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600">
                      Define the fields in this collection. Fields can be nested
                      objects or arrays.
                    </p>
                  </div>

                  {selectedCollection.fields.length === 0 ? (
                    <div className="rounded-lg border bg-gray-50 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">No fields yet.</p>
                        <Button
                          size="sm"
                          onClick={() => addField(selectedCollection.id)}
                        >
                          <Plus className="h-4 w-4" />
                          Add Field
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border bg-gray-50 p-3">
                      <div className="grid grid-cols-[2fr_1.5fr_auto_1fr_auto] gap-3 border-b border-gray-200 px-2 pb-2">
                        <div className="text-xs font-semibold tracking-tight text-gray-500 uppercase">
                          NAME
                        </div>
                        <div className="text-xs font-semibold tracking-tight text-gray-500 uppercase">
                          TYPE
                        </div>
                        <div className="text-xs font-semibold tracking-tight text-gray-500 uppercase">
                          REQUIRED
                        </div>
                        <div className="text-xs font-semibold tracking-tight text-gray-500 uppercase">
                          REFERENCE
                        </div>
                        <div className="text-xs font-semibold tracking-tight text-gray-500 uppercase"></div>
                      </div>

                      <div className="space-y-2 pt-2">
                        {selectedCollection.fields.map((field) => {
                          const showRemoveButton =
                            selectedCollection.fields.length > 1
                          const isObject = field.type === 'object'
                          const isArray = field.type === 'array'
                          const isArrayOfObjects =
                            isArray && field.itemType === 'object'
                          const objectFieldsCount = field.fields?.length || 0
                          const arrayFieldsCount = field.itemFields?.length || 0
                          const isExpanded = isFieldExpanded(
                            selectedCollection.id,
                            field.id
                          )
                          const nestedFields = field.fields || []

                          return (
                            <div key={field.id} className="space-y-2">
                              <div className="grid grid-cols-[2fr_1.5fr_auto_1fr_auto] items-center gap-3">
                                <Input
                                  className="border-stock text-foreground h-[3.5rem] rounded-[1rem] border bg-white px-4 text-sm"
                                  value={field.name}
                                  onChange={(event) =>
                                    updateField(
                                      selectedCollection.id,
                                      field.id,
                                      {
                                        name: event.target.value,
                                      }
                                    )
                                  }
                                  placeholder="Field name"
                                />

                                <div className="flex flex-wrap items-center gap-2">
                                  <Select
                                    value={field.type || undefined}
                                    onValueChange={(value) => {
                                      const updates: Partial<
                                        z.infer<typeof NoSqlFieldSchema>
                                      > = {
                                        type: value,
                                      }
                                      if (value !== 'object') {
                                        updates.fields = undefined
                                        setExpandedObjectFields((prev) => {
                                          const next = new Map(prev)
                                          const fieldSet =
                                            next.get(selectedCollection.id) ||
                                            new Set()
                                          fieldSet.delete(field.id)
                                          next.set(
                                            selectedCollection.id,
                                            fieldSet
                                          )
                                          return next
                                        })
                                      }
                                      if (value !== 'array') {
                                        updates.itemType = undefined
                                        updates.itemFields = undefined
                                      } else if (!field.itemType) {
                                        updates.itemType = 'string'
                                      }
                                      if (value === 'array') {
                                        updates.isArray = false
                                      }
                                      updateField(
                                        selectedCollection.id,
                                        field.id,
                                        updates
                                      )
                                    }}
                                  >
                                    <SelectTrigger className="border-stock text-foreground h-[3.5rem] min-w-[120px] flex-1 rounded-[1rem] border bg-white px-4 text-sm">
                                      <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="string">
                                        string
                                      </SelectItem>
                                      <SelectItem value="number">
                                        number
                                      </SelectItem>
                                      <SelectItem value="boolean">
                                        boolean
                                      </SelectItem>
                                      <SelectItem value="date">date</SelectItem>
                                      <SelectItem value="object">
                                        object
                                      </SelectItem>
                                      <SelectItem value="array">
                                        array
                                      </SelectItem>
                                      <SelectItem value="mixed">
                                        mixed
                                      </SelectItem>
                                      <SelectItem value="reference">
                                        reference
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>

                                  {isObject && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        toggleFieldExpanded(
                                          selectedCollection.id,
                                          field.id
                                        )
                                      }
                                      className="h-[3.5rem] text-xs whitespace-nowrap"
                                    >
                                      Edit fields
                                      {objectFieldsCount > 0 && (
                                        <span className="ml-1 text-gray-500">
                                          · {objectFieldsCount}
                                        </span>
                                      )}
                                    </Button>
                                  )}

                                  {isArray && (
                                    <Select
                                      value={field.itemType || 'string'}
                                      onValueChange={(value) => {
                                        const updates: Partial<
                                          z.infer<typeof NoSqlFieldSchema>
                                        > = {
                                          itemType: value,
                                        }
                                        if (value !== 'object') {
                                          updates.itemFields = undefined
                                        }
                                        updateField(
                                          selectedCollection.id,
                                          field.id,
                                          updates
                                        )
                                      }}
                                    >
                                      <SelectTrigger className="border-stock text-foreground h-[3.5rem] min-w-[100px] rounded-[1rem] border bg-white px-3 text-xs">
                                        <SelectValue placeholder="Item type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="string">
                                          string
                                        </SelectItem>
                                        <SelectItem value="number">
                                          number
                                        </SelectItem>
                                        <SelectItem value="boolean">
                                          boolean
                                        </SelectItem>
                                        <SelectItem value="date">
                                          date
                                        </SelectItem>
                                        <SelectItem value="object">
                                          object
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  )}

                                  {isArrayOfObjects && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        toggleFieldExpanded(
                                          selectedCollection.id,
                                          field.id
                                        )
                                      }
                                      className="h-[3.5rem] text-xs whitespace-nowrap"
                                    >
                                      Edit item fields
                                      {arrayFieldsCount > 0 && (
                                        <span className="ml-1 text-gray-500">
                                          · {arrayFieldsCount}
                                        </span>
                                      )}
                                    </Button>
                                  )}
                                </div>

                                <div className="flex items-center justify-center">
                                  <Checkbox
                                    checked={field.required}
                                    onCheckedChange={(checked) =>
                                      updateField(
                                        selectedCollection.id,
                                        field.id,
                                        {
                                          required: Boolean(checked),
                                        }
                                      )
                                    }
                                  />
                                </div>

                                <Select
                                  value={field.reference?.collectionId || ''}
                                  onValueChange={(value) =>
                                    updateField(
                                      selectedCollection.id,
                                      field.id,
                                      {
                                        reference: value
                                          ? { collectionId: value }
                                          : undefined,
                                      }
                                    )
                                  }
                                >
                                  <SelectTrigger className="border-stock text-foreground h-[3.5rem] rounded-[1rem] border bg-white px-4 text-sm">
                                    <SelectValue placeholder="Reference" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="__none__">
                                      No reference
                                    </SelectItem>
                                    {documentCollections
                                      .filter(
                                        (collection) =>
                                          collection.id !==
                                          selectedCollection.id
                                      )
                                      .map((collection) => (
                                        <SelectItem
                                          key={collection.id}
                                          value={collection.id}
                                        >
                                          {collection.name}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>

                                <div className="flex items-center justify-center">
                                  {showRemoveButton && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        removeField(
                                          selectedCollection.id,
                                          field.id
                                        )
                                      }
                                      className="h-8 w-8 p-0"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>

                              {isObject && isExpanded && (
                                <div className="ml-4 rounded-lg border bg-white p-3">
                                  <div className="mb-3 flex items-center justify-between">
                                    <p className="text-xs font-semibold text-gray-700">
                                      Nested fields for &quot;
                                      {field.name || 'unnamed'}&quot;
                                    </p>
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        addNestedField(
                                          selectedCollection.id,
                                          field.id
                                        )
                                      }
                                    >
                                      <Plus className="h-4 w-4" />
                                      Add nested field
                                    </Button>
                                  </div>

                                  {nestedFields.length === 0 ? (
                                    <div className="rounded-lg border bg-gray-50 p-4 text-center">
                                      <p className="text-sm text-gray-600">
                                        No nested fields yet.
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <div className="grid grid-cols-[2fr_1.2fr_auto_auto] gap-3 border-b border-gray-200 px-2 pb-2">
                                        <div className="text-xs font-semibold tracking-tight text-gray-500 uppercase">
                                          NAME
                                        </div>
                                        <div className="text-xs font-semibold tracking-tight text-gray-500 uppercase">
                                          TYPE
                                        </div>
                                        <div className="text-xs font-semibold tracking-tight text-gray-500 uppercase">
                                          REQUIRED
                                        </div>
                                        <div className="text-xs font-semibold tracking-tight text-gray-500 uppercase"></div>
                                      </div>

                                      <div className="space-y-2 pt-2">
                                        {nestedFields.map((nestedField) => {
                                          const showRemoveNestedButton =
                                            nestedFields.length > 1

                                          return (
                                            <div
                                              key={nestedField.id}
                                              className="grid grid-cols-[2fr_1.2fr_auto_auto] items-center gap-3"
                                            >
                                              <Input
                                                className="border-stock text-foreground h-[3.5rem] rounded-[1rem] border bg-white px-4 text-sm"
                                                value={nestedField.name}
                                                onChange={(event) =>
                                                  updateNestedField(
                                                    selectedCollection.id,
                                                    field.id,
                                                    nestedField.id,
                                                    { name: event.target.value }
                                                  )
                                                }
                                                placeholder="Field name"
                                              />
                                              <Select
                                                value={
                                                  nestedField.type || undefined
                                                }
                                                onValueChange={(value) =>
                                                  updateNestedField(
                                                    selectedCollection.id,
                                                    field.id,
                                                    nestedField.id,
                                                    { type: value }
                                                  )
                                                }
                                              >
                                                <SelectTrigger className="border-stock text-foreground h-[3.5rem] rounded-[1rem] border bg-white px-4 text-sm">
                                                  <SelectValue placeholder="Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="string">
                                                    string
                                                  </SelectItem>
                                                  <SelectItem value="number">
                                                    number
                                                  </SelectItem>
                                                  <SelectItem value="boolean">
                                                    boolean
                                                  </SelectItem>
                                                  <SelectItem value="date">
                                                    date
                                                  </SelectItem>
                                                  <SelectItem value="object">
                                                    object
                                                  </SelectItem>
                                                  <SelectItem value="array">
                                                    array
                                                  </SelectItem>
                                                  <SelectItem value="mixed">
                                                    mixed
                                                  </SelectItem>
                                                </SelectContent>
                                              </Select>
                                              <div className="flex items-center justify-center">
                                                <Checkbox
                                                  checked={nestedField.required}
                                                  onCheckedChange={(checked) =>
                                                    updateNestedField(
                                                      selectedCollection.id,
                                                      field.id,
                                                      nestedField.id,
                                                      {
                                                        required:
                                                          checked === true,
                                                      }
                                                    )
                                                  }
                                                />
                                              </div>
                                              <div className="flex items-center justify-center">
                                                {showRemoveNestedButton && (
                                                  <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                      removeNestedField(
                                                        selectedCollection.id,
                                                        field.id,
                                                        nestedField.id
                                                      )
                                                    }
                                                    className="h-8 w-8 p-0"
                                                  >
                                                    <X className="h-4 w-4" />
                                                  </Button>
                                                )}
                                              </div>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {isArrayOfObjects && isExpanded && (
                                <div className="ml-4 rounded-lg border bg-white p-3">
                                  <div className="mb-3 flex items-center justify-between">
                                    <p className="text-xs font-semibold text-gray-700">
                                      Item fields for &quot;
                                      {field.name || 'unnamed'}[]&quot;
                                    </p>
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        const currentFields =
                                          field.itemFields || []
                                        updateField(
                                          selectedCollection.id,
                                          field.id,
                                          {
                                            itemFields: [
                                              ...currentFields,
                                              {
                                                id: generateUUID(),
                                                name: '',
                                                type: '',
                                                required: false,
                                              },
                                            ],
                                          }
                                        )
                                      }}
                                    >
                                      <Plus className="h-4 w-4" />
                                      Add item field
                                    </Button>
                                  </div>

                                  {(field.itemFields || []).length === 0 ? (
                                    <div className="rounded-lg border bg-gray-50 p-4 text-center">
                                      <p className="text-sm text-gray-600">
                                        No item fields yet.
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <div className="grid grid-cols-[2fr_1.2fr_auto_auto] gap-3 border-b border-gray-200 px-2 pb-2">
                                        <div className="text-xs font-semibold tracking-tight text-gray-500 uppercase">
                                          NAME
                                        </div>
                                        <div className="text-xs font-semibold tracking-tight text-gray-500 uppercase">
                                          TYPE
                                        </div>
                                        <div className="text-xs font-semibold tracking-tight text-gray-500 uppercase">
                                          REQUIRED
                                        </div>
                                        <div className="text-xs font-semibold tracking-tight text-gray-500 uppercase"></div>
                                      </div>

                                      <div className="space-y-2 pt-2">
                                        {(field.itemFields || []).map(
                                          (itemField) => (
                                            <div
                                              key={itemField.id}
                                              className="grid grid-cols-[2fr_1.2fr_auto_auto] items-center gap-3"
                                            >
                                              <Input
                                                className="border-stock text-foreground h-[3.5rem] rounded-[1rem] border bg-white px-4 text-sm"
                                                value={itemField.name}
                                                onChange={(event) => {
                                                  const currentFields =
                                                    field.itemFields || []
                                                  updateField(
                                                    selectedCollection.id,
                                                    field.id,
                                                    {
                                                      itemFields:
                                                        currentFields.map(
                                                          (f) =>
                                                            f.id ===
                                                            itemField.id
                                                              ? {
                                                                  ...f,
                                                                  name: event
                                                                    .target
                                                                    .value,
                                                                }
                                                              : f
                                                        ),
                                                    }
                                                  )
                                                }}
                                                placeholder="Field name"
                                              />
                                              <Select
                                                value={
                                                  itemField.type || undefined
                                                }
                                                onValueChange={(value) => {
                                                  const currentFields =
                                                    field.itemFields || []
                                                  updateField(
                                                    selectedCollection.id,
                                                    field.id,
                                                    {
                                                      itemFields:
                                                        currentFields.map(
                                                          (f) =>
                                                            f.id ===
                                                            itemField.id
                                                              ? {
                                                                  ...f,
                                                                  type: value,
                                                                }
                                                              : f
                                                        ),
                                                    }
                                                  )
                                                }}
                                              >
                                                <SelectTrigger className="border-stock text-foreground h-[3.5rem] rounded-[1rem] border bg-white px-4 text-sm">
                                                  <SelectValue placeholder="Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="string">
                                                    string
                                                  </SelectItem>
                                                  <SelectItem value="number">
                                                    number
                                                  </SelectItem>
                                                  <SelectItem value="boolean">
                                                    boolean
                                                  </SelectItem>
                                                  <SelectItem value="date">
                                                    date
                                                  </SelectItem>
                                                  <SelectItem value="object">
                                                    object
                                                  </SelectItem>
                                                  <SelectItem value="array">
                                                    array
                                                  </SelectItem>
                                                  <SelectItem value="mixed">
                                                    mixed
                                                  </SelectItem>
                                                </SelectContent>
                                              </Select>
                                              <div className="flex items-center justify-center">
                                                <Checkbox
                                                  checked={itemField.required}
                                                  onCheckedChange={(
                                                    checked
                                                  ) => {
                                                    const currentFields =
                                                      field.itemFields || []
                                                    updateField(
                                                      selectedCollection.id,
                                                      field.id,
                                                      {
                                                        itemFields:
                                                          currentFields.map(
                                                            (f) =>
                                                              f.id ===
                                                              itemField.id
                                                                ? {
                                                                    ...f,
                                                                    required:
                                                                      checked ===
                                                                      true,
                                                                  }
                                                                : f
                                                          ),
                                                      }
                                                    )
                                                  }}
                                                />
                                              </div>
                                              <div className="flex items-center justify-center">
                                                {(field.itemFields || [])
                                                  .length > 1 && (
                                                  <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => {
                                                      const currentFields =
                                                        field.itemFields || []
                                                      updateField(
                                                        selectedCollection.id,
                                                        field.id,
                                                        {
                                                          itemFields:
                                                            currentFields.filter(
                                                              (f) =>
                                                                f.id !==
                                                                itemField.id
                                                            ),
                                                        }
                                                      )
                                                    }}
                                                    className="h-8 w-8 p-0"
                                                  >
                                                    <X className="h-4 w-4" />
                                                  </Button>
                                                )}
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  <div className="space-y-2 rounded border bg-gray-50 p-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-700">
                        Sample document inference
                      </p>
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
              {documentEditorTab === 'indexes' && (
                <div className="space-y-2">
                  {selectedCollection.indexes.map((index) => (
                    <div
                      key={index.id}
                      className="flex flex-wrap items-start gap-2 rounded border p-2"
                    >
                      <Input
                        className="border-stock text-foreground h-[3.5rem] min-w-[160px] flex-1 rounded-[1rem] border bg-white px-4 text-sm"
                        value={index.name}
                        onChange={(event) =>
                          updateIndex(selectedCollection.id, index.id, {
                            name: event.target.value,
                          })
                        }
                        placeholder="Index name"
                      />
                      <Input
                        className="border-stock text-foreground h-[3.5rem] min-w-[200px] flex-1 rounded-[1rem] border bg-white px-4 text-sm"
                        value={index.fields.join(', ')}
                        onChange={(event) =>
                          updateIndex(selectedCollection.id, index.id, {
                            fields: event.target.value
                              .split(',')
                              .map((field) => field.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder="Fields (comma separated)"
                      />
                      <div className="flex min-w-[120px] items-center gap-2">
                        <Checkbox
                          checked={index.unique}
                          onCheckedChange={(checked) =>
                            updateIndex(selectedCollection.id, index.id, {
                              unique: Boolean(checked),
                            })
                          }
                        />
                        <span className="text-xs text-gray-600">Unique</span>
                      </div>
                      <Input
                        className="border-stock text-foreground h-[3.5rem] min-w-[140px] flex-1 rounded-[1rem] border bg-white px-4 text-sm"
                        value={index.ttl || ''}
                        onChange={(event) =>
                          updateIndex(selectedCollection.id, index.id, {
                            ttl: event.target.value,
                          })
                        }
                        placeholder="TTL (sec)"
                      />
                      <div className="flex w-full justify-end">
                        <Button
                          size="sm"
                          preset="outline"
                          onClick={() =>
                            removeIndex(selectedCollection.id, index.id)
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-paragraph text-sm">
              Select a collection to edit fields and indexes
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

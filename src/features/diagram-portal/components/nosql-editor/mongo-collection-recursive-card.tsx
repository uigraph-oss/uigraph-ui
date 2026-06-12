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
import { cn } from '@/lib/utils'
import { generateUUID } from 'daily-code'
import { ChevronRight, Plus, X } from 'lucide-react'
import { z } from 'zod'
import { MongoCollectionSchema, MongoNestedFieldSchema } from './nosql-schema'

type NestedFieldEditorProps = {
  isFirstLevel?: boolean
  fields: Array<z.infer<typeof MongoNestedFieldSchema>>
  parentLabel: string
  onChange: (fields: Array<z.infer<typeof MongoNestedFieldSchema>>) => void
  normalizeField: (
    field: z.infer<typeof MongoNestedFieldSchema>,
    patch: Partial<z.infer<typeof MongoNestedFieldSchema>>
  ) => z.infer<typeof MongoNestedFieldSchema>
  expanded: Set<string>
  onToggle: (fieldId: string) => void
  onCollapse: (fieldId: string) => void
  allowItemFields: boolean
  addLabel: string
  collections: Array<z.infer<typeof MongoCollectionSchema>>
  currentCollectionId: string
}

export function MongoCollectionRecursiveCard({
  isFirstLevel,
  fields,
  parentLabel,
  onChange,
  normalizeField,
  expanded,
  onToggle,
  onCollapse,
  allowItemFields,
  addLabel,
  collections,
  currentCollectionId,
}: NestedFieldEditorProps) {
  function addField() {
    onChange([
      ...fields,
      { id: generateUUID(), name: '', type: 'string', required: false },
    ])
  }

  function updateField(
    fieldId: string,
    patch: Partial<z.infer<typeof MongoNestedFieldSchema>>
  ) {
    onChange(
      fields.map((field) =>
        field.id === fieldId ? normalizeField(field, patch) : field
      )
    )
  }

  function setChildFields(
    fieldId: string,
    key: 'fields' | 'itemFields',
    nextFields: Array<z.infer<typeof MongoNestedFieldSchema>>
  ) {
    onChange(
      fields.map((field) =>
        field.id === fieldId ? { ...field, [key]: nextFields } : field
      )
    )
  }

  function removeField(fieldId: string) {
    onChange(fields.filter((field) => field.id !== fieldId))
  }

  return (
    <div
      className={cn('rounded-lg border bg-white p-3', !isFirstLevel && 'ml-4')}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-700">{parentLabel}</p>

        {!isFirstLevel && (
          <Button preset="outline" className="h-10 px-3!" onClick={addField}>
            <Plus className="h-4 w-4" />
            {addLabel}
          </Button>
        )}
      </div>

      {fields.length === 0 ? (
        <div className="rounded-lg border bg-gray-50 p-4 text-center">
          <p className="text-sm text-gray-600">No nested fields yet.</p>
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
            {fields.map((field) => {
              const isObject = field.type === 'object'
              const isArray = field.type === 'array'
              const isArrayOfObjects = isArray && field.itemType === 'object'
              const isReference = field.type === 'reference'
              const nestedFieldCount = field.fields?.length || 0
              const itemFieldCount = field.itemFields?.length || 0
              const isExpanded = expanded.has(field.id)

              return (
                <div key={field.id} className="space-y-2">
                  <div className="grid grid-cols-[2fr_1.2fr_auto_auto] items-center gap-3">
                    <Input
                      className="border-stock text-foreground h-[3.5rem] rounded-[1rem] border bg-white px-4 text-sm"
                      value={field.name}
                      onChange={(event) =>
                        updateField(field.id, { name: event.target.value })
                      }
                      placeholder="Field name"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <Select
                        value={field.type}
                        onValueChange={(value) => {
                          updateField(field.id, { type: value })
                          if (value !== 'object' && value !== 'array') {
                            onCollapse(field.id)
                          }
                        }}
                      >
                        <SelectTrigger className="border-stock text-foreground h-[3.5rem] min-w-[120px] flex-1 rounded-[1rem] border bg-white px-4 text-sm">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">string</SelectItem>
                          <SelectItem value="number">number</SelectItem>
                          <SelectItem value="boolean">boolean</SelectItem>
                          <SelectItem value="date">date</SelectItem>
                          <SelectItem value="object">object</SelectItem>
                          <SelectItem value="array">array</SelectItem>
                          <SelectItem value="reference">reference</SelectItem>
                          <SelectItem value="mixed">mixed</SelectItem>
                        </SelectContent>
                      </Select>

                      {isObject && (
                        <button
                          type="button"
                          onClick={() => onToggle(field.id)}
                          className="flex items-center gap-1 rounded-md border border-transparent p-2 text-gray-600 transition-colors hover:bg-gray-50"
                        >
                          <ChevronRight
                            className={cn(
                              'h-4 w-4 transition-transform',
                              isExpanded && 'rotate-90'
                            )}
                          />
                          {nestedFieldCount > 0 && (
                            <span className="text-xs text-gray-500">
                              {nestedFieldCount}
                            </span>
                          )}
                        </button>
                      )}

                      {isArray && (
                        <>
                          <span className="text-xs text-gray-600">
                            Item type
                          </span>
                          <Select
                            value={field.itemType || 'string'}
                            onValueChange={(value) => {
                              updateField(field.id, { itemType: value })
                              if (value !== 'object') {
                                onCollapse(field.id)
                              }
                            }}
                          >
                            <SelectTrigger className="border-stock text-foreground h-[3.5rem] min-w-[100px] rounded-[1rem] border bg-white px-3 text-xs">
                              <SelectValue placeholder="Item type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="string">string</SelectItem>
                              <SelectItem value="number">number</SelectItem>
                              <SelectItem value="boolean">boolean</SelectItem>
                              <SelectItem value="date">date</SelectItem>
                              <SelectItem value="object">object</SelectItem>
                              <SelectItem value="reference">
                                reference
                              </SelectItem>
                              <SelectItem value="mixed">mixed</SelectItem>
                            </SelectContent>
                          </Select>
                        </>
                      )}

                      {isArrayOfObjects && allowItemFields && (
                        <button
                          type="button"
                          onClick={() => onToggle(field.id)}
                          className="flex items-center gap-1 rounded-md border border-transparent p-2 text-gray-600 transition-colors hover:bg-gray-50"
                        >
                          <ChevronRight
                            className={cn(
                              'h-4 w-4 transition-transform',
                              isExpanded && 'rotate-90'
                            )}
                          />
                          {itemFieldCount > 0 && (
                            <span className="text-xs text-gray-500">
                              {itemFieldCount}
                            </span>
                          )}
                        </button>
                      )}

                      {isReference && (
                        <Select
                          value={field.refCollectionId || ''}
                          onValueChange={(value) =>
                            updateField(field.id, {
                              refCollectionId: value || null,
                            })
                          }
                        >
                          <SelectTrigger className="border-stock text-foreground h-[3.5rem] min-w-[140px] rounded-[1rem] border bg-white px-4 text-sm">
                            <SelectValue placeholder="Target collection" />
                          </SelectTrigger>
                          <SelectContent>
                            {collections
                              .filter((c) => c.id !== currentCollectionId)
                              .map((collection) => (
                                <SelectItem
                                  key={collection.id}
                                  value={collection.id}
                                >
                                  {collection.name}
                                </SelectItem>
                              ))}
                            {collections.filter(
                              (c) => c.id !== currentCollectionId
                            ).length === 0 && (
                              <SelectItem value="" disabled>
                                Add another collection first
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={field.required}
                        onCheckedChange={(checked) =>
                          updateField(field.id, { required: checked === true })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeField(field.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {isObject && isExpanded && (
                    <MongoCollectionRecursiveCard
                      fields={field.fields || []}
                      parentLabel={`Nested fields for "${field.name || 'unnamed'}"`}
                      onChange={(nextFields) =>
                        setChildFields(field.id, 'fields', nextFields)
                      }
                      normalizeField={normalizeField}
                      expanded={expanded}
                      onToggle={onToggle}
                      onCollapse={onCollapse}
                      allowItemFields={allowItemFields}
                      addLabel="Add nested field"
                      collections={collections}
                      currentCollectionId={currentCollectionId}
                    />
                  )}

                  {allowItemFields && isArrayOfObjects && isExpanded && (
                    <MongoCollectionRecursiveCard
                      fields={field.itemFields || []}
                      parentLabel={`Item fields for "${field.name || 'unnamed'}[]"`}
                      onChange={(nextFields) =>
                        setChildFields(field.id, 'itemFields', nextFields)
                      }
                      normalizeField={normalizeField}
                      expanded={expanded}
                      onToggle={onToggle}
                      onCollapse={onCollapse}
                      allowItemFields={allowItemFields}
                      addLabel="Add item field"
                      collections={collections}
                      currentCollectionId={currentCollectionId}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

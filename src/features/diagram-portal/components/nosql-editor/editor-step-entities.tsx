import { Button } from '@/components/ui/button'
import { generateUUID } from 'daily-code'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { DynamoRecursiveAttributeCard } from './dynamo-recursive-attribute-card'
import { useEditorContext } from './editor-context'
import { NestedFieldSchema } from './nosql-schema'

export function EditorStepEntities() {
  const { currentDialect, dynamoSchema, setDynamoSchema } = useEditorContext()

  const [expandedAttributes, setExpandedAttributes] = useState<Set<string>>(
    new Set()
  )

  if (!dynamoSchema) return null
  const attributes = dynamoSchema.attributes

  function normalizeField(
    field: z.infer<typeof NestedFieldSchema>,
    patch: Partial<z.infer<typeof NestedFieldSchema>>
  ): z.infer<typeof NestedFieldSchema> {
    const updated: z.infer<typeof NestedFieldSchema> = { ...field, ...patch }
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

  function addAttribute() {
    setDynamoSchema({
      ...dynamoSchema,
      attributes: [
        ...attributes,
        {
          id: generateUUID(),
          name: '',
          type: '',
          required: false,
          notes: '',
        },
      ],
    })
  }

  function replaceAttributes(
    nextFields: Array<z.infer<typeof NestedFieldSchema>>
  ) {
    setDynamoSchema({
      ...dynamoSchema,
      attributes: nextFields.map((field) => {
        const existing = attributes.find(
          (attribute) => attribute.id === field.id
        )
        return existing ? { ...existing, ...field } : { ...field }
      }),
    })
  }

  function toggleAttributeExpanded(fieldId: string) {
    setExpandedAttributes((prev) => {
      const next = new Set(prev)
      if (next.has(fieldId)) {
        next.delete(fieldId)
      } else {
        next.add(fieldId)
      }
      return next
    })
  }

  if (currentDialect !== 'dynamodb') {
    return (
      <div className="space-y-4 rounded-lg border p-4">
        <div className="text-sm text-gray-600">
          Attributes configuration will be implemented here for {currentDialect}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-lg border p-4 [&>*]:ml-0">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold">Attributes</p>
          <p className="text-xs text-gray-600">
            Describe the attributes stored on items in this table. Primary keys
            and indexes are defined in earlier steps.
          </p>
        </div>

        <Button preset="primary" className="h-10 px-3!" onClick={addAttribute}>
          <Plus className="h-4 w-4" />
          Add Attribute
        </Button>
      </div>

      <DynamoRecursiveAttributeCard
        isFirstLevel
        fields={attributes}
        parentLabel="Attributes"
        onChange={replaceAttributes}
        normalizeField={normalizeField}
        expanded={expandedAttributes}
        onToggle={toggleAttributeExpanded}
        allowItemFields
        addLabel="Add attribute"
      />
    </div>
  )
}

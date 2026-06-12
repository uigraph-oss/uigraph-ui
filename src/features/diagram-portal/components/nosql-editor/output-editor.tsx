import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useEditorContext } from './editor-context'
import {
  DynamoEditorSchema,
  JsonEditorSchema,
  MongoEditorSchema,
} from './nosql-schema'
import { OutputEditorView } from './output-editor-view'

export function OutputEditor() {
  const {
    currentDialect,
    dynamoSchema,
    setDynamoSchema,
    mongoSchema,
    setMongoSchema,
    jsonSchema,
    setJsonSchema,
  } = useEditorContext()

  const [editorValue, setEditorValue] = useState('')
  const [hasEditorChanges, setHasEditorChanges] = useState(false)

  const activeSchema =
    currentDialect === 'dynamodb'
      ? dynamoSchema
      : currentDialect === 'mongodb'
        ? mongoSchema
        : jsonSchema

  useEffect(() => {
    const nextValue = JSON.stringify(activeSchema, null, 2)
    setEditorValue(nextValue)
    setHasEditorChanges(false)
  }, [activeSchema])

  function applyEditorChanges(value: string) {
    let parsed: unknown
    try {
      parsed = JSON.parse(value)
    } catch {
      toast.error('Invalid JSON')
      return
    }

    if (typeof parsed !== 'object' || parsed === null) {
      toast.error('Schema must be an object')
      return
    }

    if (currentDialect === 'mongodb') {
      const result = MongoEditorSchema.safeParse(parsed)
      if (!result.success) {
        toast.error('MongoDB schema is invalid')
        return
      }
      setMongoSchema(result.data)
      toast.success('Schema updated')
      return
    }

    if (currentDialect === 'dynamodb') {
      const result = DynamoEditorSchema.safeParse(parsed)
      if (!result.success) {
        toast.error('DynamoDB schema is invalid')
        return
      }
      setDynamoSchema(result.data)
      toast.success('Schema updated')
      return
    }

    if (currentDialect === 'json') {
      const result = JsonEditorSchema.safeParse(parsed)
      if (!result.success) {
        toast.error('JSON schema is invalid')
        return
      }
      setJsonSchema(result.data)
      toast.success('Schema updated')
      return
    }

    toast.error('Unknown dialect')
  }

  return (
    <OutputEditorView
      editorValue={editorValue}
      hasEditorChanges={hasEditorChanges}
      applyEditorChanges={() => applyEditorChanges(editorValue)}
      setEditorValue={(value) => {
        setEditorValue(value)
        setHasEditorChanges(true)
      }}
    />
  )
}

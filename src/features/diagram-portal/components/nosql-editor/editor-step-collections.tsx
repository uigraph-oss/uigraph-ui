import { useEditorContext } from './editor-context'
import { EditorStep2NoSQL } from './editor-step-2-nosql'
import { EditorStepMongoDBCollections } from './editor-step-mongodb-collections'

export function EditorStepCollections() {
  const { currentDialect } = useEditorContext()

  if (currentDialect === 'mongodb') {
    return <EditorStepMongoDBCollections />
  }

  if (currentDialect === 'json') {
    return <EditorStep2NoSQL />
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="text-muted-foreground text-sm">
        Collection configuration will be implemented here for {currentDialect}
      </div>
    </div>
  )
}

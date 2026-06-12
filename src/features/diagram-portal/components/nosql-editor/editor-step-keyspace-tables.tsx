import { useEditorContext } from './editor-context'

export function EditorStepKeyspaceTables() {
  const { currentDialect } = useEditorContext()

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="text-sm text-gray-600">
        Keyspace and tables configuration will be implemented here for{' '}
        {currentDialect}
      </div>
    </div>
  )
}

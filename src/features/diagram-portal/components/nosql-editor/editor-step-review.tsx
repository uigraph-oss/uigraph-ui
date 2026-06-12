import { useEditorContext } from './editor-context'

export function EditorStepReview() {
  const { coreSchema, currentDialect, mongoSchema } = useEditorContext()

  if (currentDialect === 'mongodb') {
    if (!mongoSchema) return null

    return (
      <div className="space-y-4 rounded-lg border p-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold">Review schema</p>
          <p className="text-xs text-gray-600">
            Review your MongoDB database, collections, and indexes before
            saving.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-gray-50 p-4">
            <p className="mb-1 text-xs font-semibold text-gray-700">Database</p>
            <p className="text-sm font-medium">
              {coreSchema.name || 'Unnamed'}
            </p>
            {coreSchema.description && (
              <p className="mt-1 text-xs text-gray-600">
                {coreSchema.description}
              </p>
            )}
          </div>

          {mongoSchema.collections.length === 0 ? (
            <div className="rounded-lg border bg-gray-50 p-4 text-center">
              <p className="text-sm text-gray-600">No collections defined</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mongoSchema.collections.map((collection) => {
                const fieldsCount = collection.fields.length
                const indexesCount = collection.indexes.length
                const fieldNames = collection.fields
                  .filter((f) => f.name.trim() !== '')
                  .map((f) => f.name)
                  .slice(0, 5)
                const indexNames = collection.indexes
                  .filter((i) => i.name.trim() !== '')
                  .map((i) => i.name)
                  .slice(0, 5)

                return (
                  <div
                    key={collection.id}
                    className="rounded-lg border bg-gray-50 p-4"
                  >
                    <p className="mb-1 text-xs font-semibold text-gray-700">
                      Collection &quot;{collection.name}&quot;
                    </p>
                    <p className="text-sm text-gray-600">
                      {fieldsCount} field{fieldsCount !== 1 ? 's' : ''} ·{' '}
                      {indexesCount} index{indexesCount !== 1 ? 'es' : ''}
                    </p>
                    {fieldNames.length > 0 && (
                      <div className="mt-2">
                        <p className="mb-1 text-xs text-gray-500">Fields:</p>
                        <p className="text-xs text-gray-600">
                          {fieldNames.join(', ')}
                          {collection.fields.length > 5 && '...'}
                        </p>
                      </div>
                    )}
                    {indexNames.length > 0 && (
                      <div className="mt-2">
                        <p className="mb-1 text-xs text-gray-500">Indexes:</p>
                        <p className="text-xs text-gray-600">
                          {indexNames.join(', ')}
                          {collection.indexes.length > 5 && '...'}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="text-sm text-gray-600">
        Review step will be implemented here for {currentDialect}
      </div>
    </div>
  )
}

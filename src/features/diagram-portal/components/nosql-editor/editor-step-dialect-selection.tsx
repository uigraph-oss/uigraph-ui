import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { DIALECTS, NoSQLDialect } from './dialect-registry'
import { useEditorContext } from './editor-context'

export function EditorStepDialectSelection() {
  const { currentDialect, setCurrentDialect, dialectConfig } =
    useEditorContext()

  const totalSteps =
    currentDialect && dialectConfig ? 1 + dialectConfig.steps.length : 3

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm text-gray-500">
          Step 1 of {totalSteps} · Select database type
        </p>
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">
            Select database type
          </h3>
          <p className="text-sm text-gray-600">
            Pick the NoSQL database you&apos;re designing. We&apos;ll tailor the
            next steps to match.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Object.entries(DIALECTS).map(([dialectId, dialect]) => {
            const isSelected = currentDialect === dialectId
            const Icon = dialect.icon

            return (
              <button
                key={dialectId}
                disabled={dialect.isNotAvailable}
                onClick={() => setCurrentDialect(dialectId as NoSQLDialect)}
                type="button"
                className={cn(
                  'relative flex items-start gap-3 rounded-lg border p-4 text-left transition-all',

                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-stock bg-white',

                  dialect.isNotAvailable
                    ? 'cursor-not-allowed opacity-50'
                    : 'hover:border-primary hover:bg-gray-50'
                )}
              >
                {isSelected && (
                  <div className="bg-primary absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}

                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    isSelected
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1 pr-6">
                  <h3
                    className={cn(
                      'text-sm font-semibold',
                      isSelected ? 'text-primary' : 'text-gray-900'
                    )}
                  >
                    {dialect.label}
                  </h3>
                  <p className="text-xs text-gray-600">{dialect.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

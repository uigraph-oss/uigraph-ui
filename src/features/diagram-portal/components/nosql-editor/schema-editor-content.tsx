import { BetterDialogContent } from '@/components/better-dialog'
import { SuperCircleLoader } from '@/components/loader'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { IoSaveOutline } from 'react-icons/io5'
import { Fragment } from 'react/jsx-runtime'
import { toast } from 'sonner'
import { generateUUID } from '../../utils/uuid'
import {
  convertDynamoSchemaToAst,
  convertJsonSchemaToAst,
  convertMongoSchemaToAst,
} from './convert-ast'
import { getStepLabel } from './dialect-registry'
import { useEditorContext } from './editor-context'
import { EditorStepBasic } from './editor-step-basic'
import { EditorStepCollections } from './editor-step-collections'
import { EditorStepDialectSelection } from './editor-step-dialect-selection'
import { EditorStepEntities } from './editor-step-entities'
import { EditorStepIndexes } from './editor-step-indexes'
import { EditorStepKeyspaceTables } from './editor-step-keyspace-tables'
import { EditorStepPartitioning } from './editor-step-partitioning'
import { EditorStepPrimaryKeys } from './editor-step-primary-keys'
import { EditorStepReview } from './editor-step-review'
import { EditorStepTableKeys } from './editor-step-table-keys'
import {
  DynamoEditorSchema,
  JsonEditorSchema,
  MongoEditorSchema,
} from './nosql-schema'
import { OutputEditor } from './output-editor'

export function NosqlEditorContent() {
  const {
    coreSchema,
    currentDialect,
    currentStepId,
    currentStepIndex,
    dialectConfig,
    canGoBack,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    dynamoSchema,
    mongoSchema,
    jsonSchema,
    initialDataSource,
    isSubmitting,
    setIsSubmitting,
    onSchemaSubmit,
    onOpenChange,
  } = useEditorContext()

  function handleNext() {
    if (currentStepId === 'basic') {
      if (!coreSchema.name.trim()) {
        toast.error(
          currentDialect === 'dynamodb'
            ? 'Table name is required'
            : 'Database name is required'
        )
        return
      }
    }

    if (
      currentDialect === 'dynamodb' &&
      currentStepId === 'tableKeys' &&
      !dynamoSchema?.primaryKey.partitionKey.trim()
    ) {
      toast.error('Partition key is required')
      return
    }

    goToNextStep()
  }

  function validateBeforeSave(): boolean {
    if (!coreSchema.name.trim()) {
      toast.error(
        currentDialect === 'dynamodb'
          ? 'Table name is required'
          : 'Database name is required'
      )
      return false
    }

    if (currentDialect === 'mongodb' && mongoSchema) {
      const result = MongoEditorSchema.safeParse(mongoSchema)
      if (!result.success) {
        toast.error(result.error.issues[0]?.message ?? 'Schema is invalid')
        return false
      }
      return true
    }

    if (currentDialect === 'dynamodb' && dynamoSchema) {
      const result = DynamoEditorSchema.safeParse(dynamoSchema)
      if (!result.success) {
        toast.error(result.error.issues[0]?.message ?? 'Schema is invalid')
        return false
      }
      return true
    }

    if (currentDialect === 'json' && jsonSchema) {
      const result = JsonEditorSchema.safeParse(jsonSchema)
      if (!result.success) {
        toast.error(result.error.issues[0]?.message ?? 'Schema is invalid')
        return false
      }
      return true
    }

    return false
  }

  async function handleSaveNoSql() {
    if (!validateBeforeSave()) return

    const ast =
      currentDialect === 'dynamodb' && dynamoSchema
        ? convertDynamoSchemaToAst(dynamoSchema)
        : currentDialect === 'mongodb' && mongoSchema
          ? convertMongoSchemaToAst(mongoSchema)
          : currentDialect === 'json' && jsonSchema
            ? convertJsonSchemaToAst(jsonSchema)
            : null

    if (!ast) return

    if (!ast.tables || ast.tables.length === 0) {
      if (currentDialect !== 'mongodb') {
        toast.error('Schema must include at least one collection or entity')
        return
      }
    }

    try {
      setIsSubmitting(true)

      await onSchemaSubmit({
        id: initialDataSource?.id ?? generateUUID(),
        name: coreSchema.name,
        sourceType: 'editor',
        sourceContent:
          currentDialect === 'mongodb'
            ? mongoSchema
            : currentDialect === 'dynamodb'
              ? dynamoSchema
              : currentDialect === 'json'
                ? jsonSchema
                : undefined,

        dialect: ast.dialect,
        schemaAst: ast,

        createdAt: initialDataSource?.createdAt ?? Date.now(),
        modifiedAt: initialDataSource?.modifiedAt ?? null,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function renderStep() {
    if (!currentDialect) {
      return <EditorStepDialectSelection />
    }

    if (!currentStepId || !dialectConfig) {
      return null
    }

    switch (currentStepId) {
      case 'basic':
        return <EditorStepBasic />
      case 'tableKeys':
        return currentDialect === 'dynamodb' ? (
          <EditorStepPrimaryKeys />
        ) : (
          <EditorStepTableKeys />
        )
      case 'indexes':
        return <EditorStepIndexes />
      case 'entities':
        return <EditorStepEntities />
      case 'collections':
        return <EditorStepCollections />
      case 'keyspaceTables':
        return <EditorStepKeyspaceTables />
      case 'partitioning':
        return <EditorStepPartitioning />
      case 'review':
        return <EditorStepReview />
      default:
        return null
    }
  }

  const isLastStep =
    currentDialect &&
    dialectConfig &&
    currentStepIndex === dialectConfig.steps.length - 1

  const canProceed = currentDialect !== null && currentStepId !== null

  const isDialectSelectionStep = !currentDialect

  function handleCancel() {
    if (onOpenChange) {
      onOpenChange(false)
    }
  }

  const dialogTitle =
    currentDialect === 'dynamodb'
      ? 'Design DynamoDB table'
      : currentDialect === 'mongodb'
        ? 'Design MongoDB database'
        : 'Create NoSQL Database'
  const dialogDescription =
    currentDialect === 'dynamodb'
      ? 'Design your DynamoDB table schema'
      : currentDialect === 'mongodb'
        ? 'Create MongoDB collections, fields, and indexes with a guided editor.'
        : 'Create NoSQL databases with a guided editor'

  return (
    <BetterDialogContent
      title={dialogTitle}
      description={dialogDescription}
      className="flex gap-4"
      _footerContent={
        <DialogFooter className="flex items-center justify-between! gap-3 px-6 pt-2 pb-4">
          <div>
            {isDialectSelectionStep && (
              <Button preset="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {canGoBack && !isDialectSelectionStep && (
              <Button preset="outline" onClick={goToPreviousStep}>
                <ArrowLeft />
                Back
              </Button>
            )}

            {isDialectSelectionStep ? (
              <Button
                preset="primary"
                onClick={goToNextStep}
                disabled={!currentDialect}
              >
                Next
                <ArrowRight />
              </Button>
            ) : canProceed && !isLastStep ? (
              <Button preset="primary" onClick={handleNext}>
                Next
                <ArrowRight />
              </Button>
            ) : canProceed && isLastStep ? (
              <Button
                preset="primary"
                disabled={isSubmitting}
                onClick={handleSaveNoSql}
              >
                {isSubmitting ? <SuperCircleLoader /> : <IoSaveOutline />}
                Save Database
              </Button>
            ) : null}
          </div>
        </DialogFooter>
      }
    >
      <div className="flex min-h-[38rem] min-w-[320px] flex-1 flex-col gap-4">
        {currentDialect && dialectConfig && (
          <div className="flex items-center gap-3">
            {dialectConfig.steps.map((stepId, index) => {
              const stepLabel = getStepLabel(stepId, currentDialect)
              const isActive = index === currentStepIndex
              const isCompleted = index < currentStepIndex

              return (
                <Fragment key={stepId}>
                  <button
                    onClick={() => goToStep(index)}
                    className={cn(
                      'flex items-center gap-2 rounded-full border p-1 pr-3 text-xs font-semibold transition-colors',
                      isActive
                        ? 'border-primary text-primary'
                        : isCompleted
                          ? 'border-primary/50 text-primary/70'
                          : 'border-stock text-paragraph'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full text-center',
                        isActive
                          ? 'bg-primary text-white'
                          : isCompleted
                            ? 'bg-primary/20 text-primary'
                            : 'bg-gray-200 text-gray-600'
                      )}
                    >
                      {index + 1}
                    </span>
                    {stepLabel}
                  </button>

                  {index < dialectConfig.steps.length - 1 && (
                    <div
                      className={cn(
                        'h-px flex-1',
                        isCompleted ? 'bg-primary/50' : 'bg-stock'
                      )}
                    />
                  )}
                </Fragment>
              )
            })}
          </div>
        )}

        {renderStep()}
      </div>

      <div className="sticky top-0 flex w-[18rem] overflow-hidden">
        <div className="absolute flex size-full flex-col overflow-hidden rounded-lg border bg-gray-50">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <p className="text-sm font-semibold">Generated schema JSON</p>
          </div>

          {currentDialect && dialectConfig ? (
            <OutputEditor />
          ) : (
            <div className="flex h-full items-center justify-center p-6">
              <p className="text-center text-sm text-gray-600">
                We&apos;ll generate the schema JSON after you configure your
                database.
              </p>
            </div>
          )}
        </div>
      </div>
    </BetterDialogContent>
  )
}

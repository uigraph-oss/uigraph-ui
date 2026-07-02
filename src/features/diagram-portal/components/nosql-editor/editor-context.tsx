import { createContext } from 'daily-code/react'
import { useState } from 'react'
import { z } from 'zod'
import { DataSource } from '../../types/db-flow'
import { getDialectConfig, NoSQLDialect, StepId } from './dialect-registry'
import {
  BasicDetailsSchema,
  DynamoEditorSchema,
  JsonEditorSchema,
  MongoEditorSchema,
} from './nosql-schema'

const DEFAULT_DYNAMO: z.infer<typeof DynamoEditorSchema> = {
  name: '',
  description: '',
  dialect: 'dynamodb',
  primaryKey: {
    partitionKey: '',
    partitionKeyType: 'S',
    sortKey: '',
    sortKeyType: 'S',
  },
  globalSecondaryIndexes: [],
  attributes: [],
}

const DEFAULT_MONGO: z.infer<typeof MongoEditorSchema> = {
  name: '',
  description: '',
  dialect: 'mongodb',
  collections: [],
}

const DEFAULT_JSON: z.infer<typeof JsonEditorSchema> = {
  name: '',
  description: '',
  dialect: 'json',
  collections: [],
}

const NOSQL_DIALECTS: NoSQLDialect[] = ['dynamodb', 'mongodb', 'json']

function isNoSqlDialect(dialect: string): dialect is NoSQLDialect {
  return NOSQL_DIALECTS.includes(dialect as NoSQLDialect)
}

export type NosqlContextProps = {
  initialDialect?: NoSQLDialect
  initialDataSource?: DataSource
  onSchemaSubmit: (dataSource: DataSource) => void | Promise<void>
  onOpenChange?: (open: boolean) => void
}

export const [EditorContextProvider, useEditorContext] = createContext(
  ({
    onSchemaSubmit,
    initialDialect,
    initialDataSource,
    onOpenChange,
  }: NosqlContextProps) => {
    const derivedDialect: NoSQLDialect | null =
      initialDataSource && isNoSqlDialect(initialDataSource.dialect)
        ? (initialDataSource.dialect as NoSQLDialect)
        : (initialDialect ?? null)

    const [currentDialect, setCurrentDialectState] =
      useState<NoSQLDialect | null>(() => derivedDialect)

    const [dynamoSchema, setDynamoSchema] = useState<
      z.infer<typeof DynamoEditorSchema>
    >(() => {
      if (
        initialDataSource?.dialect === 'dynamodb' &&
        initialDataSource.sourceContent
      ) {
        const parsed = DynamoEditorSchema.safeParse(
          initialDataSource.sourceContent
        )
        if (parsed.success) return parsed.data
      }
      return DEFAULT_DYNAMO
    })

    const [mongoSchema, setMongoSchema] = useState<
      z.infer<typeof MongoEditorSchema>
    >(() => {
      if (
        initialDataSource?.dialect === 'mongodb' &&
        initialDataSource.sourceContent
      ) {
        const parsed = MongoEditorSchema.safeParse(
          initialDataSource.sourceContent
        )
        if (parsed.success) return parsed.data
      }
      return DEFAULT_MONGO
    })

    const [jsonSchema, setJsonSchema] = useState<
      z.infer<typeof JsonEditorSchema>
    >(() => {
      if (
        initialDataSource?.dialect === 'json' &&
        initialDataSource.sourceContent
      ) {
        const parsed = JsonEditorSchema.safeParse(
          initialDataSource.sourceContent
        )
        if (parsed.success) return parsed.data
      }
      return DEFAULT_JSON
    })

    const [currentStepIndex, setCurrentStepIndex] = useState(0)

    const [isSubmitting, setIsSubmitting] = useState(false)

    const dialectConfig = currentDialect
      ? getDialectConfig(currentDialect)
      : null

    const currentStepId: StepId | 'dialect-selection' | null = currentDialect
      ? dialectConfig?.steps[currentStepIndex] || null
      : 'dialect-selection'

    const totalSteps = currentDialect ? dialectConfig?.steps.length || 0 : 1

    const canGoNext = currentDialect
      ? currentStepIndex < (dialectConfig?.steps.length || 0) - 1
      : false

    const canGoBack =
      currentStepIndex > 0 ||
      (currentStepIndex === 0 && currentDialect !== null)

    function setCurrentDialect(dialect: NoSQLDialect) {
      setCurrentDialectState(dialect)
      setCurrentStepIndex(0)
    }

    function goToNextStep() {
      if (!currentDialect || !dialectConfig) return
      if (currentStepIndex < dialectConfig.steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1)
      }
    }

    function goToPreviousStep() {
      if (currentStepIndex > 0) {
        setCurrentStepIndex(currentStepIndex - 1)
      } else if (currentDialect !== null) {
        setCurrentDialectState(null)
        setCurrentStepIndex(0)
      }
    }

    function goToStep(stepIndex: number) {
      if (!currentDialect || !dialectConfig) return
      if (stepIndex >= 0 && stepIndex < dialectConfig.steps.length) {
        setCurrentStepIndex(stepIndex)
      }
    }

    return {
      currentDialect,
      setCurrentDialect,

      coreSchema: {
        name:
          currentDialect === 'dynamodb'
            ? dynamoSchema.name
            : currentDialect === 'mongodb'
              ? mongoSchema.name
              : currentDialect === 'json'
                ? jsonSchema.name
                : '',

        description:
          currentDialect === 'dynamodb'
            ? dynamoSchema.description
            : currentDialect === 'mongodb'
              ? mongoSchema.description
              : currentDialect === 'json'
                ? jsonSchema.description
                : '',
      },
      setCoreSchema(schema: Partial<z.infer<typeof BasicDetailsSchema>>) {
        if (currentDialect === 'dynamodb') {
          setDynamoSchema((prev) => ({ ...prev, ...schema }))
        } else if (currentDialect === 'mongodb') {
          setMongoSchema((prev) => ({ ...prev, ...schema }))
        } else if (currentDialect === 'json') {
          setJsonSchema((prev) => ({ ...prev, ...schema }))
        }
      },

      currentStepIndex,
      currentStepId,
      dialectConfig,
      totalSteps,
      canGoNext,
      canGoBack,
      goToNextStep,
      goToPreviousStep,
      goToStep,

      isSubmitting,
      setIsSubmitting,

      dynamoSchema,
      setDynamoSchema,
      mongoSchema,
      setMongoSchema,
      jsonSchema,
      setJsonSchema,

      initialDataSource,
      onSchemaSubmit,
      onOpenChange,
    }
  }
)

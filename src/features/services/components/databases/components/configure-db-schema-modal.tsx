'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  convertDynamoSchemaToAst,
  convertMongoSchemaToAst,
} from '@/features/diagram-portal/components/nosql-editor/convert-ast'
import {
  DynamoEditorSchema,
  MongoEditorSchema,
} from '@/features/diagram-portal/components/nosql-editor/nosql-schema'
import { DataSource } from '@/features/diagram-portal/types/db-flow'
import { BetterTabController, useBetterTabs } from '@/hooks/use-better-tabs'
import { zodResolver } from '@hookform/resolvers/zod'
import { AstToUiConverter, SchemaAST, SqlToAstParser } from '@uigraph/sdk'
import { generateUUID } from 'daily-code'
import { openFileExplorer } from 'daily-code/browser'
import { Upload } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  AttachedFileSchema,
  SchemaUploadDiagramSection,
  SchemaUploadSchemaSection,
} from './configure-db-schema-sections'

type InternalAttachedFileSchema = Omit<AttachedFileSchema, 'ast'> & {
  ast: SchemaAST | null
  sourceContent:
    | null
    | z.infer<typeof DynamoEditorSchema>
    | z.infer<typeof MongoEditorSchema>
}

const uploadSchemaSchema = z.object({
  dbName: z.string().min(1, 'Database name is required'),
  dbType: z.string().min(1, 'Database type is required'),
})

interface ConfigureDbSchemaModalProps {
  mode: 'upload' | 'publish'

  onSubmit: ({
    data,
    attachedSchema,
    componentFlowDiagram,
  }: {
    data: z.infer<typeof uploadSchemaSchema>
    attachedSchema: InternalAttachedFileSchema
    componentFlowDiagram: string
  }) => Promise<void>
}

export function ConfigureDbSchemaModal({
  mode,
  onSubmit,
}: ConfigureDbSchemaModalProps) {
  const [control, activeTab] = useBetterTabs([
    {
      id: 'schema',
      label: 'Schema',
    },
    {
      id: 'diagram',
      label: 'Diagram',
    },
  ])

  const [attachedSchema, setAttachedSchema] =
    useState<InternalAttachedFileSchema | null>(null)

  const form = useForm({
    resolver: zodResolver(uploadSchemaSchema),
    defaultValues: {
      dbName: '',
      dbType: '',
    },
  })

  async function submitServiceDBUpload(
    data: z.infer<typeof uploadSchemaSchema>
  ) {
    if (!attachedSchema?.ast || !attachedSchema?.file) return

    await onSubmit({
      data,
      attachedSchema: attachedSchema as InternalAttachedFileSchema,
      componentFlowDiagram: JSON.stringify(attachedSchema.reactFlowData),
    })
  }

  async function handleSqlFile(file: File) {
    const fileContent = await file.text()

    setAttachedSchema({
      file,
      ast: null,
      sourceContent: null,
      isProcessing: true,
      reactFlowData: null,
    })

    try {
      const dialect = SqlToAstParser.detectDialect(fileContent)
      const ast = new SqlToAstParser(dialect).parse(fileContent)

      form.setValue('dbName', file.name)
      form.setValue('dbType', dialect)

      const dataSource: DataSource = {
        id: generateUUID(),
        name: file.name,

        dialect,
        schemaAst: ast,

        sourceType: 'file',
        createdAt: Date.now(),
        modifiedAt: null,
      }

      setAttachedSchema({
        file,
        ast: ast,
        sourceContent: null,
        isProcessing: false,
        reactFlowData: {
          ...AstToUiConverter.toReactFlow(ast, dataSource.id),
          dataSources: [dataSource],
        },
      })
    } catch (error) {
      console.error('Error parsing file:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to parse file'
      )
      setAttachedSchema({
        file,
        ast: null,
        sourceContent: null,
        isProcessing: false,
        reactFlowData: null,
      })
    }
  }

  async function handleDynamoSchema(
    file: File,
    schema: z.infer<typeof DynamoEditorSchema>
  ) {
    form.setValue('dbName', schema.name || file.name)
    form.setValue('dbType', 'dynamodb')

    const dynamoAst = convertDynamoSchemaToAst(schema)
    const dataSource: DataSource = {
      id: generateUUID(),
      name: schema.name || file.name,

      dialect: 'dynamodb',
      schemaAst: dynamoAst,

      sourceType: 'editor',
      sourceContent: schema,

      createdAt: Date.now(),
      modifiedAt: null,
    }

    setAttachedSchema({
      file,
      ast: dynamoAst,
      sourceContent: schema,
      isProcessing: false,
      reactFlowData: {
        ...AstToUiConverter.toReactFlow(dynamoAst, dataSource.id),
        dataSources: [dataSource],
      },
    })
  }

  async function handleMongoSchema(
    file: File,
    schema: z.infer<typeof MongoEditorSchema>
  ) {
    form.setValue('dbName', schema.name || file.name)
    form.setValue('dbType', 'mongodb')

    const mongoAst = convertMongoSchemaToAst(schema)
    const dataSource: DataSource = {
      id: generateUUID(),
      name: schema.name || file.name,
      sourceType: 'editor',
      sourceContent: schema,

      dialect: 'mongodb',
      schemaAst: mongoAst,

      createdAt: Date.now(),
      modifiedAt: null,
    }

    setAttachedSchema({
      file,
      ast: mongoAst,
      sourceContent: schema,
      isProcessing: false,
      reactFlowData: {
        ...AstToUiConverter.toReactFlow(mongoAst, dataSource.id),
        dataSources: [dataSource],
      },
    })
  }

  async function triggerFileSelect() {
    const [file] = await openFileExplorer({
      accept: '.sql,.json',
    })

    if (!file) return

    if (file.name.endsWith('.sql')) {
      return await handleSqlFile(file)
    }

    try {
      const fileContent = await file.text()
      const parsed: unknown = JSON.parse(fileContent)

      const dynamoSchema = DynamoEditorSchema.safeParse(parsed)
      if (dynamoSchema.success) {
        return await handleDynamoSchema(file, dynamoSchema.data)
      }

      const mongoSchema = MongoEditorSchema.safeParse(parsed)
      if (mongoSchema.success) {
        return await handleMongoSchema(file, mongoSchema.data)
      }
    } catch {
      toast.error('Failed to parse file')
    }
  }

  return (
    <BetterDialogContent
      title={
        mode === 'upload'
          ? 'Upload Database'
          : mode === 'publish'
            ? 'Publish Database'
            : null
      }
      description={
        mode === 'upload'
          ? 'Upload your database schema file first, then configure your database details'
          : mode === 'publish'
            ? 'Publish the database schema'
            : null
      }
      footerSubmit={
        attachedSchema
          ? mode === 'upload'
            ? 'Upload Database'
            : mode === 'publish'
              ? 'Publish Database'
              : null
          : null
      }
      onFooterSubmitClick={form.handleSubmit(submitServiceDBUpload)}
      footerSubmitLoading={form.formState.isSubmitting}
      footerSubmitIcon={<Upload />}
    >
      {attachedSchema ? (
        <form
          onSubmit={form.handleSubmit(submitServiceDBUpload)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="schema-name">
              Database Name <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="dbName"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="schema-name"
                  placeholder="e.g., users_database"
                  className="border-stock !h-[56px] !w-full rounded-[16px] border bg-[#141925] px-6 focus:outline-none"
                  {...field}
                />
              )}
            />
            {form.formState.errors.dbName && (
              <p className="text-sm text-red-500">
                {form.formState.errors.dbName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="db-type">
              Database Type <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="dbType"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="db-type"
                    className="border-stock !h-[56px] !w-full rounded-[16px] border bg-[#141925] px-6 focus:outline-none"
                  >
                    <SelectValue placeholder="Select database type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postgresql">PostgreSQL</SelectItem>
                    <SelectItem value="mysql">MySQL</SelectItem>
                    <SelectItem value="sqlite">SQLite</SelectItem>
                    <SelectItem value="mongodb">MongoDB</SelectItem>
                    <SelectItem value="dynamodb">DynamoDB</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.dbType && (
              <p className="text-sm text-red-500">
                {form.formState.errors.dbType.message}
              </p>
            )}
          </div>

          <BetterTabController control={control} />

          {activeTab === 'schema' && (
            <SchemaUploadSchemaSection
              attachedSchema={attachedSchema}
              triggerFileSelect={triggerFileSelect}
            />
          )}

          {activeTab === 'diagram' && (
            <SchemaUploadDiagramSection attachedSchema={attachedSchema} />
          )}
        </form>
      ) : (
        <div className="flex aspect-[1/0.75] flex-col items-center justify-center gap-3 rounded-lg border border-[#2A3242] bg-[#1E2533] p-8 text-center">
          <Upload className="h-12 w-12 text-[#586378]" />

          <div>
            <p className="font-medium text-[#F4F7FC]">
              Drop your file here or click to browse
            </p>
            <p className="text-sm text-[#828DA3]">
              Supports .sql and .json files
            </p>
          </div>

          <Button type="button" preset="primary" onClick={triggerFileSelect}>
            Browse Database Schema
          </Button>
        </div>
      )}
    </BetterDialogContent>
  )
}

/**
 * Unified Data Sources Panel
 *
 * Consolidated panel for:
 * - Uploading SQL files
 * - Creating tables manually
 * - Viewing/editing SQL code
 * - Full bidirectional sync: SQL ↔ AST ↔ UI ↔ Right Panel
 */
import { DynamoDBIcon } from '@/assets/svgs'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SelectSearch } from '@/components/ui/select-search'
import { Separator } from '@/components/ui/separator'
import { CodeMirrorWrapped } from '@/features/component-meta'
import {
  convertDynamoSchemaToAst,
  convertJsonSchemaToAst,
  convertMongoSchemaToAst,
} from '@/features/diagram-portal/components/nosql-editor/convert-ast'
import {
  DynamoEditorSchema,
  JsonEditorSchema,
  MongoEditorSchema,
} from '@/features/diagram-portal/components/nosql-editor/nosql-schema'
import { cn } from '@/lib/utils'
import {
  AstToSqlGenerator,
  AstToUiConverter,
  SchemaAST,
  SqlToAstParser,
  TableAST,
  generateTableNodeId,
} from '@uigraph/sdk'
import { openFileExplorer } from 'daily-code/browser'
import {
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  DatabaseIcon,
  FileText,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { GoPencil } from 'react-icons/go'
import { toast } from 'sonner'
import type { z } from 'zod'
import { NosqlEditorModal } from '../components/nosql-editor/nosql-editor-modal'
import { useDataSources } from '../context/data-sources-context'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { usePanelServicesDb } from '../hooks/use-panel-services-db'
import { componentDragDataTransfer } from '../nodes/helpers/drag-data-transfer'
import { DataSource } from '../types/db-flow'
import { generateUUID } from '../utils/uuid'
import { SidebarLayout } from './sidebar-layout'

export function PanelDataSourcesUnified() {
  const { setNodes, setEdges, dataSources, setDataSources, reactFlowInstance } =
    useFlowDiagramContext()

  const { removeDataSource, regenerateSql } = useDataSources()

  const [editingSource, setEditingSource] = useState<string | null>(null)

  const {
    selectedServiceId,
    setSelectedServiceId,
    isServicesLoading,
    isServicesDbLoading,
    services,
    servicesDb,
  } = usePanelServicesDb()

  const selectedService = services.find(
    (service) => service.serviceId === selectedServiceId
  )

  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set())
  const [editContent, setEditContent] = useState('')
  const sqlDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [isSqlDropdownOpen, setIsSqlDropdownOpen] = useState(false)
  const [isNoSqlDropdownOpen, setIsNoSqlDropdownOpen] = useState(false)

  const [nosqlDataSourceEditing, setNosqlDataSourceEditing] =
    useState<DataSource | null>(null)

  async function handleUploadSqlFile() {
    try {
      const [file] = await openFileExplorer({ accept: '.sql,.json' })
      if (!file) return

      const text = await file.text()
      const dialect = SqlToAstParser.detectDialect(text)

      const parser = new SqlToAstParser(dialect)
      const ast = parser.parse(text)

      if (!ast.tables || ast.tables.length === 0) {
        toast.error('No tables found in SQL file')
        return
      }

      const sourceId = generateUUID()
      const newSource: DataSource = {
        id: sourceId,
        name: file.name,
        sourceType: 'file',
        dialect,
        schemaAst: ast,
        createdAt: Date.now(),
        modifiedAt: null,
      }

      const updated = AstToUiConverter.toReactFlow(ast, newSource.name)
      setNodes((prev) => [...prev, ...updated.nodes])
      setEdges((prev) => [...prev, ...updated.edges])

      setDataSources((prev) => [...prev, newSource])
      setSelectedSource(sourceId)
      setExpandedSources((prev) => new Set([...prev, sourceId]))

      toast.success(
        `Imported ${ast.tables.length} tables from ${file.name} (${dialect.toUpperCase()})`
      )
    } catch (error) {
      console.error('Error uploading SQL file:', error)
      toast.error('Failed to parse SQL file. Please check the file format.')
    }
  }

  async function handleUploadNoSqlFile() {
    try {
      const [file] = await openFileExplorer({ accept: '.json' })
      if (!file) return

      const text = await file.text()
      const parsed: unknown = JSON.parse(text)

      const dynamo = DynamoEditorSchema.safeParse(parsed)
      const sourceId = generateUUID()
      let sourceContent: DataSource['sourceContent'] | undefined
      let schema: SchemaAST | null = null

      if (dynamo.success) {
        sourceContent = dynamo.data
        const ast = convertDynamoSchemaToAst(dynamo.data)
        schema = {
          ...ast,
          metadata: { ...(ast.metadata ?? {}), sourceFile: file.name },
        }
      } else {
        const mongo = MongoEditorSchema.safeParse(parsed)
        if (mongo.success) {
          sourceContent = mongo.data
          const ast = convertMongoSchemaToAst(mongo.data)
          schema = {
            ...ast,
            metadata: { ...(ast.metadata ?? {}), sourceFile: file.name },
          }
        } else {
          const json = JsonEditorSchema.safeParse(parsed)
          if (json.success) {
            sourceContent = json.data
            const ast = convertJsonSchemaToAst(json.data)
            schema = {
              ...ast,
              metadata: { ...(ast.metadata ?? {}), sourceFile: file.name },
            }
          }
        }
      }

      if (!schema || !sourceContent) {
        toast.error('Invalid NoSQL schema file')
        return
      }

      const newSource: DataSource = {
        id: sourceId,
        name: file.name,
        sourceType: 'file',
        dialect: schema.dialect,
        sourceContent,
        schemaAst: schema,
        createdAt: Date.now(),
        modifiedAt: null,
      }

      const updated = AstToUiConverter.toReactFlow(schema, newSource.name)
      setNodes((prev) => [...prev, ...updated.nodes])
      setEdges((prev) => [...prev, ...updated.edges])
      setDataSources((prev) => [...prev, newSource])
      setSelectedSource(sourceId)
      setExpandedSources((prev) => new Set([...prev, sourceId]))

      const label = schema.dialect === 'dynamodb' ? 'table' : 'collection'
      toast.success(
        `Imported ${schema.tables.length} ${schema.tables.length === 1 ? label : `${label}s`} from ${file.name}`
      )
    } catch (error) {
      console.error('Error uploading NoSQL file:', error)
      toast.error('Failed to parse NoSQL schema file.')
    }
  }

  function handleCreateManualTable(
    dialect: 'mysql' | 'postgresql' | 'sqlite' = 'mysql',
    sourceName = 'Manual Table',
    tableName = 'new_table'
  ) {
    const sourceId = generateUUID()
    const tableId = generateUUID()

    const newTable: TableAST = {
      id: tableId,
      type: 'table',
      name: tableName,
      columns: [
        {
          type: 'column',
          name: 'id',
          dataType: { name: 'INT' },
          nullable: false,
          autoIncrement: true,
        },
        {
          type: 'column',
          name: 'name',
          dataType: { name: 'VARCHAR', parameters: [255] },
          nullable: false,
        },
      ],
      constraints: [
        {
          type: 'primary_key',
          columns: ['id'],
        },
      ],
      indexes: [],
    }

    const ast: SchemaAST = {
      dialect,
      tables: [newTable],
      metadata: {
        createdAt: new Date(),
      },
    }

    const newSource: DataSource = {
      id: sourceId,
      name: sourceName,
      sourceType: 'manual',
      dialect,
      schemaAst: ast,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    }

    const updated = AstToUiConverter.toReactFlow(ast, newSource.name)
    setNodes((prev) => [...prev, ...updated.nodes])
    setEdges((prev) => [...prev, ...updated.edges])

    setSelectedSource(sourceId)
    setDataSources((prev) => [...prev, newSource])
    setExpandedSources((prev) => new Set([...prev, sourceId]))

    toast.success(`${sourceName} created`)
  }

  function handleCreateManualMongoDB() {
    const sourceId = generateUUID()
    const tableId = generateUUID()
    const sourceContent: z.infer<typeof MongoEditorSchema> = {
      dialect: 'mongodb',
      name: 'MongoDB Collection',
      description: 'MongoDB Collection',
      collections: [
        {
          id: tableId,
          name: 'users',
          tags: 'auth,profiles',
          description: 'Application users',
          fields: [
            {
              id: generateUUID(),
              name: '_id',
              type: 'string',
              required: true,
              refCollectionId: null,
            },
            {
              id: generateUUID(),
              name: 'email',
              type: 'string',
              required: true,
              refCollectionId: null,
            },
            {
              id: generateUUID(),
              name: 'username',
              type: 'string',
              required: true,
              refCollectionId: null,
            },
            {
              id: generateUUID(),
              name: 'name',
              type: 'object',
              required: true,
              refCollectionId: null,
              fields: [
                {
                  id: generateUUID(),
                  name: 'first',
                  type: 'string',
                  required: true,
                  refCollectionId: null,
                },
                {
                  id: generateUUID(),
                  name: 'last',
                  type: 'string',
                  required: true,
                  refCollectionId: null,
                },
              ],
            },
            {
              id: generateUUID(),
              name: 'roles',
              type: 'array',
              required: false,
              refCollectionId: null,
              itemType: 'string',
              itemFields: undefined,
              fields: undefined,
            },
            {
              id: generateUUID(),
              name: 'address',
              type: 'object',
              required: false,
              refCollectionId: null,
              fields: [
                {
                  id: generateUUID(),
                  name: 'line1',
                  type: 'string',
                  required: true,
                  refCollectionId: null,
                },
                {
                  id: generateUUID(),
                  name: 'line2',
                  type: 'string',
                  required: false,
                  refCollectionId: null,
                },
                {
                  id: generateUUID(),
                  name: 'city',
                  type: 'string',
                  required: true,
                  refCollectionId: null,
                },
                {
                  id: generateUUID(),
                  name: 'state',
                  type: 'string',
                  required: false,
                  refCollectionId: null,
                },
                {
                  id: generateUUID(),
                  name: 'country',
                  type: 'string',
                  required: true,
                  refCollectionId: null,
                },
                {
                  id: generateUUID(),
                  name: 'postalCode',
                  type: 'string',
                  required: false,
                  refCollectionId: null,
                },
              ],
            },
            {
              id: generateUUID(),
              name: 'preferences',
              type: 'object',
              required: false,
              refCollectionId: null,
              fields: [
                {
                  id: generateUUID(),
                  name: 'marketingOptIn',
                  type: 'boolean',
                  required: false,
                  refCollectionId: null,
                },
                {
                  id: generateUUID(),
                  name: 'language',
                  type: 'string',
                  required: false,
                  refCollectionId: null,
                },
                {
                  id: generateUUID(),
                  name: 'theme',
                  type: 'string',
                  required: false,
                  refCollectionId: null,
                },
              ],
            },
            {
              id: generateUUID(),
              name: 'sessions',
              type: 'array',
              required: false,
              refCollectionId: null,
              itemType: 'object',
              itemFields: [
                {
                  id: generateUUID(),
                  name: 'sessionId',
                  type: 'string',
                  required: true,
                  refCollectionId: null,
                },
                {
                  id: generateUUID(),
                  name: 'createdAt',
                  type: 'date',
                  required: true,
                  refCollectionId: null,
                },
                {
                  id: generateUUID(),
                  name: 'ip',
                  type: 'string',
                  required: false,
                  refCollectionId: null,
                },
                {
                  id: generateUUID(),
                  name: 'userAgent',
                  type: 'string',
                  required: false,
                  refCollectionId: null,
                },
              ],
            },
            {
              id: generateUUID(),
              name: 'createdAt',
              type: 'date',
              required: true,
              refCollectionId: null,
            },
            {
              id: generateUUID(),
              name: 'updatedAt',
              type: 'date',
              required: false,
              refCollectionId: null,
            },
          ],
          indexes: [
            {
              id: generateUUID(),
              name: 'uniq_email',
              unique: true,
              fields: [
                {
                  id: generateUUID(),
                  fieldName: 'email',
                  order: 1,
                },
              ],
            },
            {
              id: generateUUID(),
              name: 'uniq_username',
              unique: true,
              fields: [
                {
                  id: generateUUID(),
                  fieldName: 'username',
                  order: 1,
                },
              ],
            },
            {
              id: generateUUID(),
              name: 'idx_createdAt',
              unique: false,
              fields: [
                {
                  id: generateUUID(),
                  fieldName: 'createdAt',
                  order: -1,
                },
              ],
            },
          ],
        },
      ],
    }
    const ast = convertMongoSchemaToAst(sourceContent)

    const newSource: DataSource = {
      id: sourceId,
      name: 'MongoDB Collection',
      sourceType: 'manual',
      dialect: 'mongodb',
      sourceContent,
      schemaAst: ast,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    }

    const updated = AstToUiConverter.toReactFlow(ast, newSource.name)
    setNodes((prev) => [...prev, ...updated.nodes])
    setEdges((prev) => [...prev, ...updated.edges])

    setSelectedSource(sourceId)
    setDataSources((prev) => [...prev, newSource])
    setExpandedSources((prev) => new Set([...prev, sourceId]))

    toast.success('MongoDB Collection created')
  }

  function handleCreateManualDynamo() {
    const sourceId = generateUUID()

    const sourceContent: z.infer<typeof DynamoEditorSchema> = {
      dialect: 'dynamodb',
      name: 'DynamoDB Table',
      description: 'DynamoDB Table',
      primaryKey: {
        partitionKey: 'pk',
        partitionKeyType: 'S' as const,
        sortKey: 'sk',
        sortKeyType: 'S' as const,
      },
      globalSecondaryIndexes: [
        {
          id: generateUUID(),
          name: 'gsi1',
          partitionKey: 'gsi1pk',
          partitionKeyType: 'S',
          sortKey: 'gsi1sk',
          sortKeyType: 'S',
        },
        {
          id: generateUUID(),
          name: 'gsi2',
          partitionKey: 'gsi2pk',
          partitionKeyType: 'S',
          sortKey: 'gsi2sk',
          sortKeyType: 'S',
        },
      ],
      attributes: [
        {
          id: generateUUID(),
          name: 'entityType',
          type: 'string',
          required: true,
        },
        {
          id: generateUUID(),
          name: 'orgId',
          type: 'string',
          required: true,
        },
        {
          id: generateUUID(),
          name: 'userId',
          type: 'string',
          required: true,
        },
        {
          id: generateUUID(),
          name: 'email',
          type: 'string',
          required: true,
        },
        {
          id: generateUUID(),
          name: 'status',
          type: 'string',
          required: false,
        },
        {
          id: generateUUID(),
          name: 'roles',
          type: 'array',
          required: false,
          itemType: 'string',
        },
        {
          id: generateUUID(),
          name: 'profile',
          type: 'object',
          required: false,
          fields: [
            {
              id: generateUUID(),
              name: 'firstName',
              type: 'string',
              required: true,
            },
            {
              id: generateUUID(),
              name: 'lastName',
              type: 'string',
              required: true,
            },
            {
              id: generateUUID(),
              name: 'phone',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: generateUUID(),
          name: 'createdAt',
          type: 'string',
          required: true,
        },
        {
          id: generateUUID(),
          name: 'updatedAt',
          type: 'string',
          required: false,
        },
      ],
    }
    const ast = convertDynamoSchemaToAst(sourceContent)

    const newSource: DataSource = {
      id: sourceId,
      name: 'Manual DynamoDB',
      sourceType: 'manual',
      dialect: 'dynamodb',
      sourceContent,
      schemaAst: ast,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    }

    const updated = AstToUiConverter.toReactFlow(ast, newSource.name)
    setNodes((prev) => [...prev, ...updated.nodes])
    setEdges((prev) => [...prev, ...updated.edges])

    setSelectedSource(sourceId)
    setDataSources((prev) => [...prev, newSource])
    setExpandedSources((prev) => new Set([...prev, sourceId]))

    toast.success('Manual DynamoDB schema created')
  }

  function handleRemoveSource(sourceId: string) {
    removeDataSource(sourceId)

    setNodes((prev) =>
      prev.filter((node) => !node.id.startsWith(`${sourceId}-table-`))
    )
    setEdges((prev) =>
      prev.filter((edge) => !edge.id.startsWith(`${sourceId}-table-`))
    )

    if (selectedSource === sourceId) {
      setSelectedSource(null)
    }

    if (editingSource === sourceId) {
      setEditingSource(null)
    }

    toast.success('Data source removed')
  }

  function handleViewEditSql(source: DataSource) {
    if (
      source.dialect === 'mongodb' ||
      source.dialect === 'dynamodb' ||
      source.dialect === 'json'
    ) {
      setEditContent(JSON.stringify(source.sourceContent ?? {}, null, 2))
    } else {
      const generator = new AstToSqlGenerator(source.dialect, 2)
      const sqlContent = generator.generate(source.schemaAst)
      setEditContent(sqlContent)
    }

    setEditingSource(source.id)
  }

  function handleSqlEdit(sourceId: string, newSqlContent: string) {
    setEditContent(newSqlContent)

    if (sqlDebounceRef.current) clearTimeout(sqlDebounceRef.current)

    const source = dataSources.find((s) => s.id === sourceId)
    if (
      !source ||
      source.dialect === 'mongodb' ||
      source.dialect === 'dynamodb' ||
      source.dialect === 'json'
    ) {
      return
    }

    sqlDebounceRef.current = setTimeout(() => {
      try {
        const sourceInside = dataSources.find((s) => s.id === sourceId)
        if (!sourceInside) return

        const parser = new SqlToAstParser(sourceInside.dialect)
        const newAst = parser.parse(newSqlContent)

        if (!newAst.tables || newAst.tables.length === 0) {
          return
        }

        setDataSources((prev) => {
          const result = prev.map((source) =>
            source.id === sourceId
              ? { ...source, schemaAst: newAst, modifiedAt: Date.now() }
              : source
          )

          return result
        })

        const nodes = reactFlowInstance?.getNodes()
        const edges = reactFlowInstance?.getEdges()

        const updated = AstToUiConverter.updateReactFlow({
          schema: newAst,
          sourceName: source.name,
          nodes: nodes ?? [],
          edges: edges ?? [],
          oldDataSources: dataSources,
        })

        setNodes(updated.nodes)
        setEdges(updated.edges)
      } catch (error) {
        console.error('Error parsing SQL:', error)
      }
    }, 500)
  }

  function handleSaveEdit(sourceId: string) {
    try {
      const source = dataSources.find((s) => s.id === sourceId)
      if (!source) return

      if (
        source.dialect === 'mongodb' ||
        source.dialect === 'dynamodb' ||
        source.dialect === 'json'
      ) {
        const parsedValue: unknown = JSON.parse(editContent)

        if (source.dialect === 'mongodb') {
          const parsedContent = MongoEditorSchema.parse(parsedValue)
          const newAst = convertMongoSchemaToAst(parsedContent)

          if (!newAst.tables || newAst.tables.length === 0) {
            toast.error('No valid tables found in schema')
            return
          }

          setEditingSource(null)

          setDataSources((prev) =>
            prev.map((item) =>
              item.id === sourceId
                ? {
                    ...item,
                    sourceContent: parsedContent,
                    schemaAst: newAst,
                    modifiedAt: Date.now(),
                  }
                : item
            )
          )

          const nodes = reactFlowInstance?.getNodes()
          const edges = reactFlowInstance?.getEdges()

          const updated = AstToUiConverter.updateReactFlow({
            schema: newAst,
            sourceName: source.name,
            nodes: nodes ?? [],
            edges: edges ?? [],
            oldDataSources: dataSources,
          })

          setNodes(updated.nodes)
          setEdges(updated.edges)

          toast.success('Schema updated successfully')
          return
        }

        if (source.dialect === 'dynamodb') {
          const parsedContent = DynamoEditorSchema.parse(parsedValue)
          const newAst = convertDynamoSchemaToAst(parsedContent)

          if (!newAst.tables || newAst.tables.length === 0) {
            toast.error('No valid tables found in schema')
            return
          }

          setEditingSource(null)

          setDataSources((prev) =>
            prev.map((item) =>
              item.id === sourceId
                ? {
                    ...item,
                    sourceContent: parsedContent,
                    schemaAst: newAst,
                    modifiedAt: Date.now(),
                  }
                : item
            )
          )

          const nodes = reactFlowInstance?.getNodes()
          const edges = reactFlowInstance?.getEdges()

          const updated = AstToUiConverter.updateReactFlow({
            schema: newAst,
            sourceName: source.name,
            nodes: nodes ?? [],
            edges: edges ?? [],
            oldDataSources: dataSources,
          })

          setNodes(updated.nodes)
          setEdges(updated.edges)

          toast.success('Schema updated successfully')
          return
        }

        if (source.dialect === 'json') {
          const parsedContent = JsonEditorSchema.parse(parsedValue)
          const newAst = convertJsonSchemaToAst(parsedContent)

          if (!newAst.tables || newAst.tables.length === 0) {
            toast.error('No valid tables found in schema')
            return
          }

          setEditingSource(null)

          setDataSources((prev) =>
            prev.map((item) =>
              item.id === sourceId
                ? {
                    ...item,
                    sourceContent: parsedContent,
                    schemaAst: newAst,
                    modifiedAt: Date.now(),
                  }
                : item
            )
          )

          const nodes = reactFlowInstance?.getNodes()
          const edges = reactFlowInstance?.getEdges()

          const updated = AstToUiConverter.updateReactFlow({
            schema: newAst,
            sourceName: source.name,
            nodes: nodes ?? [],
            edges: edges ?? [],
            oldDataSources: dataSources,
          })

          setNodes(updated.nodes)
          setEdges(updated.edges)

          toast.success('Schema updated successfully')
          return
        }

        return
      }

      const parser = new SqlToAstParser(source.dialect)
      const newAst = parser.parse(editContent)

      if (!newAst.tables || newAst.tables.length === 0) {
        toast.error('No valid tables found in SQL')
        return
      }

      setEditingSource(null)

      setDataSources((prev) => {
        const result = prev.map((source) =>
          source.id === sourceId
            ? { ...source, schemaAst: newAst, modifiedAt: Date.now() }
            : source
        )

        return result
      })

      const nodes = reactFlowInstance?.getNodes()
      const edges = reactFlowInstance?.getEdges()

      const updated = AstToUiConverter.updateReactFlow({
        schema: newAst,
        sourceName: source.name,
        nodes: nodes ?? [],
        edges: edges ?? [],
        oldDataSources: dataSources,
      })

      setNodes(updated.nodes)
      setEdges(updated.edges)

      toast.success('SQL updated successfully')
    } catch (error) {
      console.error('Error parsing edited content:', error)
      toast.error('Invalid content. Please check your changes.')
    }
  }

  function handleCancelEdit() {
    setEditingSource(null)
    setEditContent('')
  }

  function handleRegenerateFromAST(sourceId: string) {
    const sqlContent = regenerateSql(sourceId)

    console.log('Regenerated SQL:', sqlContent)
    toast.success('SQL regenerated from internal structure')
  }

  function toggleExpanded(sourceId: string) {
    setExpandedSources((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(sourceId)) {
        newSet.delete(sourceId)
      } else {
        newSet.add(sourceId)
      }
      return newSet
    })
  }

  function isExpanded(sourceId: string) {
    return expandedSources.has(sourceId)
  }

  return (
    <SidebarLayout className="left-18">
      <div className="flex h-full w-[500px] flex-col">
        <div className="from-primary/10 to-primary/5 border-stock border-b bg-gradient-to-r px-4 py-3">
          <h3 className="text-foreground flex items-center gap-2 text-base font-semibold">
            <DatabaseIcon className="text-primary h-5 w-5" />
            Data Sources
          </h3>
          <p className="text-paragraph mt-1 text-xs">
            Connect services, upload SQL or NoSQL files, or create tables
            manually
          </p>
        </div>

        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-4">
            <DropdownMenu
              open={isSqlDropdownOpen}
              onOpenChange={(open) => {
                setIsSqlDropdownOpen(open)
                setIsNoSqlDropdownOpen(false)
              }}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  preset="primary"
                  className="flex w-full items-center justify-between gap-2 pr-3! focus:z-10"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add SQL Source
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent side="bottom" align="start">
                <DropdownMenuItem onClick={handleUploadSqlFile}>
                  <Upload className="h-4 w-4" />
                  Upload SQL Schema
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    handleCreateManualTable('mysql', 'MySQL Source')
                  }
                >
                  <DatabaseIcon className="h-4 w-4" />
                  New MySQL Source
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    handleCreateManualTable('postgresql', 'PostgreSQL Source')
                  }
                >
                  <DatabaseIcon className="h-4 w-4" />
                  New PostgreSQL Source
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu
              open={isNoSqlDropdownOpen}
              onOpenChange={(open) => {
                setIsNoSqlDropdownOpen(open)
                setIsSqlDropdownOpen(false)
              }}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  preset="outline"
                  className="flex w-full items-center justify-between gap-2 pr-3! focus:z-10"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add NoSQL Source
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent side="bottom" align="start">
                <DropdownMenuItem onClick={handleUploadNoSqlFile}>
                  <Upload className="h-4 w-4" />
                  Upload NoSQL Schema
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setWizardOpen(true)}>
                  <FileText className="h-4 w-4" />
                  Open NoSQL Editor
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCreateManualDynamo}>
                  <DynamoDBIcon className="h-4 w-4" />
                  New DynamoDB Table
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCreateManualMongoDB}>
                  <FileText className="h-4 w-4" />
                  New MongoDB Collection
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div>
            {dataSources.length > 0 && (
              <>
                <Separator className="my-4" />

                <div className="space-y-3">
                  <h4 className="text-secondary-foreground text-sm font-medium">
                    Sources ({dataSources.length})
                  </h4>

                  {dataSources.map((source) => (
                    <div
                      key={source.id}
                      className={cn(
                        'group border-stock bg-popover rounded-lg border py-2 transition-all',
                        selectedSource === source.id &&
                          'border-blue-500 ring-1 ring-blue-500',
                        editingSource === source.id && 'ring-2 ring-green-500'
                      )}
                    >
                      {editingSource === source.id ? (
                        <div>
                          <div className="mb-2 flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                              <Code2 className="h-4 w-4 text-green-600" />
                              <span className="text-foreground text-sm font-medium">
                                Editing: {source.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleSaveEdit(source.id)}
                              >
                                Done
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          <CodeMirrorWrapped
                            height="400px"
                            value={editContent}
                            setValue={(value) =>
                              handleSqlEdit(source.id, value)
                            }
                          />

                          <div className="text-muted-foreground mt-2 px-2 text-xs">
                            Changes sync automatically to flow diagram and right
                            panel
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-start justify-between gap-2 p-3">
                            <button
                              className="flex min-w-0 flex-1 cursor-pointer flex-col items-start text-left"
                              onClick={() => toggleExpanded(source.id)}
                            >
                              <div className="flex w-full items-center gap-2">
                                {isExpanded(source.id) ? (
                                  <ChevronDown className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                                )}
                                <FileText className="h-4 w-4 flex-shrink-0 text-blue-600" />
                                <span className="text-foreground truncate text-sm font-medium">
                                  {source.name}
                                </span>
                                {source.modifiedAt && (
                                  <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-700">
                                    Modified
                                  </span>
                                )}
                              </div>
                              <div className="text-muted-foreground mt-1 ml-10 flex items-center gap-3 text-xs">
                                <span className="uppercase">
                                  {source.dialect}
                                </span>
                                <span>•</span>
                                <span>
                                  {source.schemaAst?.tables?.length || 0} tables
                                </span>
                                <span>•</span>
                                <span>
                                  {source.schemaAst?.tables?.reduce(
                                    (acc, t) =>
                                      acc +
                                      t.constraints?.filter(
                                        (c) => c.type === 'foreign_key'
                                      ).length,
                                    0
                                  )}{' '}
                                  relations
                                </span>
                              </div>
                            </button>

                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground h-7 w-7 p-0 hover:text-blue-600"
                                onClick={() => handleViewEditSql(source)}
                                title="View/Edit SQL"
                              >
                                <Code2 className="h-3.5 w-3.5" />
                              </Button>

                              {(source.dialect === 'dynamodb' ||
                                source.dialect === 'mongodb' ||
                                source.dialect === 'json') && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-muted-foreground h-7 w-7 p-0 hover:text-blue-600"
                                  onClick={() =>
                                    setNosqlDataSourceEditing(source)
                                  }
                                  title="Edit NoSQL Schema"
                                >
                                  <GoPencil className="h-3.5 w-3.5" />
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground h-7 w-7 p-0 hover:text-green-600"
                                onClick={() =>
                                  handleRegenerateFromAST(source.id)
                                }
                                title="Regenerate SQL from AST"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground h-7 w-7 p-0 hover:text-red-600"
                                onClick={() => handleRemoveSource(source.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          {isExpanded(source.id) && (
                            <div className="ml-7 space-y-1 rounded px-2 pb-2">
                              {source.schemaAst?.tables.map((table) => (
                                <div
                                  key={`${source.id}-${table?.name}`}
                                  draggable
                                  className="bg-card hover:bg-accent flex cursor-grab items-center justify-between rounded px-3 py-2 text-sm transition-all active:cursor-grabbing"
                                  onDragStart={(event: React.DragEvent) => {
                                    componentDragDataTransfer(
                                      event,
                                      'databaseTableSQL',
                                      {
                                        localTable: {
                                          databaseName: source.name,
                                          tableName: table.name,
                                        },
                                      },
                                      {
                                        width: 400,
                                        id: generateTableNodeId(
                                          source.name,
                                          table.name
                                        ),
                                      },
                                      table.name ?? 'Table'
                                    )
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <DatabaseIcon className="h-4 w-4 text-green-600" />
                                    <span className="text-secondary-foreground font-mono font-medium">
                                      {table?.name}
                                    </span>
                                  </div>
                                  <span className="text-muted-foreground text-xs">
                                    {table?.columns?.length || 0} cols
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {dataSources.length === 0 && (
              <div className="mt-8 text-center">
                <div className="bg-accent mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full">
                  <DatabaseIcon className="text-muted-foreground h-8 w-8" />
                </div>
                <p className="text-muted-foreground text-sm">
                  No data sources yet
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Upload a SQL file or create a table manually
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {services.length > 0 && (
              <div className="mb-4">
                <label className="text-secondary-foreground mb-2 block text-sm font-medium">
                  Select Service
                </label>

                <SelectSearch
                  disabled={isServicesLoading}
                  value={selectedServiceId || ''}
                  onChange={setSelectedServiceId}
                  options={services.map((service) => ({
                    value: service.serviceId!,
                    label: service.name!,
                  }))}
                />
              </div>
            )}

            {selectedServiceId && servicesDb.length > 0 && (
              <div>
                {servicesDb.map((serviceDb) => {
                  const dynamoTable = serviceDb.noSQLSchema?.dynamo?.table
                  const mongoCollections =
                    serviceDb.noSQLSchema?.mongo?.collections

                  type NoSQLEntry = { name: string; colCount: number }
                  let noSQLEntries: NoSQLEntry[] = []

                  if (dynamoTable?.name) {
                    noSQLEntries = [
                      {
                        name: dynamoTable.name,
                        colCount: dynamoTable.attributes?.length ?? 0,
                      },
                    ]
                  } else if (mongoCollections) {
                    noSQLEntries = mongoCollections.map((collection) => ({
                      name: collection.name,
                      colCount: collection.fields?.length ?? 0,
                    }))
                  }

                  const isNoSQL = noSQLEntries.length > 0

                  const tableCount = isNoSQL
                    ? noSQLEntries.length
                    : serviceDb.tables?.length || 0

                  return (
                    <div key={serviceDb.serviceDBId} className="mb-4">
                      <h4 className="text-secondary-foreground mb-2 text-sm font-medium">
                        {serviceDb.dbName} ({tableCount} tables)
                      </h4>
                      <div className="space-y-2">
                        {isServicesDbLoading ? (
                          <div className="text-muted-foreground text-sm">
                            Loading tables...
                          </div>
                        ) : isNoSQL ? (
                          noSQLEntries.map((entry) => (
                            <div
                              key={`${serviceDb.serviceDBId}-${entry.name}`}
                              draggable
                              className="bg-card hover:bg-accent flex cursor-grab items-center justify-between rounded px-3 py-2 text-sm transition-all active:cursor-grabbing"
                              onDragStart={(event: React.DragEvent) => {
                                componentDragDataTransfer(
                                  event,
                                  'databaseTableSQL',
                                  {
                                    serviceTable: {
                                      serviceName: selectedService!.name!,
                                      databaseName: serviceDb.dbName!,
                                      tableName: entry.name,
                                    },
                                  },
                                  { width: 400 },
                                  entry.name
                                )
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <DatabaseIcon className="h-4 w-4 text-green-600" />
                                <span className="text-secondary-foreground font-mono font-medium">
                                  {entry.name}
                                </span>
                              </div>
                              <span className="text-muted-foreground text-xs">
                                {entry.colCount} attrs
                              </span>
                            </div>
                          ))
                        ) : (
                          serviceDb.tables
                            ?.filter(
                              (table): table is NonNullable<typeof table> =>
                                table?.name != null
                            )
                            .map((table) => (
                              <div
                                key={`${serviceDb.serviceDBId}-${table?.name}`}
                                draggable
                                className="bg-card hover:bg-accent flex cursor-grab items-center justify-between rounded px-3 py-2 text-sm transition-all active:cursor-grabbing"
                                onDragStart={(event: React.DragEvent) => {
                                  componentDragDataTransfer(
                                    event,
                                    'databaseTableSQL',
                                    {
                                      serviceTable: {
                                        serviceName: selectedService!.name!,
                                        databaseName: serviceDb.dbName!,
                                        tableName: table.name!,
                                      },
                                    },
                                    { width: 400 },
                                    table.name ?? 'Table'
                                  )
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <DatabaseIcon className="h-4 w-4 text-green-600" />
                                  <span className="text-secondary-foreground font-mono font-medium">
                                    {table?.name}
                                  </span>
                                </div>
                                <span className="text-muted-foreground text-xs">
                                  {table?.columns?.length || 0} cols
                                </span>
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <NosqlEditorModal
          open={wizardOpen}
          onOpenChange={(open) => setWizardOpen(open)}
          onSchemaSubmit={async (dataSource) => {
            const updated = AstToUiConverter.toReactFlow(
              dataSource.schemaAst,
              dataSource.name
            )

            setNodes((prev) => [...prev, ...updated.nodes])
            setEdges((prev) => [...prev, ...updated.edges])
            setDataSources((prev) => [...prev, dataSource])

            setSelectedSource(dataSource.id)
            setExpandedSources((prev) => new Set([...prev, dataSource.id]))

            toast.success('NoSQL schema saved')
            setWizardOpen(false)
          }}
        />

        <NosqlEditorModal
          open={nosqlDataSourceEditing !== null}
          initialDataSource={nosqlDataSourceEditing ?? undefined}
          onOpenChange={() => setNosqlDataSourceEditing(null)}
          onSchemaSubmit={async (dataSource) => {
            if (!nosqlDataSourceEditing) return

            setDataSources((prev) =>
              prev.map((source) =>
                source.id === nosqlDataSourceEditing.id ? dataSource : source
              )
            )

            toast.success('NoSQL schema saved')
            setNosqlDataSourceEditing(null)
          }}
        />
      </div>
    </SidebarLayout>
  )
}

'use client'

import { graphql, privateClient } from '@/api'
import { SectionLoader } from '@/components/section-loader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BetterTabController, useBetterTabs } from '@/hooks/use-better-tabs'
import {
  buildSchema,
  GraphQLNamedType,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLType,
  isEnumType,
  isInputObjectType,
  isInterfaceType,
  isListType,
  isNonNullType,
  isObjectType,
  isScalarType,
  isSpecifiedScalarType,
  isUnionType,
} from 'graphql'
import { Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'

const GET_FILE_BY_ID_QUERY = graphql(`
  query GetFileByID_SpecViewer($fileId: String!) {
    GetFileByID(fileId: $fileId, download: true) {
      fileId
      fileName
      fileDownloadURL
    }
  }
`)

type GraphqlSpecViewerProps = {
  specFileIds: string[]
}

type GraphqlSpecFile = {
  fileId: string
  fileName: string
  content: string
}

type GraphqlSection = {
  title: string
  items: string[]
}

function formatGraphqlType(type: GraphQLType): string {
  if (isNonNullType(type)) {
    return `${formatGraphqlType(type.ofType)}!`
  }

  if (isListType(type)) {
    return `[${formatGraphqlType(type.ofType)}]`
  }

  return type.name
}

function getNamedGraphqlType(type: GraphQLType): GraphQLNamedType {
  if (isNonNullType(type) || isListType(type)) {
    return getNamedGraphqlType(type.ofType)
  }

  return type
}

function getGraphqlTypeKind(type: GraphQLNamedType): string {
  if (isObjectType(type)) {
    return 'Object'
  }

  if (isInterfaceType(type)) {
    return 'Interface'
  }

  if (isInputObjectType(type)) {
    return 'Input'
  }

  if (isEnumType(type)) {
    return 'Enum'
  }

  if (isUnionType(type)) {
    return 'Union'
  }

  if (isScalarType(type)) {
    return isSpecifiedScalarType(type) ? 'Scalar (built-in)' : 'Scalar'
  }

  return 'Type'
}

function renderTypeJump(
  type: GraphQLType,
  onSelectType: (typeName: string) => void
) {
  const namedType = getNamedGraphqlType(type)

  return (
    <button
      type="button"
      onClick={() => onSelectType(namedType.name)}
      className="font-medium text-sky-700 transition hover:text-sky-900"
    >
      {formatGraphqlType(type)}
    </button>
  )
}

function renderTypeSummary(
  type: GraphQLNamedType,
  schema: GraphQLSchema,
  onSelectType: (typeName: string) => void
) {
  if (isObjectType(type) || isInterfaceType(type)) {
    const fields = Object.values(type.getFields())

    return (
      <div className="space-y-6">
        {type.description ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-6 whitespace-pre-wrap text-slate-600">
            {type.description}
          </div>
        ) : null}

        <div className="grid gap-3 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-muted-foreground text-xs font-medium">
              Fields
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {fields.length}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-muted-foreground text-xs font-medium">
              Implements
            </div>
            <div className="mt-2 flex min-h-9 flex-wrap gap-2">
              {('getInterfaces' in type ? type.getInterfaces() : []).length >
              0 ? (
                ('getInterfaces' in type ? type.getInterfaces() : []).map(
                  (item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => onSelectType(item.name)}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
                    >
                      {item.name}
                    </button>
                  )
                )
              ) : (
                <div className="text-sm text-slate-500">No interfaces</div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="text-base font-semibold text-slate-900">Fields</div>
          </div>

          <div className="divide-y divide-slate-200">
            {fields.map((field) => (
              <div key={field.name} className="space-y-3 px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <code className="rounded bg-slate-100 px-2 py-1 text-sm font-semibold text-slate-900">
                    {field.name}
                  </code>

                  <span className="text-sm text-slate-400">returns</span>
                  {renderTypeJump(field.type, onSelectType)}

                  {field.deprecationReason ? (
                    <Badge
                      variant="outline"
                      className="border-amber-200 text-amber-700"
                    >
                      Deprecated
                    </Badge>
                  ) : null}
                </div>

                {field.args.length > 0 ? (
                  <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-muted-foreground text-xs font-medium">
                      Arguments
                    </div>

                    <div className="space-y-2">
                      {field.args.map((arg) => (
                        <div
                          key={arg.name}
                          className="flex flex-wrap items-center gap-2 text-sm text-slate-700"
                        >
                          <code className="rounded bg-white px-2 py-1 font-medium text-slate-900">
                            {arg.name}
                          </code>
                          <span className="text-slate-400">:</span>
                          {renderTypeJump(arg.type, onSelectType)}
                          {arg.defaultValue !== undefined ? (
                            <span className="text-slate-500">
                              = {JSON.stringify(arg.defaultValue)}
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {field.description ? (
                  <div className="text-sm leading-6 whitespace-pre-wrap text-slate-600">
                    {field.description}
                  </div>
                ) : null}

                {field.deprecationReason ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    {field.deprecationReason}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {isInterfaceType(type) ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-base font-semibold text-slate-900">
              Implemented By
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {schema.getPossibleTypes(type).length > 0 ? (
                schema.getPossibleTypes(type).map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => onSelectType(item.name)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
                  >
                    {item.name}
                  </button>
                ))
              ) : (
                <div className="text-sm text-slate-500">No implementations</div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  if (isInputObjectType(type)) {
    const fields = Object.values(type.getFields())

    return (
      <div className="space-y-6">
        {type.description ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-6 whitespace-pre-wrap text-slate-600">
            {type.description}
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="text-base font-semibold text-slate-900">
              Input Fields
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {fields.map((field) => (
              <div key={field.name} className="space-y-3 px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <code className="rounded bg-slate-100 px-2 py-1 text-sm font-semibold text-slate-900">
                    {field.name}
                  </code>
                  <span className="text-sm text-slate-400">:</span>
                  {renderTypeJump(field.type, onSelectType)}
                  {field.defaultValue !== undefined ? (
                    <span className="text-sm text-slate-500">
                      = {JSON.stringify(field.defaultValue)}
                    </span>
                  ) : null}
                </div>

                {field.description ? (
                  <div className="text-sm leading-6 whitespace-pre-wrap text-slate-600">
                    {field.description}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isEnumType(type)) {
    return (
      <div className="space-y-6">
        {type.description ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-6 whitespace-pre-wrap text-slate-600">
            {type.description}
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="text-base font-semibold text-slate-900">
              Enum Values
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {type.getValues().map((value) => (
              <div key={value.name} className="space-y-3 px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <code className="rounded bg-slate-100 px-2 py-1 text-sm font-semibold text-slate-900">
                    {value.name}
                  </code>

                  {value.deprecationReason ? (
                    <Badge
                      variant="outline"
                      className="border-amber-200 text-amber-700"
                    >
                      Deprecated
                    </Badge>
                  ) : null}
                </div>

                {value.description ? (
                  <div className="text-sm leading-6 whitespace-pre-wrap text-slate-600">
                    {value.description}
                  </div>
                ) : null}

                {value.deprecationReason ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    {value.deprecationReason}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isUnionType(type)) {
    return (
      <div className="space-y-6">
        {type.description ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-6 whitespace-pre-wrap text-slate-600">
            {type.description}
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-base font-semibold text-slate-900">
            Possible Types
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {type.getTypes().map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => onSelectType(item.name)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isScalarType(type)) {
    return (
      <div className="space-y-6">
        {type.description ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-6 whitespace-pre-wrap text-slate-600">
            {type.description}
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-muted-foreground text-xs font-medium">
                Kind
              </div>
              <div className="mt-2 text-sm font-medium text-slate-800">
                {isSpecifiedScalarType(type)
                  ? 'Built-in scalar'
                  : 'Custom scalar'}
              </div>
            </div>

            <div>
              <div className="text-muted-foreground text-xs font-medium">
                Specification
              </div>
              <div className="mt-2 text-sm text-slate-700">
                {type.specifiedByURL ? (
                  <a
                    href={type.specifiedByURL}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-sky-700 hover:text-sky-900"
                  >
                    {type.specifiedByURL}
                  </a>
                ) : (
                  'No external specification URL'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export function GraphqlSpecViewer({ specFileIds }: GraphqlSpecViewerProps) {
  const [specFiles, setSpecFiles] = useState<GraphqlSpecFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypeName, setSelectedTypeName] = useState<string>('')
  const [tabControl, activeTab, setActiveTab] = useBetterTabs(
    [
      { id: 'reference', label: 'Reference' },
      { id: 'raw', label: 'Raw SDL' },
    ],
    'reference'
  )

  const fetchSpec = useCallback(async () => {
    if (specFileIds.length === 0) {
      setSpecFiles([])
      setError(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const files = await Promise.all(
        specFileIds.map(async (fileId) => {
          const { data } = await privateClient.query({
            query: GET_FILE_BY_ID_QUERY,
            variables: { fileId },
            fetchPolicy: 'network-only',
          })

          const downloadURL = data?.GetFileByID?.fileDownloadURL
          if (!downloadURL) {
            throw new Error('Could not get download URL for schema file')
          }

          const response = await fetch(downloadURL)
          if (!response.ok) {
            throw new Error(`Failed to download schema: ${response.statusText}`)
          }

          return {
            fileId,
            fileName: data?.GetFileByID?.fileName ?? `${fileId}.graphql`,
            content: await response.text(),
          }
        })
      )

      setSpecFiles(files)
    } catch (err) {
      setSpecFiles([])
      setError(err instanceof Error ? err.message : 'Failed to load schema')
    } finally {
      setIsLoading(false)
    }
  }, [specFileIds])

  useEffect(() => {
    void fetchSpec()
  }, [fetchSpec])

  const combinedSchema = useMemo(() => {
    return specFiles
      .map((file) => file.content.trim())
      .filter(Boolean)
      .join('\n\n')
  }, [specFiles])

  const parsedSchema = useMemo(() => {
    if (!combinedSchema) {
      return { schema: null, parseError: null as string | null }
    }

    try {
      return {
        schema: buildSchema(combinedSchema),
        parseError: null as string | null,
      }
    } catch (err) {
      return {
        schema: null,
        parseError:
          err instanceof Error ? err.message : 'Failed to parse schema',
      }
    }
  }, [combinedSchema])

  const sections = useMemo(() => {
    if (!parsedSchema.schema) {
      return [] as GraphqlSection[]
    }

    const schema = parsedSchema.schema
    const search = searchQuery.trim().toLowerCase()
    const rootTypeNames = new Set(
      [
        schema.getQueryType()?.name,
        schema.getMutationType()?.name,
        schema.getSubscriptionType()?.name,
      ].filter((value): value is string => Boolean(value))
    )

    function matches(value: string) {
      return search.length === 0 || value.toLowerCase().includes(search)
    }

    const allTypes = Object.values(schema.getTypeMap())
      .filter((type) => !type.name.startsWith('__'))
      .sort((left, right) => left.name.localeCompare(right.name))

    const rootOperations = [
      schema.getQueryType(),
      schema.getMutationType(),
      schema.getSubscriptionType(),
    ]
      .filter((value): value is GraphQLObjectType => Boolean(value))
      .filter((type) => matches(type.name))
      .map((type) => type.name)

    const objectTypes = allTypes
      .filter((type) => isObjectType(type) && !rootTypeNames.has(type.name))
      .filter((type) => matches(type.name))
      .map((type) => type.name)

    const interfaceTypes = allTypes
      .filter((type) => isInterfaceType(type))
      .filter((type) => matches(type.name))
      .map((type) => type.name)

    const inputTypes = allTypes
      .filter((type) => isInputObjectType(type))
      .filter((type) => matches(type.name))
      .map((type) => type.name)

    const enumTypes = allTypes
      .filter((type) => isEnumType(type))
      .filter((type) => matches(type.name))
      .map((type) => type.name)

    const unionTypes = allTypes
      .filter((type) => isUnionType(type))
      .filter((type) => matches(type.name))
      .map((type) => type.name)

    const scalarTypes = allTypes
      .filter((type) => isScalarType(type) && !isSpecifiedScalarType(type))
      .filter((type) => matches(type.name))
      .map((type) => type.name)

    return [
      { title: 'Operations', items: rootOperations },
      { title: 'Objects', items: objectTypes },
      { title: 'Interfaces', items: interfaceTypes },
      { title: 'Inputs', items: inputTypes },
      { title: 'Enums', items: enumTypes },
      { title: 'Unions', items: unionTypes },
      { title: 'Custom Scalars', items: scalarTypes },
    ].filter((section) => section.items.length > 0)
  }, [parsedSchema.schema, searchQuery])

  const selectedType = useMemo(() => {
    if (!parsedSchema.schema || !selectedTypeName) {
      return null
    }

    return parsedSchema.schema.getType(selectedTypeName) ?? null
  }, [parsedSchema.schema, selectedTypeName])

  useEffect(() => {
    if (!parsedSchema.schema) {
      setSelectedTypeName('')
      return
    }

    const availableTypeNames = sections.flatMap((section) => section.items)
    if (
      availableTypeNames.length > 0 &&
      !availableTypeNames.includes(selectedTypeName)
    ) {
      setSelectedTypeName(availableTypeNames[0])
    }
  }, [parsedSchema.schema, sections, selectedTypeName])

  if (isLoading) {
    return <SectionLoader label="Loading GraphQL specification..." />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="text-destructive text-sm font-medium">
          Failed to load GraphQL specification
        </div>
        <p className="text-muted-foreground max-w-md text-xs">{error}</p>
        <Button preset="link" onClick={() => void fetchSpec()}>
          Try again
        </Button>
      </div>
    )
  }

  if (specFiles.length === 0) {
    return (
      <div className="text-muted-foreground flex items-center justify-center py-16 text-sm">
        No GraphQL specification files found
      </div>
    )
  }

  return (
    <div className="graphql-spec-viewer-shell h-full w-full bg-white">
      <div className="flex min-h-full flex-col">
        <div className="viewer-header backdrop-blur-xl">
          <div className="flex flex-col gap-4 px-6 py-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">GraphQL</Badge>
                  <Badge
                    variant="outline"
                    className="border-slate-200 text-slate-600"
                  >
                    {specFiles.length} file{specFiles.length === 1 ? '' : 's'}
                  </Badge>
                  {parsedSchema.schema ? (
                    <Badge
                      variant="outline"
                      className="border-slate-200 text-slate-600"
                    >
                      {
                        Object.values(parsedSchema.schema.getTypeMap()).filter(
                          (type) => !type.name.startsWith('__')
                        ).length
                      }{' '}
                      types
                    </Badge>
                  ) : null}
                </div>

                <div>
                  <div className="viewer-title text-xl font-semibold">
                    GraphQL schema explorer
                  </div>
                  <div className="viewer-description text-sm">
                    Browse operations, types, inputs, enums, and raw SDL across
                    all uploaded schema files.
                  </div>
                </div>
              </div>

              <BetterTabController control={tabControl} />
            </div>

            {activeTab === 'reference' ? (
              <div className="relative max-w-md">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search types, operations, enums..."
                  className="border-stock h-11! !rounded-[0.8rem] bg-white pl-9 shadow-none"
                />
              </div>
            ) : null}
          </div>
        </div>

        {activeTab === 'reference' ? (
          parsedSchema.parseError || !parsedSchema.schema ? (
            <div className="flex flex-1 items-center justify-center p-6">
              <div className="viewer-state-card max-w-xl p-8 text-center">
                <div className="text-foreground text-lg font-semibold">
                  We could not build a GraphQL reference view
                </div>
                <div className="text-muted-foreground mt-3 text-sm leading-6">
                  {parsedSchema.parseError ?? 'The schema is empty or invalid.'}
                </div>
                <Button
                  preset="outline"
                  className="mt-5"
                  onClick={() => setActiveTab('raw')}
                >
                  Open raw SDL
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid flex-1 gap-0 xl:grid-cols-[320px_minmax(0,1fr)]">
              <aside className="viewer-sidebar xl:min-h-[720px]">
                <div className="space-y-6 px-4 py-5">
                  {sections.map((section) => (
                    <div key={section.title} className="space-y-2">
                      <div className="viewer-section-label px-2 text-xs font-medium">
                        {section.title}
                      </div>

                      <div className="space-y-1">
                        {section.items.map((typeName) => {
                          const type = parsedSchema.schema?.getType(typeName)

                          return (
                            <button
                              key={typeName}
                              type="button"
                              onClick={() => setSelectedTypeName(typeName)}
                              className={`viewer-nav-button flex w-full items-center justify-between px-3 py-3 text-left transition ${
                                selectedTypeName === typeName
                                  ? 'viewer-nav-button-active'
                                  : 'viewer-nav-button-inactive'
                              }`}
                            >
                              <div>
                                <div className="text-sm font-medium">
                                  {typeName}
                                </div>
                                <div className="mt-1 text-xs text-slate-500">
                                  {type ? getGraphqlTypeKind(type) : 'Type'}
                                </div>
                              </div>

                              <div className="text-xs text-slate-400">
                                {type &&
                                (isObjectType(type) || isInterfaceType(type))
                                  ? Object.keys(type.getFields()).length
                                  : type && isInputObjectType(type)
                                    ? Object.keys(type.getFields()).length
                                    : type && isEnumType(type)
                                      ? type.getValues().length
                                      : null}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}

                  {sections.length === 0 ? (
                    <div className="viewer-empty rounded-[16px] border border-dashed px-4 py-6 text-sm">
                      No schema nodes match your search.
                    </div>
                  ) : null}
                </div>
              </aside>

              <main className="min-w-0 px-6 py-6">
                {selectedType ? (
                  <div className="space-y-6">
                    <div className="viewer-hero-card p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">
                              {getGraphqlTypeKind(selectedType)}
                            </Badge>

                            {parsedSchema.schema.getQueryType()?.name ===
                            selectedType.name ? (
                              <Badge
                                variant="outline"
                                className="border-sky-200 text-sky-700"
                              >
                                Query Root
                              </Badge>
                            ) : null}

                            {parsedSchema.schema.getMutationType()?.name ===
                            selectedType.name ? (
                              <Badge
                                variant="outline"
                                className="border-emerald-200 text-emerald-700"
                              >
                                Mutation Root
                              </Badge>
                            ) : null}

                            {parsedSchema.schema.getSubscriptionType()?.name ===
                            selectedType.name ? (
                              <Badge
                                variant="outline"
                                className="border-violet-200 text-violet-700"
                              >
                                Subscription Root
                              </Badge>
                            ) : null}
                          </div>

                          <div>
                            <div className="text-xl font-semibold text-slate-950">
                              {selectedType.name}
                            </div>
                            <div className="mt-2 text-sm text-slate-500">
                              {selectedType.description
                                ? 'Schema details and field contracts'
                                : 'No description provided in schema'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {renderTypeSummary(
                      selectedType,
                      parsedSchema.schema,
                      setSelectedTypeName
                    )}
                  </div>
                ) : (
                  <div className="viewer-empty flex h-full items-center justify-center rounded-[16px] border border-dashed p-10 text-sm">
                    Select a type to inspect the schema.
                  </div>
                )}
              </main>
            </div>
          )
        ) : (
          <div className="space-y-6 px-6 py-6">
            {specFiles.map((file) => (
              <section key={file.fileId} className="raw-card overflow-hidden">
                <div className="raw-card-header flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <div className="text-foreground text-sm font-semibold">
                      {file.fileName}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {file.content.split(/\r?\n/).length} lines
                    </div>
                  </div>

                  <Badge variant="outline">SDL</Badge>
                </div>

                <SyntaxHighlighter
                  language="graphql"
                  style={oneLight}
                  customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    background: 'transparent',
                    padding: '1.25rem',
                    fontSize: '14px',
                  }}
                >
                  {file.content}
                </SyntaxHighlighter>
              </section>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .graphql-spec-viewer-shell .viewer-header {
          border-bottom: 1px solid #e5e7e9;
          background: #f9fbfc;
        }

        .graphql-spec-viewer-shell .viewer-title {
          color: #111110;
        }

        .graphql-spec-viewer-shell .viewer-description,
        .graphql-spec-viewer-shell .viewer-section-label,
        .graphql-spec-viewer-shell .viewer-empty,
        .graphql-spec-viewer-shell .viewer-state-card,
        .graphql-spec-viewer-shell .text-slate-400,
        .graphql-spec-viewer-shell .text-slate-500,
        .graphql-spec-viewer-shell .text-slate-600 {
          color: #939395 !important;
        }

        .graphql-spec-viewer-shell .text-slate-700,
        .graphql-spec-viewer-shell .text-slate-800,
        .graphql-spec-viewer-shell .text-slate-900,
        .graphql-spec-viewer-shell .text-slate-950 {
          color: #111110 !important;
        }

        .graphql-spec-viewer-shell .border-slate-200,
        .graphql-spec-viewer-shell .border-slate-200\/80 {
          border-color: #e5e7e9 !important;
        }

        .graphql-spec-viewer-shell
          .divide-slate-200
          > :not([hidden])
          ~ :not([hidden]) {
          border-color: #e5e7e9 !important;
        }

        .graphql-spec-viewer-shell .bg-slate-50,
        .graphql-spec-viewer-shell .bg-sky-50,
        .graphql-spec-viewer-shell .bg-white\/70,
        .graphql-spec-viewer-shell .bg-white\/80 {
          background: #f9fafb !important;
        }

        .graphql-spec-viewer-shell .bg-slate-100 {
          background: #f4f6f7 !important;
        }

        .graphql-spec-viewer-shell .rounded-2xl,
        .graphql-spec-viewer-shell .rounded-3xl {
          border-radius: 16px !important;
        }

        .graphql-spec-viewer-shell .viewer-sidebar {
          border-right: 1px solid #e5e7e9;
          background: #ffffff;
        }

        .graphql-spec-viewer-shell .viewer-nav-button {
          border-radius: 14px;
        }

        .graphql-spec-viewer-shell .viewer-nav-button-active {
          background: #f4f6f7;
          box-shadow: inset 0 0 0 1px #e5e7e9;
          color: #111110;
        }

        .graphql-spec-viewer-shell .viewer-nav-button-inactive {
          color: #111110;
        }

        .graphql-spec-viewer-shell .viewer-nav-button-inactive:hover {
          background: #f9fafb;
        }

        .graphql-spec-viewer-shell .viewer-hero-card,
        .graphql-spec-viewer-shell .viewer-state-card,
        .graphql-spec-viewer-shell .viewer-stat-card,
        .graphql-spec-viewer-shell .viewer-empty,
        .graphql-spec-viewer-shell .raw-card {
          border: 1px solid #e5e7e9;
          background: #ffffff;
        }

        .graphql-spec-viewer-shell .viewer-hero-card {
          border-radius: 16px;
          box-shadow: none;
        }

        .graphql-spec-viewer-shell .viewer-state-card,
        .graphql-spec-viewer-shell .viewer-stat-card,
        .graphql-spec-viewer-shell .viewer-empty,
        .graphql-spec-viewer-shell .raw-card {
          border-radius: 16px;
        }

        .graphql-spec-viewer-shell .viewer-stat-card,
        .graphql-spec-viewer-shell .raw-card-header {
          background: #f9fafb;
        }

        .graphql-spec-viewer-shell .raw-card-header {
          border-bottom: 1px solid #e5e7e9;
        }

        .graphql-spec-viewer-shell .raw-card pre {
          margin: 0 !important;
          background: #fafafa !important;
        }
      `}</style>
    </div>
  )
}

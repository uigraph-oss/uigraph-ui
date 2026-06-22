'use client'

import { apolloClientGQL } from '@/api/client'
import { SectionLoader } from '@/components/section-loader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { API_GROUP_SPEC } from '@/features/services/api/api-spec'
import { BetterTabController, useBetterTabs } from '@/hooks/use-better-tabs'
import { useCurrentOrganization } from '@/store/auth-store'
import { Search } from 'lucide-react'
import type {
  Enum as ProtoEnum,
  FieldBase as ProtoFieldBase,
  Method as ProtoMethod,
  ReflectionObject as ProtoReflectionObject,
  Root as ProtoRoot,
  Service as ProtoService,
  Type as ProtoType,
} from 'protobufjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

type GrpcSpecViewerProps = {
  serviceId: string
  apiGroupId: string
}

type GrpcSpecFile = {
  fileId: string
  fileName: string
  content: string
}

type ProtoServiceEntry = {
  key: string
  name: string
  fullName: string
  kind: 'service'
  object: ProtoService
}

type ProtoMessageEntry = {
  key: string
  name: string
  fullName: string
  kind: 'message'
  object: ProtoType
}

type ProtoEnumEntry = {
  key: string
  name: string
  fullName: string
  kind: 'enum'
  object: ProtoEnum
}

type ProtoViewerEntry = ProtoServiceEntry | ProtoMessageEntry | ProtoEnumEntry

type ProtoSection = {
  title: string
  items: ProtoViewerEntry[]
}

function normalizeProtoPath(value: string): string {
  return value.replace(/\\/g, '/').replace(/\/+/g, '/').replace(/^\.\//, '')
}

function getProtoBasename(value: string): string {
  const normalized = normalizeProtoPath(value)
  const parts = normalized.split('/')
  return parts[parts.length - 1] ?? normalized
}

function getProtoFullName(object: ProtoReflectionObject): string {
  return object.fullName.replace(/^\./, '')
}

function isProtoService(value: unknown): value is ProtoService {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'methodsArray' in value &&
    'create' in value
  )
}

function isProtoType(value: unknown): value is ProtoType {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'fieldsArray' in value &&
    'extensions' in value
  )
}

function isProtoEnum(value: unknown): value is ProtoEnum {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'values' in value &&
    'valuesById' in value
  )
}

function canShowProtoObject(
  object: ProtoReflectionObject,
  availableFiles: Set<string>
): boolean {
  const fullName = getProtoFullName(object)
  if (fullName.startsWith('google.protobuf.')) {
    return false
  }

  const filename = normalizeProtoPath(object.filename ?? '')
  if (!filename) {
    return true
  }

  return (
    availableFiles.has(filename) ||
    availableFiles.has(getProtoBasename(filename))
  )
}

function collectProtoEntries(
  object: ProtoReflectionObject & { nestedArray?: ProtoReflectionObject[] },
  availableFiles: Set<string>,
  entries: ProtoViewerEntry[]
) {
  const nestedObjects = object.nestedArray ?? []

  nestedObjects.forEach((child) => {
    if (isProtoService(child) && canShowProtoObject(child, availableFiles)) {
      entries.push({
        key: `service:${getProtoFullName(child)}`,
        name: child.name,
        fullName: getProtoFullName(child),
        kind: 'service',
        object: child,
      })
    }

    if (isProtoType(child) && canShowProtoObject(child, availableFiles)) {
      entries.push({
        key: `message:${getProtoFullName(child)}`,
        name: child.name,
        fullName: getProtoFullName(child),
        kind: 'message',
        object: child,
      })
    }

    if (isProtoEnum(child) && canShowProtoObject(child, availableFiles)) {
      entries.push({
        key: `enum:${getProtoFullName(child)}`,
        name: child.name,
        fullName: getProtoFullName(child),
        kind: 'enum',
        object: child,
      })
    }

    if ('nestedArray' in child) {
      collectProtoEntries(
        child as ProtoReflectionObject & {
          nestedArray?: ProtoReflectionObject[]
        },
        availableFiles,
        entries
      )
    }
  })
}

function formatProtoRpcType(method: ProtoMethod): string {
  if (method.requestStream && method.responseStream) {
    return 'Bidirectional stream'
  }

  if (method.requestStream) {
    return 'Client stream'
  }

  if (method.responseStream) {
    return 'Server stream'
  }

  return 'Unary'
}

function formatProtoFieldType(field: ProtoFieldBase): string {
  const resolvedName = field.resolvedType?.fullName
    ? field.resolvedType.fullName.replace(/^\./, '')
    : field.type

  if (field.map && 'keyType' in field) {
    return `map<${field.keyType}, ${resolvedName}>`
  }

  if (field.repeated) {
    return `repeated ${resolvedName}`
  }

  return resolvedName
}

function renderProtoTarget(
  label: string,
  targetName: string | null,
  entryKeyByName: Map<string, string>,
  onSelectEntry: (key: string) => void
) {
  if (!targetName) {
    return <span className="font-medium text-[#D2D9E6]">{label}</span>
  }

  const key = entryKeyByName.get(targetName)
  if (!key) {
    return <span className="font-medium text-[#D2D9E6]">{label}</span>
  }

  return (
    <button
      type="button"
      onClick={() => onSelectEntry(key)}
      className="font-medium text-sky-700 transition hover:text-sky-900"
    >
      {label}
    </button>
  )
}

function renderProtoDetails(
  entry: ProtoViewerEntry,
  entryKeyByName: Map<string, string>,
  onSelectEntry: (key: string) => void
) {
  if (entry.kind === 'service') {
    const service = entry.object

    return (
      <div className="space-y-6">
        {service.comment ? (
          <div className="rounded-2xl border border-[#2A3242] bg-[#141925] p-5 text-sm leading-6 whitespace-pre-wrap text-[#828DA3]">
            {service.comment}
          </div>
        ) : null}

        <div className="grid gap-3 xl:grid-cols-2">
          <div className="rounded-2xl border border-[#2A3242] bg-[#141925] p-5">
            <div className="text-muted-foreground text-xs font-medium">
              Methods
            </div>
            <div className="mt-2 text-2xl font-semibold text-[#F4F7FC]">
              {service.methodsArray.length}
            </div>
          </div>

          <div className="rounded-2xl border border-[#2A3242] bg-[#141925] p-5">
            <div className="text-muted-foreground text-xs font-medium">
              Package Path
            </div>
            <div className="mt-2 text-sm font-medium break-all text-[#D2D9E6]">
              {entry.fullName}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#2A3242] bg-[#141925]">
          <div className="border-b border-[#2A3242] px-5 py-4">
            <div className="text-base font-semibold text-[#F4F7FC]">
              RPC Methods
            </div>
          </div>

          <div className="divide-y divide-[#2A3242]">
            {service.methodsArray.map((method) => {
              const requestName = method.resolvedRequestType?.fullName
                ? method.resolvedRequestType.fullName.replace(/^\./, '')
                : method.requestType
              const responseName = method.resolvedResponseType?.fullName
                ? method.resolvedResponseType.fullName.replace(/^\./, '')
                : method.responseType

              return (
                <div key={method.name} className="space-y-3 px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="rounded bg-[#1E2533] px-2 py-1 text-sm font-semibold text-[#F4F7FC]">
                      {method.name}
                    </code>
                    <Badge
                      variant="outline"
                      className="border-[#2A3242] text-[#D2D9E6]"
                    >
                      {formatProtoRpcType(method)}
                    </Badge>
                  </div>

                  <div className="rounded-xl border border-[#2A3242] bg-[#1E2533] p-4 text-sm text-[#D2D9E6]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-[#828DA3]">rpc</span>
                      <span>{method.name}</span>
                      <span className="text-[#586378]">(</span>
                      {renderProtoTarget(
                        method.requestType,
                        requestName,
                        entryKeyByName,
                        onSelectEntry
                      )}
                      <span className="text-[#586378]">)</span>
                      <span className="text-[#586378]">returns</span>
                      <span className="text-[#586378]">(</span>
                      {renderProtoTarget(
                        method.responseType,
                        responseName,
                        entryKeyByName,
                        onSelectEntry
                      )}
                      <span className="text-[#586378]">)</span>
                    </div>
                  </div>

                  {method.comment ? (
                    <div className="text-sm leading-6 whitespace-pre-wrap text-[#828DA3]">
                      {method.comment}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (entry.kind === 'message') {
    const message = entry.object

    return (
      <div className="space-y-6">
        {message.comment ? (
          <div className="rounded-2xl border border-[#2A3242] bg-[#141925] p-5 text-sm leading-6 whitespace-pre-wrap text-[#828DA3]">
            {message.comment}
          </div>
        ) : null}

        <div className="grid gap-3 xl:grid-cols-2">
          <div className="rounded-2xl border border-[#2A3242] bg-[#141925] p-5">
            <div className="text-muted-foreground text-xs font-medium">
              Fields
            </div>
            <div className="mt-2 text-2xl font-semibold text-[#F4F7FC]">
              {message.fieldsArray.length}
            </div>
          </div>

          <div className="rounded-2xl border border-[#2A3242] bg-[#141925] p-5">
            <div className="text-muted-foreground text-xs font-medium">
              Nested Types
            </div>
            <div className="mt-2 text-2xl font-semibold text-[#F4F7FC]">
              {'nestedArray' in message ? message.nestedArray.length : 0}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#2A3242] bg-[#141925]">
          <div className="border-b border-[#2A3242] px-5 py-4">
            <div className="text-base font-semibold text-[#F4F7FC]">Fields</div>
          </div>

          <div className="divide-y divide-[#2A3242]">
            {message.fieldsArray.map((field) => {
              const targetName = field.resolvedType?.fullName
                ? field.resolvedType.fullName.replace(/^\./, '')
                : null

              return (
                <div key={field.name} className="space-y-3 px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="rounded bg-[#1E2533] px-2 py-1 text-sm font-semibold text-[#F4F7FC]">
                      {field.name}
                    </code>

                    <Badge
                      variant="outline"
                      className="border-[#2A3242] text-[#D2D9E6]"
                    >
                      #{field.id}
                    </Badge>

                    {field.map ? (
                      <Badge
                        variant="outline"
                        className="border-emerald-200 text-emerald-700"
                      >
                        Map
                      </Badge>
                    ) : null}

                    {field.repeated ? (
                      <Badge
                        variant="outline"
                        className="border-sky-200 text-sky-700"
                      >
                        Repeated
                      </Badge>
                    ) : null}

                    {field.partOf ? (
                      <Badge
                        variant="outline"
                        className="border-violet-200 text-violet-700"
                      >
                        oneof {field.partOf.name}
                      </Badge>
                    ) : null}
                  </div>

                  <div className="rounded-xl border border-[#2A3242] bg-[#1E2533] p-4 text-sm text-[#D2D9E6]">
                    {renderProtoTarget(
                      formatProtoFieldType(field),
                      targetName,
                      entryKeyByName,
                      onSelectEntry
                    )}
                  </div>

                  {field.comment ? (
                    <div className="text-sm leading-6 whitespace-pre-wrap text-[#828DA3]">
                      {field.comment}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const enumType = entry.object

  return (
    <div className="space-y-6">
      {enumType.comment ? (
        <div className="rounded-2xl border border-[#2A3242] bg-[#141925] p-5 text-sm leading-6 whitespace-pre-wrap text-[#828DA3]">
          {enumType.comment}
        </div>
      ) : null}

      <div className="rounded-2xl border border-[#2A3242] bg-[#141925]">
        <div className="border-b border-[#2A3242] px-5 py-4">
          <div className="text-base font-semibold text-[#F4F7FC]">
            Enum Values
          </div>
        </div>

        <div className="divide-y divide-[#2A3242]">
          {Object.entries(enumType.values)
            .sort((left, right) => left[1] - right[1])
            .map(([name, value]) => (
              <div key={name} className="space-y-3 px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <code className="rounded bg-[#1E2533] px-2 py-1 text-sm font-semibold text-[#F4F7FC]">
                    {name}
                  </code>
                  <Badge
                    variant="outline"
                    className="border-[#2A3242] text-[#D2D9E6]"
                  >
                    {value}
                  </Badge>
                </div>

                {enumType.comments?.[name] ? (
                  <div className="text-sm leading-6 whitespace-pre-wrap text-[#828DA3]">
                    {enumType.comments[name]}
                  </div>
                ) : null}
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export function GrpcSpecViewer({ serviceId, apiGroupId }: GrpcSpecViewerProps) {
  const orgId = useCurrentOrganization()?.id
  const [specFiles, setSpecFiles] = useState<GrpcSpecFile[]>([])
  const [parsedRoot, setParsedRoot] = useState<ProtoRoot | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEntryKey, setSelectedEntryKey] = useState('')
  const [tabControl, activeTab, setActiveTab] = useBetterTabs(
    [
      { id: 'reference', label: 'Reference' },
      { id: 'raw', label: 'Raw Proto' },
    ],
    'reference'
  )

  const fetchSpec = useCallback(async () => {
    if (!apiGroupId) {
      setSpecFiles([])
      setParsedRoot(null)
      setParseError(null)
      setError(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setParseError(null)

      const { data } = await apolloClientGQL.query({
        query: API_GROUP_SPEC,
        variables: { orgId: orgId!, serviceId, apiGroupId },
        fetchPolicy: 'network-only',
      })

      const spec = data?.apiGroupSpec
      if (spec?.content == null) {
        throw new Error('Could not load proto content for API group')
      }

      const files = [
        {
          fileId: spec.apiGroupId,
          fileName: spec.fileName ?? `${spec.apiGroupId}.proto`,
          content: spec.content,
        },
      ]

      setSpecFiles(files)

      try {
        const protobuf = await import('protobufjs')
        const aliases = new Map<string, string>()
        const contents = new Map<string, string>()

        files.forEach((file) => {
          const normalized = normalizeProtoPath(file.fileName)
          contents.set(normalized, file.content)
          aliases.set(normalized, normalized)

          const basename = getProtoBasename(normalized)
          if (!aliases.has(basename)) {
            aliases.set(basename, normalized)
          }
        })

        function resolveFileName(origin: string, target: string) {
          const normalizedTarget = normalizeProtoPath(target)
          if (aliases.has(normalizedTarget)) {
            return aliases.get(normalizedTarget) ?? normalizedTarget
          }

          const originDirectory = normalizeProtoPath(origin)
            .split('/')
            .slice(0, -1)
            .join('/')
          const relative = normalizeProtoPath(
            originDirectory
              ? `${originDirectory}/${normalizedTarget}`
              : normalizedTarget
          )

          if (aliases.has(relative)) {
            return aliases.get(relative) ?? relative
          }

          const basename = getProtoBasename(normalizedTarget)
          if (aliases.has(basename)) {
            return aliases.get(basename) ?? basename
          }

          return relative
        }

        const root = new protobuf.Root()
        root.resolvePath = (origin, target) => resolveFileName(origin, target)
        root.fetch = (path, callback) => {
          const finish = callback as (
            error: Error | null,
            contents?: string
          ) => void
          const resolved = resolveFileName('', path)
          const content = contents.get(resolved)

          if (content === undefined) {
            finish(new Error(`Missing imported proto file: ${path}`))
            return
          }

          finish(null, content)
        }

        await root.load([...contents.keys()], { keepCase: true })
        root.resolveAll()
        setParsedRoot(root)
      } catch (err) {
        setParsedRoot(null)
        setParseError(
          err instanceof Error ? err.message : 'Failed to parse proto files'
        )
      }
    } catch (err) {
      setParsedRoot(null)
      setError(
        err instanceof Error ? err.message : 'Failed to load proto files'
      )
    } finally {
      setIsLoading(false)
    }
  }, [orgId, serviceId, apiGroupId])

  useEffect(() => {
    void fetchSpec()
  }, [fetchSpec])

  const entries = useMemo(() => {
    if (!parsedRoot) {
      return [] as ProtoViewerEntry[]
    }

    const availableFiles = new Set<string>()
    specFiles.forEach((file) => {
      const normalized = normalizeProtoPath(file.fileName)
      availableFiles.add(normalized)
      availableFiles.add(getProtoBasename(normalized))
    })

    const allEntries: ProtoViewerEntry[] = []
    collectProtoEntries(
      parsedRoot as ProtoReflectionObject & {
        nestedArray?: ProtoReflectionObject[]
      },
      availableFiles,
      allEntries
    )

    return allEntries.sort((left, right) =>
      left.fullName.localeCompare(right.fullName)
    )
  }, [parsedRoot, specFiles])

  const filteredSections = useMemo(() => {
    const search = searchQuery.trim().toLowerCase()
    function matches(entry: ProtoViewerEntry) {
      return (
        search.length === 0 ||
        entry.fullName.toLowerCase().includes(search) ||
        entry.name.toLowerCase().includes(search)
      )
    }

    return [
      {
        title: 'Services',
        items: entries.filter(
          (entry) => entry.kind === 'service' && matches(entry)
        ),
      },
      {
        title: 'Messages',
        items: entries.filter(
          (entry) => entry.kind === 'message' && matches(entry)
        ),
      },
      {
        title: 'Enums',
        items: entries.filter(
          (entry) => entry.kind === 'enum' && matches(entry)
        ),
      },
    ].filter((section) => section.items.length > 0) as ProtoSection[]
  }, [entries, searchQuery])

  const entryKeyByName = useMemo(() => {
    return new Map(entries.map((entry) => [entry.fullName, entry.key]))
  }, [entries])

  const selectedEntry = useMemo(() => {
    return entries.find((entry) => entry.key === selectedEntryKey) ?? null
  }, [entries, selectedEntryKey])

  useEffect(() => {
    const firstAvailable = filteredSections[0]?.items[0]?.key ?? ''
    if (
      firstAvailable &&
      !filteredSections.some((section) =>
        section.items.some((entry) => entry.key === selectedEntryKey)
      )
    ) {
      setSelectedEntryKey(firstAvailable)
    }
  }, [filteredSections, selectedEntryKey])

  if (isLoading) {
    return <SectionLoader label="Loading gRPC specification..." />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="text-destructive text-sm font-medium">
          Failed to load gRPC specification
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
        No gRPC specification files found
      </div>
    )
  }

  return (
    <div className="grpc-spec-viewer-shell h-full w-full bg-[#141925]">
      <div className="flex min-h-full flex-col">
        <div className="viewer-header backdrop-blur-xl">
          <div className="flex flex-col gap-4 px-6 py-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">gRPC</Badge>
                  <Badge
                    variant="outline"
                    className="border-[#2A3242] text-[#828DA3]"
                  >
                    {specFiles.length} file{specFiles.length === 1 ? '' : 's'}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-[#2A3242] text-[#828DA3]"
                  >
                    {entries.filter((entry) => entry.kind === 'service').length}{' '}
                    services
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-[#2A3242] text-[#828DA3]"
                  >
                    {entries.filter((entry) => entry.kind === 'message').length}{' '}
                    messages
                  </Badge>
                </div>

                <div>
                  <div className="viewer-title text-xl font-semibold">
                    Proto reference explorer
                  </div>
                  <div className="viewer-description text-sm">
                    Inspect services, RPC methods, request and response
                    messages, enums, and raw proto source across all uploaded
                    files.
                  </div>
                </div>
              </div>

              <BetterTabController control={tabControl} />
            </div>

            {activeTab === 'reference' ? (
              <div className="relative max-w-md">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#586378]" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search services, messages, enums..."
                  className="border-stock h-11! !rounded-[0.8rem] bg-[#141925] pl-9 shadow-none"
                />
              </div>
            ) : null}
          </div>
        </div>

        {activeTab === 'reference' ? (
          parseError || !parsedRoot ? (
            <div className="flex flex-1 items-center justify-center p-6">
              <div className="viewer-state-card max-w-xl p-8 text-center">
                <div className="text-foreground text-lg font-semibold">
                  We could not build a gRPC reference view
                </div>
                <div className="text-muted-foreground mt-3 text-sm leading-6">
                  {parseError ?? 'The proto files are empty or invalid.'}
                </div>
                <Button
                  preset="outline"
                  className="mt-5"
                  onClick={() => setActiveTab('raw')}
                >
                  Open raw proto
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid flex-1 gap-0 xl:grid-cols-[320px_minmax(0,1fr)]">
              <aside className="viewer-sidebar xl:min-h-[720px]">
                <div className="space-y-6 px-4 py-5">
                  {filteredSections.map((section) => (
                    <div key={section.title} className="space-y-2">
                      <div className="viewer-section-label px-2 text-xs font-medium">
                        {section.title}
                      </div>

                      <div className="space-y-1">
                        {section.items.map((entry) => (
                          <button
                            key={entry.key}
                            type="button"
                            onClick={() => setSelectedEntryKey(entry.key)}
                            className={`viewer-nav-button flex w-full items-center justify-between px-3 py-3 text-left transition ${
                              selectedEntryKey === entry.key
                                ? 'viewer-nav-button-active'
                                : 'viewer-nav-button-inactive'
                            }`}
                          >
                            <div>
                              <div className="text-sm font-medium">
                                {entry.name}
                              </div>
                              <div className="mt-1 text-xs text-[#828DA3]">
                                {entry.fullName}
                              </div>
                            </div>

                            <div className="text-xs text-[#586378]">
                              {entry.kind === 'service'
                                ? entry.object.methodsArray.length
                                : entry.kind === 'message'
                                  ? entry.object.fieldsArray.length
                                  : Object.keys(entry.object.values).length}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {filteredSections.length === 0 ? (
                    <div className="viewer-empty rounded-[16px] border border-dashed px-4 py-6 text-sm">
                      No proto nodes match your search.
                    </div>
                  ) : null}
                </div>
              </aside>

              <main className="min-w-0 px-6 py-6">
                {selectedEntry ? (
                  <div className="space-y-6">
                    <div className="viewer-hero-card p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">
                              {selectedEntry.kind === 'service'
                                ? 'Service'
                                : selectedEntry.kind === 'message'
                                  ? 'Message'
                                  : 'Enum'}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="border-[#2A3242] text-[#828DA3]"
                            >
                              {selectedEntry.fullName}
                            </Badge>
                          </div>

                          <div>
                            <div className="text-foreground text-xl font-semibold">
                              {selectedEntry.name}
                            </div>
                            <div className="mt-2 text-sm text-[#828DA3]">
                              {selectedEntry.kind === 'service'
                                ? 'RPC methods and message contracts'
                                : selectedEntry.kind === 'message'
                                  ? 'Field definitions and nested structures'
                                  : 'Available enum members and values'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {renderProtoDetails(
                      selectedEntry,
                      entryKeyByName,
                      setSelectedEntryKey
                    )}
                  </div>
                ) : (
                  <div className="viewer-empty flex h-full items-center justify-center rounded-[16px] border border-dashed p-10 text-sm">
                    Select a service, message, or enum to inspect the proto
                    schema.
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

                  <Badge variant="outline">PROTO</Badge>
                </div>

                <SyntaxHighlighter
                  language="protobuf"
                  style={oneDark}
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
        .grpc-spec-viewer-shell .viewer-header {
          border-bottom: 1px solid var(--border);
          background: var(--card);
        }

        .grpc-spec-viewer-shell .viewer-title {
          color: var(--foreground);
        }

        .grpc-spec-viewer-shell .viewer-description,
        .grpc-spec-viewer-shell .viewer-section-label,
        .grpc-spec-viewer-shell .viewer-empty,
        .grpc-spec-viewer-shell .viewer-state-card,
        .grpc-spec-viewer-shell .text-[#586378],
        .grpc-spec-viewer-shell .text-[#828DA3],
        .grpc-spec-viewer-shell .text-[#828DA3] {
          color: var(--muted-foreground) !important;
        }

        .grpc-spec-viewer-shell .text-[#D2D9E6],
        .grpc-spec-viewer-shell .text-[#F4F7FC],
        .grpc-spec-viewer-shell .text-[#F4F7FC],
        .grpc-spec-viewer-shell .text-slate-950 {
          color: var(--foreground) !important;
        }

        .grpc-spec-viewer-shell .border-[#2A3242],
        .grpc-spec-viewer-shell .border-[#2A3242]\/80 {
          border-color: var(--border) !important;
        }

        .grpc-spec-viewer-shell
          .divide-[#2A3242]
          > :not([hidden])
          ~ :not([hidden]) {
          border-color: var(--border) !important;
        }

        .grpc-spec-viewer-shell .bg-[#1E2533],
        .grpc-spec-viewer-shell .bg-cyan-50,
        .grpc-spec-viewer-shell .bg-[#141925]\/70,
        .grpc-spec-viewer-shell .bg-[#141925]\/80 {
          background: var(--secondary) !important;
        }

        .grpc-spec-viewer-shell .bg-[#1E2533] {
          background: var(--accent) !important;
        }

        .grpc-spec-viewer-shell .rounded-2xl,
        .grpc-spec-viewer-shell .rounded-3xl {
          border-radius: 16px !important;
        }

        .grpc-spec-viewer-shell .viewer-sidebar {
          border-right: 1px solid var(--border);
          background: var(--card);
        }

        .grpc-spec-viewer-shell .viewer-nav-button {
          border-radius: 14px;
        }

        .grpc-spec-viewer-shell .viewer-nav-button-active {
          background: var(--accent);
          box-shadow: inset 0 0 0 1px var(--border);
          color: var(--foreground);
        }

        .grpc-spec-viewer-shell .viewer-nav-button-inactive {
          color: var(--foreground);
        }

        .grpc-spec-viewer-shell .viewer-nav-button-inactive:hover {
          background: var(--secondary);
        }

        .grpc-spec-viewer-shell .viewer-hero-card,
        .grpc-spec-viewer-shell .viewer-state-card,
        .grpc-spec-viewer-shell .viewer-stat-card,
        .grpc-spec-viewer-shell .viewer-empty,
        .grpc-spec-viewer-shell .raw-card {
          border: 1px solid var(--border);
          background: var(--card);
        }

        .grpc-spec-viewer-shell .viewer-hero-card {
          border-radius: 16px;
          box-shadow: none;
        }

        .grpc-spec-viewer-shell .viewer-state-card,
        .grpc-spec-viewer-shell .viewer-stat-card,
        .grpc-spec-viewer-shell .viewer-empty,
        .grpc-spec-viewer-shell .raw-card {
          border-radius: 16px;
        }

        .grpc-spec-viewer-shell .viewer-stat-card,
        .grpc-spec-viewer-shell .raw-card-header {
          background: var(--secondary);
        }

        .grpc-spec-viewer-shell .raw-card-header {
          border-bottom: 1px solid var(--border);
        }

        .grpc-spec-viewer-shell .raw-card pre {
          margin: 0 !important;
          background: transparent !important;
        }
      `}</style>
    </div>
  )
}

'use client'

import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'

// ─── Schema types ────────────────────────────────────────────

type SchemaNode = {
  type?: string
  format?: string
  required?: string[]
  example?: unknown
  properties?: Record<string, SchemaNode>
  items?: SchemaNode
  allOf?: SchemaNode[]
  oneOf?: SchemaNode[]
  anyOf?: SchemaNode[]
  $ref?: string
}

type ParsedParameter = {
  Name: string
  In: string
  Description: string
  Required: boolean
  Type: string
}

type StatusCodeMap = Record<string, string>

// ─── Helpers ─────────────────────────────────────────────────

function tryParseJSON<T>(value: string | undefined | null): T | null {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function typeColor(type?: string) {
  switch (type) {
    case 'string':
      return 'text-green-600'
    case 'integer':
    case 'number':
      return 'text-blue-600'
    case 'boolean':
      return 'text-amber-600'
    case 'array':
      return 'text-purple-600'
    case 'object':
      return 'text-orange-600'
    default:
      return 'text-muted-foreground'
  }
}

function statusCodeColor(code: string) {
  if (code.startsWith('2')) return 'bg-green-100 text-green-700'
  if (code.startsWith('3')) return 'bg-blue-100 text-blue-700'
  if (code.startsWith('4')) return 'bg-amber-100 text-amber-700'
  if (code.startsWith('5')) return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-700'
}

// ─── SchemaTree (recursive) ──────────────────────────────────

function SchemaProperty({
  name,
  schema,
  isRequired,
  depth = 0,
}: {
  name: string
  schema: SchemaNode
  isRequired: boolean
  depth?: number
}) {
  const [isExpanded, setIsExpanded] = useState(depth < 2)
  const hasChildren =
    schema.properties ||
    schema.items ||
    schema.allOf ||
    schema.oneOf ||
    schema.anyOf

  const displayType = schema.type
    ? schema.type + (schema.format ? ` (${schema.format})` : '')
    : schema.$ref
      ? (schema.$ref.split('/').pop() ?? '$ref')
      : 'unknown'

  return (
    <div className={cn('border-l border-gray-100', depth > 0 && 'ml-4')}>
      <div
        className={cn(
          'flex items-center gap-2 py-1 pr-3 pl-2',
          hasChildren && 'cursor-pointer hover:bg-gray-50'
        )}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="h-3 w-3 shrink-0 text-gray-400" />
          ) : (
            <ChevronRight className="h-3 w-3 shrink-0 text-gray-400" />
          )
        ) : (
          <span className="w-3" />
        )}

        <span className="text-sm font-medium text-gray-900">{name}</span>

        <span className={cn('font-mono text-xs', typeColor(schema.type))}>
          {displayType}
        </span>

        {isRequired && (
          <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
            required
          </span>
        )}

        {schema.example !== undefined && (
          <span className="text-muted-foreground ml-auto text-xs">
            e.g.{' '}
            <code className="rounded bg-gray-100 px-1 py-0.5 text-[10px]">
              {typeof schema.example === 'string'
                ? schema.example
                : JSON.stringify(schema.example)}
            </code>
          </span>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div className="pl-1">
          {/* Object properties */}
          {schema.properties &&
            Object.entries(schema.properties).map(([propName, propSchema]) => (
              <SchemaProperty
                key={propName}
                name={propName}
                schema={propSchema}
                isRequired={schema.required?.includes(propName) ?? false}
                depth={depth + 1}
              />
            ))}

          {/* Array items */}
          {schema.items && (
            <SchemaProperty
              name="[items]"
              schema={schema.items}
              isRequired={false}
              depth={depth + 1}
            />
          )}

          {/* allOf / oneOf / anyOf */}
          {schema.allOf?.map((s, i) => (
            <SchemaProperty
              key={`allOf-${i}`}
              name={`allOf[${i}]`}
              schema={s}
              isRequired={false}
              depth={depth + 1}
            />
          ))}
          {schema.oneOf?.map((s, i) => (
            <SchemaProperty
              key={`oneOf-${i}`}
              name={`oneOf[${i}]`}
              schema={s}
              isRequired={false}
              depth={depth + 1}
            />
          ))}
          {schema.anyOf?.map((s, i) => (
            <SchemaProperty
              key={`anyOf-${i}`}
              name={`anyOf[${i}]`}
              schema={s}
              isRequired={false}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SchemaTree({ schema }: { schema: SchemaNode }) {
  if (!schema.properties && !schema.items && !schema.allOf) {
    return (
      <div className="text-muted-foreground py-2 text-xs">
        Type:{' '}
        <span className={typeColor(schema.type)}>
          {schema.type || 'unknown'}
        </span>
        {schema.format && <span> ({schema.format})</span>}
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {schema.properties &&
        Object.entries(schema.properties).map(([name, propSchema]) => (
          <SchemaProperty
            key={name}
            name={name}
            schema={propSchema}
            isRequired={schema.required?.includes(name) ?? false}
            depth={0}
          />
        ))}
      {schema.items && (
        <SchemaProperty
          name="[items]"
          schema={schema.items}
          isRequired={false}
          depth={0}
        />
      )}
      {schema.allOf?.map((s, i) => (
        <SchemaProperty
          key={`allOf-${i}`}
          name={`allOf[${i}]`}
          schema={s}
          isRequired={false}
          depth={0}
        />
      ))}
    </div>
  )
}

// ─── Parameters Table ────────────────────────────────────────

function ParametersTable({ parameters }: { parameters: ParsedParameter[] }) {
  const grouped = useMemo(() => {
    const groups: Record<string, ParsedParameter[]> = {}
    for (const p of parameters) {
      const loc = p.In || 'other'
      if (!groups[loc]) groups[loc] = []
      groups[loc].push(p)
    }
    return groups
  }, [parameters])

  return (
    <div className="space-y-3">
      {Object.entries(grouped).map(([location, params]) => (
        <div key={location}>
          <div className="mb-1.5 text-xs font-medium tracking-wider text-gray-500 uppercase">
            {location} parameters
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                    Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                    Type
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                    Required
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {params.map((p) => (
                  <tr key={p.Name} className="border-b border-gray-50">
                    <td className="px-3 py-2 font-mono text-xs font-medium text-gray-900">
                      {p.Name}
                    </td>
                    <td
                      className={cn(
                        'px-3 py-2 font-mono text-xs',
                        typeColor(p.Type)
                      )}
                    >
                      {p.Type || '-'}
                    </td>
                    <td className="px-3 py-2">
                      {p.Required ? (
                        <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
                          required
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          optional
                        </span>
                      )}
                    </td>
                    <td className="text-muted-foreground px-3 py-2 text-xs">
                      {p.Description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Status Codes ────────────────────────────────────────────

function StatusCodesView({ statusCodes }: { statusCodes: StatusCodeMap }) {
  const sorted = useMemo(
    () => Object.entries(statusCodes).sort(([a], [b]) => a.localeCompare(b)),
    [statusCodes]
  )

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
              Code
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(([code, desc]) => (
            <tr key={code} className="border-b border-gray-50">
              <td className="px-3 py-2">
                <span
                  className={cn(
                    'inline-flex rounded-md px-2 py-0.5 text-xs font-medium',
                    statusCodeColor(code)
                  )}
                >
                  {code}
                </span>
              </td>
              <td className="text-muted-foreground px-3 py-2 text-xs">
                {desc || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────

export type EndpointSchemaData = {
  requestSchema?: string | null
  responseSchema?: string | null
  statusCodes?: string | null
  parameters?: string | null
  tags?: string | null
  deprecated?: string | null
  description?: string | null
}

export function EndpointSchemaView({ data }: { data: EndpointSchemaData }) {
  const requestSchema = tryParseJSON<SchemaNode>(data.requestSchema)
  const responseSchema = tryParseJSON<SchemaNode>(data.responseSchema)
  const statusCodes = tryParseJSON<StatusCodeMap>(data.statusCodes)
  const parameters = tryParseJSON<ParsedParameter[]>(data.parameters)

  const tags = data.tags?.split(', ').filter(Boolean) ?? []
  const isDeprecated = data.deprecated === 'true'

  const hasContent =
    data.description ||
    isDeprecated ||
    tags.length > 0 ||
    parameters ||
    requestSchema ||
    responseSchema ||
    statusCodes

  if (!hasContent) {
    return null
  }

  return (
    <div className="space-y-6 px-6 py-4">
      {/* Deprecation + Tags */}
      {(isDeprecated || tags.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {isDeprecated && (
            <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
              Deprecated
            </span>
          )}
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      {data.description && (
        <div>
          <div className="mb-1.5 text-xs font-medium tracking-wider text-gray-500 uppercase">
            Description
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
            {data.description}
          </p>
        </div>
      )}

      {/* Parameters */}
      {parameters && parameters.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-medium tracking-wider text-gray-500 uppercase">
            Parameters
          </div>
          <ParametersTable parameters={parameters} />
        </div>
      )}

      {/* Request Schema */}
      {requestSchema && (
        <div>
          <div className="mb-2 text-xs font-medium tracking-wider text-gray-500 uppercase">
            Request Body
          </div>
          <SchemaTree schema={requestSchema} />
        </div>
      )}

      {/* Response Schema */}
      {responseSchema && (
        <div>
          <div className="mb-2 text-xs font-medium tracking-wider text-gray-500 uppercase">
            Response Body
          </div>
          <SchemaTree schema={responseSchema} />
        </div>
      )}

      {/* Status Codes */}
      {statusCodes && Object.keys(statusCodes).length > 0 && (
        <div>
          <div className="mb-2 text-xs font-medium tracking-wider text-gray-500 uppercase">
            Status Codes
          </div>
          <StatusCodesView statusCodes={statusCodes} />
        </div>
      )}
    </div>
  )
}

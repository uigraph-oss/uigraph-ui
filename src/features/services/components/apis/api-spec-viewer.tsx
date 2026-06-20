'use client'

import { clientV2 } from '@/api/client'
import { CodeMirrorRaw } from '@/components/code-mirror'
import { SectionLoader } from '@/components/section-loader'
import { API_GROUP_SPEC_V2 } from '@/features/services/api/api-spec-v2'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Maximize2,
  Play,
  Plus,
  Search,
  Terminal,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────────────

type HttpMethod =
  | 'get'
  | 'post'
  | 'put'
  | 'patch'
  | 'delete'
  | 'head'
  | 'options'

interface SchemaField {
  name: string
  type: string
  required: boolean
  description?: string
  enum?: string[]
  format?: string
  example?: unknown
}

interface ParsedParameter {
  name: string
  in: 'path' | 'query' | 'header' | 'cookie'
  required: boolean
  description?: string
  type?: string
  enum?: string[]
}

interface ParsedResponse {
  statusCode: string
  description?: string
  fields: SchemaField[]
  example?: string
}

interface ParsedEndpoint {
  id: string
  method: HttpMethod
  path: string
  summary?: string
  description?: string
  tags: string[]
  parameters: ParsedParameter[]
  requestBody?: {
    required: boolean
    contentType: string
    fields: SchemaField[]
    example?: string
  }
  responses: ParsedResponse[]
  baseUrl?: string
}

interface ParsedGroup {
  name: string
  description?: string
  endpoints: ParsedEndpoint[]
}

interface SecurityScheme {
  key: string
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect' | 'unknown'
  name?: string
  in?: 'header' | 'query' | 'cookie'
  scheme?: string
  description?: string
}

type AuthType = 'none' | 'bearer' | 'apikey' | 'basic'

type AuthState = {
  type: AuthType
  bearer: string
  apiKey: string
  apiKeyHeader: string
  basicUser: string
  basicPass: string
}

interface ParsedSpec {
  title: string
  version: string
  oasVersion: string
  description?: string
  groups: ParsedGroup[]
  servers: string[]
  securitySchemes: SecurityScheme[]
}

// ─── GraphQL ──────────────────────────────────────────────────────────────────

// ─── OpenAPI Parser ───────────────────────────────────────────────────────────

type RawSpec = Record<string, unknown>

function resolveRef(
  spec: RawSpec,
  ref: string
): Record<string, unknown> | null {
  if (!ref?.startsWith('#/')) return null
  const parts = ref.slice(2).split('/')
  let current: unknown = spec
  for (const part of parts) {
    const key = part.replace(/~1/g, '/').replace(/~0/g, '~')
    if (!current || typeof current !== 'object') return null
    current = (current as Record<string, unknown>)[key]
  }
  return current && typeof current === 'object'
    ? (current as Record<string, unknown>)
    : null
}

function schemaToFields(
  spec: RawSpec,
  schema: unknown,
  depth = 0
): SchemaField[] {
  if (!schema || typeof schema !== 'object' || depth > 4) return []
  const s = schema as Record<string, unknown>

  if (typeof s.$ref === 'string') {
    const r = resolveRef(spec, s.$ref)
    return r ? schemaToFields(spec, r, depth + 1) : []
  }

  if (Array.isArray(s.allOf)) {
    return (s.allOf as unknown[]).flatMap((sub) =>
      schemaToFields(spec, sub, depth + 1)
    )
  }

  if (s.properties && typeof s.properties === 'object') {
    const required = Array.isArray(s.required) ? (s.required as string[]) : []
    return Object.entries(s.properties as Record<string, unknown>).map(
      ([name, prop]) => {
        const p = (prop ?? {}) as Record<string, unknown>
        const resolved =
          typeof p.$ref === 'string' ? (resolveRef(spec, p.$ref) ?? p) : p
        return {
          name,
          type: (resolved.type as string) || 'object',
          required: required.includes(name),
          description: resolved.description as string | undefined,
          enum: Array.isArray(resolved.enum)
            ? (resolved.enum as unknown[]).map(String)
            : undefined,
          format: resolved.format as string | undefined,
          example: resolved.example,
        }
      }
    )
  }

  return []
}

function parseSecuritySchemes(raw: RawSpec): SecurityScheme[] {
  const schemes: SecurityScheme[] = []

  // OAS3: components.securitySchemes
  const components = raw.components as Record<string, unknown> | undefined
  const oas3Schemes = components?.securitySchemes as
    | Record<string, unknown>
    | undefined

  // Swagger 2: securityDefinitions
  const swagger2Schemes = raw.securityDefinitions as
    | Record<string, unknown>
    | undefined

  const rawSchemes = oas3Schemes ?? swagger2Schemes ?? {}

  for (const [key, val] of Object.entries(rawSchemes)) {
    if (!val || typeof val !== 'object') continue
    const s = val as Record<string, unknown>
    const rawType = (s.type as string) ?? ''

    let type: SecurityScheme['type']
    if (rawType === 'apiKey') type = 'apiKey'
    else if (rawType === 'http') type = 'http'
    else if (rawType === 'oauth2') type = 'oauth2'
    else if (rawType === 'openIdConnect') type = 'openIdConnect'
    else type = 'unknown'

    schemes.push({
      key,
      type,
      name: s.name as string | undefined,
      in: s.in as SecurityScheme['in'],
      scheme: s.scheme as string | undefined,
      description: s.description as string | undefined,
    })
  }

  return schemes
}

function parseSpec(raw: RawSpec): ParsedSpec {
  const info = (raw.info as Record<string, unknown>) ?? {}
  const title = (info.title as string) ?? 'API'
  const version = (info.version as string) ?? ''
  const description = info.description as string | undefined
  const oasVersion =
    typeof raw.openapi === 'string'
      ? `OAS ${raw.openapi}`
      : typeof raw.swagger === 'string'
        ? `Swagger ${raw.swagger}`
        : ''

  const servers: string[] = []
  if (Array.isArray(raw.servers)) {
    for (const s of raw.servers as Record<string, unknown>[]) {
      if (typeof s?.url === 'string') servers.push(s.url)
    }
  }
  if (!servers.length && typeof raw.host === 'string') {
    const scheme =
      Array.isArray(raw.schemes) && (raw.schemes as string[]).includes('https')
        ? 'https'
        : 'http'
    const base = typeof raw.basePath === 'string' ? raw.basePath : ''
    servers.push(`${scheme}://${raw.host as string}${base}`)
  }

  const securitySchemes = parseSecuritySchemes(raw)

  const METHODS: HttpMethod[] = [
    'get',
    'post',
    'put',
    'patch',
    'delete',
    'head',
    'options',
  ]
  const paths = (raw.paths as Record<string, unknown>) ?? {}
  const rawTags = (raw.tags as Array<Record<string, unknown>>) ?? []
  const tagOrder = rawTags.map((t) => t.name as string)
  const tagDescMap = Object.fromEntries(
    rawTags.map((t) => [t.name as string, t.description as string | undefined])
  )

  const groupMap = new Map<string, ParsedEndpoint[]>()
  const untagged: ParsedEndpoint[] = []

  for (const [path, pathItem] of Object.entries(paths)) {
    if (!pathItem || typeof pathItem !== 'object') continue
    const pi = pathItem as Record<string, unknown>

    for (const method of METHODS) {
      const op = pi[method]
      if (!op || typeof op !== 'object') continue
      const operation = op as Record<string, unknown>

      const pathParams = Array.isArray(pi.parameters)
        ? (pi.parameters as unknown[])
        : []
      const opParams = Array.isArray(operation.parameters)
        ? (operation.parameters as unknown[])
        : []

      const parameters: ParsedParameter[] = [
        ...pathParams,
        ...opParams,
      ].flatMap((p): ParsedParameter[] => {
        if (!p || typeof p !== 'object') return []
        const raw2 = p as Record<string, unknown>
        const pr =
          typeof raw2.$ref === 'string'
            ? (resolveRef(raw, raw2.$ref as string) ?? raw2)
            : raw2
        if (pr.in === 'body') return []
        const schema = pr.schema as Record<string, unknown> | undefined
        return [
          {
            name: (pr.name as string) ?? '',
            in: pr.in as ParsedParameter['in'],
            required: Boolean(pr.required),
            description: pr.description as string | undefined,
            type: (schema?.type ?? pr.type) as string | undefined,
            enum: Array.isArray(schema?.enum ?? pr.enum)
              ? ((schema?.enum ?? pr.enum) as unknown[]).map(String)
              : undefined,
          },
        ]
      })

      // Request body (OpenAPI 3.x)
      let requestBody: ParsedEndpoint['requestBody'] = undefined
      if (operation.requestBody && typeof operation.requestBody === 'object') {
        const rb = operation.requestBody as Record<string, unknown>
        const rbR =
          typeof rb.$ref === 'string' ? (resolveRef(raw, rb.$ref) ?? rb) : rb
        const content = rbR.content as Record<string, unknown> | undefined
        if (content) {
          const jsonEntry = content['application/json'] as
            | Record<string, unknown>
            | undefined
          const firstKey = Object.keys(content)[0]
          const entry =
            jsonEntry ??
            (firstKey
              ? (content[firstKey] as Record<string, unknown>)
              : undefined)
          const contentType = jsonEntry
            ? 'application/json'
            : (firstKey ?? 'application/json')
          if (entry) {
            const fields = entry.schema ? schemaToFields(raw, entry.schema) : []
            const ex = entry.example
            requestBody = {
              fields,
              contentType,
              required: Boolean(rbR.required),
              example: ex ? JSON.stringify(ex, null, 2) : undefined,
            }
          }
        }
      } else {
        // Swagger 2.x body param
        const allRaw = [...pathParams, ...opParams]
        const bodyParam = allRaw.find(
          (p) =>
            p &&
            typeof p === 'object' &&
            (p as Record<string, unknown>).in === 'body'
        )
        if (bodyParam) {
          const bp = bodyParam as Record<string, unknown>
          const fields = bp.schema ? schemaToFields(raw, bp.schema) : []
          requestBody = {
            fields,
            contentType: 'application/json',
            required: Boolean(bp.required),
          }
        }
      }

      // Responses
      const responses: ParsedResponse[] = []
      const rawResponses = operation.responses as
        | Record<string, unknown>
        | undefined
      if (rawResponses) {
        for (const [statusCode, resp] of Object.entries(rawResponses).slice(
          0,
          5
        )) {
          if (!resp || typeof resp !== 'object') {
            responses.push({ statusCode, fields: [] })
            continue
          }
          const r = resp as Record<string, unknown>
          const content = r.content as Record<string, unknown> | undefined
          if (content) {
            const jsonContent = content['application/json'] as
              | Record<string, unknown>
              | undefined
            if (jsonContent) {
              const fields = jsonContent.schema
                ? schemaToFields(raw, jsonContent.schema)
                : []
              const ex = jsonContent.example
              responses.push({
                statusCode,
                description: r.description as string | undefined,
                fields,
                example: ex ? JSON.stringify(ex, null, 2) : undefined,
              })
              continue
            }
          }
          const fields = r.schema ? schemaToFields(raw, r.schema) : []
          responses.push({
            statusCode,
            description: r.description as string | undefined,
            fields,
          })
        }
      }

      const opTags = Array.isArray(operation.tags)
        ? (operation.tags as string[])
        : []
      const endpoint: ParsedEndpoint = {
        id: `${method}:${path}`,
        method,
        path,
        summary: operation.summary as string | undefined,
        description: operation.description as string | undefined,
        tags: opTags,
        parameters,
        requestBody,
        responses,
        baseUrl: servers[0],
      }

      if (opTags.length === 0) {
        untagged.push(endpoint)
      } else {
        for (const tag of opTags) {
          if (!groupMap.has(tag)) groupMap.set(tag, [])
          groupMap.get(tag)!.push(endpoint)
        }
      }
    }
  }

  const groups: ParsedGroup[] = []
  for (const tagName of tagOrder) {
    const eps = groupMap.get(tagName)
    if (eps?.length) {
      groups.push({
        name: tagName,
        description: tagDescMap[tagName],
        endpoints: eps,
      })
      groupMap.delete(tagName)
    }
  }
  for (const [name, eps] of groupMap.entries()) {
    if (eps.length) groups.push({ name, endpoints: eps })
  }
  if (untagged.length) groups.push({ name: 'Other', endpoints: untagged })

  return {
    title,
    version,
    oasVersion,
    description,
    groups,
    servers,
    securitySchemes,
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

const METHOD_STYLES: Record<string, { bg: string; text: string }> = {
  get: { bg: '#EFF6FF', text: '#2563EB' },
  post: { bg: '#DCFCE7', text: '#16A34A' },
  put: { bg: '#FFF7ED', text: '#EA580C' },
  patch: { bg: '#FEFCE8', text: '#CA8A04' },
  delete: { bg: '#FEF2F2', text: '#DC2626' },
  head: { bg: '#F8FAFC', text: '#64748B' },
  options: { bg: '#F8FAFC', text: '#64748B' },
}

function MethodBadge({
  method,
  className,
}: {
  method: string
  className?: string
}) {
  const style = METHOD_STYLES[method.toLowerCase()] ?? METHOD_STYLES.get!
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase',
        className
      )}
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {method.toUpperCase()}
    </span>
  )
}

function statusColor(code: string) {
  const n = parseInt(code, 10)
  if (n >= 200 && n < 300) return '#16A34A'
  if (n >= 400 && n < 500) return '#EA580C'
  if (n >= 500) return '#DC2626'
  return '#64748B'
}

const STATUS_LABELS: Record<string, string> = {
  '200': 'OK',
  '201': 'Created',
  '202': 'Accepted',
  '204': 'No Content',
  '301': 'Moved',
  '302': 'Found',
  '400': 'Bad Request',
  '401': 'Unauthorized',
  '403': 'Forbidden',
  '404': 'Not Found',
  '409': 'Conflict',
  '422': 'Unprocessable',
  '429': 'Too Many Requests',
  '500': 'Server Error',
  '502': 'Bad Gateway',
  '503': 'Unavailable',
}

function statusLabel(code: string) {
  const suffix = STATUS_LABELS[code]
  return suffix ? `${code} ${suffix}` : code
}

function truncatePath(path: string): string {
  const segments = path.split('/').filter(Boolean)
  if (segments.length <= 2) return path
  return `/\u2026/${segments.slice(-2).join('/')}`
}

// ─── Path param extraction ────────────────────────────────────────────────────

function extractPathParamNames(path: string): string[] {
  const matches = path.match(/\{([^}]+)\}/g)
  if (!matches) return []
  return matches.map((m) => m.slice(1, -1))
}

// ─── cURL builder ─────────────────────────────────────────────────────────────

function buildCurl(
  method: string,
  url: string,
  allHeaders: { name: string; value: string }[],
  body: string,
  isBodyMethod: boolean
): string {
  const lines = [`curl -X ${method.toUpperCase()} '${url}'`]
  for (const h of allHeaders) {
    if (h.name && h.value) lines.push(`  -H '${h.name}: ${h.value}'`)
  }
  if (isBodyMethod && body.trim() && body.trim() !== '{}') {
    lines.push(`  -H 'Content-Type: application/json'`)
    lines.push(`  -d '${body.replace(/'/g, "'\\''")}'`)
  }
  return lines.join(' \\\n')
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function SpecSidebar({
  spec,
  selected,
  onSelect,
}: {
  spec: ParsedSpec
  selected: ParsedEndpoint | null
  onSelect: (ep: ParsedEndpoint) => void
}) {
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    if (!search.trim()) return spec.groups
    const q = search.toLowerCase()
    return spec.groups
      .map((g) => ({
        ...g,
        endpoints: g.endpoints.filter(
          (ep) =>
            ep.path.toLowerCase().includes(q) ||
            ep.method.includes(q) ||
            ep.summary?.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.endpoints.length > 0)
  }, [spec.groups, search])

  return (
    <div className="flex w-[260px] shrink-0 flex-col overflow-hidden border-r border-[#E8EAEC] bg-white">
      <div className="border-b border-[#F1F5F9] px-3 py-3">
        <div className="relative">
          <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search endpoints..."
            className="h-8 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] pr-10 pl-8 text-[12px] text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
          />
          <span className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded bg-[#E8EAEC] px-1 py-0.5 font-mono text-[9px] text-[#94A3B8]">
            ⌘K
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {filtered.map((group) => {
          const isCollapsed = collapsed.has(group.name)
          return (
            <div key={group.name} className="mb-0.5">
              <button
                type="button"
                onClick={() =>
                  setCollapsed((prev) => {
                    const next = new Set(prev)
                    if (next.has(group.name)) next.delete(group.name)
                    else next.add(group.name)
                    return next
                  })
                }
                className="flex w-full items-center gap-1.5 px-3 py-2 text-left hover:bg-[#F8FAFC]"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
                ) : (
                  <ChevronDown className="h-3 w-3 text-[#94A3B8]" />
                )}
                <span className="flex-1 text-[11px] font-medium tracking-[0.04em] text-[#64748B] uppercase">
                  {group.name}
                </span>
                <span className="rounded-full bg-[#F1F5F9] px-1.5 py-0.5 text-[10px] font-semibold text-[#64748B]">
                  {group.endpoints.length}
                </span>
              </button>

              {!isCollapsed &&
                group.endpoints.map((ep) => {
                  const isActive = selected?.id === ep.id
                  return (
                    <button
                      key={ep.id}
                      type="button"
                      onClick={() => onSelect(ep)}
                      className={cn(
                        'flex w-full items-center gap-2 border-l-2 py-2 pr-3 pl-[10px] text-left transition-colors',
                        isActive
                          ? 'border-blue-500 bg-[#EFF6FF]'
                          : 'border-transparent hover:bg-[#F8FAFC]'
                      )}
                    >
                      <MethodBadge method={ep.method} className="w-[40px]" />
                      <span
                        className={cn(
                          'min-w-0 flex-1 truncate font-mono text-[11px]',
                          isActive
                            ? 'font-medium text-blue-600'
                            : 'text-[#374151]'
                        )}
                        title={ep.path}
                      >
                        {truncatePath(ep.path)}
                      </span>
                    </button>
                  )
                })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Field Row ────────────────────────────────────────────────────────────────

function SchemaFieldRow({ field }: { field: SchemaField }) {
  return (
    <div className="border-b border-[#F1F5F9] py-3 last:border-0">
      {/* Name + type + constraint badges — all on one line */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-mono text-[13px] font-semibold text-[#0F172A]">
          {field.name}
        </span>
        <span className="rounded bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-[10px] text-[#64748B]">
          {field.type}
        </span>
        {field.enum && (
          <span className="rounded bg-[#EFF6FF] px-1.5 py-0.5 text-[10px] font-medium text-[#2563EB]">
            enum
          </span>
        )}
        {field.required ? (
          <span className="rounded bg-[#FEF2F2] px-1.5 py-0.5 text-[10px] font-medium text-[#DC2626]">
            required
          </span>
        ) : (
          <span className="rounded bg-[#F8FAFC] px-1.5 py-0.5 text-[10px] font-medium text-[#94A3B8] ring-1 ring-[#E2E8F0]">
            optional
          </span>
        )}
      </div>
      {/* Description */}
      {field.description && (
        <p className="mt-1 text-[12px] leading-relaxed text-[#64748B]">
          {field.description}
        </p>
      )}
      {/* Enum chips */}
      {field.enum && (
        <div className="mt-2 flex flex-wrap gap-1">
          {field.enum.map((v) => (
            <span
              key={v}
              className="rounded border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 font-mono text-[11px] text-[#374151]"
            >
              {v}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Endpoint Detail ──────────────────────────────────────────────────────────

function SpecEndpointDetail({ endpoint }: { endpoint: ParsedEndpoint }) {
  const [activeCode, setActiveCode] = useState(
    endpoint.responses[0]?.statusCode ?? '200'
  )

  useEffect(() => {
    setActiveCode(endpoint.responses[0]?.statusCode ?? '200')
  }, [endpoint.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const activeResponse = endpoint.responses.find(
    (r) => r.statusCode === activeCode
  )
  const nonBodyParams = endpoint.parameters.filter(
    (p) => p.in === 'path' || p.in === 'query'
  )

  const copyUrl = endpoint.baseUrl
    ? `${endpoint.baseUrl}${endpoint.path}`
    : endpoint.path

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="px-6 py-6">
        {/* Header card */}
        <div className="mb-3 rounded-xl border border-[#E8EAEC] bg-white p-4">
          <div className="mb-2.5 flex items-center gap-3">
            <MethodBadge
              method={endpoint.method}
              className="px-2 py-1 text-[11px]"
            />
            <span className="flex-1 font-mono text-[14px] font-medium text-[#0F172A]">
              {endpoint.path}
            </span>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(copyUrl)
                toast.success('URL copied')
              }}
              className="flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#374151] hover:bg-[#F8FAFC]"
            >
              <Copy className="h-3.5 w-3.5" />
              {endpoint.baseUrl ? 'Copy URL' : 'Copy'}
            </button>
          </div>
          {(endpoint.description ?? endpoint.summary) && (
            <p className="text-[13px] leading-relaxed text-[#374151]">
              {endpoint.description ?? endpoint.summary}
            </p>
          )}
        </div>

        {/* Parameters */}
        {nonBodyParams.length > 0 && (
          <div className="mb-3 rounded-xl border border-[#E8EAEC] bg-white">
            <div className="border-b border-[#F1F5F9] px-5 py-3">
              <span className="text-[13px] font-semibold text-[#0F172A]">
                Parameters
              </span>
            </div>
            <div className="px-5">
              {nonBodyParams.map((p) => (
                <SchemaFieldRow
                  key={`${p.in}:${p.name}`}
                  field={{
                    name: p.name,
                    type: p.type ?? 'string',
                    required: p.required,
                    description: p.description,
                    enum: p.enum,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Request body */}
        {endpoint.requestBody && (
          <div className="mb-3 rounded-xl border border-[#E8EAEC] bg-white">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] px-5 py-3">
              <span className="text-[13px] font-semibold text-[#0F172A]">
                Request Body
              </span>
              <span className="text-[12px] text-[#94A3B8]">
                {endpoint.requestBody.contentType} ·{' '}
                {endpoint.requestBody.required ? 'required' : 'optional'}
              </span>
            </div>
            <div className="px-5">
              {endpoint.requestBody.fields.length > 0 ? (
                endpoint.requestBody.fields.map((f) => (
                  <SchemaFieldRow key={f.name} field={f} />
                ))
              ) : (
                <p className="py-4 text-[13px] text-[#94A3B8]">
                  No fields defined
                </p>
              )}
            </div>
          </div>
        )}

        {/* Responses */}
        {endpoint.responses.length > 0 && (
          <div className="rounded-xl border border-[#E8EAEC] bg-white">
            <div className="border-b border-[#F1F5F9] px-5 py-3">
              <span className="text-[13px] font-semibold text-[#0F172A]">
                Responses
              </span>
            </div>
            {/* Status tabs */}
            <div className="flex flex-wrap gap-1.5 border-b border-[#F1F5F9] px-5 py-3">
              {endpoint.responses.map((r) => {
                const color = statusColor(r.statusCode)
                const isActive = r.statusCode === activeCode
                return (
                  <button
                    key={r.statusCode}
                    type="button"
                    onClick={() => setActiveCode(r.statusCode)}
                    title={r.description}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-all',
                      isActive
                        ? 'bg-[#F8FAFC] text-[#0F172A] ring-1 ring-[#E2E8F0]'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    )}
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    {statusLabel(r.statusCode)}
                  </button>
                )
              })}
            </div>
            {/* Active response description */}
            {activeResponse?.description && (
              <div className="border-b border-[#F1F5F9] px-5 py-2.5">
                <p className="text-[12px] text-[#4B5563]">
                  {activeResponse.description}
                </p>
              </div>
            )}
            {/* Response fields */}
            <div className="px-5">
              {activeResponse?.fields && activeResponse.fields.length > 0 ? (
                activeResponse.fields.map((f) => (
                  <SchemaFieldRow key={f.name} field={f} />
                ))
              ) : (
                <p className="py-3 text-[12px] text-[#CBD5E1]">
                  No schema defined.
                </p>
              )}
            </div>
            {/* Example */}
            {activeResponse?.example && (
              <div className="border-t border-[#F1F5F9]">
                <div className="flex items-center justify-between px-5 py-2.5">
                  <span className="text-[10px] font-semibold tracking-wider text-[#94A3B8] uppercase">
                    Example Response
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(
                        activeResponse.example ?? ''
                      )
                      toast.success('Copied')
                    }}
                    className="flex items-center gap-1 text-[11px] text-[#94A3B8] hover:text-[#374151]"
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </button>
                </div>
                <pre className="mx-5 mb-5 overflow-x-auto rounded-lg bg-[#F8FAFC] p-4 font-mono text-[12px] leading-relaxed text-[#374151]">
                  {activeResponse.example}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Try-It Panel ─────────────────────────────────────────────────────────────

type TryItState = {
  body: string
  queryParams: { name: string; value: string }[]
  headers: { name: string; value: string }[]
  pathParams: { name: string; value: string }[]
}

type TryItResponse = {
  status: number
  statusText: string
  body: string
  latencyMs: number
  isCorsBlocked?: boolean
} | null

function initTryItState(endpoint: ParsedEndpoint): TryItState {
  let body = '{}'
  const fields = endpoint.requestBody?.fields
  if (endpoint.requestBody?.example) {
    body = endpoint.requestBody.example
  } else if (fields?.length) {
    const ex: Record<string, unknown> = {}
    for (const f of fields) {
      if (f.example !== undefined) ex[f.name] = f.example
    }
    if (Object.keys(ex).length > 0) {
      body = JSON.stringify(ex, null, 2)
    } else {
      const sk: Record<string, unknown> = {}
      for (const f of fields) {
        sk[f.name] =
          f.type === 'integer' || f.type === 'number'
            ? 0
            : f.type === 'boolean'
              ? false
              : ''
      }
      body = JSON.stringify(sk, null, 2)
    }
  }
  const queryParams = endpoint.parameters
    .filter((p) => p.in === 'query')
    .map((p) => ({ name: p.name, value: '' }))
  const pathParamNames = extractPathParamNames(endpoint.path)
  const pathParams = pathParamNames.map((name) => ({ name, value: '' }))
  return { body, queryParams, headers: [], pathParams }
}

function SpecTryItWrapper({
  endpoint,
  spec,
  auth,
  onAuthChange,
  selectedServerIdx,
  onServerChange,
}: {
  endpoint: ParsedEndpoint
  spec: ParsedSpec
  auth: AuthState
  onAuthChange: (patch: Partial<AuthState>) => void
  selectedServerIdx: number
  onServerChange: (idx: number) => void
}) {
  const baseUrl = spec.servers[selectedServerIdx] ?? ''
  const isBodyMethod = !['get', 'head'].includes(endpoint.method)

  const [state, setState] = useState<TryItState>(() => initTryItState(endpoint))
  const [response, setResponse] = useState<TryItResponse>(null)
  const [isSending, setIsSending] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    setState(initTryItState(endpoint))
    setResponse(null)
  }, [endpoint.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const resolvedUrl = useMemo(() => {
    let path = endpoint.path
    for (const pp of state.pathParams) {
      if (pp.value)
        path = path.replace(`{${pp.name}}`, encodeURIComponent(pp.value))
    }
    const activeQuery = state.queryParams
      .filter((p) => p.name && p.value)
      .map((p) => [p.name, p.value] as [string, string])
    if (!activeQuery.length) return `${baseUrl}${path}`
    return `${baseUrl}${path}?${new URLSearchParams(activeQuery).toString()}`
  }, [baseUrl, endpoint.path, state.pathParams, state.queryParams])

  function getEffectiveHeaders(): { name: string; value: string }[] {
    const result: { name: string; value: string }[] = []
    for (const h of state.headers) {
      if (h.name && h.value) result.push({ name: h.name, value: h.value })
    }
    if (auth.type === 'bearer' && auth.bearer) {
      result.push({ name: 'Authorization', value: `Bearer ${auth.bearer}` })
    } else if (auth.type === 'basic' && (auth.basicUser || auth.basicPass)) {
      result.push({
        name: 'Authorization',
        value: `Basic ${btoa(`${auth.basicUser}:${auth.basicPass}`)}`,
      })
    } else if (auth.type === 'apikey' && auth.apiKey) {
      result.push({
        name: auth.apiKeyHeader || 'X-API-Key',
        value: auth.apiKey,
      })
    }
    return result
  }

  async function handleSend() {
    if (!baseUrl) {
      toast.error('No server URL defined in spec')
      return
    }
    setIsSending(true)
    const start = Date.now()
    try {
      const headers = new Headers()
      if (isBodyMethod && state.body)
        headers.set('Content-Type', 'application/json')
      for (const h of getEffectiveHeaders()) {
        headers.set(h.name, h.value)
      }
      const opts: RequestInit = {
        method: endpoint.method.toUpperCase(),
        headers,
      }
      if (isBodyMethod && state.body.trim() && state.body.trim() !== '{}')
        opts.body = state.body
      const res = await fetch(resolvedUrl, opts)
      const text = await res.text()
      let fmt = text
      try {
        fmt = JSON.stringify(JSON.parse(text), null, 2)
      } catch {
        /* not JSON */
      }
      setResponse({
        status: res.status,
        statusText: res.statusText,
        body: fmt,
        latencyMs: Date.now() - start,
      })
    } catch (err) {
      const isCors =
        err instanceof TypeError &&
        (err.message.includes('Failed to fetch') ||
          err.message.includes('CORS') ||
          err.message.includes('NetworkError'))
      setResponse({
        status: 0,
        statusText: isCors ? 'CORS Blocked' : 'Error',
        body: err instanceof Error ? err.message : 'Request failed',
        latencyMs: Date.now() - start,
        isCorsBlocked: isCors,
      })
    } finally {
      setIsSending(false)
    }
  }

  function handleCopyCurl() {
    const effectiveHeaders = getEffectiveHeaders()
    const curlStr = buildCurl(
      endpoint.method,
      resolvedUrl,
      effectiveHeaders,
      state.body,
      isBodyMethod
    )
    void navigator.clipboard.writeText(curlStr)
    toast.success('cURL copied')
  }

  function addQueryParam() {
    setState((s) => ({
      ...s,
      queryParams: [...s.queryParams, { name: '', value: '' }],
    }))
  }
  function addHeader() {
    setState((s) => ({
      ...s,
      headers: [...s.headers, { name: '', value: '' }],
    }))
  }
  function setQueryParam(i: number, field: 'name' | 'value', val: string) {
    setState((s) => {
      const q = [...s.queryParams]
      q[i] = { ...q[i], [field]: val }
      return { ...s, queryParams: q }
    })
  }
  function removeQueryParam(i: number) {
    setState((s) => ({
      ...s,
      queryParams: s.queryParams.filter((_, j) => j !== i),
    }))
  }
  function setHeader(i: number, field: 'name' | 'value', val: string) {
    setState((s) => {
      const h = [...s.headers]
      h[i] = { ...h[i], [field]: val }
      return { ...s, headers: h }
    })
  }
  function removeHeader(i: number) {
    setState((s) => ({ ...s, headers: s.headers.filter((_, j) => j !== i) }))
  }
  function setPathParam(i: number, val: string) {
    setState((s) => {
      const pp = [...s.pathParams]
      pp[i] = { ...pp[i], value: val }
      return { ...s, pathParams: pp }
    })
  }

  function renderBody(editorHeight: string, isExpanded = false) {
    const px = isExpanded ? 'px-6' : 'px-4'
    const py = 'py-3'
    return (
      <div className="flex-1 divide-y divide-[#F1F5F9] overflow-y-auto">
        {/* Server selector */}
        {spec.servers.length > 1 && (
          <div className={`${px} ${py}`}>
            <p className="mb-1.5 text-[10px] font-semibold tracking-wider text-[#64748B] uppercase">
              Server
            </p>
            <select
              value={selectedServerIdx}
              onChange={(e) => onServerChange(Number(e.target.value))}
              className="h-7 w-full rounded-md border border-[#E2E8F0] bg-white px-2 text-[11px] outline-none focus:border-blue-400"
            >
              {spec.servers.map((srv, idx) => (
                <option key={idx} value={idx}>
                  {srv}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Base URL */}
        <div className={`${px} ${py}`}>
          <p className="mb-1.5 text-[10px] font-semibold tracking-wider text-[#94A3B8] uppercase">
            Base URL
          </p>
          <div className="flex items-center gap-2 overflow-hidden rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-2">
            <code className="flex-1 overflow-x-auto font-mono text-[11px] whitespace-nowrap text-[#374151]">
              {resolvedUrl}
            </code>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(resolvedUrl)
                toast.success('URL copied')
              }}
              className="shrink-0 text-[#94A3B8] transition-colors hover:text-[#374151]"
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Auth */}
        <div className={`${px} ${py}`}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold tracking-wider text-[#64748B] uppercase">
              Auth
            </p>
            <select
              value={auth.type}
              onChange={(e) =>
                onAuthChange({ type: e.target.value as AuthType })
              }
              className="h-6 rounded border border-[#E2E8F0] bg-white px-1.5 text-[11px] text-[#374151] outline-none focus:border-blue-400"
            >
              <option value="none">None</option>
              <option value="bearer">Bearer Token</option>
              <option value="apikey">API Key</option>
              <option value="basic">Basic Auth</option>
            </select>
          </div>
          {auth.type === 'bearer' && (
            <input
              type="password"
              value={auth.bearer}
              onChange={(e) => onAuthChange({ bearer: e.target.value })}
              placeholder="Paste token…"
              className="mt-2 h-7 w-full rounded-md border border-[#E2E8F0] bg-white px-2 font-mono text-[11px] outline-none focus:border-blue-400"
            />
          )}
          {auth.type === 'apikey' && (
            <div className="mt-2 space-y-1.5">
              <input
                type="text"
                value={auth.apiKeyHeader}
                onChange={(e) => onAuthChange({ apiKeyHeader: e.target.value })}
                placeholder="Header name (e.g. X-API-Key)"
                className="h-7 w-full rounded-md border border-[#E2E8F0] bg-white px-2 font-mono text-[11px] outline-none focus:border-blue-400"
              />
              <input
                type="password"
                value={auth.apiKey}
                onChange={(e) => onAuthChange({ apiKey: e.target.value })}
                placeholder="API key value…"
                className="h-7 w-full rounded-md border border-[#E2E8F0] bg-white px-2 font-mono text-[11px] outline-none focus:border-blue-400"
              />
            </div>
          )}
          {auth.type === 'basic' && (
            <div className="mt-2 space-y-1.5">
              <input
                type="text"
                value={auth.basicUser}
                onChange={(e) => onAuthChange({ basicUser: e.target.value })}
                placeholder="Username"
                className="h-7 w-full rounded-md border border-[#E2E8F0] bg-white px-2 text-[11px] outline-none focus:border-blue-400"
              />
              <input
                type="password"
                value={auth.basicPass}
                onChange={(e) => onAuthChange({ basicPass: e.target.value })}
                placeholder="Password"
                className="h-7 w-full rounded-md border border-[#E2E8F0] bg-white px-2 text-[11px] outline-none focus:border-blue-400"
              />
            </div>
          )}
        </div>

        {/* Path Parameters */}
        {state.pathParams.length > 0 && (
          <div className={`${px} ${py}`}>
            <p className="mb-2 text-[10px] font-semibold tracking-wider text-[#64748B] uppercase">
              Path Parameters
            </p>
            <div className="space-y-1.5">
              {state.pathParams.map((pp, i) => (
                <div key={pp.name} className="flex items-center gap-1.5">
                  <label
                    className="w-[90px] shrink-0 truncate font-mono text-[11px] text-[#374151]"
                    title={pp.name}
                  >
                    {pp.name}
                  </label>
                  <input
                    value={pp.value}
                    onChange={(e) => setPathParam(i, e.target.value)}
                    placeholder="value"
                    className="h-7 flex-1 rounded-md border border-[#E2E8F0] bg-white px-2 text-[11px] outline-none focus:border-blue-400"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Query params */}
        <div className={`${px} ${py}`}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold tracking-wider text-[#64748B] uppercase">
              Query Parameters
            </p>
            <button
              type="button"
              onClick={addQueryParam}
              className="flex items-center gap-0.5 text-[11px] font-medium text-[#2563EB] hover:text-[#1D4ED8]"
            >
              <Plus className="h-3 w-3" /> Add param
            </button>
          </div>
          {state.queryParams.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {state.queryParams.map((p, i) => (
                <div key={i} className="flex gap-1.5">
                  <input
                    value={p.name}
                    onChange={(e) => setQueryParam(i, 'name', e.target.value)}
                    placeholder="name"
                    className="h-7 w-[90px] shrink-0 rounded-md border border-[#E2E8F0] bg-white px-2 font-mono text-[11px] outline-none focus:border-blue-400"
                  />
                  <input
                    value={p.value}
                    onChange={(e) => setQueryParam(i, 'value', e.target.value)}
                    placeholder="value"
                    className="h-7 flex-1 rounded-md border border-[#E2E8F0] bg-white px-2 text-[11px] outline-none focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => removeQueryParam(i)}
                    className="text-[#CBD5E1] hover:text-[#94A3B8]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Headers */}
        <div className={`${px} ${py}`}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold tracking-wider text-[#64748B] uppercase">
              Headers
            </p>
            <button
              type="button"
              onClick={addHeader}
              className="flex items-center gap-0.5 text-[11px] font-medium text-[#2563EB] hover:text-[#1D4ED8]"
            >
              <Plus className="h-3 w-3" /> Add header
            </button>
          </div>
          {state.headers.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {state.headers.map((h, i) => (
                <div key={i} className="flex gap-1.5">
                  <input
                    value={h.name}
                    onChange={(e) => setHeader(i, 'name', e.target.value)}
                    placeholder="name"
                    className="h-7 w-[90px] shrink-0 rounded-md border border-[#E2E8F0] bg-white px-2 font-mono text-[11px] outline-none focus:border-blue-400"
                  />
                  <input
                    value={h.value}
                    onChange={(e) => setHeader(i, 'value', e.target.value)}
                    placeholder="value"
                    className="h-7 flex-1 rounded-md border border-[#E2E8F0] bg-white px-2 text-[11px] outline-none focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => removeHeader(i)}
                    className="text-[#CBD5E1] hover:text-[#94A3B8]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Request body */}
        {isBodyMethod && (
          <div className={`${px} ${py}`}>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-semibold tracking-wider text-[#64748B] uppercase">
                Request Body
              </p>
              <span className="text-[10px] text-[#94A3B8]">
                application/json
              </span>
            </div>
            <div className="overflow-hidden rounded-lg border border-[#E2E8F0]">
              <CodeMirrorRaw
                value={state.body}
                onChange={(v) => setState((s) => ({ ...s, body: v }))}
                height={editorHeight}
              />
            </div>
          </div>
        )}

        {/* Response */}
        {response && (
          <div className={`${px} ${py}`}>
            <div className="overflow-hidden rounded-xl border border-[#E2E8F0]">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'rounded px-2 py-0.5 text-[11px] font-bold',
                      response.status >= 200 && response.status < 300
                        ? 'bg-[#DCFCE7] text-[#16A34A]'
                        : response.status >= 400
                          ? 'bg-[#FEF2F2] text-[#DC2626]'
                          : 'bg-[#F1F5F9] text-[#64748B]'
                    )}
                  >
                    {response.status || 'ERR'}
                  </span>
                  <span className="text-[11px] text-[#64748B]">
                    {response.statusText}
                  </span>
                  <span className="text-[11px] text-[#94A3B8]">
                    · {response.latencyMs}ms
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(response.body)
                    toast.success('Copied')
                  }}
                  className="text-[#94A3B8] hover:text-[#374151]"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
              {response.isCorsBlocked ? (
                <div className="bg-[#FFFBEB] px-3 py-3 text-[12px] text-[#92400E]">
                  Request blocked by CORS policy. Use the copied cURL command to
                  test from your terminal.
                </div>
              ) : (
                <CodeMirrorRaw value={response.body} readOnly height="160px" />
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  function renderFooter(isExpanded = false) {
    return (
      <div className="shrink-0 border-t border-[#E8EAEC] p-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyCurl}
            title="Copy as cURL"
            className={cn(
              'flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#374151]',
              isExpanded ? 'px-4 text-[12px] font-medium' : 'w-10'
            )}
          >
            <Terminal className="h-4 w-4" />
            {isExpanded && 'Copy cURL'}
          </button>
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={isSending || !baseUrl}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#2563EB] text-[13px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            {isSending ? 'Sending…' : 'Send Request'}
          </button>
        </div>
        {!baseUrl && (
          <p className="mt-2 text-center text-[11px] text-[#94A3B8]">
            No server URL in spec
          </p>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Inline panel */}
      <div className="flex w-[320px] shrink-0 flex-col overflow-hidden border-l border-[#E8EAEC] bg-white">
        <div className="flex shrink-0 items-center justify-between border-b border-[#E8EAEC] px-4 py-3">
          <span className="text-[13px] font-semibold text-[#0F172A]">
            Try it
          </span>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            title="Expand"
            className="text-[#94A3B8] transition-colors hover:text-[#374151]"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
        {renderBody('180px')}
        {renderFooter()}
      </div>

      {/* Expanded modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="flex max-h-[90vh] w-[700px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-[#E8EAEC] px-5 py-4">
              <span className="text-[14px] font-semibold text-[#0F172A]">
                Try it
              </span>
              <MethodBadge method={endpoint.method} />
              <span className="flex-1 truncate font-mono text-[12px] text-[#4B5563]">
                {endpoint.path}
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="shrink-0 text-[#94A3B8] transition-colors hover:text-[#374151]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {renderBody('300px', true)}
            {renderFooter(true)}
          </div>
        </div>
      )}
    </>
  )
}

// ─── Intro ────────────────────────────────────────────────────────────────────

function SpecIntro({ spec }: { spec: ParsedSpec }) {
  return (
    <div className="flex flex-1 overflow-y-auto bg-white">
      <div className="max-w-3xl px-8 py-10">
        <div className="mb-3 flex items-center gap-2">
          {spec.version && (
            <span className="rounded-md bg-[#F1F5F9] px-2.5 py-1 text-[12px] font-medium text-[#64748B]">
              v{spec.version}
            </span>
          )}
          {spec.oasVersion && (
            <span className="rounded-md bg-[#F1F5F9] px-2.5 py-1 text-[12px] font-medium text-[#64748B]">
              {spec.oasVersion}
            </span>
          )}
        </div>
        <h1 className="mb-4 text-[28px] font-bold tracking-tight text-[#0F172A]">
          {spec.title}
        </h1>
        {spec.description && (
          <p className="mb-8 text-[14px] leading-relaxed text-[#4B5563]">
            {spec.description}
          </p>
        )}
        <div className="rounded-xl border border-[#E8EAEC] bg-white p-5">
          <p className="mb-3 text-[11px] font-semibold tracking-widest text-[#94A3B8] uppercase">
            Endpoint Groups
          </p>
          <div className="space-y-2">
            {spec.groups.map((g) => (
              <div key={g.name} className="flex items-center gap-2">
                <span className="text-[14px] font-medium text-[#0F172A]">
                  {g.name}
                </span>
                <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[11px] text-[#64748B]">
                  {g.endpoints.length}
                </span>
                {g.description && (
                  <span className="text-[13px] text-[#94A3B8]">
                    — {g.description}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────

type ApiSpecViewerProps = {
  serviceId: string
  apiGroupId: string
}

export function RestApiSpecViewer({
  serviceId,
  apiGroupId,
}: ApiSpecViewerProps) {
  const orgId = useCurrentOrganization()?.id
  const [specContent, setSpecContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [parsedSpec, setParsedSpec] = useState<ParsedSpec | null>(null)
  const [selectedEndpoint, setSelectedEndpoint] =
    useState<ParsedEndpoint | null>(null)
  const [auth, setAuth] = useState<AuthState>({
    type: 'none',
    bearer: '',
    apiKey: '',
    apiKeyHeader: 'X-API-Key',
    basicUser: '',
    basicPass: '',
  })
  const [selectedServerIdx, setSelectedServerIdx] = useState(0)

  const fetchSpec = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const { data } = await clientV2.query({
        query: API_GROUP_SPEC_V2,
        variables: { orgId: orgId!, serviceId, apiGroupId },
        fetchPolicy: 'network-only',
      })
      const content = data?.apiGroupSpec?.content
      if (content == null)
        throw new Error('Could not load spec content for API group')
      setSpecContent(content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load spec')
    } finally {
      setIsLoading(false)
    }
  }, [orgId, serviceId, apiGroupId])

  useEffect(() => {
    void fetchSpec()
  }, [fetchSpec])

  useEffect(() => {
    if (!specContent) {
      setParsedSpec(null)
      return
    }
    let cancelled = false
    async function parse() {
      let raw: RawSpec
      try {
        raw = JSON.parse(specContent!) as RawSpec
      } catch {
        try {
          const yaml = await import('js-yaml')
          raw = yaml.load(specContent!) as RawSpec
        } catch {
          if (!cancelled) setParsedSpec(null)
          return
        }
      }
      try {
        const spec = parseSpec(raw)
        if (!cancelled) {
          setParsedSpec(spec)
          const firstEndpoint = spec.groups[0]?.endpoints[0]
          if (firstEndpoint) setSelectedEndpoint(firstEndpoint)
          // Auto-detect auth type from first declared security scheme
          const firstScheme = spec.securitySchemes[0]
          if (firstScheme) {
            setAuth((prev) => {
              if (prev.type !== 'none') return prev // don't overwrite if user already set
              if (
                firstScheme.type === 'http' &&
                firstScheme.scheme === 'bearer'
              )
                return { ...prev, type: 'bearer' }
              if (firstScheme.type === 'http' && firstScheme.scheme === 'basic')
                return { ...prev, type: 'basic' }
              if (firstScheme.type === 'apiKey')
                return {
                  ...prev,
                  type: 'apikey',
                  apiKeyHeader: firstScheme.name ?? 'X-API-Key',
                }
              return prev
            })
          }
        }
      } catch {
        if (!cancelled) setParsedSpec(null)
      }
    }
    void parse()
    return () => {
      cancelled = true
    }
  }, [specContent])

  if (isLoading) return <SectionLoader label="Loading API specification..." />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="text-sm font-medium text-red-500">
          Failed to load specification
        </div>
        <p className="max-w-md text-xs text-[#64748B]">{error}</p>
        <button
          onClick={() => void fetchSpec()}
          className="text-xs text-blue-500 underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!parsedSpec) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-[#94A3B8]">
        No specification content found
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden">
      <SpecSidebar
        spec={parsedSpec}
        selected={selectedEndpoint}
        onSelect={setSelectedEndpoint}
      />
      <div className="flex flex-1 overflow-hidden">
        {selectedEndpoint ? (
          <>
            <SpecEndpointDetail endpoint={selectedEndpoint} />
            <SpecTryItWrapper
              endpoint={selectedEndpoint}
              spec={parsedSpec}
              auth={auth}
              onAuthChange={(patch) =>
                setAuth((prev) => ({ ...prev, ...patch }))
              }
              selectedServerIdx={selectedServerIdx}
              onServerChange={setSelectedServerIdx}
            />
          </>
        ) : (
          <SpecIntro spec={parsedSpec} />
        )}
      </div>
    </div>
  )
}

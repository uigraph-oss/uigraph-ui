'use client'

import { CodeMirrorRaw } from '@/components/code-mirror'
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
import { resolveAuth, type AuthConfig } from '@/utils/api/auth-resolver'
import { AuthKind } from '@/utils/api/openapi-runtime'
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Code,
  Copy,
  Play,
  RotateCcw,
  Save,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

type PathParam = {
  name: string
  value: string
  required: boolean
  description?: string
}

type QueryParam = {
  name: string
  value: string
  required: boolean
  description?: string
}

type HeaderParam = {
  name: string
  value: string
  required: boolean
  description?: string
}

type RequestState = {
  pathParams: PathParam[]
  queryParams: QueryParam[]
  headers: HeaderParam[]
  body: string
  contentType: string
}

type ResponseState = {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  latencyMs: number
  isCorsBlocked?: boolean
} | null

type EndpointTryItTabProps = {
  method: string
  path: string
  baseUrl: string
  operationId?: string
  authKind: AuthKind
  requestSchema?: string | null
  parameters?: string | null
  requestExample?: string | null
  serviceId?: string
  onSaveRequestSample?: (body: string) => Promise<void>
  onSaveResponseSample?: (body: string) => Promise<void>
}

export function EndpointTryItTab({
  method,
  path,
  baseUrl,
  operationId,
  authKind,
  requestSchema,
  parameters,
  requestExample,
  serviceId,
  onSaveRequestSample,
  onSaveResponseSample,
}: EndpointTryItTabProps) {
  const [authConfig, setAuthConfig] = useState<AuthConfig>({ kind: authKind })
  // Initialize with empty state, will be loaded from localStorage or initialized in useEffect
  const [request, setRequest] = useState<RequestState>(() => {
    if (!operationId) {
      return initializeRequest(
        path,
        parameters,
        requestSchema,
        requestExample,
        operationId
      )
    }
    // Try to load from localStorage first
    const key = `tryit-draft-${operationId}`
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as RequestState
        if (parsed.contentType) {
          const initial = initializeRequest(
            path,
            parameters,
            requestSchema,
            requestExample,
            operationId
          )
          return {
            pathParams: mergeParams(initial.pathParams, parsed.pathParams),
            queryParams: mergeParams(initial.queryParams, parsed.queryParams),
            headers: mergeParams(initial.headers, parsed.headers),
            body: parsed.body || initial.body,
            contentType: parsed.contentType || initial.contentType,
          }
        }
      } catch {
        // Fall through to initialize
      }
    }
    return initializeRequest(
      path,
      parameters,
      requestSchema,
      requestExample,
      operationId
    )
  })
  const [response, setResponse] = useState<ResponseState>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const isInitialLoad = useRef(true)

  // Reload draft when operationId or spec changes
  useEffect(() => {
    if (!operationId) return

    // Reset initial load flag when operationId changes
    isInitialLoad.current = true

    const initial = initializeRequest(
      path,
      parameters,
      requestSchema,
      requestExample,
      operationId
    )
    const key = `tryit-draft-${operationId}`
    const stored = localStorage.getItem(key)

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as RequestState
        // Only load if it has the contentType field (new format)
        if (parsed.contentType) {
          // Merge persisted draft with initial state to preserve new spec parameters
          const merged: RequestState = {
            // Path params: merge by name, keep user values, add new ones from spec
            pathParams: mergeParams(initial.pathParams, parsed.pathParams),
            // Query params: merge by name, keep user values, add new ones from spec
            queryParams: mergeParams(initial.queryParams, parsed.queryParams),
            // Headers: merge by name, keep user values, add new ones from spec
            headers: mergeParams(initial.headers, parsed.headers),
            // Body: use persisted if exists, else initial
            body: parsed.body || initial.body,
            // Content type: use persisted if exists, else initial
            contentType: parsed.contentType || initial.contentType,
          }
          setRequest(merged)
          isInitialLoad.current = false
          return
        }
      } catch {
        // Fall through to set initial
      }
    }
    // No valid draft, use initial state
    setRequest(initial)
    isInitialLoad.current = false
  }, [operationId, path, parameters, requestSchema, requestExample])

  // Save draft state when request changes (skip initial load)
  useEffect(() => {
    if (isInitialLoad.current) return
    if (!operationId) return
    const key = `tryit-draft-${operationId}`
    localStorage.setItem(key, JSON.stringify(request))
  }, [request, operationId])

  // Sync auth kind when prop changes
  useEffect(() => {
    setAuthConfig((prev) => ({ ...prev, kind: authKind }))
  }, [authKind])

  // Load auth config from localStorage (per service + auth scheme)
  useEffect(() => {
    const key = serviceId
      ? `tryit-auth-${serviceId}-${authKind}`
      : `tryit-auth-${authKind}`
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthConfig
        setAuthConfig((prev) => ({ ...prev, ...parsed }))
      } catch {
        // ignore
      }
    }
  }, [authKind, serviceId])

  // Save auth config to localStorage (per service + auth scheme)
  const saveAuthConfig = useCallback(
    (config: AuthConfig) => {
      setAuthConfig(config)
      const key = serviceId
        ? `tryit-auth-${serviceId}-${config.kind}`
        : `tryit-auth-${config.kind}`
      localStorage.setItem(key, JSON.stringify(config))
    },
    [serviceId]
  )

  const resolvedUrl = useMemo(() => {
    let urlPath = path
    for (const param of request.pathParams) {
      urlPath = urlPath.replace(
        `{${param.name}}`,
        param.value || `{${param.name}}`
      )
    }
    const normalizedBase = baseUrl.endsWith('/')
      ? baseUrl.slice(0, -1)
      : baseUrl
    const normalizedPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`
    let url = `${normalizedBase}${normalizedPath}`

    // Add query params
    const params = new URLSearchParams()
    for (const param of request.queryParams) {
      if (param.value) params.set(param.name, param.value)
    }
    if (params.toString()) {
      url += `?${params.toString()}`
    }

    return url
  }, [baseUrl, path, request.pathParams, request.queryParams])

  const handleReset = useCallback(() => {
    const reset = initializeRequest(
      path,
      parameters,
      requestSchema,
      requestExample,
      operationId
    )
    setRequest(reset)
    setResponse(null)
    // Clear persisted draft
    if (operationId) {
      localStorage.removeItem(`tryit-draft-${operationId}`)
    }
  }, [path, parameters, requestSchema, requestExample, operationId])

  const handleCopyCurl = useCallback(() => {
    // Build base URL without query params for cURL (we'll add them fresh)
    let baseUrlWithoutQuery = resolvedUrl
    try {
      const urlObj = new URL(resolvedUrl)
      baseUrlWithoutQuery = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`
    } catch {
      // If URL parsing fails, try to remove query string manually
      const queryIndex = resolvedUrl.indexOf('?')
      if (queryIndex > 0) {
        baseUrlWithoutQuery = resolvedUrl.slice(0, queryIndex)
      }
    }
    const curl = buildCurlCommand(
      method,
      baseUrlWithoutQuery,
      request,
      authConfig
    )
    void navigator.clipboard.writeText(curl)
    toast.success('cURL command copied')
  }, [method, resolvedUrl, request, authConfig])

  const handleExecute = useCallback(async () => {
    setIsExecuting(true)
    const startTime = Date.now()

    try {
      const authInjection = resolveAuth(authConfig)
      const url = new URL(resolvedUrl)

      // Add query params (filter out empty names)
      for (const param of request.queryParams) {
        if (param.name && param.value) {
          url.searchParams.set(param.name, param.value)
        }
      }
      for (const [key, value] of Object.entries(authInjection.queryParams)) {
        url.searchParams.set(key, value)
      }

      // Build headers (include defaults, then custom, then auth)
      const headers = new Headers()

      // Content-Type header (use selected or default)
      if (method !== 'GET' && method !== 'HEAD' && request.body) {
        headers.set('Content-Type', request.contentType || 'application/json')
      }

      // Custom headers (filter out empty names)
      for (const header of request.headers) {
        if (header.name && header.value) {
          headers.set(header.name, header.value)
        }
      }

      // Auth headers (override any existing)
      for (const [key, value] of Object.entries(authInjection.headers)) {
        headers.set(key, value)
      }

      // Execute request
      const fetchOptions: RequestInit = {
        method,
        headers,
        signal: AbortSignal.timeout(30000),
      }

      if (method !== 'GET' && method !== 'HEAD' && request.body) {
        fetchOptions.body = request.body
      }

      const res = await fetch(url.toString(), fetchOptions)
      const latencyMs = Date.now() - startTime

      const responseHeaders: Record<string, string> = {}
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      let responseBody = await res.text()
      try {
        const parsed = JSON.parse(responseBody)
        responseBody = JSON.stringify(parsed, null, 2)
      } catch {
        // Keep as text
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body: responseBody,
        latencyMs,
        isCorsBlocked: false,
      })
    } catch (err) {
      const latencyMs = Date.now() - startTime
      const isCorsError =
        err instanceof TypeError &&
        (err.message.includes('Failed to fetch') ||
          err.message.includes('CORS') ||
          err.message.includes('NetworkError') ||
          err.message.includes('Network request failed'))

      setResponse({
        status: 0,
        statusText: isCorsError ? 'CORS Blocked' : 'Network Error',
        headers: {},
        body: err instanceof Error ? err.message : 'Unknown error occurred',
        latencyMs,
        isCorsBlocked: isCorsError,
      })
    } finally {
      setIsExecuting(false)
    }
  }, [method, resolvedUrl, request, authConfig])

  // Keyboard shortcut: Cmd/Ctrl + Enter
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        void handleExecute()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleExecute])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold">
            {method} {path}
          </span>
        </div>
        <div className="text-muted-foreground text-xs">
          <span className="font-medium">Resolved URL:</span>{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px]">
            {resolvedUrl}
          </code>
        </div>
      </div>

      {/* Auth Configuration */}
      {authKind !== 'none' && (
        <div className="space-y-2 rounded-lg border bg-slate-50 p-3">
          <Label className="text-xs font-semibold tracking-wide uppercase">
            {authKind === 'bearer' || authKind === 'oauth2'
              ? 'Authentication (Bearer Token)'
              : authKind === 'api-key'
                ? 'Authentication (API Key)'
                : 'Authentication'}
          </Label>
          {authKind === 'bearer' || authKind === 'oauth2' ? (
            <Input
              type="text"
              placeholder="Paste your Bearer token here"
              value={authConfig.token || ''}
              onChange={(e) =>
                saveAuthConfig({ ...authConfig, token: e.target.value })
              }
            />
          ) : authKind === 'api-key' ? (
            <div className="space-y-2">
              <Input
                placeholder="API key value"
                value={authConfig.apiKey || ''}
                onChange={(e) =>
                  saveAuthConfig({ ...authConfig, apiKey: e.target.value })
                }
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Key name (e.g., x-api-key)"
                  value={authConfig.apiKeyName || ''}
                  onChange={(e) =>
                    saveAuthConfig({
                      ...authConfig,
                      apiKeyName: e.target.value,
                    })
                  }
                />
                <Select
                  value={authConfig.apiKeyIn || 'header'}
                  onValueChange={(value) =>
                    saveAuthConfig({
                      ...authConfig,
                      apiKeyIn: value as 'header' | 'query',
                    })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="header">Header</SelectItem>
                    <SelectItem value="query">Query</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Request Builder */}
      <div className="space-y-3">
        {request.pathParams.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-semibold tracking-wide uppercase">
              Path Parameters
            </Label>
            {request.pathParams.map((param, idx) => (
              <div key={param.name} className="flex items-center gap-2">
                <code className="w-32 text-xs text-slate-600">
                  {param.name}
                </code>
                <Input
                  placeholder={param.description || 'Value'}
                  value={param.value}
                  onChange={(e) => {
                    const next = [...request.pathParams]
                    next[idx] = { ...param, value: e.target.value }
                    setRequest({ ...request, pathParams: next })
                  }}
                  required={param.required}
                />
                {param.required && (
                  <span className="text-xs text-red-600">*</span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold tracking-wide uppercase">
              Query Parameters
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setRequest({
                  ...request,
                  queryParams: [
                    ...request.queryParams,
                    { name: '', value: '', required: false },
                  ],
                })
              }}
              className="h-7 text-xs"
            >
              + Add param
            </Button>
          </div>
          {request.queryParams.map((param, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                placeholder="Name"
                value={param.name}
                onChange={(e) => {
                  const next = [...request.queryParams]
                  next[idx] = { ...param, name: e.target.value }
                  setRequest({ ...request, queryParams: next })
                }}
                className="w-32"
              />
              <Input
                placeholder={param.description || 'Value'}
                value={param.value}
                onChange={(e) => {
                  const next = [...request.queryParams]
                  next[idx] = { ...param, value: e.target.value }
                  setRequest({ ...request, queryParams: next })
                }}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  const next = request.queryParams.filter((_, i) => i !== idx)
                  setRequest({ ...request, queryParams: next })
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold tracking-wide uppercase">
              Headers
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setRequest({
                  ...request,
                  headers: [
                    ...request.headers,
                    { name: '', value: '', required: false },
                  ],
                })
              }}
              className="h-7 text-xs"
            >
              + Add header
            </Button>
          </div>
          {request.headers.map((header, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                placeholder="Name"
                value={header.name}
                onChange={(e) => {
                  const next = [...request.headers]
                  next[idx] = { ...header, name: e.target.value }
                  setRequest({ ...request, headers: next })
                }}
                className="w-32"
              />
              <Input
                placeholder={header.description || 'Value'}
                value={header.value}
                onChange={(e) => {
                  const next = [...request.headers]
                  next[idx] = { ...header, value: e.target.value }
                  setRequest({ ...request, headers: next })
                }}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  const next = request.headers.filter((_, i) => i !== idx)
                  setRequest({ ...request, headers: next })
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>

        {method !== 'GET' && method !== 'HEAD' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold tracking-wide uppercase">
                Request Body
              </Label>
              <Select
                value={request.contentType}
                onValueChange={(value) =>
                  setRequest({ ...request, contentType: value })
                }
              >
                <SelectTrigger className="h-7 w-40 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="application/json">
                    application/json
                  </SelectItem>
                  <SelectItem value="application/xml">
                    application/xml
                  </SelectItem>
                  <SelectItem value="application/x-www-form-urlencoded">
                    application/x-www-form-urlencoded
                  </SelectItem>
                  <SelectItem value="text/plain">text/plain</SelectItem>
                  <SelectItem value="multipart/form-data">
                    multipart/form-data
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CodeMirrorRaw
              value={request.body}
              onChange={(value) => setRequest({ ...request, body: value })}
              height="200px"
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button onClick={handleExecute} disabled={isExecuting} preset="primary">
          <Play className="h-3.5 w-3.5" />
          {isExecuting ? 'Sending...' : 'Send'}
        </Button>
        <Button onClick={handleReset} preset="outline" disabled={isExecuting}>
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
        <Button
          onClick={handleCopyCurl}
          preset="outline"
          disabled={isExecuting}
        >
          <Code className="h-3.5 w-3.5" />
          Copy as cURL
        </Button>
        <Button
          onClick={() => {
            void navigator.clipboard.writeText(resolvedUrl)
            toast.success('URL copied')
          }}
          preset="outline"
          disabled={isExecuting}
        >
          <Copy className="h-3.5 w-3.5" />
          Copy URL
        </Button>
      </div>

      {/* Response Viewer */}
      {response && (
        <>
          {response.isCorsBlocked ? (
            <CorsBlockedUI
              resolvedUrl={resolvedUrl}
              method={method}
              request={request}
              authConfig={authConfig}
              onCopyCurl={handleCopyCurl}
              onCopyUrl={() => {
                void navigator.clipboard.writeText(resolvedUrl)
                toast.success('URL copied')
              }}
              onSaveRequest={
                onSaveRequestSample
                  ? () => void onSaveRequestSample(request.body)
                  : undefined
              }
            />
          ) : (
            <div className="space-y-3 rounded-lg border bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-semibold ${
                      response.status >= 200 && response.status < 300
                        ? 'bg-green-100 text-green-700'
                        : response.status >= 400
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {response.status === 0 ? 'Error' : response.status}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {response.statusText}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    • {response.latencyMs}ms
                  </span>
                </div>
                <div className="flex gap-2">
                  {onSaveRequestSample && (
                    <Button
                      onClick={() => void onSaveRequestSample(request.body)}
                      variant="outline"
                      size="sm"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Save Request
                    </Button>
                  )}
                  {onSaveResponseSample &&
                    response.status >= 200 &&
                    response.status < 300 && (
                      <Button
                        onClick={() => void onSaveResponseSample(response.body)}
                        variant="outline"
                        size="sm"
                      >
                        <Save className="h-3.5 w-3.5" />
                        Save Response
                      </Button>
                    )}
                </div>
              </div>

              <ResponseTabs response={response} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── CORS Blocked UI Component ───────────────────────────────

function CorsBlockedUI({
  onCopyCurl,
  onCopyUrl,
  onSaveRequest,
}: {
  resolvedUrl: string
  method: string
  request: RequestState
  authConfig: AuthConfig
  onCopyCurl: () => void
  onCopyUrl: () => void
  onSaveRequest?: () => void
}) {
  const [showHelp, setShowHelp] = useState(false)

  return (
    <div className="space-y-4 rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
        <div className="flex-1 space-y-2">
          <h4 className="font-semibold text-amber-900">Blocked by CORS</h4>
          <p className="text-sm text-amber-800">
            The browser blocked this request due to Cross-Origin Resource
            Sharing (CORS) policy. Use the cURL command below to test the
            endpoint from your terminal.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={onCopyCurl}
          size="sm"
          className="bg-amber-600 hover:bg-amber-700"
        >
          <Code className="h-3.5 w-3.5" />
          Copy as cURL
        </Button>
        <Button onClick={onCopyUrl} variant="outline" size="sm">
          <Copy className="h-3.5 w-3.5" />
          Copy URL
        </Button>
        {onSaveRequest && (
          <Button onClick={onSaveRequest} variant="outline" size="sm">
            <Save className="h-3.5 w-3.5" />
            Save Request
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="flex w-full items-center justify-between rounded-md border border-amber-200 bg-white px-3 py-2 text-left text-sm text-amber-900 hover:bg-amber-100"
        >
          <span className="font-medium">How to fix CORS</span>
          {showHelp ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {showHelp && (
          <div className="rounded-md border border-amber-200 bg-white p-3 text-xs text-amber-900">
            <p className="mb-2 font-medium">Server-side fix:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>
                Add CORS headers:{' '}
                <code className="rounded bg-amber-100 px-1">
                  Access-Control-Allow-Origin
                </code>
              </li>
              <li>
                For development:{' '}
                <code className="rounded bg-amber-100 px-1">
                  Access-Control-Allow-Origin: *
                </code>
              </li>
              <li>For production: Specify allowed origins explicitly</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Response Tabs Component ─────────────────────────────────

function ResponseTabs({ response }: { response: ResponseState }) {
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body')

  if (!response) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 rounded-md bg-slate-100 p-1">
        <Button
          variant={activeTab === 'body' ? 'default' : 'ghost'}
          size="sm"
          className="h-7 flex-1 text-xs"
          onClick={() => setActiveTab('body')}
        >
          Body
        </Button>
        <Button
          variant={activeTab === 'headers' ? 'default' : 'ghost'}
          size="sm"
          className="h-7 flex-1 text-xs"
          onClick={() => setActiveTab('headers')}
        >
          Headers
        </Button>
      </div>

      {activeTab === 'body' ? (
        <div className="space-y-2">
          <div className="flex items-center justify-end gap-2">
            <Button
              onClick={() => {
                void navigator.clipboard.writeText(response.body)
                toast.success('Response body copied')
              }}
              variant="ghost"
              size="sm"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy Response
            </Button>
          </div>
          <CodeMirrorRaw value={response.body} height="300px" readOnly />
        </div>
      ) : (
        <div className="space-y-1 rounded-md border">
          {Object.entries(response.headers).map(([key, value]) => (
            <div
              key={key}
              className="flex gap-2 border-b px-3 py-2 text-xs last:border-b-0"
            >
              <code className="font-semibold text-slate-700">{key}:</code>
              <code className="text-muted-foreground">{value}</code>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────

function initializeRequest(
  path: string,
  parametersJson?: string | null,
  requestSchemaJson?: string | null,
  requestExample?: string | null,
  _operationId?: string
): RequestState {
  const pathParams: PathParam[] = []
  const queryParams: QueryParam[] = []
  const headers: HeaderParam[] = []

  // Extract path params from path template
  const pathParamMatches = path.match(/\{([^}]+)\}/g)
  if (pathParamMatches) {
    for (const match of pathParamMatches) {
      const name = match.slice(1, -1)
      pathParams.push({ name, value: '', required: true })
    }
  }

  // Parse parameters from OpenAPI
  if (parametersJson) {
    try {
      const params = JSON.parse(parametersJson) as Array<{
        Name?: string
        In?: string
        Required?: boolean
        Description?: string
        Default?: string
        Schema?: { default?: unknown; example?: unknown }
      }>

      for (const param of params) {
        if (!param.Name) continue

        // Extract default value from param
        const defaultValue =
          param.Default ?? param.Schema?.default ?? param.Schema?.example ?? ''

        if (param.In === 'query') {
          queryParams.push({
            name: param.Name,
            value: String(defaultValue),
            required: param.Required ?? false,
            description: param.Description,
          })
        } else if (param.In === 'header') {
          headers.push({
            name: param.Name,
            value: String(defaultValue),
            required: param.Required ?? false,
            description: param.Description,
          })
        } else if (param.In === 'path') {
          const existing = pathParams.find((p) => p.name === param.Name)
          if (existing) {
            existing.description = param.Description
            existing.required = param.Required ?? true
          }
        }
      }
    } catch {
      // ignore parse errors
    }
  }

  // Extract body example - prefer requestExample from meta, then requestSchema
  let bodyExample = '{}'

  // First, try to use the request example from componentMeta
  if (requestExample) {
    try {
      // Try to parse as JSON to validate and pretty-print
      const parsed = JSON.parse(requestExample)
      bodyExample = JSON.stringify(parsed, null, 2)
    } catch {
      // If not valid JSON, use as-is (might be plain text)
      bodyExample = requestExample
    }
  } else if (requestSchemaJson) {
    // Fallback to extracting from requestSchema
    try {
      const schema = JSON.parse(requestSchemaJson) as {
        example?: unknown
        examples?: Record<string, { value?: unknown }>
        properties?: Record<string, { example?: unknown; default?: unknown }>
      }

      // Prefer top-level example
      if (schema.example) {
        bodyExample = JSON.stringify(schema.example, null, 2)
      } else if (schema.examples && Object.keys(schema.examples).length > 0) {
        // Use first example
        const firstExample = Object.values(schema.examples)[0]
        if (firstExample?.value) {
          bodyExample = JSON.stringify(firstExample.value, null, 2)
        }
      } else if (schema.properties) {
        // Build example from properties with examples/defaults
        const example: Record<string, unknown> = {}
        for (const [key, prop] of Object.entries(schema.properties)) {
          if (prop.example !== undefined) {
            example[key] = prop.example
          } else if (prop.default !== undefined) {
            example[key] = prop.default
          }
        }
        if (Object.keys(example).length > 0) {
          bodyExample = JSON.stringify(example, null, 2)
        }
      }
    } catch {
      // ignore parse errors, use default {}
    }
  }

  return {
    pathParams,
    queryParams,
    headers,
    body: bodyExample,
    contentType: 'application/json',
  }
}

// Helper to merge persisted params with initial spec params
function mergeParams<T extends { name: string; value: string }>(
  initial: T[],
  persisted: T[]
): T[] {
  const merged = new Map<string, T>()

  // First, add all initial params (from spec)
  for (const param of initial) {
    merged.set(param.name, { ...param })
  }

  // Then, override with persisted values (user-entered)
  for (const param of persisted) {
    const existing = merged.get(param.name)
    if (existing) {
      // Merge: keep spec metadata, use persisted value
      merged.set(param.name, { ...existing, value: param.value })
    } else {
      // User-added param not in spec, keep it
      merged.set(param.name, param)
    }
  }

  return Array.from(merged.values())
}

function buildCurlCommand(
  method: string,
  url: string,
  request: RequestState,
  authConfig: AuthConfig
): string {
  const lines: string[] = [`curl -X ${method} \\`]
  lines.push(`  -sS \\`)

  // Track headers to avoid duplicates (case-insensitive)
  const addedHeaders = new Set<string>()

  // Build auth headers with placeholders
  if (authConfig.kind === 'bearer' || authConfig.kind === 'oauth2') {
    const token = authConfig.token || '$TOKEN'
    lines.push(`  -H 'Authorization: Bearer ${token}' \\`)
    addedHeaders.add('authorization')
  } else if (authConfig.kind === 'api-key') {
    if (authConfig.apiKeyIn === 'query') {
      // Will be added to query params below
    } else {
      const apiKey = authConfig.apiKey || '$API_KEY'
      const headerName = authConfig.apiKeyName || 'x-api-key'
      lines.push(`  -H '${headerName}: ${apiKey}' \\`)
      addedHeaders.add(headerName.toLowerCase())
    }
  }

  // Add custom headers (avoid duplicates)
  for (const header of request.headers) {
    if (header.name && header.value) {
      const headerKey = header.name.toLowerCase()
      if (!addedHeaders.has(headerKey)) {
        lines.push(`  -H '${header.name}: ${header.value}' \\`)
        addedHeaders.add(headerKey)
      }
    }
  }

  // Add Content-Type only if not already present and body exists
  if (method !== 'GET' && method !== 'HEAD' && request.body) {
    if (!addedHeaders.has('content-type')) {
      const contentType = request.contentType || 'application/json'
      lines.push(`  -H 'Content-Type: ${contentType}' \\`)
    }
  }

  if (method !== 'GET' && method !== 'HEAD' && request.body) {
    lines.push(`  -d '${request.body.replace(/'/g, "'\\''")}' \\`)
  }

  // Build final URL with query params (url should already be base without query)
  let finalUrl = url
  const params = new URLSearchParams()

  // Add query params from request (will override existing if same name)
  for (const param of request.queryParams) {
    if (param.name && param.value) {
      params.set(param.name, param.value)
    }
  }

  // Add API key to query if needed
  if (authConfig.kind === 'api-key' && authConfig.apiKeyIn === 'query') {
    const apiKey = authConfig.apiKey || '$API_KEY'
    const paramName = authConfig.apiKeyName || 'api_key'
    params.set(paramName, apiKey)
  } else {
    // Add other auth query params (if any)
    const authInjection = resolveAuth(authConfig)
    for (const [key, value] of Object.entries(authInjection.queryParams)) {
      params.set(key, value)
    }
  }

  if (params.toString()) {
    finalUrl += `?${params.toString()}`
  }

  lines.push(`  '${finalUrl}'`)

  // Add jq for JSON formatting, with fallback to raw output
  // If jq fails (non-JSON response, includes headers, or jq not installed), show raw output
  // Redirect stderr to stdout to capture curl errors, then try jq, fallback to cat
  const curlCommand = lines.join('\n')
  // Note: -i includes headers which will break jq parsing, so cat will show full response
  return `${curlCommand}`
}

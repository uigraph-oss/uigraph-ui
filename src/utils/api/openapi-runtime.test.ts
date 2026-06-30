import { describe, expect, it } from 'vitest'
import { createOpenApiRuntime } from './openapi-runtime'

describe('createOpenApiRuntime', () => {
  it('extracts env options from server variable enum and resolves base url', () => {
    const runtime = createOpenApiRuntime({
      servers: [
        {
          url: 'https://api.{stage}.uigraph.app/project-manager',
          variables: {
            stage: {
              default: 'staging',
              enum: ['dev', 'staging', 'prod'],
            },
          },
        },
      ],
    })

    expect(runtime.envOptions).toEqual(['dev', 'staging', 'prod'])
    expect(runtime.defaultEnv).toBe('dev')
    expect(runtime.resolveBaseUrl('staging')).toBe(
      'https://api.staging.uigraph.app/project-manager'
    )
  })

  it('falls back to provided base url when no server exists', () => {
    const runtime = createOpenApiRuntime({})
    expect(runtime.envOptions).toEqual([])
    expect(runtime.resolveBaseUrl('dev', 'https://fallback.example.com')).toBe(
      'https://fallback.example.com'
    )
  })

  it('derives operation auth from security schemes and operation security', () => {
    const runtime = createOpenApiRuntime({
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer' },
          apiKeyAuth: { type: 'apiKey' },
        },
      },
      security: [{ bearerAuth: [] }],
      paths: {
        '/v1/services': {
          get: {
            operationId: 'v1GetServices',
            security: [{ apiKeyAuth: [] }],
          },
        },
      },
    })

    expect(runtime.hasSecuritySchemes).toBe(true)
    expect(runtime.operationAuth('v1GetServices')).toBe('api-key')
    expect(runtime.operationAuth('unknownOp')).toBe('bearer')
  })

  it('returns none auth when no security schemes are present', () => {
    const runtime = createOpenApiRuntime({
      paths: {
        '/v1/services': {
          get: { operationId: 'v1GetServices' },
        },
      },
    })

    expect(runtime.hasSecuritySchemes).toBe(false)
    expect(runtime.operationAuth('v1GetServices')).toBe('none')
  })

  it('treats explicit empty operation security as no auth', () => {
    const runtime = createOpenApiRuntime({
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer' },
        },
      },
      security: [{ bearerAuth: [] }],
      paths: {
        '/auth/login': {
          post: {
            operationId: 'login',
            security: [],
          },
        },
        '/orders': {
          get: { operationId: 'listOrders' },
        },
      },
    })

    expect(runtime.operationAuth('login')).toBe('none')
    expect(runtime.operationAuth('listOrders')).toBe('bearer')
    expect(runtime.operationAuthByPath('POST', '/auth/login')).toBe('none')
    expect(runtime.operationAuthByPath('GET', '/orders')).toBe('bearer')
  })
})

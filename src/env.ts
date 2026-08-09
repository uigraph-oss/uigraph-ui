import z from 'zod'

const envSchema = z.object({
  GRAPHQL_URL: z.url(),

  VITE_DEPLOY_ENV: z
    .enum(['local', 'development', 'production'])
    .default('production'),

  VITE_FEATURE_ENABLE_DEMO_TEST_CASES: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),

  VITE_FEATURE_ENABLE_INSIGHTS: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),

  VITE_FEATURE_ENABLE_DEBUG_DIAGRAM_NODE_BOUNDS: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),

  // Only ever set on the managed/enterprise build — self-hosted OSS builds
  // never set this, so the billing link never renders and no billing
  // network call is made.
  VITE_FEATURE_ENABLE_BILLING: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),

  VITE_BILLING_URL: z.url().optional(),
})

export const env = envSchema.parse({
  ...import.meta.env,
  GRAPHQL_URL: `${window.location.origin}/graphql`,
})

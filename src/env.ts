import z from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.url(),
  VITE_GRAPHQL_URL: z.url(),

  VITE_DEPLOY_ENV: z
    .enum(['local', 'development', 'production'])
    .default('production'),

  VITE_FEATURE_ENABLE_DEMO_TEST_CASES: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
})

export const env = envSchema.parse({
  ...import.meta.env,
  VITE_API_URL: `${window.location.origin}/api`,
  VITE_GRAPHQL_URL: `${window.location.origin}/graphql`,
})

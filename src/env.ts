import z from 'zod'

const envSchema = z.object({
  API_URL: z.url(),
  GRAPHQL_URL: z.url(),

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
  API_URL: `${window.location.origin}/api`,
  GRAPHQL_URL: `${window.location.origin}/graphql`,
})

import z from 'zod'

const envSchema = z.object({
  VITE_APP_URL: z.url().min(1),
  VITE_ASSETS_URL: z.url().min(1),
  VITE_GRAPHQL_ENDPOINT: z.string().min(1),

  VITE_DEPLOY_ENV: z.enum(['local', 'development', 'production']),

  VITE_BYPASS_DOMAIN_CHECK: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true'),

  VITE_FEATURE_ENABLE_DEMO_TEST_CASES: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true'),

  VITE_FIGMA_CLIENT_ID: z.string(),
  VITE_FIGMA_CLIENT_SECRET: z.string(),
  VITE_FIGMA_REDIRECT_URI: z.string(),
})

export const env = envSchema.parse(import.meta.env)

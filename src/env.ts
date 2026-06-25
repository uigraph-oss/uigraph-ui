import z from 'zod'

const envSchema = z.object({
  VITE_APP_URL: z.url().min(1),
  VITE_API_URL: z.url().min(1),
  VITE_ASSETS_URL: z.url().min(1),
  VITE_GRAPHQL_URL: z.string().min(1),

  VITE_DEPLOY_ENV: z
    .enum(['local', 'development', 'production'])
    .default('local'),

  VITE_FEATURE_ENABLE_DEMO_TEST_CASES: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true'),

  // TODO: Migrate this into server
  VITE_FIGMA_CLIENT_ID: z.string().default(''),
  VITE_FIGMA_CLIENT_SECRET: z.string().default(''),
  VITE_FIGMA_REDIRECT_URI: z.string().default(''),
})

export const env = envSchema.parse(import.meta.env)

import z from 'zod'

const bool = z.enum(['true', 'false']).transform((v) => v === 'true')

const envSchema = z.object({
  VITE_DEPLOY_ENV: z.enum(['local', 'development', 'production']),
  VITE_APP_URL: z.url().min(1),
  VITE_ASSETS_URL: z.url().min(1),
  VITE_GRAPHQL_ENDPOINT: z.string().min(1),
  VITE_BYPASS_DOMAIN_CHECK: bool,
  VITE_FEATURE_SSO_ENABLED: bool,
  VITE_FEATURE_ENABLE_DEMO_TEST_CASES: bool,
  VITE_FIGMA_CLIENT_ID: z.string(),
  VITE_FIGMA_CLIENT_SECRET: z.string(),
  VITE_FIGMA_REDIRECT_URI: z.string(),
})

export const env = envSchema.parse(import.meta.env)

import z from 'zod'

const baseEnvSchema = z.object({
  deployEnv: z.enum(['local', 'development', 'production']),
  clientOrigin: z.url().min(1),
  assetsOrigin: z.url().min(1),
  googleAnalyticsId: z.string().optional(),
  bypassDomainCheck: z.boolean().optional(),
})

export const env = {
  ...baseEnvSchema.parse({
    deployEnv: (process.env.NEXT_PUBLIC_DEPLOY_ENV ?? 'production') as
      | 'local'
      | 'development'
      | 'production',

    googleAnalyticsId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ?? undefined,

    bypassDomainCheck: process.env.NEXT_PUBLIC_BYPASS_DOMAIN_CHECK === 'true',

    clientOrigin:
      process.env.NEXT_PUBLIC_APP_URL ??
      process.env.NEXT_PUBLIC_CLIENT_URL ??
      'https://uigraph.app',

    assetsOrigin:
      process.env.NEXT_PUBLIC_ASSETS_URL ?? 'https://assets.uigraph.app',
  }),

  features: {
    ssoEnabled: process.env.NEXT_PUBLIC_FEATURE_SSO_ENABLED === 'true',

    enableDemoTestCases:
      process.env.NEXT_PUBLIC_FEATURE_ENABLE_DEMO_TEST_CASES === 'true',
  },
}

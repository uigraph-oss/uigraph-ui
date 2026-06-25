import z from 'zod'

const envSchema = z.object({
  API_URL: z.url(),
  GRAPHQL_URL: z.url(),
  CODEGEN_URL: z.url().optional(),
})

export const processEnv = envSchema.parse(process.env)
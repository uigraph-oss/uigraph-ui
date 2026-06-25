import z from 'zod'

const processEnvSchema = z.object({})

export const processEnv = processEnvSchema.parse(process.env)

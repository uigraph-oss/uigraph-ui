import { UseFormReturn } from 'react-hook-form'
import z from 'zod'

export type FormType = UseFormReturn<z.infer<typeof configureTestCaseSchema>>

export const configureTestCaseSchema = z
  .object({
    title: z.string({ error: 'Title is required' }).min(1, 'Title is required'),
    description: z.string().optional(),
    type: z.enum(['manual', 'api', 'graphql', 'database', 'grpc'], {
      message: 'Type is required',
    }),
    priority: z.enum(['p0', 'p1', 'p2', 'p3'], {
      message: 'Priority is required',
    }),
    tags: z.array(z.string()).optional(),
    linkedTicket: z.string().optional(),
    estimatedMins: z.string().optional(),
    testOwner: z.string().optional(),
    linkedMapNode: z.string().optional(),
    evidenceRequired: z.boolean().optional(),
    critical: z.boolean().optional(),
    preconditions: z.string().optional(),
    testData: z.string().optional(),
    steps: z
      .array(
        z.object({
          action: z.string(),
          expected: z.string(),
        })
      )
      .optional(),
    expectedOutcome: z.string().optional(),
    postconditions: z.string().optional(),
    httpMethod: z.string().optional(),
    apiSpec: z.string().optional(),
    operation: z.string().optional(),
    authType: z.string().optional(),
    authValue: z.string().optional(),
    apiKeyHeader: z.string().optional(),
    apiKeyValue: z.string().optional(),
    basicUser: z.string().optional(),
    basicPass: z.string().optional(),
    headers: z
      .array(
        z.object({
          key: z.string(),
          value: z.string(),
        })
      )
      .optional(),
    queryParams: z
      .array(
        z.object({
          key: z.string(),
          value: z.string(),
        })
      )
      .optional(),
    requestBody: z.string().optional(),
    expectedStatus: z.string().optional(),
    responseTimeMs: z.string().optional(),
    responseBody: z.string().optional(),
    assertions: z
      .array(
        z.object({
          field: z.string(),
          type: z.string(),
          value: z.string(),
        })
      )
      .optional(),
    gqlType: z.string().optional(),
    gqlName: z.string().optional(),
    gqlQuery: z.string().optional(),
    gqlVariables: z.string().optional(),
    gqlResponseBody: z.string().optional(),
    gqlAssertions: z
      .array(
        z.object({
          field: z.string(),
          type: z.string(),
          value: z.string(),
        })
      )
      .optional(),
    gqlExpectError: z.boolean().optional(),
    dbDialect: z.string().optional(),
    dbSchema: z.string().optional(),
    dbQuery: z.string().optional(),
    dbAssertions: z
      .array(
        z.object({
          field: z.string(),
          type: z.string(),
          value: z.string(),
        })
      )
      .optional(),
    dbSetup: z.string().optional(),
    dbCleanup: z.string().optional(),
    grpcService: z.string().optional(),
    grpcMethod: z.string().optional(),
    grpcMode: z.string().optional(),
    grpcProto: z.string().optional(),
    grpcAddress: z.string().optional(),
    grpcRequest: z.string().optional(),
    grpcMetadata: z
      .array(
        z.object({
          key: z.string(),
          value: z.string(),
        })
      )
      .optional(),
    grpcExpectedStatus: z.string().optional(),
    grpcDeadline: z.string().optional(),
    grpcResponseBody: z.string().optional(),
    grpcAssertions: z
      .array(
        z.object({
          field: z.string(),
          type: z.string(),
          value: z.string(),
        })
      )
      .optional(),
    grpcTLS: z.boolean().optional(),
    grpcExpectError: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'grpc' && !data.grpcMethod?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['grpcMethod'],
        message: 'Method Name is required',
      })
    }

    if (data.type === 'grpc' && !data.grpcMode?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['grpcMode'],
        message: 'Call Mode is required',
      })
    }

    if (data.type === 'grpc' && !data.grpcExpectedStatus?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['grpcExpectedStatus'],
        message: 'Expected gRPC Status is required',
      })
    }

    if (data.type === 'graphql' && !data.gqlType?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['gqlType'],
        message: 'Operation Type is required',
      })
    }

    if (data.type === 'graphql' && !data.gqlQuery?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['gqlQuery'],
        message: 'Query / Mutation is required',
      })
    }

    if (data.type === 'graphql' && data.gqlExpectError === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['gqlExpectError'],
        message: 'Expect Error is required',
      })
    }

    if (data.type === 'api' && !data.httpMethod?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['httpMethod'],
        message: 'Method is required',
      })
    }
  })

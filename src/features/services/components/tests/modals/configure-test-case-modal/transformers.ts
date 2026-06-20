import { V2 } from '@/api'
import z from 'zod'
import { configureTestCaseSchema } from './schema'

export function transformToCreateTestCase(
  data: z.infer<typeof configureTestCaseSchema>
): Omit<V2.CreateTestCaseInput, 'testPackId' | 'order'> {
  return {
    title: data.title,
    description: data.description,
    type: data.type,
    priority: {
      p0: 'P0',
      p1: 'P1',
      p2: 'P2',
      p3: 'P3',
    }[data.priority],
    labels: data.tags,
    linkedTicket: data.linkedTicket,
    estimatedDurationMins:
      data.estimatedMins !== undefined && data.estimatedMins !== ''
        ? Number(data.estimatedMins)
        : undefined,
    testOwner: data.testOwner,
    linkedMapNodeId: data.linkedMapNode,
    evidenceRequired: data.evidenceRequired,
    isCritical: data.critical,
    manual:
      data.type === 'manual'
        ? {
            preconditions: data.preconditions,
            testData: data.testData,
            steps: data.steps?.map((step, index) => ({
              order: index,
              action: step.action,
              expectedResult: step.expected,
            })),
            expectedOutcome: data.expectedOutcome,
            postconditions: data.postconditions,
          }
        : undefined,
    api:
      data.type === 'api'
        ? {
            httpMethod: data.httpMethod!,
            apiSpecId: data.apiSpec,
            operationId: data.operation,
            auth: data.authType
              ? {
                  type: data.authType,
                  bearerToken: data.authValue,
                  apiKeyHeader: data.apiKeyHeader,
                  apiKeyValue: data.apiKeyValue,
                  basicUsername: data.basicUser,
                  basicPassword: data.basicPass,
                }
              : undefined,
            requestHeaders: data.headers,
            queryParams: data.queryParams,
            requestBody: data.requestBody,
            expectedStatusCode:
              data.expectedStatus !== undefined && data.expectedStatus !== ''
                ? Number(data.expectedStatus)
                : undefined,
            maxResponseTimeMs:
              data.responseTimeMs !== undefined && data.responseTimeMs !== ''
                ? Number(data.responseTimeMs)
                : undefined,
            responseBody: data.responseBody,
            assertions: data.assertions,
          }
        : undefined,
    graphql:
      data.type === 'graphql'
        ? {
            operationType: data.gqlType!,
            operationName: data.gqlName,
            query: data.gqlQuery!,
            variables: data.gqlVariables,
            responseBody: data.gqlResponseBody,
            assertions: data.gqlAssertions,
            expectError: data.gqlExpectError!,
          }
        : undefined,
    database:
      data.type === 'database'
        ? {
            dialect: data.dbDialect!,
            schemaId: data.dbSchema,
            query: data.dbQuery!,
            assertions: data.dbAssertions,
            setupQuery: data.dbSetup,
            teardownQuery: data.dbCleanup,
          }
        : undefined,
    grpc:
      data.type === 'grpc'
        ? {
            serviceName: data.grpcService!,
            methodName: data.grpcMethod!,
            callMode: data.grpcMode!,
            protoFileId: data.grpcProto,
            serverAddress: data.grpcAddress,
            requestMessage: data.grpcRequest,
            metadata: data.grpcMetadata,
            expectedStatus: data.grpcExpectedStatus!,
            deadlineMs:
              data.grpcDeadline !== undefined && data.grpcDeadline !== ''
                ? Number(data.grpcDeadline)
                : undefined,
            responseBody: data.grpcResponseBody,
            assertions: data.grpcAssertions,
            useTLS: data.grpcTLS!,
            expectError: data.grpcExpectError!,
          }
        : undefined,
  }
}

export function transformToUpdateTestCase(
  data: z.infer<typeof configureTestCaseSchema>
): Omit<V2.UpdateTestCaseInput, 'testCaseId' | 'testPackId' | 'order'> {
  return {
    title: data.title,
    description: data.description,
    type: data.type,
    priority: {
      p0: 'P0',
      p1: 'P1',
      p2: 'P2',
      p3: 'P3',
    }[data.priority],
    labels: data.tags,
    linkedTicket: data.linkedTicket,
    estimatedDurationMins:
      data.estimatedMins !== undefined && data.estimatedMins !== ''
        ? Number(data.estimatedMins)
        : undefined,
    testOwner: data.testOwner,
    linkedMapNodeId: data.linkedMapNode,
    evidenceRequired: data.evidenceRequired,
    isCritical: data.critical,
    manual:
      data.type === 'manual'
        ? {
            preconditions: data.preconditions,
            testData: data.testData,
            steps: data.steps?.map((step, index) => ({
              order: index,
              action: step.action,
              expectedResult: step.expected,
            })),
            expectedOutcome: data.expectedOutcome,
            postconditions: data.postconditions,
          }
        : undefined,
    api:
      data.type === 'api'
        ? {
            httpMethod: data.httpMethod!,
            apiSpecId: data.apiSpec,
            operationId: data.operation,
            auth: data.authType
              ? {
                  type: data.authType,
                  bearerToken: data.authValue,
                  apiKeyHeader: data.apiKeyHeader,
                  apiKeyValue: data.apiKeyValue,
                  basicUsername: data.basicUser,
                  basicPassword: data.basicPass,
                }
              : undefined,
            requestHeaders: data.headers,
            queryParams: data.queryParams,
            requestBody: data.requestBody,
            expectedStatusCode:
              data.expectedStatus !== undefined && data.expectedStatus !== ''
                ? Number(data.expectedStatus)
                : undefined,
            maxResponseTimeMs:
              data.responseTimeMs !== undefined && data.responseTimeMs !== ''
                ? Number(data.responseTimeMs)
                : undefined,
            responseBody: data.responseBody,
            assertions: data.assertions,
          }
        : undefined,
    graphql:
      data.type === 'graphql'
        ? {
            operationType: data.gqlType!,
            operationName: data.gqlName,
            query: data.gqlQuery!,
            variables: data.gqlVariables,
            responseBody: data.gqlResponseBody,
            assertions: data.gqlAssertions,
            expectError: data.gqlExpectError!,
          }
        : undefined,
    database:
      data.type === 'database'
        ? {
            dialect: data.dbDialect!,
            schemaId: data.dbSchema,
            query: data.dbQuery!,
            assertions: data.dbAssertions,
            setupQuery: data.dbSetup,
            teardownQuery: data.dbCleanup,
          }
        : undefined,
    grpc:
      data.type === 'grpc'
        ? {
            serviceName: data.grpcService!,
            methodName: data.grpcMethod!,
            callMode: data.grpcMode!,
            protoFileId: data.grpcProto,
            serverAddress: data.grpcAddress,
            requestMessage: data.grpcRequest,
            metadata: data.grpcMetadata,
            expectedStatus: data.grpcExpectedStatus!,
            deadlineMs:
              data.grpcDeadline !== undefined && data.grpcDeadline !== ''
                ? Number(data.grpcDeadline)
                : undefined,
            responseBody: data.grpcResponseBody,
            assertions: data.grpcAssertions,
            useTLS: data.grpcTLS!,
            expectError: data.grpcExpectError!,
          }
        : undefined,
  }
}

function priorityToSchemaValue(
  priority?: string | null
): 'p0' | 'p1' | 'p2' | 'p3' {
  if (!priority) return 'p2'
  const normalized = String(priority).toUpperCase()
  const map: Record<string, 'p0' | 'p1' | 'p2' | 'p3'> = {
    P0: 'p0',
    P1: 'p1',
    P2: 'p2',
    P3: 'p3',
  }
  return map[normalized] ?? 'p2'
}

export function transformTestCaseToSchema(
  testCase: V2.TestCase
): z.infer<typeof configureTestCaseSchema> {
  return {
    title: testCase.title!,
    description:
      testCase.description === null ? undefined : testCase.description,
    type: testCase.type as z.infer<typeof configureTestCaseSchema>['type'],
    priority: priorityToSchemaValue(testCase.priority),
    tags: testCase.labels === null ? undefined : testCase.labels,
    linkedTicket:
      testCase.linkedTicket === null ? undefined : testCase.linkedTicket,
    estimatedMins:
      typeof testCase.estimatedDurationMins === 'number'
        ? String(testCase.estimatedDurationMins)
        : undefined,
    testOwner: testCase.testOwner === null ? undefined : testCase.testOwner,
    linkedMapNode:
      testCase.linkedMapNodeId === null ? undefined : testCase.linkedMapNodeId,
    evidenceRequired:
      testCase.evidenceRequired === null
        ? undefined
        : testCase.evidenceRequired,
    critical: testCase.isCritical === null ? undefined : testCase.isCritical,
    preconditions:
      testCase.manual?.preconditions === null
        ? undefined
        : testCase.manual?.preconditions,
    testData:
      testCase.manual?.testData === null
        ? undefined
        : testCase.manual?.testData,
    steps:
      testCase.manual?.steps === null
        ? undefined
        : testCase.manual?.steps?.map((step) => ({
            action: step.action,
            expected: step.expectedResult,
          })),
    expectedOutcome:
      testCase.manual?.expectedOutcome === null
        ? undefined
        : testCase.manual?.expectedOutcome,
    postconditions:
      testCase.manual?.postconditions === null
        ? undefined
        : testCase.manual?.postconditions,
    httpMethod:
      testCase.api?.httpMethod === null ? undefined : testCase.api?.httpMethod,
    apiSpec:
      testCase.api?.apiSpecId === null ? undefined : testCase.api?.apiSpecId,
    operation:
      testCase.api?.operationId === null
        ? undefined
        : testCase.api?.operationId,
    authType:
      testCase.api?.auth?.type === null ? undefined : testCase.api?.auth?.type,
    authValue:
      testCase.api?.auth?.bearerToken === null
        ? undefined
        : testCase.api?.auth?.bearerToken,
    apiKeyHeader:
      testCase.api?.auth?.apiKeyHeader === null
        ? undefined
        : testCase.api?.auth?.apiKeyHeader,
    apiKeyValue:
      testCase.api?.auth?.apiKeyValue === null
        ? undefined
        : testCase.api?.auth?.apiKeyValue,
    basicUser:
      testCase.api?.auth?.basicUsername === null
        ? undefined
        : testCase.api?.auth?.basicUsername,
    basicPass:
      testCase.api?.auth?.basicPassword === null
        ? undefined
        : testCase.api?.auth?.basicPassword,
    headers:
      testCase.api?.requestHeaders === null
        ? undefined
        : testCase.api?.requestHeaders,
    queryParams:
      testCase.api?.queryParams === null
        ? undefined
        : testCase.api?.queryParams,
    requestBody:
      testCase.api?.requestBody === null
        ? undefined
        : testCase.api?.requestBody,
    expectedStatus:
      typeof testCase.api?.expectedStatusCode === 'number'
        ? String(testCase.api.expectedStatusCode)
        : undefined,
    responseTimeMs:
      typeof testCase.api?.maxResponseTimeMs === 'number'
        ? String(testCase.api.maxResponseTimeMs)
        : undefined,
    responseBody:
      testCase.api?.responseBody === null
        ? undefined
        : testCase.api?.responseBody,
    assertions:
      testCase.api?.assertions === null
        ? undefined
        : testCase.api?.assertions?.map((assertion) => ({
            field: assertion.field!,
            type: assertion.type!,
            value: assertion.value!,
          })),
    gqlType:
      testCase.graphql?.operationType === null
        ? undefined
        : testCase.graphql?.operationType,
    gqlName:
      testCase.graphql?.operationName === null
        ? undefined
        : testCase.graphql?.operationName,
    gqlQuery:
      testCase.graphql?.query === null ? undefined : testCase.graphql?.query,
    gqlVariables:
      testCase.graphql?.variables === null
        ? undefined
        : testCase.graphql?.variables,
    gqlResponseBody:
      testCase.graphql?.responseBody === null
        ? undefined
        : testCase.graphql?.responseBody,
    gqlAssertions:
      testCase.graphql?.assertions === null
        ? undefined
        : testCase.graphql?.assertions?.map((assertion) => ({
            field: assertion.field!,
            type: assertion.type!,
            value: assertion.value!,
          })),
    gqlExpectError:
      testCase.graphql?.expectError === null
        ? undefined
        : testCase.graphql?.expectError,
    dbDialect:
      testCase.database?.dialect === null
        ? undefined
        : testCase.database?.dialect,
    dbSchema:
      testCase.database?.schemaId === null
        ? undefined
        : testCase.database?.schemaId,
    dbQuery:
      testCase.database?.query === null ? undefined : testCase.database?.query,
    dbAssertions:
      testCase.database?.assertions === null
        ? undefined
        : testCase.database?.assertions?.map((assertion) => ({
            field: assertion.field!,
            type: assertion.type!,
            value: assertion.value!,
          })),
    dbSetup:
      testCase.database?.setupQuery === null
        ? undefined
        : testCase.database?.setupQuery,
    dbCleanup:
      testCase.database?.teardownQuery === null
        ? undefined
        : testCase.database?.teardownQuery,
    grpcService:
      testCase.grpc?.serviceName === null
        ? undefined
        : testCase.grpc?.serviceName,
    grpcMethod:
      testCase.grpc?.methodName === null
        ? undefined
        : testCase.grpc?.methodName,
    grpcMode:
      testCase.grpc?.callMode === null ? undefined : testCase.grpc?.callMode,
    grpcProto:
      testCase.grpc?.protoFileId === null
        ? undefined
        : testCase.grpc?.protoFileId,
    grpcAddress:
      testCase.grpc?.serverAddress === null
        ? undefined
        : testCase.grpc?.serverAddress,
    grpcRequest:
      testCase.grpc?.requestMessage === null
        ? undefined
        : testCase.grpc?.requestMessage,
    grpcMetadata:
      testCase.grpc?.metadata === null ? undefined : testCase.grpc?.metadata,
    grpcExpectedStatus:
      testCase.grpc?.expectedStatus === null
        ? undefined
        : testCase.grpc?.expectedStatus,
    grpcDeadline:
      typeof testCase.grpc?.deadlineMs === 'number'
        ? String(testCase.grpc.deadlineMs)
        : undefined,
    grpcResponseBody:
      testCase.grpc?.responseBody === null
        ? undefined
        : testCase.grpc?.responseBody,
    grpcAssertions:
      testCase.grpc?.assertions === null
        ? undefined
        : testCase.grpc?.assertions?.map((assertion) => ({
            field: assertion.field!,
            type: assertion.type!,
            value: assertion.value!,
          })),
    grpcTLS: testCase.grpc?.useTLS === null ? undefined : testCase.grpc?.useTLS,
    grpcExpectError:
      testCase.grpc?.expectError === null
        ? undefined
        : testCase.grpc?.expectError,
  }
}

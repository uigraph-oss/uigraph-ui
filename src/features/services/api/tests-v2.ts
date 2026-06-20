import { graphql } from '@/api'

export const TEST_PACKS_V2 = graphql(`
  query TestPacksV2($orgId: ID!, $serviceId: ID!) {
    testPacks(orgId: $orgId, serviceId: $serviceId) {
      testPackId
      serviceId
      orgId
      name
      type
      createdBy
      updatedBy
      createdAt
      updatedAt
    }
  }
`)

export const CREATE_TEST_PACK_V2 = graphql(`
  mutation CreateTestPackV2(
    $orgId: ID!
    $serviceId: ID!
    $input: CreateTestPackInput!
  ) {
    createTestPack(orgId: $orgId, serviceId: $serviceId, input: $input) {
      testPackId
      serviceId
      orgId
      name
      type
      createdBy
      updatedBy
      createdAt
      updatedAt
    }
  }
`)

export const UPDATE_TEST_PACK_V2 = graphql(`
  mutation UpdateTestPackV2(
    $orgId: ID!
    $serviceId: ID!
    $id: ID!
    $input: UpdateTestPackInput!
  ) {
    updateTestPack(
      orgId: $orgId
      serviceId: $serviceId
      id: $id
      input: $input
    ) {
      testPackId
      serviceId
      orgId
      name
      type
      createdBy
      updatedBy
      createdAt
      updatedAt
    }
  }
`)

export const DELETE_TEST_PACK_V2 = graphql(`
  mutation DeleteTestPackV2($orgId: ID!, $serviceId: ID!, $id: ID!) {
    deleteTestPack(orgId: $orgId, serviceId: $serviceId, id: $id)
  }
`)

export const TEST_CASES_V2 = graphql(`
  query TestCasesV2($orgId: ID!, $serviceId: ID!, $testPackId: ID!) {
    testCases(orgId: $orgId, serviceId: $serviceId, testPackId: $testPackId) {
      testCaseId
      testPackId
      serviceId
      orgId
      title
      order
      type
      description
      priority
      labels
      linkedTicket
      estimatedDurationMins
      testOwner
      linkedMapNodeId
      isCritical
      evidenceRequired
      status
      version
      baselineRunResultId
      dependencies
      createdBy
      updatedBy
      createdAt
      updatedAt
      manual {
        preconditions
        testData
        expectedOutcome
        postconditions
        steps {
          order
          action
          expectedResult
        }
      }
      api {
        httpMethod
        apiSpecId
        operationId
        requestBody
        expectedStatusCode
        maxResponseTimeMs
      }
      graphql {
        operationType
        operationName
        query
        variables
        responseBody
        expectError
      }
      database {
        dialect
        schemaId
        query
        setupQuery
        teardownQuery
      }
      grpc {
        serviceName
        methodName
        callMode
        protoFileId
        serverAddress
        requestMessage
        expectedStatus
        deadlineMs
        responseBody
        useTLS
        expectError
      }
    }
  }
`)

export const CREATE_TEST_CASE_V2 = graphql(`
  mutation CreateTestCaseV2(
    $orgId: ID!
    $serviceId: ID!
    $input: CreateTestCaseInput!
  ) {
    createTestCase(orgId: $orgId, serviceId: $serviceId, input: $input) {
      testCaseId
      testPackId
      serviceId
      orgId
      title
      order
      type
      description
      priority
      labels
      linkedTicket
      estimatedDurationMins
      testOwner
      linkedMapNodeId
      isCritical
      evidenceRequired
      status
      version
      baselineRunResultId
      dependencies
      createdBy
      updatedBy
      createdAt
      updatedAt
      manual {
        preconditions
        testData
        expectedOutcome
        postconditions
        steps {
          order
          action
          expectedResult
        }
      }
      api {
        httpMethod
        apiSpecId
        operationId
        requestBody
        expectedStatusCode
        maxResponseTimeMs
      }
      graphql {
        operationType
        operationName
        query
        variables
        responseBody
        expectError
      }
      database {
        dialect
        schemaId
        query
        setupQuery
        teardownQuery
      }
      grpc {
        serviceName
        methodName
        callMode
        protoFileId
        serverAddress
        requestMessage
        expectedStatus
        deadlineMs
        responseBody
        useTLS
        expectError
      }
    }
  }
`)

export const UPDATE_TEST_CASE_V2 = graphql(`
  mutation UpdateTestCaseV2(
    $orgId: ID!
    $serviceId: ID!
    $id: ID!
    $input: UpdateTestCaseInput!
  ) {
    updateTestCase(
      orgId: $orgId
      serviceId: $serviceId
      id: $id
      input: $input
    ) {
      testCaseId
      testPackId
      serviceId
      orgId
      title
      order
      type
      description
      priority
      labels
      linkedTicket
      estimatedDurationMins
      testOwner
      linkedMapNodeId
      isCritical
      evidenceRequired
      status
      version
      baselineRunResultId
      dependencies
      createdBy
      updatedBy
      createdAt
      updatedAt
      manual {
        preconditions
        testData
        expectedOutcome
        postconditions
        steps {
          order
          action
          expectedResult
        }
      }
      api {
        httpMethod
        apiSpecId
        operationId
        requestBody
        expectedStatusCode
        maxResponseTimeMs
      }
      graphql {
        operationType
        operationName
        query
        variables
        responseBody
        expectError
      }
      database {
        dialect
        schemaId
        query
        setupQuery
        teardownQuery
      }
      grpc {
        serviceName
        methodName
        callMode
        protoFileId
        serverAddress
        requestMessage
        expectedStatus
        deadlineMs
        responseBody
        useTLS
        expectError
      }
    }
  }
`)

export const DELETE_TEST_CASE_V2 = graphql(`
  mutation DeleteTestCaseV2($orgId: ID!, $serviceId: ID!, $id: ID!) {
    deleteTestCase(orgId: $orgId, serviceId: $serviceId, id: $id)
  }
`)

export const TEST_RUNS_V2 = graphql(`
  query TestRunsV2($orgId: ID!, $serviceId: ID!, $testPackId: ID!) {
    testRuns(orgId: $orgId, serviceId: $serviceId, testPackId: $testPackId) {
      testRunId
      testPackId
      serviceId
      orgId
      environment
      releaseLabel
      startedAt
      completedAt
      status
      startedBy
      executedBy
      executedAt
      overallStatus
    }
  }
`)

export const TEST_RUN_V2 = graphql(`
  query TestRunV2($orgId: ID!, $serviceId: ID!, $id: ID!) {
    testRun(orgId: $orgId, serviceId: $serviceId, id: $id) {
      testRunId
      testPackId
      serviceId
      orgId
      environment
      releaseLabel
      startedAt
      completedAt
      status
      startedBy
      executedBy
      executedAt
      overallStatus
    }
  }
`)

export const TEST_RUNS_SUMMARY_V2 = graphql(`
  query TestRunsSummaryV2($orgId: ID!, $serviceId: ID!, $testPackId: ID) {
    testRunsSummary(
      orgId: $orgId
      serviceId: $serviceId
      testPackId: $testPackId
    ) {
      testRunId
      testPackId
      serviceId
      environment
      releaseLabel
      startedAt
      completedAt
      status
      startedBy
      executedBy
      executedAt
      overallStatus
      passedCount
      failedCount
      skippedCount
      blockedCount
    }
  }
`)

export const CREATE_TEST_RUN_V2 = graphql(`
  mutation CreateTestRunV2(
    $orgId: ID!
    $serviceId: ID!
    $input: CreateTestRunInput!
  ) {
    createTestRun(orgId: $orgId, serviceId: $serviceId, input: $input) {
      testRunId
      testPackId
      status
      overallStatus
    }
  }
`)

export const UPDATE_TEST_RUN_V2 = graphql(`
  mutation UpdateTestRunV2(
    $orgId: ID!
    $serviceId: ID!
    $id: ID!
    $input: UpdateTestRunInput!
  ) {
    updateTestRun(
      orgId: $orgId
      serviceId: $serviceId
      id: $id
      input: $input
    ) {
      testRunId
      status
      overallStatus
    }
  }
`)

export const TEST_RUN_RESULTS_V2 = graphql(`
  query TestRunResultsV2($orgId: ID!, $serviceId: ID!, $testRunId: ID!) {
    testRunResults(
      orgId: $orgId
      serviceId: $serviceId
      testRunId: $testRunId
    ) {
      testRunResultId
      testRunId
      testCaseId
      serviceId
      orgId
      status
      blockedReason
      responseStatus
      responseBody
      responseTimeMs
      notes
      screenshotUrls
      executedAt
      executedBy
    }
  }
`)

export const CREATE_TEST_RUN_RESULT_V2 = graphql(`
  mutation CreateTestRunResultV2(
    $orgId: ID!
    $serviceId: ID!
    $input: CreateTestRunResultInput!
  ) {
    createTestRunResult(orgId: $orgId, serviceId: $serviceId, input: $input) {
      testRunResultId
      testRunId
      testCaseId
      status
    }
  }
`)

export const UPDATE_TEST_RUN_RESULT_V2 = graphql(`
  mutation UpdateTestRunResultV2(
    $orgId: ID!
    $serviceId: ID!
    $id: ID!
    $input: UpdateTestRunResultInput!
  ) {
    updateTestRunResult(
      orgId: $orgId
      serviceId: $serviceId
      id: $id
      input: $input
    ) {
      testRunResultId
      status
    }
  }
`)

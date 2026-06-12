import { graphql } from '@/api'

export const GET_TEST_CASES_QUERY = graphql(`
  query V1GetTestCases($testPackId: String!) {
    v1GetTestCases(testPackId: $testPackId) {
      testCaseId
      testPackId
      type
      title
      order
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
      createdAt
      updatedAt
      deletedAt
      createdBy
      updatedBy
      deletedBy
      createdByProfileImgUrl
      updatedByProfileImgUrl
      deletedByProfileImgUrl
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
        responseBody
        auth {
          type
          bearerToken
          apiKeyHeader
          apiKeyValue
          basicUsername
          basicPassword
        }
        requestHeaders {
          key
          value
        }
        queryParams {
          key
          value
        }
        assertions {
          field
          type
          value
        }
      }
      graphql {
        operationType
        operationName
        query
        variables
        responseBody
        expectError
        assertions {
          field
          type
          value
        }
      }
      database {
        dialect
        schemaId
        query
        setupQuery
        teardownQuery
        assertions {
          field
          type
          value
        }
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
        metadata {
          key
          value
        }
        assertions {
          field
          type
          value
        }
      }
    }
  }
`)

export const CREATE_TEST_CASE_MUTATION = graphql(`
  mutation V1CreateTestCase($input: CreateTestCaseInput!) {
    v1CreateTestCase(input: $input) {
      testCaseId
      testPackId
    }
  }
`)

export const UPDATE_TEST_CASE_MUTATION = graphql(`
  mutation V1UpdateTestCase(
    $testCaseId: String!
    $input: UpdateTestCaseInput!
  ) {
    v1UpdateTestCase(testCaseId: $testCaseId, input: $input) {
      testCaseId
      testPackId
    }
  }
`)

export const DELETE_TEST_CASE_MUTATION = graphql(`
  mutation V1DeleteTestCase($testCaseId: String!, $organizationId: String!) {
    v1DeleteTestCase(testCaseId: $testCaseId, organizationId: $organizationId)
  }
`)

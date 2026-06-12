import { graphql } from '@/api'

export const CREATE_TEST_RUN_RESULT_MUTATION = graphql(`
  mutation V1CreateTestRunResult($input: CreateTestRunResultInput!) {
    v1CreateTestRunResult(input: $input) {
      testRunResultId
      testRunId
      testCaseId
      status
      blockedReason
      responseStatus
      responseBody
      notes
      screenshotUrls
      executedAt
      executedBy
      executedByProfileImgUrl
    }
  }
`)

export const UPDATE_TEST_RUN_RESULT_MUTATION = graphql(`
  mutation V1UpdateTestRunResult($input: UpdateTestRunResultInput!) {
    v1UpdateTestRunResult(input: $input) {
      testRunResultId
      testRunId
      testCaseId
      status
      blockedReason
      responseStatus
      responseBody
      notes
      screenshotUrls
      executedAt
      executedBy
      executedByProfileImgUrl
    }
  }
`)

export const GET_TEST_RUN_RESULTS_QUERY = graphql(`
  query V1GetTestRunResults($testRunId: String!) {
    v1GetTestRunResults(testRunId: $testRunId) {
      testRunResultId
      testRunId
      testCaseId
      status
      blockedReason
      responseStatus
      responseBody
      notes
      screenshotUrls
      executedAt
      executedBy
      executedByProfileImgUrl
    }
  }
`)

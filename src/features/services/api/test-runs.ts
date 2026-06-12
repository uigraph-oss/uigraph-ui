import { graphql } from '@/api'

export const CREATE_TEST_RUN_MUTATION = graphql(`
  mutation V1CreateTestRun($input: CreateTestRunInput!) {
    v1CreateTestRun(input: $input) {
      testRunId
      testPackId
      serviceId
      environment
      releaseLabel
      startedAt
      completedAt
      status
      startedBy
      startedByProfileImgUrl
      executedBy
      executedByProfileImgUrl
      executedAt
      overallStatus
    }
  }
`)

export const GET_TEST_RUN_QUERY = graphql(`
  query V1GetTestRun($testRunId: String!) {
    v1GetTestRun(testRunId: $testRunId) {
      testRunId
      testPackId
      serviceId
      environment
      releaseLabel
      startedAt
      completedAt
      status
      startedBy
      startedByProfileImgUrl
      executedBy
      executedByProfileImgUrl
      executedAt
      overallStatus
    }
  }
`)

export const GET_TEST_RUNS_QUERY = graphql(`
  query V1GetTestRuns($serviceId: String, $testPackId: String) {
    v1GetTestRuns(serviceId: $serviceId, testPackId: $testPackId) {
      testRunId
      testPackId
      serviceId
      environment
      releaseLabel
      startedAt
      completedAt
      status
      startedBy
      startedByProfileImgUrl
      executedBy
      executedByProfileImgUrl
      executedAt
      overallStatus
    }
  }
`)

export const GET_TEST_RUNS_SUMMARY_QUERY = graphql(`
  query V1GetTestRunsSummary(
    $testPackId: String!
    $serviceId: String
    $environment: String
    $status: String
    $executedBy: String
    $fromDate: String
    $toDate: String
  ) {
    v1GetTestRunsSummary(
      testPackId: $testPackId
      serviceId: $serviceId
      environment: $environment
      status: $status
      executedBy: $executedBy
      fromDate: $fromDate
      toDate: $toDate
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
      startedByProfileImgUrl
      executedBy
      executedByProfileImgUrl
      executedAt
      overallStatus
      passedCount
      failedCount
      skippedCount
      blockedCount
    }
  }
`)

export const UPDATE_TEST_RUN_MUTATION = graphql(`
  mutation V1UpdateTestRun($testRunId: String!, $input: UpdateTestRunInput!) {
    v1UpdateTestRun(testRunId: $testRunId, input: $input) {
      testRunId
      testPackId
      serviceId
      environment
      releaseLabel
      startedAt
      completedAt
      status
      startedBy
      startedByProfileImgUrl
      executedBy
      executedByProfileImgUrl
      executedAt
      overallStatus
    }
  }
`)

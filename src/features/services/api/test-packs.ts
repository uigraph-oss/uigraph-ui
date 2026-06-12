import { graphql } from '@/api'

export const GET_TEST_PACKS_QUERY = graphql(`
  query V1GetTestPacks($serviceId: String!) {
    v1GetTestPacks(serviceId: $serviceId) {
      testPackId
      serviceId
      name
      type
      createdAt
      updatedAt
      deletedAt
      createdBy
      createdByProfileImgUrl
      updatedBy
      updatedByProfileImgUrl
      deletedBy
      deletedByProfileImgUrl
    }
  }
`)

export const CREATE_TEST_PACK_MUTATION = graphql(`
  mutation V1CreateTestPack($input: CreateTestPackInput!) {
    v1CreateTestPack(input: $input) {
      testPackId
      serviceId
      name
      type
      createdAt
      updatedAt
      deletedAt
      createdBy
      createdByProfileImgUrl
      updatedBy
      updatedByProfileImgUrl
      deletedBy
      deletedByProfileImgUrl
    }
  }
`)

export const UPDATE_TEST_PACK_MUTATION = graphql(`
  mutation V1UpdateTestPack(
    $testPackId: String!
    $input: UpdateTestPackInput!
  ) {
    v1UpdateTestPack(testPackId: $testPackId, input: $input) {
      testPackId
      serviceId
      name
      type
      createdAt
      updatedAt
      deletedAt
      createdBy
      createdByProfileImgUrl
      updatedBy
      updatedByProfileImgUrl
      deletedBy
      deletedByProfileImgUrl
    }
  }
`)

export const DELETE_TEST_PACK_MUTATION = graphql(`
  mutation V1DeleteTestPack($testPackId: String!, $organizationId: String!) {
    v1DeleteTestPack(testPackId: $testPackId, organizationId: $organizationId)
  }
`)

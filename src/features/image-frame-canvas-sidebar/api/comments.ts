import { graphql } from '@/api'

export const GET_COMMENT = graphql(`
  query V1GetComment($resourceId: String!) {
    v1GetComment(resourceId: $resourceId) {
      commentId
      organizationId
      resourceId
      parentCommentId
      text
      isActive
      createdBy
      updatedBy
      createdAt
      updatedAt
      deletedAt
      deletedBy
    }
  }
`)

export const CREATE_COMMENT = graphql(`
  mutation V1CreateComment($input: CreateCommentInput!) {
    v1CreateComment(input: $input) {
      commentId
      organizationId
      resourceId
      parentCommentId
      text
      isActive
      createdBy
      updatedBy
      createdAt
      updatedAt
      deletedAt
      deletedBy
    }
  }
`)

export const UPDATE_COMMENT = graphql(`
  mutation V1UpdateComment($commentId: String!, $input: UpdateCommentInput!) {
    v1UpdateComment(commentId: $commentId, input: $input) {
      commentId
      organizationId
      resourceId
      parentCommentId
      text
      isActive
      createdBy
      updatedBy
      createdAt
      updatedAt
      deletedAt
      deletedBy
    }
  }
`)

export const DELETE_COMMENT = graphql(`
  mutation V1DeleteComment($commentId: String!) {
    v1DeleteComment(commentId: $commentId) {
      commentId
      organizationId
      resourceId
      parentCommentId
      text
      isActive
      createdBy
      updatedBy
      createdAt
      updatedAt
      deletedAt
      deletedBy
    }
  }
`)

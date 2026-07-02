import { graphql } from '@/api'

export type UIComment = {
  commentId: string
  resourceId: string
  parentCommentId?: string | null
  text: string
  createdBy: string
  createdAt: string
  authorName?: string | null
  authorAvatarUrl?: string | null
}

export const COMMENTS = graphql(`
  query Comments($orgId: ID!, $resourceId: ID!) {
    comments(orgId: $orgId, resourceId: $resourceId) {
      id
      resourceId
      parentCommentId
      text
      createdBy
      createdAt
      createdByActor {
        id
        name
        avatarUrl
      }
    }
  }
`)

export const CREATE_COMMENT = graphql(`
  mutation CreateComment($orgId: ID!, $input: CreateCommentInput!) {
    createComment(orgId: $orgId, input: $input) {
      id
    }
  }
`)

export const UPDATE_COMMENT = graphql(`
  mutation UpdateComment($orgId: ID!, $id: ID!, $input: UpdateCommentInput!) {
    updateComment(orgId: $orgId, id: $id, input: $input) {
      id
    }
  }
`)

export const DELETE_COMMENT = graphql(`
  mutation DeleteComment($orgId: ID!, $id: ID!) {
    deleteComment(orgId: $orgId, id: $id)
  }
`)

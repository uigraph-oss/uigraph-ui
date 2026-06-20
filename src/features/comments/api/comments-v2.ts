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

export const COMMENTS_V2 = graphql(`
  query CommentsV2($orgId: ID!, $resourceId: ID!) {
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

export const CREATE_COMMENT_V2 = graphql(`
  mutation CreateCommentV2($orgId: ID!, $input: CreateCommentInput!) {
    createComment(orgId: $orgId, input: $input) {
      id
    }
  }
`)

export const UPDATE_COMMENT_V2 = graphql(`
  mutation UpdateCommentV2($orgId: ID!, $id: ID!, $input: UpdateCommentInput!) {
    updateComment(orgId: $orgId, id: $id, input: $input) {
      id
    }
  }
`)

export const DELETE_COMMENT_V2 = graphql(`
  mutation DeleteCommentV2($orgId: ID!, $id: ID!) {
    deleteComment(orgId: $orgId, id: $id)
  }
`)

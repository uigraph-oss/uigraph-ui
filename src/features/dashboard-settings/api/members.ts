import { graphql } from '@/api'

export type OrgMemberRow = {
  userId: string
  email: string
  name: string
  avatarUrl?: string | null
  role: string
  status: string
  teamId?: string | null
  teamName?: string | null
}

export const MEMBERS = graphql(`
  query Members($orgId: ID!) {
    members(orgId: $orgId) {
      userId
      email
      name
      avatarUrl
      role
      teamId
    }
  }
`)

export const ADD_MEMBER = graphql(`
  mutation AddMember($orgId: ID!, $input: AddMemberInput!) {
    addMember(orgId: $orgId, input: $input) {
      userId
    }
  }
`)

export const UPDATE_MEMBER = graphql(`
  mutation UpdateMember($orgId: ID!, $userId: ID!, $input: UpdateMemberInput!) {
    updateMember(orgId: $orgId, userId: $userId, input: $input) {
      userId
    }
  }
`)

export const REMOVE_MEMBER = graphql(`
  mutation RemoveMember($orgId: ID!, $userId: ID!) {
    removeMember(orgId: $orgId, userId: $userId)
  }
`)

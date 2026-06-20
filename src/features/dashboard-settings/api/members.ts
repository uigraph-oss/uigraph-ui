import { graphql } from '@/api'

export type OrgMemberRow = {
  userId: string
  email: string
  name: string
  role: string
  status: string
  teamId?: string | null
  teamName?: string | null
}

export const MEMBERS = graphql(`
  query MembersV2($orgId: ID!) {
    members(orgId: $orgId) {
      userId
      email
      name
      role
      teamId
      teamName
    }
  }
`)

export const ADD_MEMBER = graphql(`
  mutation AddMemberV2($orgId: ID!, $input: AddMemberInput!) {
    addMember(orgId: $orgId, input: $input) {
      userId
    }
  }
`)

export const UPDATE_MEMBER_ROLE = graphql(`
  mutation UpdateMemberRoleV2($orgId: ID!, $userId: ID!, $role: String!) {
    updateMemberRole(orgId: $orgId, userId: $userId, role: $role) {
      userId
    }
  }
`)

export const REMOVE_MEMBER = graphql(`
  mutation RemoveMemberV2($orgId: ID!, $userId: ID!) {
    removeMember(orgId: $orgId, userId: $userId)
  }
`)

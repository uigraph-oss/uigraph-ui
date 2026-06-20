import { graphql } from '@/api-v2'

export type OrgMemberRow = {
  userId: string
  email: string
  name: string
  role: string
  status: string
  teamId?: string | null
  teamName?: string | null
}

export const MEMBERS_V2 = graphql(`
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

export const ADD_MEMBER_V2 = graphql(`
  mutation AddMemberV2($orgId: ID!, $input: AddMemberInput!) {
    addMember(orgId: $orgId, input: $input) {
      userId
    }
  }
`)

export const UPDATE_MEMBER_ROLE_V2 = graphql(`
  mutation UpdateMemberRoleV2($orgId: ID!, $userId: ID!, $role: String!) {
    updateMemberRole(orgId: $orgId, userId: $userId, role: $role) {
      userId
    }
  }
`)

export const REMOVE_MEMBER_V2 = graphql(`
  mutation RemoveMemberV2($orgId: ID!, $userId: ID!) {
    removeMember(orgId: $orgId, userId: $userId)
  }
`)

export const CREATE_INVITATION_V2 = graphql(`
  mutation CreateInvitationV2($orgId: ID!, $input: CreateInvitationInput!) {
    createInvitation(orgId: $orgId, input: $input) {
      id
    }
  }
`)

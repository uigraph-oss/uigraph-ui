import { graphql } from '@/api'

export const GET_DIAGRAM_TEAMS = graphql(`
  query DiagramsGetTeams($organizationId: String!) {
    GetTeam(organizationId: $organizationId) {
      teamId
      teamName
      organizationId
    }
  }
`)

export const GET_DIAGRAM_ORG_USERS = graphql(`
  query DiagramsGetOrgUsers($organizationId: String!) {
    GetOrganizationUsers(organizationId: $organizationId) {
      userId
      email
      teamId
      teamName
    }
  }
`)

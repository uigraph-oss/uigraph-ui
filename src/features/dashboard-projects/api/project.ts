import { graphql } from '@/api'

export const GET_PROJECT = graphql(`
  query V1GetProject($organizationId: String!, $projectId: String) {
    v1GetProject(organizationId: $organizationId, projectId: $projectId) {
      projectId
      organizationId
      name
      description
      createdAt
      createdBy
      createdByProfileImgUrl
      updatedByProfileImgUrl
      teamId
      updatedAt
      updatedBy
      deletedAt
      deletedBy
      previewImgUrls
      status
      pageCount
      collaborators {
        name
        profileImgUrl
      }
    }
  }
`)

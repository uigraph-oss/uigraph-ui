import { graphql } from '@/api'

export const GET_PAGE = graphql(`
  query V1GetPage($pageId: String, $projectId: String) {
    v1GetPage(pageId: $pageId, projectId: $projectId) {
      organizationId
      projectId
      pageId
      pageGroupId

      pageName
      description
      status
      templateType
      screenShotFileID
      screenShotFileUrl
      createdAt
      createdBy
      updatedAt
      updatedBy
      deletedAt
      deletedBy

      collaborators {
        name
        profileImgUrl
      }
    }
  }
`)

import { graphql } from '@/api'

export const GET_PAGE_PROJECT_LINK = graphql(`
  query V1GetPageProjectLink($linkId: String, $pageId: String) {
    v1GetPageProjectLink(linkId: $linkId, pageId: $pageId) {
      linkId
      organizationId
      pageId
      projectId
      label
      locationX
      locationY
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

export const GET_PAGE_PAGE_LINK = graphql(`
  query V1GetPagePageLink($linkId: String, $pageId: String) {
    v1GetPagePageLink(linkId: $linkId, pageId: $pageId) {
      linkId
      organizationId
      pageId
      linkedPageId
      label
      locationX
      locationY
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

export const CREATE_PAGE_PROJECT_LINK = graphql(`
  mutation V1CreatePageProjectLink($input: CreatePageProjectLinkInput!) {
    v1CreatePageProjectLink(input: $input) {
      linkId
      organizationId
      pageId
      projectId
      label
      locationX
      locationY
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

export const UPDATE_PAGE_PROJECT_LINK = graphql(`
  mutation V1UpdatePageProjectLink(
    $linkId: String!
    $input: UpdatePageProjectLinkInput!
  ) {
    v1UpdatePageProjectLink(linkId: $linkId, input: $input) {
      linkId
      organizationId
      pageId
      projectId
      label
      locationX
      locationY
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

export const DELETE_PAGE_PAGE_LINK = graphql(`
  mutation V1DeletePagePageLink($linkId: String!) {
    v1DeletePagePageLink(linkId: $linkId) {
      linkId
      organizationId
      pageId
      linkedPageId
      label
      locationX
      locationY
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

export const UPDATE_PAGE_PAGE_LINK = graphql(`
  mutation V1UpdatePagePageLink(
    $linkId: String!
    $input: UpdatePagePageLinkInput!
  ) {
    v1UpdatePagePageLink(linkId: $linkId, input: $input) {
      linkId
      organizationId
      pageId
      linkedPageId
      label
      locationX
      locationY
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

export const CREATE_PAGE_PAGE_LINK = graphql(`
  mutation V1CreatePagePageLink($input: CreatePagePageLinkInput!) {
    v1CreatePagePageLink(input: $input) {
      linkId
      organizationId
      pageId
      linkedPageId
      label
      locationX
      locationY
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

export const DELETE_PAGE_PROJECT_LINK = graphql(`
  mutation V1DeletePageProjectLink($linkId: String!) {
    v1DeletePageProjectLink(linkId: $linkId) {
      linkId
      organizationId
      pageId
      projectId
      label
      locationX
      locationY
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

import { graphql } from '@/api'

export const GET_COMPONENTS = graphql(`
  query ComponentsV2($orgId: ID!) {
    components(orgId: $orgId) {
      components {
        componentId
        type
        name
        description
        tags
        category
        slug
        previewImageJpg
        isActive
        order
        componentFields {
          componentFieldId
          label
          type
          required
          readonly
          options
          order
        }
        createdAt
        updatedAt
      }
      customComponents {
        componentId
        type
        name
        description
        tags
        category
        slug
        previewImageJpg
        isActive
        order
        componentFields {
          componentFieldId
          label
          type
          required
          readonly
          options
          order
        }
        createdAt
        updatedAt
      }
    }
  }
`)

export const CREATE_CUSTOM_COMPONENT = graphql(`
  mutation CreateCustomComponentV2($orgId: ID!, $input: CustomComponentInput!) {
    createCustomComponent(orgId: $orgId, input: $input) {
      componentId
    }
  }
`)

export const UPDATE_CUSTOM_COMPONENT = graphql(`
  mutation UpdateCustomComponentV2(
    $orgId: ID!
    $id: ID!
    $input: CustomComponentInput!
  ) {
    updateCustomComponent(orgId: $orgId, id: $id, input: $input) {
      componentId
    }
  }
`)

export const DELETE_CUSTOM_COMPONENT = graphql(`
  mutation DeleteCustomComponentV2($orgId: ID!, $id: ID!) {
    deleteCustomComponent(orgId: $orgId, id: $id)
  }
`)

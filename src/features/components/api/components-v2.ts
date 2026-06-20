import { graphql } from '@/api-v2'

export const GET_COMPONENTS_V2 = graphql(`
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
      }
    }
  }
`)

export const CREATE_CUSTOM_COMPONENT_V2 = graphql(`
  mutation CreateCustomComponentV2($orgId: ID!, $input: CustomComponentInput!) {
    createCustomComponent(orgId: $orgId, input: $input) {
      componentId
    }
  }
`)

export const UPDATE_CUSTOM_COMPONENT_V2 = graphql(`
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

export const DELETE_CUSTOM_COMPONENT_V2 = graphql(`
  mutation DeleteCustomComponentV2($orgId: ID!, $id: ID!) {
    deleteCustomComponent(orgId: $orgId, id: $id)
  }
`)

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

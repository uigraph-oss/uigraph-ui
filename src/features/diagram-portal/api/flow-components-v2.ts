import { graphql } from '@/api-v2'

export const FLOW_DIAGRAM_COMPONENTS_V2 = graphql(`
  query FlowDiagramComponentsV2($orgId: ID!) {
    flowDiagramComponents(orgId: $orgId) {
      components {
        componentId
        type
        name
        description
        category
        tags
        slug
        previewImageJpg
        isActive
        order
        flowDiagramComponentFields {
          flowDiagramComponentFieldId
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
        category
        tags
        slug
        previewImageJpg
        isActive
        order
        organizationId
        flowDiagramComponentFields {
          flowDiagramComponentFieldId
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

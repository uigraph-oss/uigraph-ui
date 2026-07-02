import { graphql } from '@/api'

export const FLOW_DIAGRAM_COMPONENTS = graphql(`
  query FlowDiagramComponents($orgId: ID!) {
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

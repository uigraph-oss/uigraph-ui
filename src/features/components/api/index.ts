import { graphql } from '@/api'

export const CREATE_CUSTOM_COMPONENT = graphql(`
  mutation V1CreateCustomComponent($input: CreateCustomComponentInput!) {
    v1CreateCustomComponent(input: $input) {
      componentId
    }
  }
`)

export const UPDATE_CUSTOM_COMPONENT = graphql(`
  mutation V1UpdateCustomComponent(
    $componentId: String!
    $input: UpdateCustomComponentInput!
  ) {
    v1UpdateCustomComponent(componentId: $componentId, input: $input) {
      componentId
    }
  }
`)

export const DELETE_CUSTOM_COMPONENT = graphql(`
  mutation V1DeleteCustomComponent(
    $componentId: String!
    $organizationId: String!
  ) {
    v1DeleteCustomComponent(
      componentId: $componentId
      organizationId: $organizationId
    )
  }
`)

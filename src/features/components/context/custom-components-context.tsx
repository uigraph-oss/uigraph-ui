import { V2 } from '@/api'
import { clientV2 } from '@/api/client'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { createContext } from 'daily-code/react'
import {
  CREATE_CUSTOM_COMPONENT_V2,
  DELETE_CUSTOM_COMPONENT_V2,
  GET_COMPONENTS_V2,
  UPDATE_CUSTOM_COMPONENT_V2,
} from '../api/components-v2'
import { ComponentField } from '../components/configure-component/component-field-list'

function mapComponentFields(fields: ComponentField[]) {
  return fields.map((field, i) => ({
    componentFieldId: field.componentFieldId ?? undefined,
    label: field.label ?? '',
    type: field.type ?? '',
    required: field.required ?? false,
    readonly: field.isReadonly ?? undefined,
    options: arrayNonNullable(field.options),
    order: field.order ?? i + 1,
  }))
}

export const [CustomComponentsContextProvider, useCustomComponentsContext] =
  createContext(() => {
    const organizationId = useCurrentOrganization()?.id

    const { data, loading } = useQuery(GET_COMPONENTS_V2, {
      client: clientV2,
      variables: { orgId: organizationId! },
      skip: !organizationId,
    })

    const refetchQueries = [
      { query: GET_COMPONENTS_V2, variables: { orgId: organizationId } },
    ]

    const [createCustomComponent] = useMutation(CREATE_CUSTOM_COMPONENT_V2, {
      client: clientV2,
      awaitRefetchQueries: true,
      refetchQueries,
    })

    const [updateCustomComponent] = useMutation(UPDATE_CUSTOM_COMPONENT_V2, {
      client: clientV2,
      awaitRefetchQueries: true,
      refetchQueries,
    })

    const [deleteCustomComponent] = useMutation(DELETE_CUSTOM_COMPONENT_V2, {
      client: clientV2,
      awaitRefetchQueries: true,
      refetchQueries,
    })

    return {
      fetchingComponents: loading,
      loadingComponents: loading && !data?.components?.customComponents?.length,
      nativeComponents: arrayNonNullable(data?.components?.components),
      customComponents: arrayNonNullable(data?.components?.customComponents),

      createCustomComponent(
        name: string,
        category: string,
        description: string,
        fields: ComponentField[]
      ) {
        return createCustomComponent({
          variables: {
            orgId: organizationId!,
            input: {
              name,
              category,
              description,
              componentFields: mapComponentFields(fields),
            },
          },
        })
      },

      updateCustomComponent(
        component: V2.Component,
        name: string,
        category: string,
        description: string,
        fields: ComponentField[]
      ) {
        return updateCustomComponent({
          variables: {
            orgId: organizationId!,
            id: component.componentId!,
            input: {
              name,
              category,
              description,
              isActive: component.isActive ?? true,
              componentFields: mapComponentFields(fields),
            },
          },
        })
      },

      deleteCustomComponent(componentId: string) {
        return deleteCustomComponent({
          variables: { orgId: organizationId!, id: componentId },
        })
      },
    }
  })

import { GT } from '@/api'
import { useOrganizationContext } from '@/contexts'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { createContext } from 'daily-code/react'
import {
  CREATE_CUSTOM_COMPONENT,
  DELETE_CUSTOM_COMPONENT,
  GET_COMPONENTS,
  UPDATE_CUSTOM_COMPONENT,
} from '../api'

export const [CustomComponentsContextProvider, useCustomComponentsContext] =
  createContext(() => {
    const { organizationId } = useOrganizationContext()

    const { data, loading } = useQuery(GET_COMPONENTS, {
      variables: { organizationId },
    })

    const [createCustomComponent] = useMutation(CREATE_CUSTOM_COMPONENT, {
      awaitRefetchQueries: true,
      refetchQueries: [
        {
          query: GET_COMPONENTS,
          variables: { organizationId },
        },
      ],
    })

    const [updateCustomComponent] = useMutation(UPDATE_CUSTOM_COMPONENT, {
      awaitRefetchQueries: true,
      refetchQueries: [
        {
          query: GET_COMPONENTS,
          variables: { organizationId },
        },
      ],
    })

    const [deleteCustomComponent] = useMutation(DELETE_CUSTOM_COMPONENT, {
      awaitRefetchQueries: true,
      refetchQueries: [
        {
          query: GET_COMPONENTS,
          variables: { organizationId },
        },
      ],
    })

    return {
      fetchingComponents: loading,
      loadingComponents:
        loading && !data?.v1GetComponents?.customComponents?.length,
      nativeComponents: arrayNonNullable(data?.v1GetComponents?.components),
      customComponents: arrayNonNullable(
        data?.v1GetComponents?.customComponents
      ),

      createCustomComponent(
        name: string,
        category: string,
        description: string,
        fields: GT.ComponentField[]
      ) {
        return createCustomComponent({
          variables: {
            input: {
              organizationId,

              name,
              category,
              description,

              type: 'custom',
              previewImageJpg: 'https://placehold.co/64x64',

              componentFields: fields.map((field) => ({
                ...field,

                componentFieldId: field.componentFieldId!,
                required: field.required ?? false,

                order: field.order!,
                label: field.label!,
                type: field.type!,
              })),
            },
          },
        })
      },

      updateCustomComponent(
        component: GT.CustomComponent,
        name: string,
        category: string,
        description: string,
        fields: GT.ComponentField[]
      ) {
        return updateCustomComponent({
          variables: {
            componentId: component.componentId!,
            input: {
              type: component.type ?? 'custom',
              status: component.status ?? 'active',

              name,
              category,
              description,
              organizationId,

              componentFields: fields.map((field, i) => ({
                ...field,

                componentFieldId: field.componentFieldId ?? crypto.randomUUID(),
                required: field.required ?? false,
                order: field.order ?? i + 1,

                label: field.label ?? '',
                type: field.type ?? '',
              })),
            },
          },
        })
      },

      deleteCustomComponent(componentId: string) {
        return deleteCustomComponent({
          variables: { componentId, organizationId },
        })
      },
    }
  })

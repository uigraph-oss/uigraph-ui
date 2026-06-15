import { GT } from '@/api'
import { V2 } from '@/api-v2'
import { clientV2 } from '@/api-v2/client'
import { useOrganizationContext } from '@/contexts'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { createContext } from 'daily-code/react'
import {
  CREATE_CUSTOM_COMPONENT,
  DELETE_CUSTOM_COMPONENT,
  UPDATE_CUSTOM_COMPONENT,
} from '../api'
import { GET_COMPONENTS_V2 } from '../api/components-v2'

export const [CustomComponentsContextProvider, useCustomComponentsContext] =
  createContext(() => {
    const { organizationId } = useOrganizationContext()

    const { data, loading } = useQuery(GET_COMPONENTS_V2, {
      client: clientV2,
      variables: { orgId: organizationId! },
      skip: !organizationId,
    })

    const [createCustomComponent] = useMutation(CREATE_CUSTOM_COMPONENT, {
      awaitRefetchQueries: true,
      refetchQueries: [
        {
          query: GET_COMPONENTS_V2,
          variables: { orgId: organizationId },
        },
      ],
    })

    const [updateCustomComponent] = useMutation(UPDATE_CUSTOM_COMPONENT, {
      awaitRefetchQueries: true,
      refetchQueries: [
        {
          query: GET_COMPONENTS_V2,
          variables: { orgId: organizationId },
        },
      ],
    })

    const [deleteCustomComponent] = useMutation(DELETE_CUSTOM_COMPONENT, {
      awaitRefetchQueries: true,
      refetchQueries: [
        {
          query: GET_COMPONENTS_V2,
          variables: { orgId: organizationId },
        },
      ],
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
        component: V2.Component,
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

              status: component.isActive === false ? 'inactive' : 'active',
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

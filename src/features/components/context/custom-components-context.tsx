import { GT } from '@/api'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useScopedStorage } from '@/hooks/use-scoped-storage'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { createContext } from 'daily-code/react'
import { useEffect, useMemo, useState } from 'react'
import {
  CREATE_CUSTOM_COMPONENT,
  DELETE_CUSTOM_COMPONENT,
  GET_COMPONENTS,
  UPDATE_CUSTOM_COMPONENT,
} from '../api/components'
import { ComponentField } from '../components/configure-component/component-field-list'

const PAGE_SIZE = 24

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

    const { data, loading } = useQuery(GET_COMPONENTS, {
      variables: { orgId: organizationId! },
      skip: !organizationId,
    })

    const [sortBy, setSortBy] = useScopedStorage('catalog:sort', 'name')
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebouncedValue(search)
    const [page, setPage] = useState(0)

    useEffect(() => {
      setPage(0)
    }, [sortBy, debouncedSearch])

    const refetchQueries = [
      { query: GET_COMPONENTS, variables: { orgId: organizationId } },
    ]

    const [createCustomComponent] = useMutation(CREATE_CUSTOM_COMPONENT, {
      awaitRefetchQueries: true,
      refetchQueries,
    })

    const [updateCustomComponent] = useMutation(UPDATE_CUSTOM_COMPONENT, {
      awaitRefetchQueries: true,
      refetchQueries,
    })

    const [deleteCustomComponent] = useMutation(DELETE_CUSTOM_COMPONENT, {
      awaitRefetchQueries: true,
      refetchQueries,
    })

    const allCustomComponents = arrayNonNullable(
      data?.components?.customComponents
    )

    const filteredComponents = useMemo(() => {
      let result = allCustomComponents
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase()
        result = result.filter((c) => c.name?.toLowerCase().includes(q))
      }
      if (sortBy === 'name') {
        result = [...result].sort((a, b) => a.name!.localeCompare(b.name!))
      } else if (sortBy === 'created') {
        result = [...result].sort(
          (a, b) =>
            new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        )
      }
      return result
    }, [allCustomComponents, debouncedSearch, sortBy])

    const pagedComponents = filteredComponents.slice(
      page * PAGE_SIZE,
      page * PAGE_SIZE + PAGE_SIZE
    )

    return {
      fetchingComponents: loading,
      loadingComponents: loading && !data?.components?.customComponents?.length,
      nativeComponents: arrayNonNullable(data?.components?.components),
      customComponents: allCustomComponents,

      filteredComponents: pagedComponents,
      totalCount: filteredComponents.length,
      pageSize: PAGE_SIZE,
      page,
      setPage,
      sortBy,
      setSortBy,
      search,
      setSearch,

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
        component: GT.Component,
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

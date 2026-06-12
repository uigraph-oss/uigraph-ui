import { GT } from '@/api'
import { useOrganizationContext } from '@/contexts'
import { GET_COMPONENTS } from '@/features/components/api'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useMemo } from 'react'
import { ComponentsGroup } from '../types'

export function useComponents() {
  const { organizationId } = useOrganizationContext()
  const { data, loading } = useQuery(GET_COMPONENTS, {
    variables: { organizationId },
    fetchPolicy: 'cache-first',
  })

  const focalPointGroups: ComponentsGroup[] = useMemo(() => {
    const nativeComponents = arrayNonNullable(data?.v1GetComponents?.components)
    const customComponents = arrayNonNullable(
      data?.v1GetComponents?.customComponents
    )

    const components = [...nativeComponents, ...customComponents]

    const groupMap: Record<string, ComponentsGroup> = {}

    for (const comp of components) {
      const groupName = comp.category?.trim() || 'Other'
      if (!groupMap[groupName]) {
        groupMap[groupName] = { name: groupName, components: [] }
      }

      // @ts-expect-error Ignore
      groupMap[groupName].components.push(transformComponentToSectionItem(comp))
    }

    return Object.values(groupMap)
  }, [data])

  return {
    focalPointGroups,
    loading: loading && !data?.v1GetComponents?.components,
  }
}

function transformComponentToSectionItem(input: GT.Component): GT.Component {
  return {
    ...input,
    componentFields: arrayNonNullable(input.componentFields).map((field) => {
      return {
        ...field,
        options: arrayNonNullable(field.options),
      }
    }),
  }
}

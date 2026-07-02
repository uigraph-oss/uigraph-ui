import { GT } from '@/api'
import { GET_COMPONENTS } from '@/features/components/api/components'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useMemo } from 'react'
import { ComponentsGroup } from '../types'

export function useComponents() {
  const organizationId = useCurrentOrganization()?.id
  const { data, loading } = useQuery(GET_COMPONENTS, {
    variables: { orgId: organizationId! },
    skip: !organizationId,
    fetchPolicy: 'cache-first',
  })

  const focalPointGroups: ComponentsGroup[] = useMemo(() => {
    const nativeComponents = arrayNonNullable(data?.components?.components)
    const customComponents = arrayNonNullable(
      data?.components?.customComponents
    )

    const components = [...nativeComponents, ...customComponents]

    const groupMap: Record<string, ComponentsGroup> = {}

    for (const comp of components) {
      const groupName = comp.category?.trim() || 'Other'
      if (!groupMap[groupName]) {
        groupMap[groupName] = { name: groupName, components: [] }
      }

      groupMap[groupName].components.push(transformComponentToSectionItem(comp))
    }

    return Object.values(groupMap)
  }, [data])

  return {
    focalPointGroups,
    loading: loading && !data?.components?.components,
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

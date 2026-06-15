import { V2 } from '@/api-v2'
import { clientV2 } from '@/api-v2/client'
import { useOrganizationContext } from '@/contexts'
import { GET_COMPONENTS_V2 } from '@/features/components/api/components-v2'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useMemo } from 'react'
import { ComponentsGroup } from '../types'

export function useComponents() {
  const { organizationId } = useOrganizationContext()
  const { data, loading } = useQuery(GET_COMPONENTS_V2, {
    client: clientV2,
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

function transformComponentToSectionItem(input: V2.Component): V2.Component {
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

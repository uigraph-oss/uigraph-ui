import { GT } from '@/api'
import { useOrganizationContext } from '@/contexts'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useMemo } from 'react'
import { GET_FLOW_DIAGRAM_COMPONENTS } from '../api'

export type FlowDiagramComponentsGroup = {
  name: string
  components: GT.FlowDiagramComponent[]
}

export function useFlowDiagramComponents() {
  const { organizationId } = useOrganizationContext()
  const { data, loading } = useQuery(GET_FLOW_DIAGRAM_COMPONENTS, {
    variables: { organizationId },
    fetchPolicy: 'cache-first',
  })

  const flowDiagramGroups: FlowDiagramComponentsGroup[] = useMemo(() => {
    const nativeComponents = arrayNonNullable(
      data?.v1GetFlowDiagramComponents?.components
    )
    const customComponents = arrayNonNullable(
      data?.v1GetFlowDiagramComponents?.customComponents
    )

    const components = [...nativeComponents, ...customComponents]

    const groupMap: Record<string, FlowDiagramComponentsGroup> = {}

    for (const comp of components) {
      const groupName = comp.category?.trim() || 'Other'
      if (!groupMap[groupName]) {
        groupMap[groupName] = { name: groupName, components: [] }
      }
      groupMap[groupName].components.push(
        transformFlowDiagramComponentToSectionItem(comp)
      )
    }

    return Object.values(groupMap)
  }, [data])

  return {
    flowDiagramGroups,
    loading: loading && !data?.v1GetFlowDiagramComponents?.components,
  }
}

function transformFlowDiagramComponentToSectionItem(
  input: GT.FlowDiagramComponent
): GT.FlowDiagramComponent {
  return {
    ...input,
    flowDiagramComponentFields: arrayNonNullable(
      input.flowDiagramComponentFields
    ).map((field) => {
      return {
        ...field,
        options: arrayNonNullable(field.options),
      }
    }),
  }
}

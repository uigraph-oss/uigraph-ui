import { GT } from '@/api'
import { clientV2 } from '@/api-v2/client'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useMemo } from 'react'
import { FLOW_DIAGRAM_COMPONENTS_V2 } from '../api/flow-components-v2'

export type FlowDiagramComponentsGroup = {
  name: string
  components: GT.FlowDiagramComponent[]
}

export function useFlowDiagramComponents() {
  const organizationId = useCurrentOrganization()?.id
  const { data, loading } = useQuery(FLOW_DIAGRAM_COMPONENTS_V2, {
    client: clientV2,
    variables: { orgId: organizationId! },
    skip: !organizationId,
    fetchPolicy: 'cache-first',
  })

  const flowDiagramGroups: FlowDiagramComponentsGroup[] = useMemo(() => {
    const nativeComponents = arrayNonNullable(
      data?.flowDiagramComponents?.components
    )
    const customComponents = arrayNonNullable(
      data?.flowDiagramComponents?.customComponents
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
    loading: loading && !data?.flowDiagramComponents?.components,
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

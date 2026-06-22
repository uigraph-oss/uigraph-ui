import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useMemo } from 'react'
import { FLOW_DIAGRAM_COMPONENTS } from '../api/flow-components'

export type FlowDiagramComponentField = {
  data?: (unknown | null)[] | null
  flowDiagramComponentFieldId?: string | null
  label?: string | null
  options?: (string | null)[] | null
  order?: number | null
  readonly?: boolean | null
  required?: boolean | null
  type?: string | null
}

export type FlowDiagramComponent = {
  category?: string | null
  componentId?: string | null
  createdAt?: string | null
  description?: string | null
  flowDiagramComponentFields?: (FlowDiagramComponentField | null)[] | null
  isActive?: boolean | null
  name?: string | null
  order?: number | null
  previewImageJpg?: string | null
  slug?: string | null
  tags?: (string | null)[] | null
  type?: string | null
  updatedAt?: string | null
}

export type FlowDiagramComponentsGroup = {
  name: string
  components: FlowDiagramComponent[]
}

export function useFlowDiagramComponents() {
  const organizationId = useCurrentOrganization()?.id
  const { data, loading } = useQuery(FLOW_DIAGRAM_COMPONENTS, {
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
  input: FlowDiagramComponent
): FlowDiagramComponent {
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

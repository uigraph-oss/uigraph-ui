import {
  COMPONENT_API_CONTRACT_ID,
  COMPONENT_FLOW_DIAGRAM_ID,
  COMPONENT_SUPPORT_KB_ID,
  COMPONENT_TEST_SUITE_ID,
} from '@/constants/component-meta'
import { z } from 'zod'

export const apiContractSchema = z.object({
  serviceId: z.string().min(1),
  apiGroupId: z.string().min(1),
  apiEndpointId: z.string().min(1),
})

export const testSuiteSchema = z.object({
  serviceId: z.string().min(1),
  testPackId: z.string().min(1),
})

export const serviceDocSchema = z.object({
  serviceId: z.string().min(1),
  serviceDocId: z.string().min(1),
})

export const flowDiagramSchema = z.object({
  diagramId: z.string().min(1),
})

export const componentLinkSchemas: Record<string, z.ZodType> = {
  [COMPONENT_API_CONTRACT_ID]: apiContractSchema,
  [COMPONENT_TEST_SUITE_ID]: testSuiteSchema,
  [COMPONENT_SUPPORT_KB_ID]: serviceDocSchema,
  [COMPONENT_FLOW_DIAGRAM_ID]: flowDiagramSchema,
}

export type ApiContractLink = z.infer<typeof apiContractSchema>
export type TestSuiteLink = z.infer<typeof testSuiteSchema>
export type ServiceDocLink = z.infer<typeof serviceDocSchema>
export type FlowDiagramLink = z.infer<typeof flowDiagramSchema>

export type ComponentLink =
  | ApiContractLink
  | TestSuiteLink
  | ServiceDocLink
  | FlowDiagramLink

export function componentLinkRef(
  link: ComponentLink | null | undefined
): { key: string; value: string } | null {
  if (!link) return null
  if ('apiEndpointId' in link)
    return { key: 'apiEndpointId', value: link.apiEndpointId }
  if ('testPackId' in link) return { key: 'testPackId', value: link.testPackId }
  if ('serviceDocId' in link)
    return { key: 'serviceDocId', value: link.serviceDocId }
  if ('diagramId' in link) return { key: 'diagramId', value: link.diagramId }
  return null
}

export function parseComponentLink(
  componentId: string | null | undefined,
  value: unknown
): ComponentLink | null {
  if (!componentId || value == null) return null
  const schema = componentLinkSchemas[componentId]
  if (!schema) return null
  const result = schema.safeParse(value)
  if (result.success) return result.data as ComponentLink
  return null
}

import { ComponentInputType } from '@/features/component-meta'
import { ReactNode } from 'react'
import { RiFlowChart } from 'react-icons/ri'
import {
  ComponentClockIcon,
  ComponentCodeIcon,
  ComponentDatabaseIcon,
  ComponentFileIcon,
  ComponentGlobeIcon,
  ComponentMessageIcon,
  ComponentOpenLinkIcon,
  ComponentServerIcon,
  ComponentTextIcon,
  ComponentZapIcon,
} from '../components/icons/node-types'

type FlowComponentNodeCore = {
  tags: string[]
  icon: ReactNode
}

/* [
  {
      "name": "Service",
      "componentId": "flow_diagram_component_service"
  },
  {
      "name": "Database",
      "componentId": "flow_diagram_component_database"
  },
  {
      "name": "Message Queue",
      "componentId": "flow_diagram_component_message-queue"
  },
  {
      "name": "Function / Lambda",
      "componentId": "flow_diagram_component_function-lambda"
  },
  {
      "name": "Job / Scheduler",
      "componentId": "flow_diagram_component_job-scheduler"
  },
  {
      "name": "Code Block",
      "componentId": "flow_diagram_component_code-block"
  },
  {
      "name": "File / Note",
      "componentId": "flow_diagram_component_file-note"
  }
] */

const baseComponents: FlowComponentNodeCore[] = [
  {
    tags: ['microservice', 'service'],
    icon: <ComponentServerIcon />,
  },
  {
    tags: ['api-endpoint', 'api'],
    icon: <ComponentGlobeIcon />,
  },
  {
    tags: ['database', 'db'],
    icon: <ComponentDatabaseIcon />,
  },
  {
    tags: [
      'message-queue',
      'message',
      'Message Queue',
      'flow_diagram_component_message-queue',
    ],
    icon: <ComponentMessageIcon />,
  },
  {
    tags: ['external-service'],
    icon: <ComponentOpenLinkIcon />,
  },
  {
    tags: ['function-lambda', 'function', 'lambda', 'Function / Lambda'],
    icon: <ComponentZapIcon />,
  },
  {
    tags: ['job-scheduler', 'job', 'scheduler', 'Job / Scheduler'],
    icon: <ComponentClockIcon />,
  },
  {
    tags: ['code-block', 'code', 'Code Block'],
    icon: <ComponentCodeIcon />,
  },
  {
    tags: ['label', 'Label'],
    icon: <ComponentTextIcon />,
  },
  {
    tags: ['file-note', 'file', 'note', 'File / Note'],
    icon: <ComponentFileIcon />,
  },
]

export const nodeVisibleInputFields: ComponentInputType[] = [
  ComponentInputType.TextInput,
  ComponentInputType.URLInput,
  ComponentInputType.NumberInput,
  ComponentInputType.DropdownSelect,
  ComponentInputType.BooleanToggle,
]

export function getFlowDiagramComponentIcon(
  input: unknown,
  fallbackIcon?: ReactNode
): ReactNode {
  const component = baseComponents.find((component) =>
    component.tags.some(
      (tag) => tag.toLowerCase().trim() === String(input).toLowerCase().trim()
    )
  )

  return (
    component?.icon ?? fallbackIcon ?? <RiFlowChart className="text-gray-400" />
  )
}

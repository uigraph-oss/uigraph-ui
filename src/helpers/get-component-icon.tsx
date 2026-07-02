import {
  AccessibilityIcon,
  APIContactIcon,
  BusinessLogicIcon,
  ComponentLinkIcon,
  DefaultIcon,
  FeatureFlagConfigIcon,
  FlowDiagramIcon,
  OpenIssuesIcon,
  PerformanceIcon,
  PerformanceSLAIcon,
  SecurityIcon,
  SupportKBIcon,
  TestingIcon,
} from '@/assets/svgs/component-icons'
import { ReactNode } from 'react'

type PointComponentIcon = {
  category?: string | undefined | null
  component?: string | undefined | null
  fallbackIcon?: ReactNode
}

export function getFocalPointComponentIcon({
  component,
  category,
  fallbackIcon,
}: PointComponentIcon): ReactNode {
  const componentIcon = getIcon(component ?? '')
  if (componentIcon) return componentIcon

  const categoryIcon = getIcon(category ?? '')
  if (categoryIcon) return categoryIcon

  return fallbackIcon ?? <DefaultIcon />
}

function getIcon(input: string) {
  switch (input) {
    case 'component_backend-flow-diagram':
    case 'Architecture & Flows':
      return <FlowDiagramIcon />

    case 'component_api-contract':
    case 'API & Contracts':
      return <APIContactIcon />

    case 'component_performance-sla':
    case 'Performance & Reliability':
      return <PerformanceSLAIcon />

    case 'component_test-case-suite':
    case 'Quality & Testing':
      return <TestingIcon />

    case 'component_business-rule-logic':
    case 'Business Logic':
      return <BusinessLogicIcon />

    case 'component_feature-flag-config':
    case 'Release & Feature Management':
      return <FeatureFlagConfigIcon />

    case 'component_support-kb-troubleshooting':
    case 'Support & Operations':
      return <SupportKBIcon />

    case 'component_analytics-telemetry-event':
    case 'Analytics & Telemetry':
      return <PerformanceIcon />

    case 'component_security-and-pii':
    case 'Security & Compliance':
      return <SecurityIcon />

    case 'component_ownership-on-call':
    case 'Ownership & On-call':
      return <AccessibilityIcon />

    case 'component_design-spec-link':
    case 'Design & UX':
      return <ComponentLinkIcon />

    case 'component_open-issues-bugs':
    case 'Issue Tracking':
      return <OpenIssuesIcon />
  }
}

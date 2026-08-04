const mockOnlyServiceTabIds = new Set(['operations', 'people'])

const allServiceTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'apis', label: 'API & Behavior' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'data', label: 'Data' },
  { id: 'dependencies', label: 'Dependencies' },
  { id: 'tests', label: 'Tests' },
  { id: 'costs', label: 'Costs & Infra' },
  { id: 'docs', label: 'Docs' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'operations', label: 'Operations' },
  { id: 'people', label: 'People' },
] as const

export const serviceTabs = allServiceTabs.filter(
  (tab) => !mockOnlyServiceTabIds.has(tab.id)
)

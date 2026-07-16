const mockOnlyServiceTabIds = new Set(['operations', 'people'])

const allServiceTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'apis', label: 'API & Behavior' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'data', label: 'Data' },
  { id: 'dependencies', label: 'Dependencies' },
  { id: 'docs', label: 'Docs' },
  { id: 'tests', label: 'Tests' },
  { id: 'operations', label: 'Operations' },
  { id: 'people', label: 'People' },
] as const

export const serviceTabs = allServiceTabs.filter(
  (tab) => !mockOnlyServiceTabIds.has(tab.id)
)

import type { PageProfile } from '@/types'

export const PAGE_PROFILES: PageProfile[] = [
  {
    id: 'default',
    name: 'Default (Full View)',
    description: 'Shows all available embedded sections',
    tags: ['Business Logic', 'Backend Diagrams', 'Api Contracts', '+5 more'],
    icon: '🖥️',
    color: 'blue',
  },
  {
    id: 'product',
    name: 'Product Management Focus',
    description: 'Shows user flows, feature flags, Business Logic',
    tags: ['Business Logic', 'Feature Flags', 'Notes', '+2 more'],
    icon: '📊',
    color: 'green',
  },
  {
    id: 'backend',
    name: 'Backend Engineering Focus',
    description: 'Shows backend flows, APIs, and system architecture',
    tags: ['Backend Diagrams', 'Api Contracts', 'Linked Components', '+2 more'],
    icon: '⚙️',
    color: 'orange',
  },
  {
    id: 'frontend',
    name: 'Frontend Engineering Focus',
    description: 'Shows UI components, interactions, and client-side logic',
    tags: ['UI Components', 'Interactions', 'Client Logic', '+2 more'],
    icon: '🎨',
    color: 'purple',
  },
  {
    id: 'qa',
    name: 'QA/Testing Focus',
    description: 'Shows test cases, edge cases, and quality scenarios',
    tags: ['Test Cases', 'Edge Cases', 'Quality Checks', '+2 more'],
    icon: '🔍',
    color: 'red',
  },
  {
    id: 'support',
    name: 'Support/SRE Focus',
    description: 'Shows error states, monitoring, and support workflows',
    tags: ['Error States', 'Monitoring', 'Support Flows', '+2 more'],
    icon: '📞',
    color: 'yellow',
  },
]

export const FILTER_OPTIONS = {
  TYPE: [
    { value: 'web', label: 'Web' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'desktop', label: 'Desktop' },
  ],
  STATUS: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ],
  SORT: [
    { value: 'date', label: 'Date' },
    { value: 'name', label: 'Name' },
    { value: 'status', label: 'Status' },
  ],
}

export const PAGE_FILTER_OPTIONS = {
  STATUS: [
    { value: 'draft', label: 'Draft' },
    { value: 'review', label: 'Review' },
    { value: 'published', label: 'Published' },
  ],
  SORT: [
    { value: 'date', label: 'Date' },
    { value: 'name', label: 'Name' },
    { value: 'status', label: 'Status' },
    { value: 'version', label: 'Version' },
  ],
}

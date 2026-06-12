'use client'

import { BookOpenIcon, ExternalLinkIcon, FileTextIcon } from '@/assets/svgs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  mockNativeDocs,
  mockRunbooks,
} from '@/features/services/constants/mock-data'
interface ServiceRunbooksProps {
  serviceId: string
}

export function ServiceRunbooks({}: ServiceRunbooksProps) {
  function getStatusColor(status: string) {
    switch (status) {
      case 'current':
        return 'bg-green-100 text-green-800'
      case 'outdated':
        return 'bg-yellow-100 text-yellow-800'
      case 'deprecated':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  function getTypeColor(type: string) {
    switch (type) {
      case 'runbook':
        return 'bg-blue-100 text-blue-800'
      case 'playbook':
        return 'bg-purple-100 text-purple-800'
      case 'native':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  function getTypeIcon(type: string) {
    switch (type) {
      case 'runbook':
        return <BookOpenIcon className="h-4 w-4" />
      case 'playbook':
        return <BookOpenIcon className="h-4 w-4" />
      case 'native':
        return <FileTextIcon className="h-4 w-4" />
      default:
        return <FileTextIcon className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* External Runbooks & Playbooks */}
      <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
        <div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
          <h3 className="leading-none font-semibold">Runbooks & Playbooks</h3>
          <p className="text-muted-foreground text-sm">
            External documentation and procedures for this service
          </p>
        </div>
        <div className="px-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {mockRunbooks.map((runbook) => (
              <div
                key={runbook.id}
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      {getTypeIcon(runbook.type)}
                      <h3 className="font-medium text-gray-900">
                        {runbook.title}
                      </h3>
                    </div>
                    <p className="mb-2 text-sm text-gray-600">
                      {runbook.description}
                    </p>
                    <div className="mb-2 flex items-center gap-2">
                      <Badge className={getTypeColor(runbook.type)}>
                        {runbook.type}
                      </Badge>
                      <Badge className={getStatusColor(runbook.status)}>
                        {runbook.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      Last reviewed:{' '}
                      {new Date(runbook.lastReviewed).toLocaleDateString()} by{' '}
                      {runbook.reviewer}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ExternalLinkIcon className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {runbook.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="outline" size="sm">
                    Open
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Native Documentation */}
      <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
        <div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
          <h3 className="leading-none font-semibold">Native Documentation</h3>
          <p className="text-muted-foreground text-sm">
            Documentation stored within the service repository
          </p>
        </div>
        <div className="px-6">
          <div className="space-y-4">
            {mockNativeDocs.map((doc) => (
              <div
                key={doc.id}
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      {getTypeIcon(doc.type)}
                      <h3 className="font-medium text-gray-900">{doc.title}</h3>
                    </div>
                    <p className="mb-2 text-sm text-gray-600">
                      {doc.description}
                    </p>
                    <div className="text-xs text-gray-500">
                      Last updated:{' '}
                      {new Date(doc.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
                <div className="rounded-md bg-gray-50 p-3">
                  <pre className="line-clamp-3 text-xs text-gray-700">
                    {doc.content}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Documentation Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
          <div className="p-4 px-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {mockRunbooks.length + mockNativeDocs.length}
              </div>
              <div className="text-sm text-gray-600">Total Docs</div>
            </div>
          </div>
        </div>
        <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
          <div className="p-4 px-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {mockRunbooks.filter((r) => r.type === 'runbook').length}
              </div>
              <div className="text-sm text-gray-600">Runbooks</div>
            </div>
          </div>
        </div>
        <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
          <div className="p-4 px-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {mockRunbooks.filter((r) => r.type === 'playbook').length}
              </div>
              <div className="text-sm text-gray-600">Playbooks</div>
            </div>
          </div>
        </div>
        <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
          <div className="p-4 px-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockRunbooks.filter((r) => r.status === 'current').length}
              </div>
              <div className="text-sm text-gray-600">Current</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

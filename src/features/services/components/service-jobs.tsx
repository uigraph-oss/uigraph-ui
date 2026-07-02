'use client'

import { ClockIcon, ExternalLinkIcon, PlayIcon } from '@/assets/svgs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { mockJobs } from '@/features/services/constants/mock-data'

interface ServiceJobsProps {
  serviceId: string
}

export function ServiceJobs({}: ServiceJobsProps) {
  function getTypeColor(type: string) {
    switch (type) {
      case 'cron':
        return 'bg-blue-100 text-blue-800'
      case 'event':
        return 'bg-green-100 text-green-800'
      case 'queue':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-[#1E2533] text-[#F4F7FC]'
    }
  }

  function getTypeIcon(type: string) {
    switch (type) {
      case 'cron':
        return <ClockIcon className="h-4 w-4" />
      case 'event':
        return <PlayIcon className="h-4 w-4" />
      case 'queue':
        return <PlayIcon className="h-4 w-4" />
      default:
        return <PlayIcon className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
        <div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="leading-none font-semibold">
                Jobs & Async Operations
              </h3>
              <p className="text-muted-foreground text-sm">
                Background jobs and asynchronous operations for this service
              </p>
            </div>
            <Button size="sm" className="flex items-center gap-2">
              <PlayIcon className="h-4 w-4" />
              Add Job
            </Button>
          </div>
        </div>
        <div className="p-0 px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Source File</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{job.name}</div>
                      {job.linkedFlowNode && (
                        <div className="text-sm text-[#828DA3]">
                          Linked to: {job.linkedFlowNode}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(job.type)}
                      <Badge className={getTypeColor(job.type)}>
                        {job.type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-[#1E2533] px-2 py-1 text-sm">
                      {job.trigger}
                    </code>
                  </TableCell>
                  <TableCell>
                    {job.sourceFile ? (
                      <code className="text-sm text-[#828DA3]">
                        {job.sourceFile}
                      </code>
                    ) : (
                      <span className="text-sm text-[#586378]">
                        No source file
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-[#828DA3]">
                    {new Date(job.lastUpdated).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {job.linkedFlowNode && (
                        <Button variant="ghost" size="sm" title="View Flow">
                          <ExternalLinkIcon className="h-4 w-4" />
                        </Button>
                      )}
                      {job.sourceFile && (
                        <Button variant="ghost" size="sm" title="View Source">
                          <ExternalLinkIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Job Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
          <div className="p-4 px-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#F4F7FC]">
                {mockJobs.length}
              </div>
              <div className="text-sm text-[#828DA3]">Total Jobs</div>
            </div>
          </div>
        </div>
        <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
          <div className="p-4 px-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {mockJobs.filter((j) => j.type === 'cron').length}
              </div>
              <div className="text-sm text-[#828DA3]">Cron Jobs</div>
            </div>
          </div>
        </div>
        <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
          <div className="p-4 px-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockJobs.filter((j) => j.type === 'event').length}
              </div>
              <div className="text-sm text-[#828DA3]">Event Jobs</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

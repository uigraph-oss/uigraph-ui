'use client'

import { CopyIcon, EyeIcon, EyeOffIcon, SearchIcon } from '@/assets/svgs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { mockConfigs } from '@/features/services/constants/mock-data'
import { useState } from 'react'

interface ServiceConfigProps {
  serviceId: string
}

export function ServiceConfig({}: ServiceConfigProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleValues, setVisibleValues] = useState<Set<string>>(new Set())

  const filteredConfigs = mockConfigs.filter(
    (config) =>
      config.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  )

  function toggleValueVisibility(key: string) {
    const newVisible = new Set(visibleValues)
    if (newVisible.has(key)) {
      newVisible.delete(key)
    } else {
      newVisible.add(key)
    }
    setVisibleValues(newVisible)
  }

  function copyToClipboard(text: string) {
    void navigator.clipboard.writeText(text)
  }

  function maskValue(value: string) {
    if (value.length <= 8) return '••••••••'
    return (
      value.substring(0, 4) + '••••••••' + value.substring(value.length - 4)
    )
  }

  function getTagColor(tag: string) {
    switch (tag) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'security':
        return 'bg-orange-100 text-orange-800'
      case 'database':
        return 'bg-blue-100 text-blue-800'
      case 'cache':
        return 'bg-green-100 text-green-800'
      case 'external':
        return 'bg-purple-100 text-purple-800'
      case 'feature-flag':
        return 'bg-yellow-100 text-yellow-800'
      case 'pii':
        return 'bg-pink-100 text-pink-800'
      default:
        return 'bg-[#1E2533] text-[#F4F7FC]'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-[#586378]" />
            <Input
              placeholder="Search config keys, descriptions, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
        <div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
          <h3 className="leading-none font-semibold">
            Config & Environment Variables
          </h3>
          <p className="text-muted-foreground text-sm">
            Configuration variables used by this service across environments
          </p>
        </div>
        <div className="p-0 px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Environments</TableHead>
                <TableHead>Used By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConfigs.map((config) => (
                <TableRow key={config.key}>
                  <TableCell>
                    <div>
                      <div className="font-mono text-sm font-medium">
                        {config.key}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-[#D2D9E6]">
                      {config.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {config.tags.map((tag) => (
                        <Badge key={tag} className={getTagColor(tag)}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {Object.entries(config.environments).map(
                        ([env, value]) => (
                          <div key={env} className="flex items-center gap-2">
                            <Badge variant="outline" className="w-20 text-xs">
                              {env}
                            </Badge>
                            <code className="flex-1 rounded bg-[#1E2533] px-2 py-1 text-xs">
                              {visibleValues.has(`${config.key}-${env}`)
                                ? value
                                : maskValue(value)}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                toggleValueVisibility(`${config.key}-${env}`)
                              }
                            >
                              {visibleValues.has(`${config.key}-${env}`) ? (
                                <EyeOffIcon className="h-3 w-3" />
                              ) : (
                                <EyeIcon className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(value)}
                            >
                              <CopyIcon className="h-3 w-3" />
                            </Button>
                          </div>
                        )
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {config.usedBy.map((item) => (
                        <div key={item} className="text-xs text-[#828DA3]">
                          {item}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
          <div className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#F4F7FC]">
                {mockConfigs.length}
              </div>
              <div className="text-sm text-[#828DA3]">Total Configs</div>
            </div>
          </div>
        </div>
        <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
          <div className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {mockConfigs.filter((c) => c.tags.includes('critical')).length}
              </div>
              <div className="text-sm text-[#828DA3]">Critical</div>
            </div>
          </div>
        </div>
        <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
          <div className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {mockConfigs.filter((c) => c.tags.includes('security')).length}
              </div>
              <div className="text-sm text-[#828DA3]">Security</div>
            </div>
          </div>
        </div>
        <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
          <div className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">
                {mockConfigs.filter((c) => c.tags.includes('pii')).length}
              </div>
              <div className="text-sm text-[#828DA3]">PII</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

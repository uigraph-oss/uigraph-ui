'use client'

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
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useMlStudioData } from '../../contexts/ml-studio-data-context'
import { useModelContext } from '../../contexts/model-context'
import { InfoRow, Panel } from '../panel'

const tabs = [
  { id: 'model-card', label: 'Model card' },
  { id: 'metrics', label: 'Metrics' },
  { id: 'artifacts', label: 'Artifacts' },
  { id: 'parameters', label: 'Parameters' },
] as const

type TabId = (typeof tabs)[number]['id']

export function ModelOverviewTab() {
  const { model, selectedVersion } = useModelContext()
  const { runs, artifacts: allArtifacts } = useMlStudioData()
  const [activeTab, setActiveTab] = useState<TabId>('model-card')

  const latestRun = runs.find((r) => r.id === selectedVersion?.runId)
  const metrics = Object.entries(latestRun?.metrics ?? {})
  const parameters = Object.entries(latestRun?.parameters ?? {})
  const artifacts = latestRun
    ? allArtifacts.filter((a) => latestRun.artifactIds.includes(a.id))
    : []

  return (
    <div className="flex flex-col">
      <div className="border-stock flex items-center border-b">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            className={cn(
              'h-11 rounded-none bg-transparent px-8 text-[#828DA3] hover:bg-transparent',
              activeTab === tab.id &&
                'text-[#F4F7FC] shadow-[inset_0_-2px_0_0_var(--color-primary)]'
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === 'model-card' && (
          <Panel>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              <InfoRow label="Problem type">
                <span className="capitalize">{model.problemType}</span>
              </InfoRow>
              <InfoRow label="Domain">{model.domain || '—'}</InfoRow>
            </div>
            <InfoRow label="Description">
              <span className="leading-relaxed text-[#828DA3]">
                {model.description || 'No description.'}
              </span>
            </InfoRow>
            {model.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {model.tags.map((tag) => (
                  <Badge
                    key={tag}
                    className="border-stock rounded-md border bg-[#1E2533] text-[#828DA3]"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </Panel>
        )}

        {activeTab === 'metrics' && (
          <Panel>
            {metrics.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {metrics.map(([key, value]) => (
                  <div
                    key={key}
                    className="border-stock rounded-lg border bg-[#1E2533] p-4"
                  >
                    <div className="text-2xl font-bold text-[#F4F7FC]">
                      {value}
                    </div>
                    <div className="mt-1 text-sm text-[#828DA3]">
                      {key.replace(/_/g, ' ')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#586378]">
                No metrics recorded for this version.
              </p>
            )}
          </Panel>
        )}

        {activeTab === 'artifacts' && (
          <Panel>
            {artifacts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Size</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {artifacts.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium text-[#F4F7FC]">
                        {a.name}
                      </TableCell>
                      <TableCell className="text-[#828DA3]">{a.type}</TableCell>
                      <TableCell className="text-[#828DA3]">
                        {a.format}
                      </TableCell>
                      <TableCell className="text-[#828DA3]">{a.size}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-[#586378]">No artifacts attached.</p>
            )}
          </Panel>
        )}

        {activeTab === 'parameters' && (
          <Panel>
            {parameters.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parameter</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parameters.map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell className="text-[#828DA3]">{key}</TableCell>
                      <TableCell className="font-mono text-[#F4F7FC]">
                        {String(value)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-[#586378]">No parameters recorded.</p>
            )}
          </Panel>
        )}
      </div>
    </div>
  )
}

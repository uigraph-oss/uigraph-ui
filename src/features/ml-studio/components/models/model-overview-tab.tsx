'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useMlStudioData } from '../../contexts/ml-studio-data-context'
import { useModelContext } from '../../contexts/model-context'
import type { ProblemType } from '../../types'
import { InfoRow, Panel } from '../panel'
import { VersionTimeline } from '../version-timeline'
import { VersionModal } from './version-modal'

const PROBLEM_TYPES: ProblemType[] = [
  'classification',
  'regression',
  'ranking',
  'generation',
  'embedding',
  'other',
]

export function ModelOverviewTab() {
  const { model, versions, selectedVersionId, selectedVersion, setVersionId } =
    useModelContext()
  const {
    orgId,
    runs,
    artifacts: allArtifacts,
    updateModel,
  } = useMlStudioData()
  const [versionModalOpen, setVersionModalOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [domain, setDomain] = useState(model.domain)
  const [problemType, setProblemType] = useState<ProblemType>(model.problemType)

  const latestRun = runs.find((r) => r.id === selectedVersion?.runId)
  const metrics = Object.entries(latestRun?.metrics ?? {})
  const parameters = Object.entries(latestRun?.parameters ?? {})
  const artifacts = latestRun
    ? allArtifacts.filter((a) => latestRun.artifactIds.includes(a.id))
    : []

  function startEdit() {
    setDomain(model.domain)
    setProblemType(model.problemType)
    setEditing(true)
  }

  async function saveEdit() {
    await updateModel({
      variables: { orgId: orgId!, id: model.id, domain, problemType },
    })
    setEditing(false)
  }

  return (
    <div className="grid grid-cols-1 gap-5 p-6 lg:grid-cols-3">
      <div className="flex flex-col gap-5 lg:col-span-2">
        <Panel
          title="Model card"
          action={
            editing ? (
              <div className="flex gap-2">
                <Button
                  preset="outline"
                  className="h-9 px-3"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
                <Button className="h-9 px-3" onClick={() => void saveEdit()}>
                  Save
                </Button>
              </div>
            ) : (
              <Button preset="outline" className="h-9 px-3" onClick={startEdit}>
                Edit
              </Button>
            )
          }
        >
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            <InfoRow label="Problem type">
              {editing ? (
                <Select
                  value={problemType}
                  onValueChange={(v) => setProblemType(v as ProblemType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROBLEM_TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="capitalize">{model.problemType}</span>
              )}
            </InfoRow>
            <InfoRow label="Domain">
              {editing ? (
                <Input
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
              ) : (
                model.domain
              )}
            </InfoRow>
          </div>
          <p className="text-sm leading-relaxed text-[#828DA3]">
            {model.description}
          </p>
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
        </Panel>

        <Panel
          title="Version"
          description={selectedVersion ? selectedVersion.version : undefined}
        >
          <Tabs defaultValue="metrics">
            <TabsList className="border-stock bg-[#1E2533]">
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
              <TabsTrigger value="parameters">Parameters</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
            </TabsList>

            <TabsContent value="metrics">
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
            </TabsContent>

            <TabsContent value="artifacts">
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
                        <TableCell className="text-[#828DA3]">
                          {a.type}
                        </TableCell>
                        <TableCell className="text-[#828DA3]">
                          {a.format}
                        </TableCell>
                        <TableCell className="text-[#828DA3]">
                          {a.size}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-[#586378]">No artifacts attached.</p>
              )}
            </TabsContent>

            <TabsContent value="parameters">
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
                <p className="text-sm text-[#586378]">
                  No parameters recorded.
                </p>
              )}
            </TabsContent>

            <TabsContent value="description">
              <p className="text-sm leading-relaxed text-[#828DA3]">
                {selectedVersion?.description ||
                  'No description for this version.'}
              </p>
            </TabsContent>
          </Tabs>
        </Panel>
      </div>

      <div className="lg:col-span-1">
        <Panel
          title="Version history"
          action={
            <Button
              preset="outline"
              className="h-9 px-3"
              onClick={() => setVersionModalOpen(true)}
            >
              <PlusIcon />
              Version
            </Button>
          }
        >
          <VersionTimeline
            versions={versions}
            selectedVersionId={selectedVersionId}
            onSelect={(id) => void setVersionId(id)}
          />
        </Panel>
      </div>

      <VersionModal
        open={versionModalOpen}
        onOpenChange={setVersionModalOpen}
      />
    </div>
  )
}

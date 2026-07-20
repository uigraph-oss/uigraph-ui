'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PlusIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { mockDatasets } from '../../constants/mock-data'
import { useModelContext } from '../../contexts/model-context'
import { FormField, FormGrid } from '../form-field'
import { Panel } from '../panel'

function KeyValueRows({ label, hint }: { label: string; hint: string }) {
  const [rows, setRows] = useState([0, 1])

  return (
    <FormField label={label} hint={hint}>
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <div key={row} className="flex items-center gap-2">
            <Input placeholder="key" className="flex-1" />
            <Input placeholder="value" className="flex-1" />
            <Button
              preset="ghost"
              className="h-9 w-9 px-0"
              onClick={() => setRows((r) => r.filter((x) => x !== row))}
            >
              <XIcon />
            </Button>
          </div>
        ))}
        <Button
          preset="outline"
          className="h-9 w-fit px-3"
          onClick={() => setRows((r) => [...r, (r.at(-1) ?? 0) + 1])}
        >
          <PlusIcon />
          Add row
        </Button>
      </div>
    </FormField>
  )
}

export function RunFormPage() {
  const { model, selectedVersionId } = useModelContext()
  const { experimentId } = useParams<{ experimentId: string }>()
  const navigate = useNavigate()
  const versionQuery = selectedVersionId ? `?v=${selectedVersionId}` : ''
  const backTo = `/dashboard/ml-studio/${model.id}/experiments/${experimentId}${versionQuery}`

  const datasets = mockDatasets.filter((d) => d.versionId === selectedVersionId)

  return (
    <div className="flex flex-col gap-5 p-6">
      <div>
        <h2 className="text-xl font-semibold text-[#F4F7FC]">Log run</h2>
        <p className="mt-1 text-sm text-[#828DA3]">
          Record a single execution of this experiment.
        </p>
      </div>

      <div className="mx-auto w-full max-w-3xl">
        <Panel>
          <div className="flex flex-col gap-5">
            <FormGrid>
              <FormField label="Name">
                <Input placeholder="watch-history-context" />
              </FormField>
              <FormField label="Status">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </FormGrid>

            <KeyValueRows
              label="Parameters"
              hint="Hyperparameters and config."
            />
            <KeyValueRows label="Metrics" hint="Scalar metric values." />

            <FormGrid>
              <FormField label="Dataset">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dataset" />
                  </SelectTrigger>
                  <SelectContent>
                    {datasets.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} {d.version}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Environment">
                <Input placeholder="gpu-a100-x2" />
              </FormField>
            </FormGrid>

            <FormGrid>
              <FormField label="Trigger">
                <Input placeholder="manual / sdk / ci" />
              </FormField>
              <FormField label="Duration">
                <Input placeholder="4h 12m" />
              </FormField>
            </FormGrid>

            <FormField label="Model architecture">
              <Textarea
                placeholder="Describe the architecture used."
                rows={2}
              />
            </FormField>

            <FormField label="Notes">
              <Textarea placeholder="Anything worth remembering." rows={2} />
            </FormField>

            <div className="flex justify-end gap-2 pt-2">
              <Button preset="outline" onClick={() => navigate(backTo)}>
                Cancel
              </Button>
              <Button preset="primary" onClick={() => navigate(backTo)}>
                Log run
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  )
}

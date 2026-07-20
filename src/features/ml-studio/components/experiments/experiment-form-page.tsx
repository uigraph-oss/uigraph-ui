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
import { useNavigate } from 'react-router-dom'
import { useModelContext } from '../../contexts/model-context'
import { FormField, FormGrid } from '../form-field'
import { Panel } from '../panel'

export function ExperimentFormPage() {
  const { model, selectedVersionId } = useModelContext()
  const navigate = useNavigate()
  const versionQuery = selectedVersionId ? `?v=${selectedVersionId}` : ''
  const backTo = `/dashboard/ml-studio/${model.id}/experiments${versionQuery}`

  return (
    <div className="flex flex-col gap-5 p-6">
      <div>
        <h2 className="text-xl font-semibold text-[#F4F7FC]">New Experiment</h2>
        <p className="mt-1 text-sm text-[#828DA3]">
          Define a research effort for {model.name}.
        </p>
      </div>

      <div className="mx-auto w-full max-w-3xl">
        <Panel>
          <div className="flex flex-col gap-5">
            <FormField label="Name">
              <Input placeholder="Cold-start recall improvement" />
            </FormField>

            <FormField label="Description">
              <Textarea placeholder="Short summary of the effort." rows={3} />
            </FormField>

            <FormField label="Goal">
              <Textarea placeholder="What outcome are you chasing?" rows={2} />
            </FormField>

            <FormField label="Hypothesis">
              <Textarea
                placeholder="What do you expect to happen and why?"
                rows={2}
              />
            </FormField>

            <FormGrid>
              <FormField label="Owner">
                <Input placeholder="Maya Patel" />
              </FormField>
              <FormField label="Status">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="concluded">Concluded</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </FormGrid>

            <FormField label="Tags" hint="Comma separated">
              <Input placeholder="ranking, cold-start" />
            </FormField>

            <div className="flex justify-end gap-2 pt-2">
              <Button preset="outline" onClick={() => navigate(backTo)}>
                Cancel
              </Button>
              <Button preset="primary" onClick={() => navigate(backTo)}>
                Create experiment
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  )
}

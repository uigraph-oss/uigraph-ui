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
import {
  DashboardSectionContent,
  DashboardSectionHeader,
} from '@/features/dashboard'
import { DashboardPageLayout } from '@/features/dashboard/dashboard-layout'
import { useNavigate } from 'react-router-dom'
import { FormField, FormGrid } from '../form-field'
import { Panel } from '../panel'

export function ModelFormPage() {
  const navigate = useNavigate()

  return (
    <DashboardPageLayout
      crumbs={[
        { to: '/dashboard/ml-studio', label: 'ML Studio' },
        { to: '/dashboard/ml-studio/new', label: 'New Model' },
      ]}
    >
      <div className="flex h-full flex-col">
        <DashboardSectionHeader
          title="New Model"
          description="Register a model in the studio. You can add versions and experiments after."
        />

        <DashboardSectionContent>
          <div className="mx-auto w-full max-w-3xl">
            <Panel>
              <div className="flex flex-col gap-5">
                <FormField label="Name">
                  <Input placeholder="Video Recommendations" />
                </FormField>

                <FormField label="Description">
                  <Textarea placeholder="What does this model do?" rows={3} />
                </FormField>

                <FormGrid>
                  <FormField label="Owner">
                    <Input placeholder="Maya Patel" />
                  </FormField>
                  <FormField label="Domain">
                    <Input placeholder="Recommendations" />
                  </FormField>
                </FormGrid>

                <FormGrid>
                  <FormField label="Problem type">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="classification">
                          Classification
                        </SelectItem>
                        <SelectItem value="regression">Regression</SelectItem>
                        <SelectItem value="ranking">Ranking</SelectItem>
                        <SelectItem value="generation">Generation</SelectItem>
                        <SelectItem value="embedding">Embedding</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Status">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </FormGrid>

                <FormField label="Tags" hint="Comma separated">
                  <Input placeholder="ranking, cold-start, retrieval" />
                </FormField>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    preset="outline"
                    onClick={() => navigate('/dashboard/ml-studio')}
                  >
                    Cancel
                  </Button>
                  <Button
                    preset="primary"
                    onClick={() => navigate('/dashboard/ml-studio')}
                  >
                    Create model
                  </Button>
                </div>
              </div>
            </Panel>
          </div>
        </DashboardSectionContent>
      </div>
    </DashboardPageLayout>
  )
}

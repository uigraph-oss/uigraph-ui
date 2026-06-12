'use client'

import { GT } from '@/api'
import { SuperCircleLoader } from '@/components/loader'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffectState } from '@/hooks/use-effect-state'
import { useState } from 'react'
import { toast } from 'sonner'
import { FocalPointComponentsSection } from '../components/focal-point-component-group'
import { useFocalPointSidebarContext } from '../contexts/focal-point-sidebar-context'
import { DeleteFocalPointConfirmationModal } from './delete-focal-point-confirm-modal'

export type FocalPointDetailsApi = {
  updateFocalPoint: (
    pointId: string,
    input: GT.UpdateFocalPointInput
  ) => Promise<void>

  deleteFocalPoint: (pointId: string) => Promise<void>
}

type FocalPointDetailsProps = FocalPointDetailsApi & {
  focalPoint: GT.FocalPoint
  unselectFocalPoint: () => void
}

export function FocalPointDetails({
  focalPoint,
  unselectFocalPoint,
  updateFocalPoint,
  deleteFocalPoint,
}: FocalPointDetailsProps) {
  const { pointMeta, createPointMeta, updatePointMeta, deletePointMeta } =
    useFocalPointSidebarContext()

  const [isUpdatingFocalPoint, setIsUpdatingFocalPoint] = useState(false)
  const [isDeletingFocalPoint, setIsDeletingFocalPoint] = useState(false)

  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
    useState(false)

  const [localName, setLocalName] = useEffectState(
    focalPoint.focalPointName || ''
  )

  const hasChanges = localName !== focalPoint.focalPointName

  return (
    <div>
      <Accordion
        type="single"
        collapsible
        className={'border-b'}
        defaultValue="basics"
      >
        <AccordionItem value="basics">
          <AccordionTrigger className="group flex w-full items-center justify-between px-4 text-base">
            Basics
          </AccordionTrigger>

          <AccordionContent className="space-y-4 px-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={localName}
                autoCorrect="off"
                autoComplete="off"
                autoCapitalize="off"
                disabled={isUpdatingFocalPoint}
                onChange={(e) => setLocalName(e.target.value)}
                placeholder="Enter focal point name"
                className="!h-14 w-full !rounded-[0.75rem]"
              />
            </div>

            {hasChanges && (
              <div className="flex justify-start">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 rounded-[0.75rem]"
                  onClick={async () => {
                    try {
                      setIsUpdatingFocalPoint(true)
                      await updateFocalPoint(focalPoint.focalPointId!, {
                        organizationId: focalPoint.organizationId!,
                        pageId: focalPoint.pageId!,
                        focalPointName: localName,
                      })
                    } catch {
                      toast.error('Failed to update focal point')
                    } finally {
                      setIsUpdatingFocalPoint(false)
                    }
                  }}
                >
                  <SuperCircleLoader loading={isUpdatingFocalPoint} />
                  Save Changes
                </Button>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <FocalPointComponentsSection
        pointMetaList={pointMeta}
        createPointMeta={async (componentId, input) => {
          await createPointMeta(componentId, input)
        }}
        deletePointMeta={async (pointMetaId) => {
          await deletePointMeta(pointMetaId)
        }}
        updatePointMeta={async (pointMetaId, componentId, input) => {
          await updatePointMeta(pointMetaId, componentId, input)
        }}
      />

      <div className="mt-6 px-4 pb-2">
        <Button
          size="lg"
          variant="destructive"
          className="text-destructive ring-destructive w-full rounded-lg bg-white ring hover:text-white"
          disabled={isDeletingFocalPoint}
          onClick={async () => setIsDeleteConfirmModalOpen(true)}
        >
          <SuperCircleLoader loading={isDeletingFocalPoint} />
          Delete Focal Point
        </Button>

        <DeleteFocalPointConfirmationModal
          open={isDeleteConfirmModalOpen}
          onOpenChange={setIsDeleteConfirmModalOpen}
          onConfirm={async () => {
            try {
              setIsDeletingFocalPoint(true)
              await deleteFocalPoint(focalPoint.focalPointId!)
              toast.success('Focal point deleted successfully')
              unselectFocalPoint()
            } catch {
              toast.error(
                'Failed to delete focal point. Please try again later.'
              )
            } finally {
              setIsDeletingFocalPoint(false)
            }
          }}
        />
      </div>
    </div>
  )
}

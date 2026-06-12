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

type BasicSectionProps = {
  frameGroup: GT.PageGroup
  updateFrameGroup: (input: GT.UpdatePageGroupInput) => Promise<void>
}

export function BasicSection({
  frameGroup,
  updateFrameGroup,
}: BasicSectionProps) {
  const [isUpdatingGroup, setIsUpdatingGroup] = useState(false)

  const [localName, setLocalName] = useEffectState(frameGroup.groupName || '')

  const hasChanges = localName !== frameGroup.groupName

  return (
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
            <Label htmlFor="group-name">Name</Label>
            <Input
              id="group-name"
              value={localName}
              autoCorrect="off"
              autoComplete="off"
              autoCapitalize="off"
              disabled={isUpdatingGroup}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder="Enter group name"
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
                    setIsUpdatingGroup(true)
                    await updateFrameGroup({
                      organizationId: frameGroup.organizationId!,
                      pageId: frameGroup.pageId!,
                      groupName: localName,
                      locationX: frameGroup.locationX,
                      locationY: frameGroup.locationY,
                      width: frameGroup.width,
                      height: frameGroup.height,
                    })
                  } catch {
                    toast.error('Failed to update group')
                  } finally {
                    setIsUpdatingGroup(false)
                  }
                }}
              >
                <SuperCircleLoader loading={isUpdatingGroup} />
                Save Changes
              </Button>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

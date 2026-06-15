'use client'

import { GT } from '@/api'
import { SuperLogoLoader } from '@/components/loader'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useComponents } from '@/features/dashboard-pages/hooks/use-components'
import { useMemo } from 'react'
import { PointMeta } from '../api/focal-point-meta-v2'
import {
  FocalPointMetaSection,
  FocalPointMetaSectionProps,
} from '../components/focal-point-meta-section'

type CommonMetaOptions = Pick<
  FocalPointMetaSectionProps,
  | 'createPointMeta'
  | 'deletePointMeta'
  | 'updatePointMeta'
  | 'showFocalPointName'
  | 'disableCreatePointMeta'
>

type FocalPointComponentGroupProps = CommonMetaOptions & {
  pointMetaList: PointMeta[]
}

type FocalPointComponentSectionProps = CommonMetaOptions & {
  component: GT.Component
  pointMetaList: PointMeta[]
}

export function FocalPointComponentsSection({
  ...props
}: FocalPointComponentGroupProps) {
  const { focalPointGroups, loading } = useComponents()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <SuperLogoLoader className={'text-8xl'} />
        <p className="text-muted-foreground mt-4 text-sm font-medium">
          Loading Focal Point...
        </p>
      </div>
    )
  }

  return (
    <>
      {focalPointGroups.map((group, i) => (
        <Accordion
          key={i}
          collapsible
          type="single"
          className="border-stock border-b"
          defaultValue={group.name}
        >
          <AccordionItem value={group.name}>
            <AccordionTrigger className="group flex w-full items-center justify-between px-4 text-base">
              {group.name}
            </AccordionTrigger>

            <AccordionContent className="space-y-4 px-4 pt-2">
              {group.components.map((component) => (
                <FocalPointComponentSection
                  key={component.componentId}
                  component={component}
                  {...props}
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}
    </>
  )
}

function FocalPointComponentSection({
  component,
  pointMetaList,
  ...props
}: FocalPointComponentSectionProps) {
  const componentPointMeta = useMemo(
    () =>
      pointMetaList.filter(
        (meta) => meta.componentId === component.componentId
      ),
    [pointMetaList, component.componentId]
  )

  return (
    <FocalPointMetaSection
      component={component}
      componentPointMeta={componentPointMeta}
      {...props}
    />
  )
}

import { CrossButton } from '@/components/cross-button'
import { SuperCircleLoader } from '@/components/loader'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StepTwoComponent } from '@/features/components/components/configure-component/step-two'
import { useEffectState } from '@/hooks/use-effect-state'
import { arrayNonNullable } from 'daily-code'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { TComponentField } from '../types/component-fields'

type ConfigurePropertiesModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void

  initialComponentFields: TComponentField[]
  onSubmit: (fields: TComponentField[]) => Promise<void>
}

export function ConfigurePropertiesModal({
  ...props
}: ConfigurePropertiesModalProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="border-stock bg-shading h-full !w-full !max-w-full grid-rows-[auto_1fr] gap-0 overflow-hidden rounded-none border p-0 md:h-auto md:max-h-[90vh] md:!max-w-[42.9375rem] md:rounded-[2rem]"
      >
        <ConfigurePropertiesContent {...props} />
      </DialogContent>
    </Dialog>
  )
}

function ConfigurePropertiesContent({
  initialComponentFields,
  onOpenChange,
  onSubmit,
}: ConfigurePropertiesModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(0)

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const container = containerRef.current!
    if (!container) return

    const resizeObserver = new ResizeObserver(() => {
      setContainerHeight(container.clientHeight)
    })

    setContainerHeight(container.clientHeight)
    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [containerRef])

  const memoizedComponentFields = useMemo(
    () => arrayNonNullable(initialComponentFields),
    [initialComponentFields]
  )

  const [componentFields, setComponentFields] = useEffectState(
    memoizedComponentFields
  )

  return (
    <>
      <DialogHeader className="border-stock flex flex-row items-center justify-between border-b p-6">
        <div className="flex h-full flex-col justify-between">
          <DialogTitle className="mb-2 text-base leading-tight">
            Component Structure
          </DialogTitle>

          <DialogDescription>
            Configure the Structure for component.
          </DialogDescription>
        </div>

        <DialogClose asChild>
          <CrossButton />
        </DialogClose>
      </DialogHeader>

      <div className="custom-scrollbar relative isolate overflow-auto p-6">
        <motion.div
          animate={{ height: containerHeight }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <div ref={containerRef}>
            <StepTwoComponent
              hideDescription
              largeEmptyState
              enableRequired={false}
              componentFields={componentFields}
              setComponentFields={setComponentFields}
            />
          </div>
        </motion.div>

        <div className="relative z-10 mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="text-paragraph border-stock bg-input h-11 w-[4.5rem] rounded-[0.8125rem]"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            className="h-11 rounded-[0.8125rem] px-8"
            onClick={async function () {
              let hasError = false

              setComponentFields(
                componentFields.map((field) => {
                  if (field.label?.trim()) return field

                  hasError = true
                  return { ...field, error: `Field name is required` }
                })
              )

              if (hasError) return

              setIsLoading(true)
              await onSubmit(componentFields)
              setIsLoading(false)
            }}
          >
            {isLoading && <SuperCircleLoader />}
            Save
          </Button>
        </div>
      </div>
    </>
  )
}

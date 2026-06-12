import { GT } from '@/api'
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
import { ComponentInputType } from '@/features/component-meta'
import { useEffectState } from '@/hooks/use-effect-state'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { arrayNonNullable } from 'daily-code'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { StepOneComponent } from './step-one'
import { StepThreeComponent } from './step-three'
import { StepTwoComponent } from './step-two'

const stepOneSchema = z.object({
  name: z
    .string()
    .min(1, 'Component name is required')
    .min(2, 'Component name must be at least 2 characters')
    .max(50, 'Component name must be at most 50 characters'),
  category: z.string(),
  description: z
    .string()
    .max(100, 'Description must be at most 100 characters'),
})

type StepOneFormData = z.infer<typeof stepOneSchema>

type ConfigureComponentModalProps = {
  enableRequired?: boolean
  nativeComponents?: GT.Component[]
  selectedComponent: GT.CustomComponent | null
  includeCategory?: boolean
  includeStepThree?: boolean
  includeReadonlyName?: boolean

  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (
    name: string,
    category: string,
    description: string,
    fields: GT.ComponentField[]
  ) => Promise<void>
}

export function ConfigureComponentModal({
  ...props
}: ConfigureComponentModalProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="border-stock bg-shading h-full !w-full !max-w-full grid-rows-[auto_1fr] gap-0 overflow-hidden rounded-none border p-0 md:h-auto md:max-h-[90vh] md:!max-w-[42.9375rem] md:rounded-[2rem]"
      >
        <ConfigureComponentContent {...props} />
      </DialogContent>
    </Dialog>
  )
}

function ConfigureComponentHeader({
  title,
  currentStep,
  setStep,
  steps,
}: {
  title: string
  currentStep: number
  setStep: (step: number) => void
  steps: number[]
}) {
  return (
    <DialogHeader className="border-stock flex h-[7.0625rem] flex-row items-center justify-between border-b p-6">
      <div className="flex h-full flex-col justify-between">
        <DialogTitle className="text-base leading-tight">{title}</DialogTitle>

        <DialogDescription hidden className="sr-only">
          Configure the settings for component.
        </DialogDescription>

        <div className="flex gap-1">
          {steps.map((step, i) => (
            <button
              key={i}
              onClick={() => setStep(step)}
              className={cn(
                'bg-stock/45 text-paragraph flex size-8 items-center justify-center rounded-full text-sm',
                currentStep === step && 'bg-primary text-white'
              )}
            >
              {step}
            </button>
          ))}
        </div>
      </div>

      <DialogClose asChild>
        <CrossButton />
      </DialogClose>
    </DialogHeader>
  )
}

function ConfigureComponentContent({
  enableRequired,
  selectedComponent,
  nativeComponents,
  includeCategory = true,
  includeStepThree = true,
  includeReadonlyName = true,
  onOpenChange,
  onSubmit,
}: ConfigureComponentModalProps) {
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

  const [currentStep, setCurrentStep] = useState(1)

  const memoizedComponentFields = useMemo(
    () =>
      selectedComponent
        ? arrayNonNullable(selectedComponent?.componentFields)
        : includeReadonlyName
          ? [
              {
                componentFieldId: crypto.randomUUID(),
                order: 1,
                label: 'Name',
                required: true,
                type: ComponentInputType.TextInput,
                isReadonly: true,
              },
            ]
          : [],
    [selectedComponent, includeReadonlyName]
  )

  const [componentFields, setComponentFields] = useEffectState(
    memoizedComponentFields
  )

  const {
    control,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<StepOneFormData>({
    resolver: zodResolver(stepOneSchema),
    values: {
      name: selectedComponent?.name ?? '',
      category: selectedComponent?.category ?? '',
      description: selectedComponent?.description ?? '',
    },
  })

  return (
    <>
      <ConfigureComponentHeader
        steps={includeStepThree ? [1, 2, 3] : [1, 2]}
        title={selectedComponent ? 'Configure Component' : 'Create Component'}
        currentStep={currentStep}
        setStep={(step) => {
          if (currentStep === 1) {
            void handleSubmit(() => setCurrentStep(step))()
          } else if (currentStep === 2) {
            let hasError = false

            setComponentFields(
              componentFields.map((field) => {
                if (field.label?.trim()) return field

                hasError = true
                return { ...field, error: `Field name is required` }
              })
            )

            if (hasError) return
            setCurrentStep(step)
          } else {
            setCurrentStep(step)
          }
        }}
      />

      <div className="custom-scrollbar relative isolate overflow-auto p-6">
        <motion.div
          animate={{ height: containerHeight }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <div ref={containerRef}>
            <AnimatePresence mode="popLayout" initial={false}>
              {currentStep === 1 && (
                <motion.div
                  key={1}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.2 }}
                >
                  <StepOneComponent
                    includeCategory={includeCategory}
                    control={control}
                    errors={errors}
                  />
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key={2}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.2 }}
                >
                  <StepTwoComponent
                    enableRequired={enableRequired ?? true}
                    nativeComponents={nativeComponents}
                    componentFields={componentFields}
                    setComponentFields={setComponentFields}
                  />
                </motion.div>
              )}

              {includeStepThree && currentStep === 3 && (
                <motion.div
                  key={3}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.2 }}
                >
                  <StepThreeComponent componentFields={componentFields} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="relative z-10 mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="text-paragraph border-stock h-11 w-[4.5rem] rounded-[0.8125rem] bg-white"
            onClick={() => {
              if (currentStep > 1) {
                setCurrentStep(currentStep - 1)
              } else {
                onOpenChange(false)
              }
            }}
          >
            Cancel
          </Button>

          <Button
            type="button"
            className="h-11 rounded-[0.8125rem] px-8"
            onClick={async function () {
              if (currentStep === 1) {
                return handleSubmit(() => setCurrentStep(2))()
              }

              if (currentStep === 2) {
                let hasError = false

                setComponentFields(
                  componentFields.map((field) => {
                    if (field.label?.trim()) return field

                    hasError = true
                    return { ...field, error: `Field name is required` }
                  })
                )

                if (hasError) return
                if (includeStepThree) return setCurrentStep(3)
              }

              setIsLoading(true)

              await onSubmit(
                getValues('name'),
                getValues('category'),
                getValues('description'),
                componentFields
              )

              setIsLoading(false)
            }}
          >
            {isLoading && <SuperCircleLoader />}
            {currentStep < 3 ? 'Next' : 'Save'}
          </Button>
        </div>
      </div>
    </>
  )
}

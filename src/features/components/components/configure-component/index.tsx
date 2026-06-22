import { V2 } from '@/api'
import { BetterDialogCloseButton } from '@/components/better-dialog'
import { SuperCircleLoader } from '@/components/loader'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ComponentInputType } from '@/features/component-meta'
import { useEffectState } from '@/hooks/use-effect-state'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { arrayNonNullable } from 'daily-code'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ComponentField } from './component-field-list'
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
  nativeComponents?: V2.Component[]
  selectedComponent: V2.Component | null
  includeCategory?: boolean
  includeStepThree?: boolean
  includeReadonlyName?: boolean

  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (
    name: string,
    category: string,
    description: string,
    fields: ComponentField[]
  ) => Promise<void>
}

export function ConfigureComponentModal({
  ...props
}: ConfigureComponentModalProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-full max-h-full w-full max-w-full flex-col gap-0 overflow-hidden rounded-none border-0 border-[#2A3242] bg-[#141925] p-0 outline-none sm:h-auto sm:max-h-[90vh] sm:max-w-[min(45rem,90%)] sm:rounded-[1rem] sm:border"
      >
        <ConfigureComponentContent {...props} />
      </DialogContent>
    </Dialog>
  )
}

function ConfigureComponentHeader({
  title,
  description,
  currentStep,
  setStep,
  steps,
}: {
  title: string
  description: string
  currentStep: number
  setStep: (step: number) => void
  steps: number[]
}) {
  return (
    <DialogHeader className="flex min-h-18 w-full flex-row items-center justify-between border-b border-[#2A3242] px-6 py-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <DialogTitle className="text-base font-medium">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </div>

        <div className="flex gap-1">
          {steps.map((step, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStep(step)}
              className={cn(
                'flex size-8 items-center justify-center rounded-full bg-[#2A3242]/60 text-sm text-[#828DA3]',
                currentStep === step && 'bg-primary text-white'
              )}
            >
              {step}
            </button>
          ))}
        </div>
      </div>

      <BetterDialogCloseButton />
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
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const memoizedComponentFields = useMemo<ComponentField[]>(
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
        description={
          selectedComponent
            ? 'Update component configuration'
            : 'Create component configuration'
        }
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

      <div className="custom-scrollbar relative isolate flex-1 overflow-auto p-6 pb-3">
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

      <DialogFooter className="flex w-full flex-row items-center justify-end gap-3 p-6 pt-3">
        <Button
          type="button"
          preset="outline"
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
          preset="primary"
          disabled={isLoading}
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
          {(includeStepThree ? currentStep === 3 : currentStep === 2)
            ? selectedComponent
              ? 'Update Component'
              : 'Create Component'
            : 'Next'}
        </Button>
      </DialogFooter>
    </>
  )
}

import { BetterDialogContent } from '@/components/better-dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { env } from '@/env'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'
import { DemoTestCase } from './demo-test-case'
import { FieldMessage } from './field-message'
import { FormApiSection } from './form-api-section'
import { FormBasicSection } from './form-basic-section'
import { FormDatabaseSection } from './form-database-section'
import { FormGraphqlSection } from './form-graphql-section'
import { FormGrpcSection } from './form-grpc-section'
import { FormManualSection } from './form-manual-section'
import { configureTestCaseSchema, FormType } from './schema'

type ConfigureTestCaseModalProps = {
  mode: 'create' | 'update'
  onSubmit: (data: z.infer<typeof configureTestCaseSchema>) => Promise<void>
  defaultValue?: z.infer<typeof configureTestCaseSchema>
}

export function ConfigureTestCaseModal({
  mode,
  onSubmit,
  defaultValue,
}: ConfigureTestCaseModalProps) {
  const form: FormType = useForm<z.infer<typeof configureTestCaseSchema>>({
    resolver: zodResolver(configureTestCaseSchema),
    defaultValues: defaultValue,
    mode: 'onBlur',
  })

  const testType = form.watch('type')

  return (
    <BetterDialogContent
      title={mode === 'create' ? 'Create Test Case' : 'Edit Test Case'}
      description={
        mode === 'create'
          ? 'Add a new test case to this pack'
          : 'Update test case'
      }
      footerSubmit={mode === 'create' ? 'Create Test Case' : 'Save Changes'}
      footerSubmitLoading={form.formState.isSubmitting}
      onFooterSubmitClick={form.handleSubmit(async (data) => onSubmit(data))}
      footerCancel="Cancel"
    >
      <FormBasicSection form={form} />

      <AnimatePresence mode="wait">
        {testType === 'manual' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 rounded-[12px] border-[1.5px] border-[#2A3242] bg-[#141925] px-4 pt-1 pb-4"
          >
            <FormManualSection form={form} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {testType === 'api' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 rounded-[12px] border-[1.5px] border-[#2A3242] bg-[#141925] px-4 pt-1 pb-4"
          >
            <FormApiSection form={form} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {testType === 'graphql' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 rounded-[12px] border-[1.5px] border-[#2A3242] bg-[#141925] px-4 pt-1 pb-4"
          >
            <FormGraphqlSection form={form} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {testType === 'database' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 rounded-[12px] border-[1.5px] border-[#2A3242] bg-[#141925] px-4 pt-1 pb-4"
          >
            <FormDatabaseSection form={form} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {testType === 'grpc' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 rounded-[12px] border-[1.5px] border-[#2A3242] bg-[#141925] px-4 pt-1 pb-4"
          >
            <FormGrpcSection form={form} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="my-5 mb-4 flex items-center gap-2.5">
        <div className="h-px flex-1 bg-[#1E2533]" />
        <span className="text-[11px] font-bold tracking-[0.08em] whitespace-nowrap text-[#828DA3] uppercase">
          Flags
        </span>
        <div className="h-px flex-1 bg-[#1E2533]" />
      </div>

      <div className="mb-2 flex flex-wrap gap-8">
        <div>
          <div className="flex items-center gap-3">
            <Controller
              name="critical"
              control={form.control}
              render={({ field }) => (
                <Switch
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label className="text-sm font-normal text-[#D2D9E6]">
              Critical - blocks run completion if failed
            </Label>
          </div>
          <FieldMessage message={form.formState.errors.critical?.message} />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <Controller
              name="evidenceRequired"
              control={form.control}
              render={({ field }) => (
                <Switch
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label className="text-sm font-normal text-[#D2D9E6]">
              Evidence Required (screenshots)
            </Label>
          </div>
          <FieldMessage
            message={form.formState.errors.evidenceRequired?.message}
          />
        </div>
      </div>

      {env.VITE_FEATURE_ENABLE_DEMO_TEST_CASES && <DemoTestCase form={form} />}
    </BetterDialogContent>
  )
}

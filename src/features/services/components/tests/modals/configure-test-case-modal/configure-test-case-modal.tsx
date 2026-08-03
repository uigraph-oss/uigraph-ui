import {
  BetterDialogCloseButton,
  BetterDialogContent,
} from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { env } from '@/env'
import { uploadFile, useAssetUrls } from '@/features/uploads/api/uploads'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { Pencil, X } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'
import { ScreenshotUploader } from '../screenshot-uploader'
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
  mode: 'create' | 'update' | 'view'
  onSubmit: (data: z.infer<typeof configureTestCaseSchema>) => Promise<void>
  defaultValue?: z.infer<typeof configureTestCaseSchema>
}

function ExistingScreenshots({
  orgId,
  assetIds,
  onRemove,
}: {
  orgId: string | undefined
  assetIds: string[]
  onRemove: (assetId: string) => void
}) {
  const urlMap = useAssetUrls(orgId, assetIds)
  if (assetIds.length === 0) return null
  return (
    <div className="mb-3 grid grid-cols-4 gap-3">
      {assetIds.map((assetId) => {
        const url = urlMap[assetId]
        return (
          <div key={assetId} className="relative">
            {url ? (
              <img
                src={url}
                alt="Screenshot"
                className="h-20 w-full rounded-[12px] border border-[#2A3242] object-cover"
              />
            ) : (
              <div className="bg-muted h-20 w-full animate-pulse rounded-[12px] border border-[#2A3242]" />
            )}
            <button
              type="button"
              onClick={() => onRemove(assetId)}
              className="bg-destructive hover:bg-destructive/90 absolute -top-2 -right-2 rounded-full p-1 text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function ConfigureTestCaseModal({
  mode,
  onSubmit,
  defaultValue,
}: ConfigureTestCaseModalProps) {
  const orgId = useCurrentOrganization().id
  const form: FormType = useForm<z.infer<typeof configureTestCaseSchema>>({
    resolver: zodResolver(configureTestCaseSchema),
    defaultValues: defaultValue,
    mode: 'onBlur',
  })

  const testType = form.watch('type')
  const screenshotUrls = form.watch('screenshotUrls') ?? []

  // 'view' starts read-only with an edit affordance in the header; clicking
  // it flips this in place so the same modal instance becomes the familiar
  // edit form, without closing/reopening.
  const [isEditing, setIsEditing] = useState(mode !== 'view')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const readOnly = !isEditing

  const title =
    mode === 'create'
      ? 'Create Test Case'
      : isEditing
        ? 'Edit Test Case'
        : 'Test Case Details'
  const description =
    mode === 'create'
      ? 'Add a new test case to this pack'
      : isEditing
        ? 'Update test case'
        : 'Viewing in read-only mode — click the pencil to edit'

  async function handleSave(data: z.infer<typeof configureTestCaseSchema>) {
    setIsSubmitting(true)
    try {
      let mergedScreenshotUrls = data.screenshotUrls ?? []
      if (data.screenshotFiles && data.screenshotFiles.length > 0 && orgId) {
        const uploaded = await Promise.all(
          data.screenshotFiles.map((file) => uploadFile(orgId, file))
        )
        mergedScreenshotUrls = [...mergedScreenshotUrls, ...uploaded]
      }
      await onSubmit({
        ...data,
        screenshotUrls: mergedScreenshotUrls,
        screenshotFiles: undefined,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <BetterDialogContent
      _headerContent={
        <DialogHeader className="flex min-h-18 w-full flex-row items-center justify-between border-b border-[#2A3242] px-6">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-left text-base font-medium">
              {title}
            </DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </div>
          <div className="flex items-center gap-2">
            {mode === 'view' && readOnly && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                title="Edit test case"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            <BetterDialogCloseButton />
          </div>
        </DialogHeader>
      }
      footerCancel={isEditing ? 'Cancel' : 'Close'}
      footerSubmit={
        isEditing
          ? mode === 'create'
            ? 'Create Test Case'
            : 'Save Changes'
          : undefined
      }
      footerSubmitLoading={isSubmitting}
      onFooterSubmitClick={form.handleSubmit(handleSave)}
    >
      <fieldset
        disabled={readOnly}
        className={cn('contents', readOnly && 'pointer-events-none')}
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

        <div className="my-5 mb-4 flex items-center gap-2.5">
          <div className="h-px flex-1 bg-[#1E2533]" />
          <span className="text-[11px] font-bold tracking-[0.08em] whitespace-nowrap text-[#828DA3] uppercase">
            Reference Screenshots
          </span>
          <div className="h-px flex-1 bg-[#1E2533]" />
        </div>

        <ExistingScreenshots
          orgId={orgId}
          assetIds={screenshotUrls}
          onRemove={(assetId) =>
            form.setValue(
              'screenshotUrls',
              screenshotUrls.filter((id) => id !== assetId)
            )
          }
        />
        <Controller
          name="screenshotFiles"
          control={form.control}
          render={({ field }) => (
            <ScreenshotUploader
              files={field.value ?? []}
              onChange={field.onChange}
            />
          )}
        />

        {env.VITE_FEATURE_ENABLE_DEMO_TEST_CASES && (
          <DemoTestCase form={form} />
        )}
      </fieldset>
    </BetterDialogContent>
  )
}

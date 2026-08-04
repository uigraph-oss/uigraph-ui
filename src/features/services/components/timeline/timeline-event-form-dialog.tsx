import type { GT } from '@/api'
import { BetterDialogContent } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { TagInput } from '@/features/component-meta'
import { ComponentMetaThemeProvider } from '@/features/component-meta/theme'
import { uploadFile } from '@/features/uploads/api/uploads'
import { zodResolver } from '@hookform/resolvers/zod'
import { openFileExplorer } from 'daily-code/browser'
import { Upload, X } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { DECISION_STATUS_OPTIONS, TYPE_LABEL } from './constants'
import type { TimelineEvent, TimelineEventType } from './types'

const TYPE_OPTIONS: TimelineEventType[] = ['release', 'decision', 'incident']

const timelineEventFormSchema = z.object({
  type: z.enum(['release', 'decision', 'incident']),
  title: z.string().min(1, 'Title is required'),
  summary: z.string().min(1, 'Summary is required'),
  date: z.string().min(1, 'Date is required'),
  version: z.string().optional(),
  adrNumber: z.string().optional(),
  status: z
    .enum(['proposed', 'accepted', 'superseded', 'deprecated'])
    .optional(),
  sourceLabel: z.string().optional(),
  sourceUrl: z.url('Invalid URL').optional().or(z.literal('')),
  touches: z.array(z.string()),
})

type TimelineEventFormValues = z.infer<typeof timelineEventFormSchema>

function toFormValues(event: TimelineEvent | null): TimelineEventFormValues {
  if (!event) {
    return {
      type: 'release',
      title: '',
      summary: '',
      date: new Date().toISOString().slice(0, 10),
      version: '',
      adrNumber: '',
      status: 'accepted',
      sourceLabel: '',
      sourceUrl: '',
      touches: [],
    }
  }

  return {
    type: event.type,
    title: event.title,
    summary: event.summary,
    date: event.date.slice(0, 10),
    version: event.type === 'release' ? event.version : '',
    adrNumber: event.type === 'decision' ? event.adrNumber : '',
    status: event.type === 'decision' ? event.status : 'accepted',
    sourceLabel: event.sourceLabel ?? '',
    sourceUrl: event.sourceUrl ?? '',
    touches: event.touches.map((t) => t.label),
  }
}

export function TimelineEventFormDialog({
  mode,
  defaultEvent,
  orgId,
  onSubmit,
}: {
  mode: 'create' | 'edit'
  defaultEvent?: TimelineEvent | null
  orgId: string
  onSubmit: (input: GT.CreateTimelineEventInput) => void | Promise<void>
}) {
  const form = useForm<TimelineEventFormValues>({
    resolver: zodResolver(timelineEventFormSchema),
    defaultValues: toFormValues(defaultEvent ?? null),
  })

  const type = form.watch('type')
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [attachmentRemoved, setAttachmentRemoved] = useState(false)
  const existingAttachment =
    !attachmentFile && !attachmentRemoved ? defaultEvent?.attachment : null

  async function handleAttach() {
    try {
      const [file] = await openFileExplorer({
        accept: '.md,.mdx,.txt,.pdf,image/*',
      })
      if (file) {
        setAttachmentFile(file)
        setAttachmentRemoved(false)
      }
    } catch {
      // user cancelled the file picker
    }
  }

  async function handleSubmit(values: TimelineEventFormValues) {
    let attachmentAssetId: string | undefined
    let attachmentFileName: string | undefined
    let attachmentFileType: string | undefined

    if (attachmentFile) {
      attachmentAssetId = await uploadFile(orgId, attachmentFile)
      attachmentFileName = attachmentFile.name
      attachmentFileType = attachmentFile.type || 'application/octet-stream'
    } else if (!attachmentRemoved && defaultEvent?.attachment) {
      attachmentAssetId = defaultEvent.attachment.assetId
      attachmentFileName = defaultEvent.attachment.fileName
      attachmentFileType = defaultEvent.attachment.fileType
    }

    const input: GT.CreateTimelineEventInput = {
      type: values.type,
      title: values.title,
      summary: values.summary,
      eventDate: new Date(values.date).toISOString(),
      version:
        values.type === 'release' ? values.version || 'unversioned' : undefined,
      adrNumber:
        values.type === 'decision'
          ? values.adrNumber || 'ADR-manual'
          : undefined,
      decisionStatus:
        values.type === 'decision' ? values.status || 'accepted' : undefined,
      sourceLabel: values.sourceLabel || undefined,
      sourceUrl: values.sourceUrl || undefined,
      touches: values.touches.map((label) => ({
        id: label.toLowerCase().replace(/\s+/g, '-'),
        label,
        kind: 'service',
      })),
      attachmentAssetId,
      attachmentFileName,
      attachmentFileType,
    }

    await onSubmit(input)

    form.reset()
    setAttachmentFile(null)
    setAttachmentRemoved(false)
  }

  return (
    <BetterDialogContent
      title={mode === 'edit' ? 'Edit timeline event' : 'Add timeline event'}
      description={
        mode === 'edit'
          ? "Update this event's details."
          : "Manually log a release, decision, or incident that the automatic repo sync hasn't picked up yet."
      }
      footerCancel
      footerSubmit={mode === 'edit' ? 'Save changes' : 'Add event'}
      footerSubmitLoading={form.formState.isSubmitting}
      onFooterSubmitClick={form.handleSubmit(handleSubmit)}
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Controller
              name="type"
              control={form.control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => field.onChange(v as TimelineEventType)}
                >
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {TYPE_LABEL[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Controller
              name="date"
              control={form.control}
              render={({ field }) => <Input id="date" type="date" {...field} />}
            />
            {form.formState.errors.date && (
              <p className="text-sm text-red-500">
                {form.formState.errors.date.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Controller
            name="title"
            control={form.control}
            render={({ field }) => (
              <Input
                id="title"
                placeholder="Short, specific title"
                {...field}
              />
            )}
          />
          {form.formState.errors.title && (
            <p className="text-sm text-red-500">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>

        {type === 'release' ? (
          <div className="space-y-2">
            <Label htmlFor="version">Version</Label>
            <Controller
              name="version"
              control={form.control}
              render={({ field }) => (
                <Input id="version" placeholder="v1.0.0" {...field} />
              )}
            />
          </div>
        ) : null}

        {type === 'decision' ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adrNumber">ADR number</Label>
              <Controller
                name="adrNumber"
                control={form.control}
                render={({ field }) => (
                  <Input id="adrNumber" placeholder="ADR-042" {...field} />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DECISION_STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="summary">Summary</Label>
          <Controller
            name="summary"
            control={form.control}
            render={({ field }) => (
              <Textarea
                id="summary"
                placeholder="What happened, and why it matters"
                className="min-h-24 resize-none"
                {...field}
              />
            )}
          />
          {form.formState.errors.summary && (
            <p className="text-sm text-red-500">
              {form.formState.errors.summary.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sourceLabel">
              Source label{' '}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Controller
              name="sourceLabel"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="sourceLabel"
                  placeholder="e.g. CHANGELOG.md"
                  {...field}
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sourceUrl">
              Source URL{' '}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Controller
              name="sourceUrl"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="sourceUrl"
                  type="url"
                  placeholder="https://..."
                  {...field}
                />
              )}
            />
            {form.formState.errors.sourceUrl && (
              <p className="text-sm text-red-500">
                {form.formState.errors.sourceUrl.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>
            Attach a document{' '}
            <span className="text-muted-foreground">
              (optional — markdown, text, PDF, or image)
            </span>
          </Label>
          {attachmentFile || existingAttachment ? (
            <div className="border-stock bg-shading/60 flex items-center justify-between gap-2 rounded-md border px-3 py-2">
              <span className="text-foreground truncate text-sm">
                {attachmentFile?.name || existingAttachment?.fileName}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive size-7 shrink-0"
                onClick={() => {
                  setAttachmentFile(null)
                  setAttachmentRemoved(true)
                }}
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAttach}
            >
              <Upload className="size-4" />
              Upload file
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Touches{' '}
            <span className="text-muted-foreground">
              (services or nodes this affects)
            </span>
          </Label>
          <Controller
            name="touches"
            control={form.control}
            render={({ field }) => (
              <ComponentMetaThemeProvider theme="modal">
                <TagInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Type a service or node name and press Enter"
                />
              </ComponentMetaThemeProvider>
            )}
          />
        </div>
      </form>
    </BetterDialogContent>
  )
}

'use client'

import { uploadProjectFile } from '@/api'
import { UploadTopIcon } from '@/assets/svgs/component-icons'
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
import { useOrganizationContext } from '@/contexts'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { formatBytesToHumanReadable } from 'daily-code'
import { openFileExplorer } from 'daily-code/browser'
import { FileText, TrashIcon } from 'lucide-react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import z from 'zod'
import { useServiceContext } from '../../contexts/service-context'
import {
  DOCUMENT_FILE_TYPES,
  getDocumentFileTypeKey,
} from '../../helpers/doc-file'

export const configureServiceDocSchema = z.object({
  file: z.union([
    z.instanceof(File, { error: 'File is required' }),
    z.string().min(1, 'File is required'),
  ]),
  fileName: z.string().optional(),
  fileType: z.string().optional(),
  description: z.string().optional(),
})

type ServerData = Omit<z.infer<typeof configureServiceDocSchema>, 'file'> & {
  fileId: string
}

type ConfigureServiceDocModalProps = {
  mode: 'create' | 'update'
  defaultValues?: Partial<ServerData>
  onSubmit: SubmitHandler<ServerData>
}

export function ConfigureServiceDocModal({
  mode,
  defaultValues,
  onSubmit,
}: ConfigureServiceDocModalProps) {
  const { serviceId } = useServiceContext()
  const { organizationId } = useOrganizationContext()

  const form = useForm({
    resolver: zodResolver(configureServiceDocSchema),
    defaultValues: {
      file: defaultValues?.fileId ?? undefined,
      fileName: defaultValues?.fileName ?? undefined,
      fileType: defaultValues?.fileType ?? undefined,
      description: defaultValues?.description ?? undefined,
    },
  })

  async function handleSubmit(data: z.infer<typeof configureServiceDocSchema>) {
    try {
      const fileId =
        data.file instanceof File
          ? await uploadProjectFile(data.file, {
              orgId: organizationId,
              projectId: serviceId,
            })
          : data.file

      if (!fileId) {
        throw new Error('File ID is required')
      }

      await onSubmit({
        fileId,
        fileName: data.fileName,
        fileType: data.fileType,
        description: data.description,
      })
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  return (
    <BetterDialogContent
      title={
        mode === 'create' ? 'Upload Documentation' : 'Update Documentation'
      }
      description={
        mode === 'create'
          ? 'Upload PDF, README, HTML, or other documentation files.'
          : 'Update documentation file and metadata.'
      }
      footerSubmit={mode === 'create' ? 'Upload' : 'Update'}
      footerSubmitLoading={form.formState.isSubmitting}
      onFooterSubmitClick={form.handleSubmit(handleSubmit)}
      footerCancel
    >
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
        id="configure-service-doc-form"
      >
        <div className="space-y-2">
          <Label htmlFor="file" className="text-sm font-normal">
            Documentation File
          </Label>
          <Controller
            name="file"
            control={form.control}
            render={({ field }) => (
              <LocalFileInput
                accept=".pdf,.md,.markdown,.html,.txt"
                file={field.value instanceof File ? field.value : null}
                onChange={(file) => {
                  field.onChange(file)

                  if (file && !form.getValues('fileName')) {
                    const name = file.name.split('.')[0]
                    form.setValue('fileName', name)
                  }

                  if (file && !form.getValues('fileType')) {
                    const extension = file.name.split('.').pop()?.toLowerCase()
                    if (extension) {
                      form.setValue(
                        'fileType',
                        getDocumentFileTypeKey(extension)
                      )
                    }
                  }
                }}
              />
            )}
          />
          {defaultValues?.fileId && (
            <p className="text-xs text-gray-500">
              Current file: {defaultValues.fileName || 'File uploaded'}
            </p>
          )}
          {form.formState.errors.file && (
            <p className="text-sm text-red-500">
              {form.formState.errors.file.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fileName" className="text-sm font-normal">
            Display Name
          </Label>
          <Controller
            name="fileName"
            control={form.control}
            render={({ field }) => (
              <Input
                id="fileName"
                placeholder="e.g. API Documentation v1.0"
                className={cn(
                  'h-[56px] rounded-[16px] border border-[#E5E7E9] bg-white px-6 focus:outline-none',
                  form.formState.errors.fileName && 'border-red-500'
                )}
                {...field}
              />
            )}
          />
          {form.formState.errors.fileName && (
            <p className="text-sm text-red-500">
              {form.formState.errors.fileName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fileType" className="text-sm font-normal">
            File Type
          </Label>
          <Controller
            name="fileType"
            control={form.control}
            render={({ field }) => (
              <Select
                value={field.value ?? ''}
                onValueChange={(v) => field.onChange(v)}
              >
                <SelectTrigger
                  {...field}
                  id="fileType"
                  className={cn(
                    'h-[56px]! w-full rounded-[16px] border border-[#E5E7E9] bg-white px-6 focus:outline-none',
                    form.formState.errors.fileType && 'border-red-500'
                  )}
                >
                  <SelectValue placeholder="Select a file type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_FILE_TYPES.map(({ key, label }) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-normal">
            Description
          </Label>
          <Controller
            name="description"
            control={form.control}
            render={({ field }) => (
              <Textarea
                id="description"
                placeholder="Brief description of this documentation..."
                className={cn(
                  'min-h-[100px] rounded-[16px] border border-[#E5E7E9] bg-white px-6 py-4 focus:outline-none',
                  form.formState.errors.description && 'border-red-500'
                )}
                {...field}
              />
            )}
          />
        </div>
      </form>
    </BetterDialogContent>
  )
}

function LocalFileInput({
  file,
  accept,
  onChange,
}: {
  accept: string
  file: File | null
  onChange: (file: File | null) => void
}) {
  return (
    <div className="relative">
      {file && (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onChange(null)}
          className="text-destructive hover:text-destructive/80 hover:bg-destructive/20 absolute top-1 right-1 rounded-full"
        >
          <TrashIcon className="size-4" />
        </Button>
      )}

      <button
        type="button"
        className="border-primary/20 flex h-[8.75rem] w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed bg-white p-6"
        onClick={async () => {
          const [file] = await openFileExplorer({ accept })
          onChange(file)
        }}
      >
        {file ? (
          <div className="flex flex-col items-center gap-2">
            <FileText className="size-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500">
                {formatBytesToHumanReadable(file.size).text}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex h-11 flex-col items-center gap-1">
              <UploadTopIcon className={'text-primary text-2xl'} />
              <label className={'text-primary/80 text-xs'}>Upload File</label>
            </div>

            <p className={'text-paragraph/80 text-xs'}>Supports {accept}</p>
          </>
        )}
      </button>
    </div>
  )
}

'use client'

import { apolloClientGQL } from '@/api/client'
import { UploadTopIcon } from '@/assets/svgs/component-icons'
import { BetterDialogContent } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { formatBytesToHumanReadable } from 'daily-code'
import { openFileExplorer } from 'daily-code/browser'
import {
  FileText,
  Link2Icon,
  Loader2,
  PencilLineIcon,
  TrashIcon,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { CREATE_ML_ARTIFACT, UPDATE_ML_ARTIFACT } from '../../api/artifacts'
import { resolveLink } from '../../api/resolve-link'
import {
  ARTIFACT_TYPE_SUGGESTIONS,
  artifactTypeFromName,
  filenameFromUrl,
  formatFromName,
} from '../../lib/artifact-metadata'
import type { Artifact } from '../../types'

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

const inputClass =
  'h-[56px] rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none'

const metadataSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  format: z.string(),
  size: z.string(),
  uri: z.string(),
  downloadUri: z.string(),
})

type MetadataFormValues = z.infer<typeof metadataSchema>

type Mode = 'upload' | 'link' | 'manual'

const emptyValues: MetadataFormValues = {
  name: '',
  type: '',
  format: '',
  size: '',
  uri: '',
  downloadUri: '',
}

export function ArtifactModal({
  onClose,
  runId,
  artifact,
}: {
  onClose: () => void
  runId: string
  artifact?: Artifact | null
}) {
  const orgId = useCurrentOrganization()?.id
  const isEdit = !!artifact

  const [step, setStep] = useState<'source' | 'metadata'>(
    isEdit ? 'metadata' : 'source'
  )
  const [mode, setMode] = useState<Mode>('manual')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkError, setLinkError] = useState<string | null>(null)
  const [resolving, setResolving] = useState(false)
  const [uploadPercent, setUploadPercent] = useState<number | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

  const [createArtifact] = useMutation(CREATE_ML_ARTIFACT, {
    refetchQueries: ['MlStudioRunArtifacts', 'MlStudioArtifacts'],
    awaitRefetchQueries: true,
  })
  const [updateArtifact] = useMutation(UPDATE_ML_ARTIFACT, {
    refetchQueries: ['MlStudioRunArtifacts', 'MlStudioArtifacts'],
    awaitRefetchQueries: true,
  })

  const form = useForm<MetadataFormValues>({
    resolver: zodResolver(metadataSchema),
    defaultValues: artifact
      ? {
          name: artifact.name,
          type: artifact.type,
          format: artifact.format,
          size: artifact.size,
          uri: artifact.uri,
          downloadUri: artifact.downloadUri,
        }
      : emptyValues,
  })
  const { control, handleSubmit, formState, reset, setValue, watch } = form

  function pickFile(picked: File | null) {
    if (!picked) {
      setFile(null)
      setFileError(null)
      return
    }
    if (picked.size > MAX_UPLOAD_BYTES) {
      setFile(null)
      setFileError('File must be 5MB or smaller')
      return
    }
    setFileError(null)
    setFile(picked)
    reset({
      name: picked.name,
      type: artifactTypeFromName(picked.name),
      format: formatFromName(picked.name),
      size: formatBytesToHumanReadable(picked.size).text,
      uri: '',
      downloadUri: '',
    })
    setStep('metadata')
  }

  async function startLinkResolve() {
    const url = linkUrl.trim()
    if (!url) {
      setLinkError('Enter a URL')
      return
    }
    setLinkError(null)

    const controller = new AbortController()
    controllerRef.current = controller
    setResolving(true)
    try {
      const resolved = await resolveLink(url, controller.signal)
      reset({
        name: resolved.name,
        type: resolved.type,
        format: resolved.format,
        size:
          resolved.sizeBytes !== null
            ? formatBytesToHumanReadable(resolved.sizeBytes).text
            : '',
        uri: url,
        downloadUri: url,
      })
      setStep('metadata')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }
      toast.error('Could not read that link — fill in the details manually.')
      const name = filenameFromUrl(url)
      reset({
        name,
        type: artifactTypeFromName(name),
        format: formatFromName(name),
        size: '',
        uri: url,
        downloadUri: url,
      })
      setStep('metadata')
    } finally {
      setResolving(false)
      controllerRef.current = null
    }
  }

  async function uploadArtifact(values: MetadataFormValues) {
    if (!file || !orgId) {
      return
    }
    const body = new FormData()
    body.append('file', file)
    body.append('name', values.name)
    body.append('type', values.type)
    body.append('size', values.size)
    body.append('format', values.format)

    const controller = new AbortController()
    controllerRef.current = controller
    setUploadPercent(0)
    try {
      const token = window.localStorage.getItem('uigraph_token')
      await axios.post(
        `/api/v1/orgs/${orgId}/ml/runs/${runId}/artifacts/upload`,
        body,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          signal: controller.signal,
          onUploadProgress: (event) => {
            if (event.total) {
              setUploadPercent(Math.round((event.loaded / event.total) * 100))
            }
          },
        }
      )
      await apolloClientGQL.refetchQueries({
        include: ['MlStudioRunArtifacts', 'MlStudioArtifacts'],
      })
      onClose()
    } catch (err) {
      if (axios.isCancel(err)) {
        return
      }
      toast.error('Upload failed.')
    } finally {
      setUploadPercent(null)
      controllerRef.current = null
    }
  }

  async function onSubmit(values: MetadataFormValues) {
    if (!orgId) {
      return
    }

    if (isEdit && artifact) {
      await updateArtifact({
        variables: {
          orgId,
          id: artifact.id,
          input: {
            name: values.name,
            type: values.type,
            uri: values.uri,
            downloadUri: values.downloadUri,
            size: values.size,
            format: values.format,
          },
        },
      })
      onClose()
      return
    }

    if (mode === 'upload') {
      await uploadArtifact(values)
      return
    }

    await createArtifact({
      variables: {
        orgId,
        runId,
        input: {
          name: values.name,
          type: values.type,
          uri: values.uri,
          downloadUri: values.downloadUri,
          size: values.size,
          format: values.format,
        },
      },
    })
    onClose()
  }

  const uploading = uploadPercent !== null
  const busy = formState.isSubmitting || uploading

  const footer = (
    <div className="flex w-full flex-row items-center justify-end gap-3 p-6 pt-3">
      {step === 'metadata' && !isEdit && (
        <Button
          preset="outline"
          disabled={busy}
          onClick={() => setStep('source')}
        >
          Back
        </Button>
      )}

      {resolving || uploading ? (
        <Button preset="outline" onClick={() => controllerRef.current?.abort()}>
          Cancel
        </Button>
      ) : (
        <Button preset="outline" onClick={onClose}>
          Cancel
        </Button>
      )}

      {step === 'source' && mode === 'link' && (
        <Button
          preset="primary"
          disabled={resolving}
          onClick={startLinkResolve}
        >
          {resolving && <Loader2 className="size-4 animate-spin" />}
          Next
        </Button>
      )}

      {step === 'source' && mode === 'manual' && (
        <Button
          preset="primary"
          onClick={() => {
            reset(emptyValues)
            setStep('metadata')
          }}
        >
          Next
        </Button>
      )}

      {step === 'metadata' && (
        <Button
          preset="primary"
          disabled={busy}
          onClick={handleSubmit(onSubmit)}
        >
          {busy && <Loader2 className="size-4 animate-spin" />}
          {isEdit ? 'Save changes' : 'Add artifact'}
        </Button>
      )}
    </div>
  )

  return (
    <BetterDialogContent
      title={isEdit ? 'Edit artifact' : 'Add artifact'}
      description={
        step === 'source'
          ? 'Upload a file, share a link, or enter the details by hand.'
          : 'Review the details before attaching this artifact to the run.'
      }
      _footerContent={footer}
    >
      {step === 'source' && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-3">
            <SourceCard
              active={mode === 'upload'}
              icon={<UploadTopIcon className="text-primary text-2xl" />}
              label="Upload File"
              description="Up to 5MB"
              onClick={() => setMode('upload')}
            />
            <SourceCard
              active={mode === 'link'}
              icon={<Link2Icon className="text-primary size-6" />}
              label="Link"
              description="Share a URL"
              onClick={() => setMode('link')}
            />
            <SourceCard
              active={mode === 'manual'}
              icon={<PencilLineIcon className="text-primary size-6" />}
              label="Manual"
              description="Enter details"
              onClick={() => setMode('manual')}
            />
          </div>

          {mode === 'upload' && (
            <div className="flex flex-col gap-2">
              <LocalFileInput file={file} onChange={pickFile} />
              {fileError && <p className="text-sm text-red-400">{fileError}</p>}
            </div>
          )}

          {mode === 'link' && (
            <div className="flex flex-col gap-2">
              <label className="text-sm text-[#B4BECE]">URL</label>
              <Input
                placeholder="https://example.com/model.onnx"
                className={inputClass}
                value={linkUrl}
                disabled={resolving}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
              {linkError && <p className="text-sm text-red-400">{linkError}</p>}
              {resolving && (
                <p className="text-sm text-[#828DA3]">
                  Reading the link — this can take a moment.
                </p>
              )}
            </div>
          )}

          {mode === 'manual' && (
            <p className="text-sm text-[#586378]">
              Continue to enter the filename, size, format, and type yourself.
            </p>
          )}
        </div>
      )}

      {step === 'metadata' && (
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="model.onnx"
                      className={inputClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Model checkpoint"
                      className={inputClass}
                      {...field}
                    />
                  </FormControl>
                  <div className="flex flex-wrap gap-1.5">
                    {ARTIFACT_TYPE_SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setValue('type', suggestion)}
                        className={
                          watch('type') === suggestion
                            ? 'border-primary/40 text-primary rounded-md border bg-[#1E2533] px-2 py-1 text-xs'
                            : 'border-stock rounded-md border bg-[#1E2533] px-2 py-1 text-xs text-[#828DA3] hover:text-[#F4F7FC]'
                        }
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Format</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ONNX"
                        className={inputClass}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="12.4 MB"
                        className={inputClass}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {mode !== 'upload' && (
              <>
                <FormField
                  control={control}
                  name="uri"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URI</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="s3://bucket/path/model.onnx"
                          className={`${inputClass} font-mono text-sm`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="downloadUri"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Download URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/model.onnx"
                          className={`${inputClass} font-mono text-sm`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {uploading && (
              <div className="flex flex-col gap-2">
                <Progress value={uploadPercent} />
                <p className="text-xs text-[#828DA3]">
                  Uploading — {uploadPercent}%
                </p>
              </div>
            )}
          </form>
        </Form>
      )}
    </BetterDialogContent>
  )
}

function SourceCard({
  active,
  icon,
  label,
  description,
  onClick,
}: {
  active: boolean
  icon: React.ReactNode
  label: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'border-primary flex flex-col items-center justify-center gap-2 rounded-2xl border-2 bg-[#141925] p-5'
          : 'flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-[#2A3242] bg-[#141925] p-5 hover:border-[#3A4457]'
      }
    >
      {icon}
      <span className="text-sm font-medium text-[#F4F7FC]">{label}</span>
      <span className="text-xs text-[#828DA3]">{description}</span>
    </button>
  )
}

function LocalFileInput({
  file,
  onChange,
}: {
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
        className="border-primary/20 flex h-[8.75rem] w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed bg-[#141925] p-6"
        onClick={async () => {
          const [picked] = await openFileExplorer({ accept: '*/*' })
          onChange(picked ?? null)
        }}
      >
        {file ? (
          <div className="flex flex-col items-center gap-2">
            <FileText className="size-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-[#F4F7FC]">{file.name}</p>
              <p className="text-xs text-[#828DA3]">
                {formatBytesToHumanReadable(file.size).text}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex h-11 flex-col items-center gap-1">
              <UploadTopIcon className="text-primary text-2xl" />
              <label className="text-primary/80 text-xs">Upload File</label>
            </div>

            <p className="text-paragraph/80 text-xs">Any file up to 5MB</p>
          </>
        )}
      </button>
    </div>
  )
}

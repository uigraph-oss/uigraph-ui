import { uploadProjectFile } from '@/api'
import { OpenApiIcon } from '@/assets/svgs'
import { BetterDialogContent } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useOrganizationContext } from '@/contexts'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { formatBytesToHumanReadable } from 'daily-code'
import { openFileExplorer } from 'daily-code/browser'
import { Code2, FileText } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'

type ImportSource = 'openapi' | 'graphql' | 'grpc'

const configureApiGroupSchema = z.object({
  name: z.string().min(1, 'API Group Name is required'),
  specFile: z.instanceof(File).optional(),
  specFileId: z.string().optional(),
})

type ConfigureApiGroupModalProps = {
  mode: 'create' | 'update' | 'publish'
  defaultValues?: {
    name?: string
    openApiSpecFileId?: string
    swaggerSpecFileId?: string
    graphqlSpecFileIds?: string[]
    grpcSpecFileIds?: string[]
  }
  onSubmit: (data: {
    name: string
    openApiSpecFileId?: string
    swaggerSpecFileId?: string
    graphqlSpecFileIds?: string[]
    grpcSpecFileIds?: string[]
  }) => Promise<void>
}

export function ConfigureApiGroupModal({
  mode,
  defaultValues,
  onSubmit,
}: ConfigureApiGroupModalProps) {
  const { organizationId } = useOrganizationContext()

  const initialImportSource: ImportSource =
    defaultValues?.openApiSpecFileId || defaultValues?.swaggerSpecFileId
      ? 'openapi'
      : 'openapi'

  const [importSource, setImportSource] =
    useState<ImportSource>(initialImportSource)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [nameBlurred, setNameBlurred] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [existingFileId, setExistingFileId] = useState<string | undefined>(
    defaultValues?.openApiSpecFileId || defaultValues?.swaggerSpecFileId
  )

  const form = useForm({
    resolver: zodResolver(configureApiGroupSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      specFile: undefined,
    },
    mode: 'onBlur',
  })

  const name = form.watch('name')
  const nameError = form.formState.errors.name

  function getAcceptedExtensions(): string {
    switch (importSource) {
      case 'openapi':
        return '.json,.yml,.yaml'
      case 'graphql':
        return '.graphql,.gql,.graphqls'
      case 'grpc':
        return '.proto'
      default:
        return '.json'
    }
  }

  function getDropzoneSecondaryText(): string {
    switch (importSource) {
      case 'openapi':
        return 'Supports .json, .yml, .yaml (OpenAPI 3.x or Swagger 2.0)'
      case 'graphql':
        return 'Supports .graphql, .gql, .graphqls'
      case 'grpc':
        return 'Supports .proto'
      default:
        return 'Supports .json'
    }
  }

  async function handleFileSelect() {
    setFileError(null)

    const allowMultiple = importSource === 'graphql' || importSource === 'grpc'

    const files = await openFileExplorer({
      accept: getAcceptedExtensions(),
      multiple: allowMultiple,
    })

    if (files && files.length > 0) {
      if (allowMultiple && uploadedFiles.length > 0) {
        setUploadedFiles((prev) => [...prev, ...Array.from(files)])
      } else {
        setUploadedFiles(Array.from(files))
      }
      form.setValue('specFile', files[0])
    }
  }

  function handleRemoveFile(index?: number) {
    if (index !== undefined) {
      setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
    } else {
      setUploadedFiles([])
      setExistingFileId(undefined)
      form.setValue('specFile', undefined)
    }
    setFileError(null)
  }

  async function handleSubmit(data: z.infer<typeof configureApiGroupSchema>) {
    if (uploadedFiles.length === 0 && mode === 'create') {
      setFileError('Please upload an API spec file.')
      return
    }

    try {
      setIsUploading(true)

      const submitData: {
        name: string
        openApiSpecFileId?: string
        swaggerSpecFileId?: string
        graphqlSpecFileIds?: string[]
        grpcSpecFileIds?: string[]
      } = {
        name: data.name.trim(),
      }

      switch (importSource) {
        case 'openapi': {
          const file = uploadedFiles[0]
          if (file) {
            const fileId = await uploadProjectFile(uploadedFiles[0], {
              orgId: organizationId,
              projectId: '123',
            })

            submitData.openApiSpecFileId = fileId
          }

          break
        }
        case 'graphql': {
          const fileIds: string[] = []
          for (const file of uploadedFiles) {
            const fileId = await uploadProjectFile(file, {
              orgId: organizationId,
              projectId: '123',
            })
            fileIds.push(fileId)
          }
          submitData.graphqlSpecFileIds = fileIds
          break
        }
        case 'grpc': {
          const fileIds: string[] = []
          for (const file of uploadedFiles) {
            const fileId = await uploadProjectFile(file, {
              orgId: organizationId,
              projectId: '123',
            })
            fileIds.push(fileId)
          }
          submitData.grpcSpecFileIds = fileIds
          break
        }
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error(error)
      setFileError('Failed to upload file. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <BetterDialogContent
      title={
        mode === 'create'
          ? 'Create API Group'
          : mode === 'update'
            ? 'Edit API Group'
            : mode === 'publish'
              ? 'Publish API Group'
              : null
      }
      description="Import an API specification to describe how this group behaves."
      footerSubmit={
        mode === 'create'
          ? 'Create API Group'
          : mode === 'update'
            ? 'Save Changes'
            : mode === 'publish'
              ? 'Publish API Group'
              : null
      }
      footerSubmitLoading={form.formState.isSubmitting || isUploading}
      onFooterSubmitClick={form.handleSubmit(handleSubmit)}
      footerCancel="Cancel"
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-normal">
            API Group Name
          </Label>
          <Controller
            name="name"
            control={form.control}
            render={({ field }) => {
              const { onBlur, ...restField } = field
              return (
                <Input
                  id="name"
                  placeholder="e.g. uigraph-adapter-openapi, public, internal"
                  autoCorrect="off"
                  autoComplete="off"
                  autoCapitalize="off"
                  disabled={isUploading}
                  className={cn(
                    'h-[56px] rounded-[16px] border border-[#E5E7E9] bg-white px-6 focus:outline-none',
                    (nameError || (nameBlurred && !name.trim())) &&
                      'border-red-500'
                  )}
                  {...restField}
                  onBlur={() => {
                    setNameBlurred(true)
                    onBlur()
                  }}
                />
              )
            }}
          />
          <p className="text-xs text-[#939395]">
            Used to group endpoints (e.g. uigraph-adapter-openapi, public,
            internal).
          </p>
          {(nameError || (nameBlurred && !name.trim())) && (
            <p className="text-sm text-red-500">
              {nameError?.message || 'API Group Name is required.'}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-sm font-normal">
              Import API Specification
            </Label>
            <p className="mt-1 text-xs text-[#939395]">Upload one source.</p>
          </div>

          <ToggleGroup
            type="single"
            value={importSource}
            onValueChange={(value) => {
              if (value) {
                setImportSource(value as ImportSource)
                if (uploadedFiles.length > 0) {
                  handleRemoveFile()
                }
              }
            }}
            variant="outline"
            className="w-full shadow-none!"
            disabled={isUploading}
          >
            <ToggleGroupItem
              value="openapi"
              className="flex-1"
              aria-label="OpenAPI"
            >
              <div className="flex items-center gap-2">
                <OpenApiIcon className="h-4 w-4" />
                <span>OpenAPI</span>
              </div>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="graphql"
              className="flex-1"
              aria-label="GraphQL Schema"
            >
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                <span>GraphQL Schema</span>
              </div>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="grpc"
              className="flex-1"
              aria-label="gRPC Protobuf"
            >
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                <span>gRPC Protobuf</span>
              </div>
            </ToggleGroupItem>
          </ToggleGroup>

          {(uploadedFiles.length > 0 || existingFileId) && (
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-[#E5E7E9] bg-white p-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatBytesToHumanReadable(file.size).text}
                        {uploadedFiles.length > 1 &&
                          ` • File ${index + 1} of ${uploadedFiles.length}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      disabled={isUploading}
                      className="h-8 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {uploadedFiles.length === 0 && !existingFileId && (
            <button
              type="button"
              onClick={handleFileSelect}
              disabled={isUploading}
              className={cn(
                'flex h-[8.75rem] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-white p-6 transition-colors',
                fileError
                  ? 'border-red-300 bg-red-50'
                  : 'hover:border-primary/40 border-[#E5E7E9] hover:bg-gray-50',
                isUploading && 'cursor-not-allowed opacity-50'
              )}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-11 flex-col items-center justify-center">
                  <FileText className="text-primary h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-gray-900">
                  Drag & drop or click to upload
                </p>
              </div>
              <p className="text-xs text-gray-500">
                {getDropzoneSecondaryText()}
                {(importSource === 'graphql' || importSource === 'grpc') &&
                  ' (select multiple files at once)'}
              </p>
            </button>
          )}

          {uploadedFiles.length > 0 &&
            (importSource === 'graphql' || importSource === 'grpc') && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  preset="outline"
                  onClick={handleFileSelect}
                  className="flex-1"
                >
                  <FileText className="h-4 w-4" />
                  Add more files
                </Button>
                <Button
                  type="button"
                  preset="ghost"
                  onClick={() => setUploadedFiles([])}
                >
                  Clear all
                </Button>
              </div>
            )}

          {fileError && <p className="text-sm text-red-500">{fileError}</p>}
        </div>
      </form>
    </BetterDialogContent>
  )
}

import { Button } from '@/components/ui/button'
import { FlowDiagramPreview } from '@/features/diagram-portal/flow-diagram-preview'
import { ServerDiagramData } from '@/features/diagram-portal/types/diagram'
import { SchemaAST } from '@uigraph/sdk'
import { AlertCircle, CheckCircle, FileText } from 'lucide-react'

export interface AttachedFileSchema {
  file: File
  ast: SchemaAST | null
  isProcessing: boolean
  reactFlowData: Pick<
    ServerDiagramData,
    'nodes' | 'edges' | 'dataSources'
  > | null
}

export function SchemaUploadDiagramSection({
  attachedSchema,
}: {
  attachedSchema: AttachedFileSchema
}) {
  return (
    <div className="flex aspect-square w-full">
      <FlowDiagramPreview
        name={'Untitled Diagram'}
        data={{
          nodes: attachedSchema.reactFlowData?.nodes || [],
          edges: attachedSchema.reactFlowData?.edges || [],
          dataSources: attachedSchema.reactFlowData?.dataSources || [],
          components: [],
          viewport: null,
        }}
      />
    </div>
  )
}

export function SchemaUploadSchemaSection({
  attachedSchema,
  triggerFileSelect,
}: {
  attachedSchema: AttachedFileSchema
  triggerFileSelect: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <h4 className="mb-2 text-sm font-medium">Tables Found:</h4>
        <div className="space-y-1">
          {attachedSchema?.ast?.tables.map((table, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-sm text-[#828DA3]"
            >
              <span className="font-mono">{table.name}</span>
              <span className="text-xs text-[#828DA3]">
                {table.columns.length} columns
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-green-200 bg-green-50 p-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <FileText className="h-12 w-12 text-green-600" />
          <div>
            <p className="font-medium text-[#F4F7FC]">
              {attachedSchema.file.name}
            </p>
            <p className="text-sm text-[#828DA3]">
              {(attachedSchema.file.size / 1024).toFixed(2)} KB
            </p>
          </div>
          <Button
            type="button"
            preset="outline"
            onClick={triggerFileSelect}
            className="bg-white/10"
          >
            Choose Different File
          </Button>
        </div>
      </div>

      {attachedSchema?.ast && (
        <div
          className={`rounded-lg p-4 ${
            attachedSchema.ast.tables.length > 0
              ? 'border border-green-200 bg-green-50'
              : 'border border-red-200 bg-red-50'
          }`}
        >
          <div className="flex items-start gap-3">
            {attachedSchema.ast.tables.length > 0 ? (
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            )}
            <div className="flex-1">
              <h4
                className={`font-medium ${
                  attachedSchema.ast.tables.length > 0
                    ? 'text-green-900'
                    : 'text-red-900'
                }`}
              >
                {attachedSchema.ast.tables.length > 0
                  ? 'Schema Valid'
                  : 'Validation Failed'}
              </h4>
              {attachedSchema.ast.tables.length > 0 && attachedSchema.ast && (
                <p className="mt-1 text-sm text-green-700">
                  Found {attachedSchema.ast.tables.length} table(s)
                </p>
              )}
              {!(attachedSchema.ast.tables.length > 0) &&
                attachedSchema.ast.tables.length > 0 && (
                  <p className="mt-1 text-sm text-red-700">
                    No tables found in the schema
                  </p>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

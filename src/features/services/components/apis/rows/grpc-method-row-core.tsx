'use client'

import { GT } from '@/api'
import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'
import { flattenMetaData } from '@uigraph/sdk'
import { arrayNonNullable } from 'daily-code'
import { useMemo } from 'react'

export function GrpcMethodRowCore({
  onViewOpen,
  componentMeta,
  selected = false,
  actionsCell,
  additionalContent,
}: {
  onViewOpen: () => void
  componentMeta: GT.ComponentMeta
  selected?: boolean
  actionsCell?: React.ReactNode
  additionalContent?: React.ReactNode
}) {
  const parsedData = useMemo(() => {
    const fields = arrayNonNullable(componentMeta.componentModalFields)
    const flattened = flattenMetaData(fields, fields)

    const methodNameField = fields.find(
      (field) =>
        field?.label?.toLowerCase() === 'grpc method name' ||
        field?.label?.toLowerCase() === 'method name'
    )
    const serviceNameField = fields.find(
      (field) =>
        field?.label?.toLowerCase() === 'grpc service name' ||
        field?.label?.toLowerCase() === 'service name'
    )
    const requestTypeField = fields.find(
      (field) => field?.label?.toLowerCase() === 'request type'
    )
    const responseTypeField = fields.find(
      (field) => field?.label?.toLowerCase() === 'response type'
    )

    const rpcTypeField = fields.find(
      (field) =>
        field?.label?.toLowerCase() === 'grpc rpc type' ||
        field?.label?.toLowerCase() === 'streaming type' ||
        field?.label?.toLowerCase() === 'rpc type'
    )

    function mapRpcType(
      rpcType: string
    ):
      | 'UNARY'
      | 'SERVER_STREAMING'
      | 'CLIENT_STREAMING'
      | 'BIDIRECTIONAL_STREAMING' {
      const normalized = rpcType.toLowerCase()
      if (normalized === 'unary') return 'UNARY'
      if (normalized === 'server streaming') return 'SERVER_STREAMING'
      if (normalized === 'client streaming') return 'CLIENT_STREAMING'
      if (normalized === 'bidirectional streaming')
        return 'BIDIRECTIONAL_STREAMING'
      if (normalized === 'server_streaming') return 'SERVER_STREAMING'
      if (normalized === 'client_streaming') return 'CLIENT_STREAMING'
      if (normalized === 'bidirectional_streaming')
        return 'BIDIRECTIONAL_STREAMING'
      return 'UNARY'
    }

    return {
      methodName: methodNameField?.componentFieldId
        ? (flattened[methodNameField.componentFieldId] as string)
        : 'N/A',
      serviceName: serviceNameField?.componentFieldId
        ? (flattened[serviceNameField.componentFieldId] as string)
        : undefined,
      requestType: requestTypeField?.componentFieldId
        ? (flattened[requestTypeField.componentFieldId] as string)
        : undefined,
      responseType: responseTypeField?.componentFieldId
        ? (flattened[responseTypeField.componentFieldId] as string)
        : undefined,
      streamingType: rpcTypeField?.componentFieldId
        ? mapRpcType(flattened[rpcTypeField.componentFieldId] as string)
        : 'UNARY',
    }
  }, [componentMeta.componentModalFields])

  function getStreamingTypeColor(type?: string) {
    switch (type) {
      case 'UNARY':
        return 'bg-blue-500'
      case 'SERVER_STREAMING':
        return 'bg-green-500'
      case 'CLIENT_STREAMING':
        return 'bg-purple-500'
      case 'BIDIRECTIONAL_STREAMING':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <>
      <TableRow
        className={
          selected
            ? 'h-20 cursor-pointer bg-blue-50/60'
            : 'h-20 cursor-pointer hover:bg-slate-50'
        }
        onClick={onViewOpen}
      >
        <TableCell className="w-0 pl-4">
          <Badge
            variant="outline"
            className={`${getStreamingTypeColor(parsedData.streamingType)} text-white`}
          >
            {parsedData.streamingType}
          </Badge>
        </TableCell>

        <TableCell className="truncate whitespace-normal">
          <p className="line-clamp-1 font-mono text-sm font-semibold text-[#111827]">
            {parsedData.methodName || (
              <span className="text-paragraph/50">N/A</span>
            )}
          </p>
          {parsedData.requestType && parsedData.responseType && (
            <p className="text-muted-foreground line-clamp-1 font-mono text-xs">
              {parsedData.requestType} → {parsedData.responseType}
            </p>
          )}
        </TableCell>

        <TableCell className="w-0">
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-[10px]">
              gRPC
            </Badge>
          </div>
        </TableCell>

        <TableCell className="w-0" onClick={(e) => e.stopPropagation()}>
          {actionsCell}
        </TableCell>
      </TableRow>

      {additionalContent}
    </>
  )
}

'use client'

import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'
import { LegacyComponentMeta } from '@/features/services/api/api-adapters'
import { flattenMetaData } from '@uigraph/sdk'
import { arrayNonNullable } from 'daily-code'
import { useMemo } from 'react'

export function ApiEndPointRowCore({
  onViewOpen,
  componentMeta,
  actionsCell,
  additionalContent,
}: {
  onViewOpen: () => void
  componentMeta: LegacyComponentMeta
  actionsCell?: React.ReactNode
  additionalContent?: React.ReactNode
}) {
  const parsedData = useMemo(() => {
    const fields = arrayNonNullable(componentMeta.componentModalFields)

    const flattened = flattenMetaData(fields, fields)

    const urlComponentId = fields.find(
      (field) => field?.label?.toLowerCase() === 'url'
    )
    const labelComponentId = fields.find(
      (field) => field?.label?.toLowerCase() === 'label'
    )
    const methodComponentId = fields.find(
      (field) => field?.label?.toLowerCase() === 'method'
    )

    const protocolComponentId = fields.find(
      (field) => field?.label?.toLowerCase() === 'protocol'
    )

    const authenticationComponentId = fields.find(
      (field) => field?.label?.toLowerCase() === 'authentication'
    )

    const apiSourceTypeComponentId = fields.find(
      (field) => field?.label?.toLowerCase() === 'api source type'
    )

    return {
      url: urlComponentId?.componentFieldId
        ? flattened[urlComponentId?.componentFieldId]
        : null,

      label: labelComponentId?.componentFieldId
        ? flattened[labelComponentId?.componentFieldId]
        : null,

      method: methodComponentId?.componentFieldId
        ? flattened[methodComponentId?.componentFieldId]
        : null,

      protocol: protocolComponentId?.componentFieldId
        ? flattened[protocolComponentId?.componentFieldId]
        : null,

      authentication: authenticationComponentId?.componentFieldId
        ? flattened[authenticationComponentId?.componentFieldId]
        : null,

      apiSourceType: apiSourceTypeComponentId?.componentFieldId
        ? flattened[apiSourceTypeComponentId?.componentFieldId]
        : null,
    }
  }, [componentMeta.componentModalFields])

  return (
    <>
      <TableRow className="h-20 cursor-pointer" onClick={onViewOpen}>
        <TableCell className="w-0">
          <MethodBadge method={parsedData.method} />
        </TableCell>

        <TableCell className="truncate whitespace-normal">
          <p className="line-clamp-1" title={parsedData.url || 'N/A'}>
            {parsedData.url || <span className="text-paragraph/50">N/A</span>}
          </p>
          <p
            className="text-paragraph line-clamp-1 text-xs"
            title={parsedData.label || ''}
          >
            {parsedData.label}
          </p>
        </TableCell>

        <TableCell className="w-0">
          <div className="flex items-center gap-1">
            {arrayNonNullable([
              parsedData.protocol,
              parsedData.authentication,
              parsedData.apiSourceType,
            ])
              .filter(Boolean)
              .map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-[#1E2533] text-[10px] text-[#394150]"
                >
                  {tag}
                </Badge>
              ))}
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

function MethodBadge({ method }: { method: string }) {
  switch (method) {
    case 'GET':
      return (
        <Badge variant="outline" className="bg-blue-500 text-white">
          GET
        </Badge>
      )
    case 'POST':
      return (
        <Badge variant="outline" className="bg-green-500 text-white">
          POST
        </Badge>
      )
    case 'PUT':
      return (
        <Badge variant="outline" className="bg-orange-500 text-white">
          PUT
        </Badge>
      )
    case 'PATCH':
      return (
        <Badge variant="outline" className="bg-yellow-500 text-white">
          PATCH
        </Badge>
      )
    case 'DELETE':
      return (
        <Badge variant="outline" className="bg-red-500 text-white">
          DELETE
        </Badge>
      )
  }

  return (
    <Badge variant="outline" className="bg-gray-500 text-white">
      N/A
    </Badge>
  )
}

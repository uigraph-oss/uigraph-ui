'use client'

import { GT } from '@/api'
import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'
import { flattenMetaData } from '@uigraph/sdk'
import { arrayNonNullable } from 'daily-code'
import { useMemo } from 'react'

export function GraphQLOperationRowCore({
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

    const nameField = fields.find(
      (field) => field?.label?.toLowerCase() === 'name'
    )
    const signatureField = fields.find(
      (field) => field?.label?.toLowerCase() === 'signature'
    )
    const summaryField = fields.find(
      (field) => field?.label?.toLowerCase() === 'summary'
    )

    const kindField = fields.find(
      (field) =>
        field?.label?.toLowerCase() === 'graphql operation type' ||
        field?.label?.toLowerCase() === 'operation type' ||
        field?.label?.toLowerCase() === 'kind'
    )

    return {
      name: nameField?.componentFieldId
        ? (flattened[nameField.componentFieldId] as string)
        : 'N/A',
      signature: signatureField?.componentFieldId
        ? (flattened[signatureField.componentFieldId] as string)
        : undefined,
      summary: summaryField?.componentFieldId
        ? (flattened[summaryField.componentFieldId] as string)
        : undefined,
      kind: (kindField?.componentFieldId
        ? (flattened[kindField.componentFieldId] as string)
        : 'Query') as 'Query' | 'Mutation' | 'Subscription',
    }
  }, [componentMeta.componentModalFields])

  function getOperationTypeColor(kind: string) {
    switch (kind) {
      case 'Query':
        return 'bg-blue-500'
      case 'Mutation':
        return 'bg-green-500'
      case 'Subscription':
        return 'bg-purple-500'
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
            className={`${getOperationTypeColor(parsedData.kind)} text-white`}
          >
            {parsedData.kind}
          </Badge>
        </TableCell>

        <TableCell className="truncate whitespace-normal">
          <p className="line-clamp-1 font-mono text-sm font-semibold text-[#111827]">
            {parsedData.name || <span className="text-paragraph/50">N/A</span>}
          </p>
          {parsedData.signature && (
            <p className="text-muted-foreground line-clamp-1 font-mono text-xs">
              {parsedData.signature}
            </p>
          )}
          {parsedData.summary && !parsedData.signature && (
            <p className="text-muted-foreground line-clamp-1 text-xs">
              {parsedData.summary}
            </p>
          )}
        </TableCell>

        <TableCell className="w-0">
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-[10px]">
              GraphQL
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

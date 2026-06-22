'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { Badge } from '@/components/ui/badge'
import {
  LegacyApiEndpoint,
  LegacyComponentMeta,
} from '@/features/services/api/api-adapters'
import { BetterTabController, useBetterTabs } from '@/hooks/use-better-tabs'
import { flattenMetaData } from '@uigraph/sdk'
import { arrayNonNullable } from 'daily-code'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo } from 'react'
import { ConfigureApiEndpointConnections } from './configure-api-endpoint-connections'
import { ConfigureApiEndpointMeta } from './configure-api-endpoint-meta'
import { ConfigureApiEndpointSamples } from './configure-api-endpoint-samples'

type CompareApiEndpointDetailsModalProps = {
  protocol: string
  endpointA: {
    apiEndpoint?: LegacyApiEndpoint | null
    componentMeta?: LegacyComponentMeta | null
  } | null
  endpointB: {
    apiEndpoint?: LegacyApiEndpoint | null
    componentMeta?: LegacyComponentMeta | null
  } | null
}

export function CompareApiEndpointDetailsModal({
  protocol,
  endpointA,
  endpointB,
}: CompareApiEndpointDetailsModalProps) {
  const [control, drawerTab] = useBetterTabs([
    { id: 'meta', label: 'Meta' },
    { id: 'samples', label: 'Samples' },
    { id: 'connections', label: 'Connections' },
  ])

  const isGraphQL = protocol === 'graphql'
  const isGrpc = protocol === 'grpc'
  const isRest = protocol === 'rest'

  const componentMetaA = endpointA?.componentMeta
  const componentMetaB = endpointB?.componentMeta
  const apiEndpointA = endpointA?.apiEndpoint
  const apiEndpointB = endpointB?.apiEndpoint

  const titleA = useMemo(() => {
    if (!componentMetaA) return <span className="text-paragraph">N/A</span>
    if (isRest) {
      const fields = arrayNonNullable(componentMetaA.componentModalFields)
      const flattened = flattenMetaData(fields, fields)
      const methodField = fields.find(
        (field) => field?.label?.toLowerCase() === 'method'
      )
      const urlField = fields.find(
        (field) => field?.label?.toLowerCase() === 'url'
      )
      const method = methodField?.componentFieldId
        ? (flattened[methodField.componentFieldId] as string)
        : null
      const url = urlField?.componentFieldId
        ? (flattened[urlField.componentFieldId] as string)
        : null
      return method && url ? (
        <span className="flex items-center gap-2">
          <span className="font-semibold">{method}</span>
          <span>{url}</span>
        </span>
      ) : (
        <span className="text-paragraph">N/A</span>
      )
    }

    if (isGraphQL) {
      const fields = arrayNonNullable(componentMetaA.componentModalFields)
      const flattened = flattenMetaData(fields, fields)
      const nameField = fields.find(
        (field) => field?.label?.toLowerCase() === 'name'
      )
      const kindField = fields.find(
        (field) =>
          field?.label?.toLowerCase() === 'graphql operation type' ||
          field?.label?.toLowerCase() === 'operation type' ||
          field?.label?.toLowerCase() === 'kind'
      )
      const operationName = nameField?.componentFieldId
        ? (flattened[nameField.componentFieldId] as string)
        : 'N/A'
      const operationKind = (
        kindField?.componentFieldId
          ? (flattened[kindField.componentFieldId] as string)
          : 'Query'
      ) as 'Query' | 'Mutation' | 'Subscription'

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
        <span className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`${getOperationTypeColor(operationKind)} text-white`}
          >
            {operationKind}
          </Badge>
          <span className="font-semibold">{operationName}</span>
        </span>
      )
    }

    if (isGrpc) {
      const fields = arrayNonNullable(componentMetaA.componentModalFields)
      const flattened = flattenMetaData(fields, fields)
      const methodNameField = fields.find(
        (field) =>
          field?.label?.toLowerCase() === 'grpc method name' ||
          field?.label?.toLowerCase() === 'method name'
      )
      const rpcTypeField = fields.find(
        (field) =>
          field?.label?.toLowerCase() === 'grpc rpc type' ||
          field?.label?.toLowerCase() === 'streaming type' ||
          field?.label?.toLowerCase() === 'rpc type'
      )

      const methodName = methodNameField?.componentFieldId
        ? (flattened[methodNameField.componentFieldId] as string)
        : 'N/A'

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

      const streamingType = rpcTypeField?.componentFieldId
        ? mapRpcType(flattened[rpcTypeField.componentFieldId] as string)
        : 'UNARY'

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
        <span className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`${getStreamingTypeColor(streamingType)} text-white`}
          >
            {streamingType}
          </Badge>
          <span className="font-semibold">{methodName}</span>
        </span>
      )
    }

    return <span className="text-paragraph">N/A</span>
  }, [componentMetaA, isRest, isGraphQL, isGrpc])

  const titleB = useMemo(() => {
    if (!componentMetaB) return <span className="text-paragraph">N/A</span>
    if (isRest) {
      const fields = arrayNonNullable(componentMetaB.componentModalFields)
      const flattened = flattenMetaData(fields, fields)
      const methodField = fields.find(
        (field) => field?.label?.toLowerCase() === 'method'
      )
      const urlField = fields.find(
        (field) => field?.label?.toLowerCase() === 'url'
      )
      const method = methodField?.componentFieldId
        ? (flattened[methodField.componentFieldId] as string)
        : null
      const url = urlField?.componentFieldId
        ? (flattened[urlField.componentFieldId] as string)
        : null
      return method && url ? (
        <span className="flex items-center gap-2">
          <span className="font-semibold">{method}</span>
          <span>{url}</span>
        </span>
      ) : (
        <span className="text-paragraph">N/A</span>
      )
    }

    if (isGraphQL) {
      const fields = arrayNonNullable(componentMetaB.componentModalFields)
      const flattened = flattenMetaData(fields, fields)
      const nameField = fields.find(
        (field) => field?.label?.toLowerCase() === 'name'
      )
      const kindField = fields.find(
        (field) =>
          field?.label?.toLowerCase() === 'graphql operation type' ||
          field?.label?.toLowerCase() === 'operation type' ||
          field?.label?.toLowerCase() === 'kind'
      )
      const operationName = nameField?.componentFieldId
        ? (flattened[nameField.componentFieldId] as string)
        : 'N/A'
      const operationKind = (
        kindField?.componentFieldId
          ? (flattened[kindField.componentFieldId] as string)
          : 'Query'
      ) as 'Query' | 'Mutation' | 'Subscription'

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
        <span className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`${getOperationTypeColor(operationKind)} text-white`}
          >
            {operationKind}
          </Badge>
          <span className="font-semibold">{operationName}</span>
        </span>
      )
    }

    if (isGrpc) {
      const fields = arrayNonNullable(componentMetaB.componentModalFields)
      const flattened = flattenMetaData(fields, fields)
      const methodNameField = fields.find(
        (field) =>
          field?.label?.toLowerCase() === 'grpc method name' ||
          field?.label?.toLowerCase() === 'method name'
      )
      const rpcTypeField = fields.find(
        (field) =>
          field?.label?.toLowerCase() === 'grpc rpc type' ||
          field?.label?.toLowerCase() === 'streaming type' ||
          field?.label?.toLowerCase() === 'rpc type'
      )

      const methodName = methodNameField?.componentFieldId
        ? (flattened[methodNameField.componentFieldId] as string)
        : 'N/A'

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

      const streamingType = rpcTypeField?.componentFieldId
        ? mapRpcType(flattened[rpcTypeField.componentFieldId] as string)
        : 'UNARY'

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
        <span className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`${getStreamingTypeColor(streamingType)} text-white`}
          >
            {streamingType}
          </Badge>
          <span className="font-semibold">{methodName}</span>
        </span>
      )
    }

    return <span className="text-paragraph">N/A</span>
  }, [componentMetaB, isRest, isGraphQL, isGrpc])

  const descriptionA = useMemo(() => {
    if (!apiEndpointA) {
      return <span className="text-paragraph text-xs">N/A</span>
    }
    return (
      <span className="text-paragraph text-xs">
        Updated{' '}
        {apiEndpointA.updatedAt
          ? new Date(apiEndpointA.updatedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : apiEndpointA.createdAt
            ? new Date(apiEndpointA.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Jan 15, 2024'}
      </span>
    )
  }, [apiEndpointA])

  const descriptionB = useMemo(() => {
    if (!apiEndpointB) {
      return <span className="text-paragraph text-xs">N/A</span>
    }
    return (
      <span className="text-paragraph text-xs">
        Updated{' '}
        {apiEndpointB.updatedAt
          ? new Date(apiEndpointB.updatedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : apiEndpointB.createdAt
            ? new Date(apiEndpointB.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Jan 15, 2024'}
      </span>
    )
  }, [apiEndpointB])

  if (!componentMetaA || !componentMetaB || !apiEndpointA || !apiEndpointB) {
    return (
      <BetterDialogContent
        className="p-0"
        title="Compare Endpoints"
        description="Unable to compare endpoints - missing metadata"
      >
        <div className="p-6 text-center text-sm text-[#828DA3]">
          Endpoint metadata is missing. Please ensure both endpoints have
          complete metadata.
        </div>
      </BetterDialogContent>
    )
  }

  return (
    <BetterDialogContent
      className="p-3"
      title="Compare Endpoints"
      description="Compare endpoint details side by side"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="border-stock overflow-hidden rounded-[1rem] border bg-[#141925]">
          <div className="border-b bg-[#141925] px-6 py-4">
            <div className="mb-2">{titleA}</div>
            {descriptionA}
          </div>
          <div className="sticky top-[-12px] px-6 py-2">
            <BetterTabController control={control} className="shadow-sm" />
          </div>
          <div>
            <AnimatePresence mode="sync">
              {drawerTab === 'meta' && (
                <motion.div
                  key="meta"
                  exit={{ opacity: 0, height: 0 }}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <ConfigureApiEndpointMeta
                    readonly
                    endpoint={apiEndpointA}
                    componentMeta={componentMetaA}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="sync">
              {drawerTab === 'samples' && (
                <motion.div
                  key="samples"
                  exit={{ opacity: 0, height: 0 }}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <ConfigureApiEndpointSamples
                    readonly
                    endpoint={apiEndpointA}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="sync">
              {drawerTab === 'connections' && (
                <motion.div
                  key="connections"
                  exit={{ opacity: 0, height: 0 }}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <ConfigureApiEndpointConnections
                    readonly
                    endpoint={apiEndpointA}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="border-stock overflow-hidden rounded-[1rem] border bg-[#141925]">
          <div className="border-b bg-[#141925] px-6 py-4">
            <div className="mb-2">{titleB}</div>
            {descriptionB}
          </div>
          <div className="sticky top-[-12px] px-6 py-2">
            <BetterTabController control={control} className="shadow-sm" />
          </div>
          <div>
            <AnimatePresence mode="sync">
              {drawerTab === 'meta' && (
                <motion.div
                  key="meta"
                  exit={{ opacity: 0, height: 0 }}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <ConfigureApiEndpointMeta
                    readonly
                    endpoint={apiEndpointB}
                    componentMeta={componentMetaB}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="sync">
              {drawerTab === 'samples' && (
                <motion.div
                  key="samples"
                  exit={{ opacity: 0, height: 0 }}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <ConfigureApiEndpointSamples
                    readonly
                    endpoint={apiEndpointB}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="sync">
              {drawerTab === 'connections' && (
                <motion.div
                  key="connections"
                  exit={{ opacity: 0, height: 0 }}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <ConfigureApiEndpointConnections
                    readonly
                    endpoint={apiEndpointB}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </BetterDialogContent>
  )
}

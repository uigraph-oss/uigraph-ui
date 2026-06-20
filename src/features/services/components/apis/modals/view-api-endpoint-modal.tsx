import { BetterDialogContent } from '@/components/better-dialog'
import { useComponentField } from '@/features/diagram-portal/hooks/use-component-field'
import {
  LegacyApiEndpoint,
  LegacyComponentMeta,
} from '@/features/services/api/api-v2-adapters'
import { BetterTabController, useBetterTabs } from '@/hooks/use-better-tabs'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo } from 'react'
import { ConfigureApiEndpointConnections } from '../configure-api-endpoint-connections'
import { ConfigureApiEndpointMeta } from '../configure-api-endpoint-meta'
import { ConfigureApiEndpointSamples } from '../configure-api-endpoint-samples'
import {
  EndpointSchemaView,
  type EndpointSchemaData,
} from '../endpoint-schema-view'

export function ViewApiEndpointModal({
  endpoint,
  componentMeta,
  readonly = false,
}: {
  endpoint: LegacyApiEndpoint
  componentMeta: LegacyComponentMeta
  readonly?: boolean
}) {
  const fields = componentMeta.componentModalFields

  const method = useComponentField<string>(fields, { label: 'Method' })
  const url = useComponentField<string>(fields, { label: 'URL' })

  // Schema documentation fields
  const requestSchema = useComponentField<string>(fields, {
    label: 'Request Schema',
  })
  const responseSchema = useComponentField<string>(fields, {
    label: 'Response Schema',
  })
  const statusCodes = useComponentField<string>(fields, {
    label: 'Status Codes',
  })
  const parameters = useComponentField<string>(fields, {
    label: 'Parameters',
  })
  const tags = useComponentField<string>(fields, { label: 'Tags' })
  const deprecated = useComponentField<string>(fields, {
    label: 'Deprecated',
  })
  const description = useComponentField<string>(fields, {
    label: 'Notes',
  })

  const schemaData: EndpointSchemaData = useMemo(
    () => ({
      requestSchema,
      responseSchema,
      statusCodes,
      parameters,
      tags,
      deprecated,
      description,
    }),
    [
      requestSchema,
      responseSchema,
      statusCodes,
      parameters,
      tags,
      deprecated,
      description,
    ]
  )

  // Only show schema tab if there's meaningful schema data
  const hasSchemaData =
    requestSchema || responseSchema || statusCodes || parameters

  const tabs = useMemo(() => {
    const base = [
      { id: 'meta', label: 'Meta' },
      ...(hasSchemaData ? [{ id: 'schema', label: 'Schema' }] : []),
      { id: 'samples', label: 'Samples' },
      { id: 'connections', label: 'Connections' },
    ]
    return base
  }, [hasSchemaData])

  const [control, drawerTab] = useBetterTabs(tabs)

  return (
    <BetterDialogContent
      className="p-0"
      title={
        method && url ? (
          <span className="flex items-center gap-2">
            <span className="font-semibold">{method}</span>
            <span>{url}</span>
          </span>
        ) : (
          <span className="text-paragraph">N/A</span>
        )
      }
      description={
        <span className="text-paragraph text-xs">
          Updated{' '}
          {endpoint.updatedAt
            ? new Date(endpoint.updatedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : endpoint.createdAt
              ? new Date(endpoint.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Jan 15, 2024'}
        </span>
      }
    >
      <div className="sticky top-0 px-6 py-2">
        <BetterTabController control={control} className="shadow-sm" />
      </div>

      <AnimatePresence mode="sync">
        {drawerTab === 'meta' && (
          <motion.div
            key="meta"
            exit={{ opacity: 0, height: 0 }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <ConfigureApiEndpointMeta
              endpoint={endpoint}
              componentMeta={componentMeta}
              readonly={readonly}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="sync">
        {drawerTab === 'schema' && (
          <motion.div
            key="schema"
            exit={{ opacity: 0, height: 0 }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <EndpointSchemaView data={schemaData} />
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
              endpoint={endpoint}
              readonly={readonly}
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
              endpoint={endpoint}
              readonly={readonly}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </BetterDialogContent>
  )
}

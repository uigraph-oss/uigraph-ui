'use client'

import { BetterDialogProvider } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useMutation, useQuery } from '@apollo/client'
import { CircleHelp, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  AUTH_ROLE_MAPPINGS,
  CREATE_AUTH_ROLE_MAPPING,
  DELETE_AUTH_ROLE_MAPPING,
  UPDATE_AUTH_ROLE_MAPPING,
  type AuthProvider,
} from '../api/org-auth'
import { ConfigureRoleMappingModal } from './configure-role-mapping-modal'
import { RoleMappingRow } from './role-mapping-row'

function getGroupsField(provider: AuthProvider) {
  if (provider.kind === 'saml') return provider.groupsAttribute
  if (provider.kind === 'oidc') return provider.groupsClaim
  throw new Error(`unknown provider kind ${provider.kind}`)
}

export function RoleMappingsPanel({
  orgId,
  provider,
}: {
  orgId: string
  provider: AuthProvider
}) {
  const variables = { orgId, providerSlug: provider.slug }
  const mappingsQuery = useQuery(AUTH_ROLE_MAPPINGS, { variables })

  const refetchQueries = [{ query: AUTH_ROLE_MAPPINGS, variables }]
  const [updateMapping] = useMutation(UPDATE_AUTH_ROLE_MAPPING, {
    awaitRefetchQueries: true,
    refetchQueries,
  })
  const [deleteMapping] = useMutation(DELETE_AUTH_ROLE_MAPPING, {
    awaitRefetchQueries: true,
    refetchQueries,
  })
  const [createMapping] = useMutation(CREATE_AUTH_ROLE_MAPPING, {
    awaitRefetchQueries: true,
    refetchQueries,
  })

  const [addOpen, setAddOpen] = useState(false)

  const mappings = mappingsQuery.data?.authRoleMappings ?? []

  async function handleMove(index: number, direction: -1 | 1) {
    const current = mappings[index]
    const neighbour = mappings[index + direction]

    try {
      await Promise.all([
        updateMapping({
          variables: {
            ...variables,
            mappingId: current.id,
            input: {
              priority: neighbour.priority,
              attributeKey: current.attributeKey,
              operator: current.operator,
              attributeValue: current.attributeValue,
              role: current.role,
            },
          },
        }),
        updateMapping({
          variables: {
            ...variables,
            mappingId: neighbour.id,
            input: {
              priority: current.priority,
              attributeKey: neighbour.attributeKey,
              operator: neighbour.operator,
              attributeValue: neighbour.attributeValue,
              role: neighbour.role,
            },
          },
        }),
      ])
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  async function handleDelete(mappingId: string) {
    try {
      await deleteMapping({ variables: { ...variables, mappingId } })
      toast.success('Rule removed')
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          <Label className="text-sm font-medium text-[#D2D9E6]">
            Role Mapping
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="How role mapping works"
                className="text-[#586378] transition-colors hover:text-[#D2D9E6]"
              >
                <CircleHelp className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              Evaluated top to bottom, first match wins. Rules apply as soon as
              you save them, without saving the provider.
            </TooltipContent>
          </Tooltip>
        </div>

        <Button type="button" preset="outline" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          Add Rule
        </Button>
      </div>

      {mappingsQuery.loading && !mappingsQuery.data ? (
        <p className="text-muted-foreground py-6 text-center text-sm">
          Loading…
        </p>
      ) : mappings.length === 0 ? (
        <div className="rounded-[12px] border border-dashed border-[#2A3242] px-6 py-8 text-center text-sm text-[#828DA3]">
          No rules. Everyone gets the {provider.defaultRole} role.
        </div>
      ) : (
        <ul className="space-y-2">
          {mappings.map((mapping, index) => (
            <RoleMappingRow
              key={mapping.id}
              orgId={orgId}
              provider={provider}
              mapping={mapping}
              index={index}
              isFirst={index === 0}
              isLast={index === mappings.length - 1}
              onMoveUp={() => void handleMove(index, -1)}
              onMoveDown={() => void handleMove(index, 1)}
              onDelete={() => void handleDelete(mapping.id)}
            />
          ))}
        </ul>
      )}

      <BetterDialogProvider
        open={addOpen}
        onOpenChange={setAddOpen}
        className="sm:max-w-[36rem]"
      >
        <ConfigureRoleMappingModal
          id="create-role-mapping"
          open={addOpen}
          providerKind={provider.kind}
          title="Add Rule"
          ctaLabel="Add Rule"
          initialValues={{
            attributeKey: getGroupsField(provider),
            operator: 'contains',
            attributeValue: '',
            role: 'editor',
          }}
          submitForm={async (values) => {
            await createMapping({
              variables: {
                ...variables,
                input: { ...values, priority: mappings.length },
              },
            })
            toast.success('Rule added')
            setAddOpen(false)
          }}
        />
      </BetterDialogProvider>
    </div>
  )
}

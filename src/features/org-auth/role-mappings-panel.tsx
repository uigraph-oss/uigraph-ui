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
import {
  ArrowDown,
  ArrowUp,
  CircleHelp,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  AUTH_ROLE_MAPPINGS,
  DELETE_AUTH_ROLE_MAPPING,
  UPDATE_AUTH_ROLE_MAPPING,
  type AuthProvider,
  type AuthRoleMapping,
} from './api/org-auth'
import { RoleMappingModal } from './role-mapping-modal'

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

  const [ruleOpen, setRuleOpen] = useState(false)
  const [editing, setEditing] = useState<AuthRoleMapping | null>(null)

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

  return (
    <div className="max-w-2xl space-y-3">
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

        <Button
          type="button"
          preset="outline"
          onClick={() => {
            setEditing(null)
            setRuleOpen(true)
          }}
        >
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
            <li
              key={mapping.id}
              className="flex items-center gap-3 rounded-[12px] border border-[#2A3242] px-4 py-3"
            >
              <span className="w-5 shrink-0 text-xs text-[#828DA3]">
                {index + 1}
              </span>
              <p className="min-w-0 flex-1 text-sm text-[#D2D9E6]">
                <span className="font-mono text-[#F4F7FC]">
                  {mapping.attributeKey}
                </span>{' '}
                <span className="text-[#828DA3]">{mapping.operator}</span>{' '}
                {mapping.attributeValue && (
                  <span className="font-mono text-[#F4F7FC]">
                    {mapping.attributeValue}
                  </span>
                )}
                <span className="text-[#828DA3]"> → </span>
                <span className="font-medium text-[#F4F7FC]">
                  {mapping.role}
                </span>
              </p>
              <button
                type="button"
                disabled={index === 0}
                onClick={() => void handleMove(index, -1)}
                className="flex size-8 items-center justify-center rounded-md border border-[#2A3242] text-[#D2D9E6] transition-colors hover:border-[#3A4252] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowUp className="size-4" />
              </button>
              <button
                type="button"
                disabled={index === mappings.length - 1}
                onClick={() => void handleMove(index, 1)}
                className="flex size-8 items-center justify-center rounded-md border border-[#2A3242] text-[#D2D9E6] transition-colors hover:border-[#3A4252] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowDown className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(mapping)
                  setRuleOpen(true)
                }}
                className="flex size-8 items-center justify-center rounded-md border border-[#2A3242] text-[#D2D9E6] transition-colors hover:border-[#3A4252]"
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await deleteMapping({
                      variables: { ...variables, mappingId: mapping.id },
                    })
                    toast.success('Rule removed')
                  } catch (error) {
                    toast.error((error as Error).message)
                  }
                }}
                className="flex size-8 items-center justify-center rounded-md border border-red-500/30 text-red-600 transition-colors hover:border-red-500/40 hover:bg-red-500/10"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <BetterDialogProvider open={ruleOpen} onOpenChange={setRuleOpen}>
        {ruleOpen && (
          <RoleMappingModal
            orgId={orgId}
            provider={provider}
            mapping={editing}
            nextPriority={mappings.length}
            onSaved={() => setRuleOpen(false)}
          />
        )}
      </BetterDialogProvider>
    </div>
  )
}

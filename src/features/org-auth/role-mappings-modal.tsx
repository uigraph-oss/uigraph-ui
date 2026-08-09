'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMutation, useQuery } from '@apollo/client'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  AUTH_ROLE_MAPPINGS,
  CREATE_AUTH_ROLE_MAPPING,
  DELETE_AUTH_ROLE_MAPPING,
  MAPPING_OPERATORS,
  UPDATE_AUTH_ROLE_MAPPING,
  type AuthProvider,
} from './api/org-auth'

export function RoleMappingsModal({
  orgId,
  provider,
}: {
  orgId: string
  provider: AuthProvider
}) {
  const variables = { orgId, providerSlug: provider.slug }
  const mappingsQuery = useQuery(AUTH_ROLE_MAPPINGS, { variables })
  const operatorsQuery = useQuery(MAPPING_OPERATORS)

  const refetchQueries = [{ query: AUTH_ROLE_MAPPINGS, variables }]
  const [createMapping] = useMutation(CREATE_AUTH_ROLE_MAPPING, {
    awaitRefetchQueries: true,
    refetchQueries,
  })
  const [updateMapping] = useMutation(UPDATE_AUTH_ROLE_MAPPING, {
    awaitRefetchQueries: true,
    refetchQueries,
  })
  const [deleteMapping] = useMutation(DELETE_AUTH_ROLE_MAPPING, {
    awaitRefetchQueries: true,
    refetchQueries,
  })

  const [attributeKey, setAttributeKey] = useState(
    provider.kind === 'saml' ? provider.groupsAttribute : provider.groupsClaim
  )
  const [operator, setOperator] = useState('contains')
  const [attributeValue, setAttributeValue] = useState('')
  const [role, setRole] = useState('editor')

  const mappings = mappingsQuery.data?.authRoleMappings ?? []
  const operators = operatorsQuery.data?.mappingOperators ?? []
  const takesValue =
    operators.find((o) => o.name === operator)?.takesValue ?? true

  async function handleAdd() {
    if (attributeKey.trim().length === 0) {
      toast.error('Attribute key is required')
      return
    }
    if (takesValue && attributeValue.trim().length === 0) {
      toast.error(`The "${operator}" operator needs a value`)
      return
    }

    try {
      await createMapping({
        variables: {
          ...variables,
          input: {
            priority: mappings.length,
            attributeKey: attributeKey.trim(),
            operator,
            attributeValue: takesValue ? attributeValue.trim() : '',
            role,
          },
        },
      })
      setAttributeValue('')
      toast.success('Rule added')
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  // Priorities are swapped rather than renumbered so a reorder touches exactly
  // the two rules the admin moved.
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
    <BetterDialogContent
      title="Role Mapping Rules"
      description={`Rules are evaluated top to bottom for ${provider.displayName}. The first match wins; when nothing matches the default role (${provider.defaultRole}) applies.`}
      footerCancel="Done"
    >
      <div className="space-y-5">
        {mappingsQuery.loading && !mappingsQuery.data ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            Loading…
          </p>
        ) : mappings.length === 0 ? (
          <div className="rounded-[12px] border border-dashed border-[#2A3242] px-6 py-8 text-center text-sm text-[#828DA3]">
            No rules yet. Everyone who signs in gets the default role.
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

        <div className="space-y-4 rounded-[16px] border border-[#2A3242] bg-[#161C28] px-4 py-5">
          <p className="text-sm font-semibold text-[#F4F7FC]">Add a rule</p>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#D2D9E6]">
              {provider.kind === 'saml' ? 'Attribute' : 'Claim'}
            </Label>
            <Input
              value={attributeKey}
              onChange={(event) => setAttributeKey(event.target.value)}
              placeholder="groups"
              className="h-[48px] rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4"
              autoComplete="off"
            />
            <p className="text-sm text-[#828DA3]">
              Dot notation reads nested values, e.g.{' '}
              <span className="font-mono">realm_access.roles</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#D2D9E6]">
                Operator
              </Label>
              <Select value={operator} onValueChange={setOperator}>
                <SelectTrigger className="h-[48px] w-full rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((op) => (
                    <SelectItem key={op.name} value={op.name}>
                      {op.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#D2D9E6]">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="h-[48px] w-full rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {takesValue && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#D2D9E6]">
                Value
              </Label>
              <Input
                value={attributeValue}
                onChange={(event) => setAttributeValue(event.target.value)}
                placeholder="platform-engineers"
                className="h-[48px] rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4"
                autoComplete="off"
              />
            </div>
          )}

          <Button
            type="button"
            className="h-11 w-full rounded-[0.75rem] text-sm"
            onClick={() => void handleAdd()}
          >
            <Plus className="mr-0.5 h-4 w-4" />
            Add Rule
          </Button>
        </div>
      </div>
    </BetterDialogContent>
  )
}

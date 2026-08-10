'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useMutation, useQuery } from '@apollo/client'
import { CircleHelp } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  AUTH_ROLE_MAPPINGS,
  CREATE_AUTH_ROLE_MAPPING,
  MAPPING_OPERATORS,
  UPDATE_AUTH_ROLE_MAPPING,
  type AuthProvider,
  type AuthRoleMapping,
} from './api/org-auth'

const labelClass = 'text-sm font-medium text-[#D2D9E6]'
const controlClass =
  'h-11 rounded-lg border border-[#2A3242] bg-[#0F1420]/70 px-3.5 shadow-none hover:border-[#3A455A] focus-visible:border-[#5475F7] focus-visible:ring-[#5475F7]/20'

function initialValues(
  provider: AuthProvider,
  mapping: AuthRoleMapping | null
) {
  if (mapping !== null) {
    return {
      attributeKey: mapping.attributeKey,
      operator: mapping.operator,
      attributeValue: mapping.attributeValue,
      role: mapping.role,
    }
  }
  if (provider.kind === 'saml') {
    return {
      attributeKey: provider.groupsAttribute,
      operator: 'contains',
      attributeValue: '',
      role: 'editor',
    }
  }
  if (provider.kind === 'oidc') {
    return {
      attributeKey: provider.groupsClaim,
      operator: 'contains',
      attributeValue: '',
      role: 'editor',
    }
  }
  throw new Error(`unknown provider kind ${provider.kind}`)
}

export function RoleMappingModal({
  orgId,
  provider,
  mapping,
  nextPriority,
  onSaved,
}: {
  orgId: string
  provider: AuthProvider
  mapping: AuthRoleMapping | null
  nextPriority: number
  onSaved: () => void
}) {
  const variables = { orgId, providerSlug: provider.slug }
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

  const initial = initialValues(provider, mapping)
  const [attributeKey, setAttributeKey] = useState(initial.attributeKey)
  const [operator, setOperator] = useState(initial.operator)
  const [attributeValue, setAttributeValue] = useState(initial.attributeValue)
  const [role, setRole] = useState(initial.role)
  const [saving, setSaving] = useState(false)

  const operators = operatorsQuery.data?.mappingOperators ?? []
  const takesValue =
    operators.find((o) => o.name === operator)?.takesValue ?? true

  async function handleSubmit() {
    if (attributeKey.trim().length === 0) {
      toast.error(
        `${provider.kind === 'saml' ? 'Attribute' : 'Claim'} is required`
      )
      return
    }
    if (takesValue && attributeValue.trim().length === 0) {
      toast.error(`The "${operator}" operator needs a value`)
      return
    }

    const input = {
      attributeKey: attributeKey.trim(),
      operator,
      attributeValue: takesValue ? attributeValue.trim() : '',
      role,
    }

    setSaving(true)
    try {
      if (mapping === null) {
        await createMapping({
          variables: {
            ...variables,
            input: { ...input, priority: nextPriority },
          },
        })
        toast.success('Rule added')
      } else {
        await updateMapping({
          variables: {
            ...variables,
            mappingId: mapping.id,
            input: { ...input, priority: mapping.priority },
          },
        })
        toast.success('Rule updated')
      }
      onSaved()
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <BetterDialogContent
      title={mapping === null ? 'Add Rule' : 'Edit Rule'}
      footerSubmit={mapping === null ? 'Add Rule' : 'Save Rule'}
      footerSubmitLoading={saving}
      onFooterSubmitClick={() => void handleSubmit()}
      footerCancel
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="role-mapping-attribute" className={labelClass}>
              {provider.kind === 'saml' ? 'Attribute' : 'Claim'}
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="How the key is read"
                  className="text-[#586378] transition-colors hover:text-[#D2D9E6]"
                >
                  <CircleHelp className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                Dot notation reads nested values, e.g. realm_access.roles
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="role-mapping-attribute"
            value={attributeKey}
            onChange={(event) => setAttributeKey(event.target.value)}
            placeholder="groups"
            className={controlClass}
            autoComplete="off"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="role-mapping-operator" className={labelClass}>
              Operator
            </Label>
            <Select value={operator} onValueChange={setOperator}>
              <SelectTrigger
                id="role-mapping-operator"
                className={`${controlClass} w-full`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[#2A3242] bg-[#171D29]">
                {operators.map((op) => (
                  <SelectItem key={op.name} value={op.name}>
                    {op.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-mapping-role" className={labelClass}>
              Role
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger
                id="role-mapping-role"
                className={`${controlClass} w-full`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[#2A3242] bg-[#171D29]">
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {takesValue && (
          <div className="space-y-2">
            <Label htmlFor="role-mapping-value" className={labelClass}>
              Value
            </Label>
            <Input
              id="role-mapping-value"
              value={attributeValue}
              onChange={(event) => setAttributeValue(event.target.value)}
              placeholder="platform-engineers"
              className={controlClass}
              autoComplete="off"
            />
          </div>
        )}
      </div>
    </BetterDialogContent>
  )
}

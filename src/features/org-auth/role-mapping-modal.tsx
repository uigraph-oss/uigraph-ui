'use client'

import {
  BetterDialogContent,
  BetterDialogProvider,
} from '@/components/better-dialog'
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
  onOpenChange,
}: {
  orgId: string
  provider: AuthProvider
  mapping: AuthRoleMapping | null
  nextPriority: number
  onOpenChange: (open: boolean) => void
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
        `${provider.kind === 'saml' ? 'Attribute' : 'Claim'} name is required`
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
      onOpenChange(false)
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <BetterDialogProvider
      open
      onOpenChange={onOpenChange}
      className="shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:max-w-[36rem]"
    >
      <BetterDialogContent
        title={mapping === null ? 'Add role mapping' : 'Edit role mapping'}
        description={
          mapping === null
            ? `Assign a role when a ${provider.kind === 'saml' ? 'SAML attribute' : 'token claim'} matches.`
            : 'Update the match condition and its assigned role.'
        }
        footerSubmit={mapping === null ? 'Add Rule' : 'Save Rule'}
        footerSubmitLoading={saving}
        onFooterSubmitClick={() => void handleSubmit()}
        footerCancel
      >
        <div className="space-y-7">
          <section className="space-y-4" aria-labelledby="match-heading">
            <div>
              <p
                id="match-heading"
                className="text-xs font-semibold tracking-[0.08em] text-[#6F8FFF] uppercase"
              >
                When
              </p>
              <p className="mt-1 text-sm text-[#828DA3]">
                Match a value from the identity provider.
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="role-mapping-attribute"
                className="text-sm font-medium text-[#D2D9E6]"
              >
                {provider.kind === 'saml' ? 'Attribute' : 'Claim'} name
              </Label>
              <Input
                id="role-mapping-attribute"
                value={attributeKey}
                onChange={(event) => setAttributeKey(event.target.value)}
                placeholder="groups"
                aria-describedby="role-mapping-attribute-help"
                className="h-11 rounded-lg border border-[#2A3242] bg-[#0F1420]/70 px-3.5 shadow-none hover:border-[#3A455A] focus-visible:border-[#5475F7] focus-visible:ring-[#5475F7]/20"
                autoComplete="off"
              />
              <p
                id="role-mapping-attribute-help"
                className="text-xs leading-5 text-[#68758C]"
              >
                Use dot notation for nested values, such as{' '}
                <span className="font-mono text-[#8E9AB0]">
                  realm_access.roles
                </span>
                .
              </p>
            </div>

            <div
              className={
                takesValue
                  ? 'grid gap-4 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]'
                  : 'grid'
              }
            >
              <div className="space-y-2">
                <Label
                  htmlFor="role-mapping-operator"
                  className="text-sm font-medium text-[#D2D9E6]"
                >
                  Operator
                </Label>
                <Select value={operator} onValueChange={setOperator}>
                  <SelectTrigger
                    id="role-mapping-operator"
                    className="h-11 w-full rounded-lg border border-[#2A3242] bg-[#0F1420]/70 px-3.5 shadow-none hover:border-[#3A455A] focus-visible:border-[#5475F7] focus-visible:ring-[#5475F7]/20"
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

              {takesValue && (
                <div className="space-y-2">
                  <Label
                    htmlFor="role-mapping-value"
                    className="text-sm font-medium text-[#D2D9E6]"
                  >
                    Value
                  </Label>
                  <Input
                    id="role-mapping-value"
                    value={attributeValue}
                    onChange={(event) => setAttributeValue(event.target.value)}
                    placeholder="platform-engineers"
                    className="h-11 rounded-lg border border-[#2A3242] bg-[#0F1420]/70 px-3.5 shadow-none hover:border-[#3A455A] focus-visible:border-[#5475F7] focus-visible:ring-[#5475F7]/20"
                    autoComplete="off"
                  />
                </div>
              )}
            </div>
          </section>

          <section
            className="space-y-4 border-t border-[#252D3C] pt-6"
            aria-labelledby="role-heading"
          >
            <div>
              <p
                id="role-heading"
                className="text-xs font-semibold tracking-[0.08em] text-[#6F8FFF] uppercase"
              >
                Then
              </p>
              <p className="mt-1 text-sm text-[#828DA3]">
                Give matching users this workspace role.
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="role-mapping-role"
                className="text-sm font-medium text-[#D2D9E6]"
              >
                Assigned role
              </Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger
                  id="role-mapping-role"
                  className="h-11 w-full rounded-lg border border-[#2A3242] bg-[#0F1420]/70 px-3.5 shadow-none hover:border-[#3A455A] focus-visible:border-[#5475F7] focus-visible:ring-[#5475F7]/20"
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
          </section>
        </div>
      </BetterDialogContent>
    </BetterDialogProvider>
  )
}

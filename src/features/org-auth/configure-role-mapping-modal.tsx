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
import { useQuery } from '@apollo/client'
import { CircleHelp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { MAPPING_OPERATORS, type AuthProvider } from './api/org-auth'

export type RoleMappingFormValues = {
  attributeKey: string
  operator: string
  attributeValue: string
  role: string
}

export function ConfigureRoleMappingModal({
  id,
  open,
  providerKind,
  title,
  ctaLabel,
  initialValues,
  submitForm,
}: {
  id: string
  open: boolean
  providerKind: AuthProvider['kind']
  title: string
  ctaLabel: string
  initialValues: RoleMappingFormValues
  submitForm: (values: RoleMappingFormValues) => Promise<void>
}) {
  const operatorsQuery = useQuery(MAPPING_OPERATORS)
  const [attributeKey, setAttributeKey] = useState(initialValues.attributeKey)
  const [operator, setOperator] = useState(initialValues.operator)
  const [attributeValue, setAttributeValue] = useState(
    initialValues.attributeValue
  )
  const [role, setRole] = useState(initialValues.role)
  const [saving, setSaving] = useState(false)

  const operators = operatorsQuery.data?.mappingOperators ?? []
  const takesValue =
    operators.find((item) => item.name === operator)?.takesValue ?? true

  useEffect(() => {
    if (!open) return
    setAttributeKey(initialValues.attributeKey)
    setOperator(initialValues.operator)
    setAttributeValue(initialValues.attributeValue)
    setRole(initialValues.role)
  }, [
    open,
    initialValues.attributeKey,
    initialValues.operator,
    initialValues.attributeValue,
    initialValues.role,
  ])

  async function handleSubmit() {
    if (attributeKey.trim().length === 0) {
      toast.error(
        `${providerKind === 'saml' ? 'Attribute' : 'Claim'} is required`
      )
      return
    }
    if (takesValue && attributeValue.trim().length === 0) {
      toast.error(`The "${operator}" operator needs a value`)
      return
    }

    setSaving(true)
    try {
      await submitForm({
        attributeKey: attributeKey.trim(),
        operator,
        attributeValue: takesValue ? attributeValue.trim() : '',
        role,
      })
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <BetterDialogContent
      title={title}
      description="Choose the identity condition and the role it should grant."
      footerSubmit={ctaLabel}
      footerSubmitLoading={saving}
      onFooterSubmitClick={() => void handleSubmit()}
      footerCancel
    >
      <div className="space-y-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label
                htmlFor={`${id}-attribute`}
                className="text-sm font-medium text-[#D2D9E6]"
              >
                {providerKind === 'saml' ? 'Attribute' : 'Claim'}
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
              id={`${id}-attribute`}
              value={attributeKey}
              onChange={(event) => setAttributeKey(event.target.value)}
              placeholder="groups"
              className="h-11 rounded-lg border border-[#2A3242] bg-[#0F1420]/70 px-3.5 shadow-none hover:border-[#3A455A] focus-visible:border-[#5475F7] focus-visible:ring-[#5475F7]/20"
              autoComplete="off"
            />
          </div>

          <div
            className={
              takesValue
                ? 'grid gap-4 sm:grid-cols-[10rem_minmax(0,1fr)]'
                : 'grid gap-4'
            }
          >
            <div className="min-w-0 space-y-2">
              <Label
                htmlFor={`${id}-operator`}
                className="text-sm font-medium text-[#D2D9E6]"
              >
                Operator
              </Label>
              <Select value={operator} onValueChange={setOperator}>
                <SelectTrigger
                  id={`${id}-operator`}
                  className="h-11 w-full rounded-lg border border-[#2A3242] bg-[#0F1420]/70 px-3.5 shadow-none hover:border-[#3A455A] focus-visible:border-[#5475F7] focus-visible:ring-[#5475F7]/20"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#2A3242] bg-[#171D29]">
                  {operators.map((item) => (
                    <SelectItem key={item.name} value={item.name}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {takesValue && (
              <div className="min-w-0 space-y-2">
                <Label
                  htmlFor={`${id}-value`}
                  className="text-sm font-medium text-[#D2D9E6]"
                >
                  Value
                </Label>
                <Input
                  id={`${id}-value`}
                  value={attributeValue}
                  onChange={(event) => setAttributeValue(event.target.value)}
                  placeholder="platform-engineers"
                  className="h-11 rounded-lg border border-[#2A3242] bg-[#0F1420]/70 px-3.5 shadow-none hover:border-[#3A455A] focus-visible:border-[#5475F7] focus-visible:ring-[#5475F7]/20"
                  autoComplete="off"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="space-y-2">
            <Label
              htmlFor={`${id}-role`}
              className="text-sm font-medium text-[#D2D9E6]"
            >
              Role to assign
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger
                id={`${id}-role`}
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
        </div>
      </div>
    </BetterDialogContent>
  )
}

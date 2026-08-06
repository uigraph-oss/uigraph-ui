'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePermissions } from '@/hooks/use-permissions'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  CREATE_SERVICE_COST_TAG_RULE,
  DELETE_SERVICE_COST_TAG_RULE,
  SERVICE_COST_TAG_RULES,
} from '../api/costs'

// Links this service to real cloud resources: a resource rolls up into
// this service's cost dashboard when any one of its actual cloud tags
// matches one of these key=value rules.
export function TagRulesPanel({ serviceId }: { serviceId: string }) {
  const orgId = useCurrentOrganization()?.id as string
  const { canWrite } = usePermissions()
  const [tagKey, setTagKey] = useState('')
  const [tagValue, setTagValue] = useState('')

  const listVars = { orgId, serviceId }
  const rulesQuery = useQuery(SERVICE_COST_TAG_RULES, {
    variables: listVars,
    skip: !orgId || !serviceId,
  })

  const [createRule, { loading: creating }] = useMutation(
    CREATE_SERVICE_COST_TAG_RULE,
    {
      refetchQueries: [{ query: SERVICE_COST_TAG_RULES, variables: listVars }],
      awaitRefetchQueries: true,
    }
  )
  const [deleteRule] = useMutation(DELETE_SERVICE_COST_TAG_RULE, {
    refetchQueries: [{ query: SERVICE_COST_TAG_RULES, variables: listVars }],
    awaitRefetchQueries: true,
  })

  const rules = rulesQuery.data?.serviceCostTagRules ?? []

  async function handleAdd() {
    const key = tagKey.trim()
    const value = tagValue.trim()
    if (!key || !value) return
    try {
      await createRule({
        variables: { orgId, serviceId, tagKey: key, tagValue: value },
      })
      setTagKey('')
      setTagValue('')
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  async function handleDelete(ruleId: string) {
    try {
      await deleteRule({ variables: { orgId, serviceId, ruleId } })
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <div className="border-stock bg-shading/40 rounded-[12px] border p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold">Tag rules</h3>
        <p className="text-paragraph text-xs">
          Resources whose cloud tags match any rule below are pulled into this
          service&apos;s cost dashboard.
        </p>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {rules.map((rule) => (
          <span
            key={rule.id}
            className="bg-muted/40 inline-flex max-w-full items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium"
          >
            <span className="min-w-0 break-all">
              {rule.tagKey}:{rule.tagValue}
            </span>
            <button
              type="button"
              disabled={!canWrite}
              onClick={() => void handleDelete(rule.id)}
              className="text-paragraph hover:text-foreground shrink-0"
              aria-label={`Remove rule ${rule.tagKey}:${rule.tagValue}`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        {rules.length === 0 && !rulesQuery.loading && (
          <span className="text-paragraph text-xs">
            No tag rules configured yet — no cloud resources are linked to this
            service.
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={tagKey}
          onChange={(e) => setTagKey(e.target.value)}
          placeholder="tag key (e.g. team)"
          className="h-9 w-40 rounded-lg px-3 text-sm"
        />
        <Input
          value={tagValue}
          onChange={(e) => setTagValue(e.target.value)}
          placeholder="tag value (e.g. checkout)"
          className="h-9 w-48 rounded-lg px-3 text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter') void handleAdd()
          }}
        />
        <Button
          preset="outline"
          className="h-9 px-3 text-xs"
          disabled={creating || !tagKey.trim() || !tagValue.trim() || !canWrite}
          onClick={() => void handleAdd()}
        >
          <Plus className="mr-1 size-3.5" />
          Add rule
        </Button>
      </div>
    </div>
  )
}

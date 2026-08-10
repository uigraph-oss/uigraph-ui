'use client'

import { BetterDialogProvider } from '@/components/better-dialog'
import { useMutation } from '@apollo/client'
import { ArrowDown, ArrowRight, ArrowUp, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  AUTH_ROLE_MAPPINGS,
  UPDATE_AUTH_ROLE_MAPPING,
  type AuthProvider,
  type AuthRoleMapping,
} from './api/org-auth'
import { ConfigureRoleMappingModal } from './configure-role-mapping-modal'

export function RoleMappingRow({
  orgId,
  provider,
  mapping,
  index,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  orgId: string
  provider: AuthProvider
  mapping: AuthRoleMapping
  index: number
  isFirst: boolean
  isLast: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
}) {
  const [editOpen, setEditOpen] = useState(false)
  const variables = { orgId, providerSlug: provider.slug }
  const [updateMapping] = useMutation(UPDATE_AUTH_ROLE_MAPPING, {
    awaitRefetchQueries: true,
    refetchQueries: [{ query: AUTH_ROLE_MAPPINGS, variables }],
  })

  return (
    <li className="flex items-center gap-3 rounded-[12px] border border-[#2A3242] px-4 py-3">
      <span className="w-5 shrink-0 text-xs text-[#828DA3]">{index + 1}</span>
      <p className="flex min-w-0 flex-1 items-center gap-2 text-sm text-[#D2D9E6]">
        <span className="min-w-0 truncate">
          <span className="font-mono text-[#F4F7FC]">
            {mapping.attributeKey}
          </span>{' '}
          <span className="text-[#828DA3]">{mapping.operator}</span>{' '}
          {mapping.attributeValue && (
            <span className="font-mono text-[#F4F7FC]">
              {mapping.attributeValue}
            </span>
          )}
        </span>
        <ArrowRight className="size-3.5 shrink-0 text-[#586378]" />
        <span className="shrink-0 font-medium text-[#F4F7FC]">
          {mapping.role}
        </span>
      </p>

      <button
        type="button"
        aria-label="Move rule up"
        disabled={isFirst}
        onClick={onMoveUp}
        className="flex size-8 items-center justify-center rounded-md border border-[#2A3242] text-[#D2D9E6] transition-colors hover:border-[#3A4252] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ArrowUp className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Move rule down"
        disabled={isLast}
        onClick={onMoveDown}
        className="flex size-8 items-center justify-center rounded-md border border-[#2A3242] text-[#D2D9E6] transition-colors hover:border-[#3A4252] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ArrowDown className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Edit rule"
        onClick={() => setEditOpen(true)}
        className="flex size-8 items-center justify-center rounded-md border border-[#2A3242] text-[#D2D9E6] transition-colors hover:border-[#3A4252]"
      >
        <Pencil className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Delete rule"
        onClick={onDelete}
        className="flex size-8 items-center justify-center rounded-md border border-red-500/30 text-red-600 transition-colors hover:border-red-500/40 hover:bg-red-500/10"
      >
        <Trash2 className="size-4" />
      </button>

      <BetterDialogProvider
        open={editOpen}
        onOpenChange={setEditOpen}
        className="sm:max-w-[36rem]"
      >
        <ConfigureRoleMappingModal
          id={`edit-role-mapping-${mapping.id}`}
          open={editOpen}
          providerKind={provider.kind}
          title="Edit Rule"
          ctaLabel="Save Rule"
          initialValues={{
            attributeKey: mapping.attributeKey,
            operator: mapping.operator,
            attributeValue: mapping.attributeValue,
            role: mapping.role,
          }}
          submitForm={async (values) => {
            await updateMapping({
              variables: {
                ...variables,
                mappingId: mapping.id,
                input: { ...values, priority: mapping.priority },
              },
            })
            toast.success('Rule updated')
            setEditOpen(false)
          }}
        />
      </BetterDialogProvider>
    </li>
  )
}

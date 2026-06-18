import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { TagInput } from '@/features/component-meta'
import { GET_ORGANIZATION_USERS } from '@/features/dashboard-settings/api/users'
import { GET_PUBLIC_ACCOUNT_INFO } from '@/features/image-frame-canvas-sidebar/api/account'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useApolloClient, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useEffect, useMemo, useState } from 'react'
import { Controller } from 'react-hook-form'
import { RxCross2 } from 'react-icons/rx'
import { TEST_TYPES } from './constants'
import { FieldMessage } from './field-message'
import { LinkUiMapNodeSelect } from './link-ui-map-node'
import { FormType } from './schema'

const PRIORITY_OPTIONS = [
  {
    id: 'p0',
    label: 'P0 · Blocker',
    color: '#ef4444',
    bg: '#fef2f2',
  },
  {
    id: 'p1',
    label: 'P1 · High',
    color: '#f97316',
    bg: '#fff7ed',
  },
  {
    id: 'p2',
    label: 'P2 · Medium',
    color: '#eab308',
    bg: '#fefce8',
  },
  {
    id: 'p3',
    label: 'P3 · Low',
    color: '#6b7280',
    bg: '#f9fafb',
  },
]

type OwnerOption = {
  value: string
  label: string
  email: string
  avatarSrc: string | null
  searchValue: string
}

function formatOwnerName(value: string) {
  const normalizedValue = value.trim()
  const localValue = normalizedValue.includes('@')
    ? (normalizedValue.split('@')[0] ?? normalizedValue)
    : normalizedValue
  const baseValue = localValue.replace(/^[^a-zA-Z0-9]+/, '').split('+')[0] ?? ''
  const parts = baseValue.split(/[._-]+/).filter(Boolean)

  if (parts.length === 0) return normalizedValue

  return parts
    .map(
      (part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`
    )
    .join(' ')
}

function getOwnerInitials(label: string, email: string) {
  const initials = label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

  return initials || email.charAt(0).toUpperCase() || 'U'
}

function OwnerOptionContent({ option }: { option: OwnerOption }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-6">
        <AvatarImage src={option.avatarSrc ?? ''} className="object-cover" />
        <AvatarFallback className="bg-[#eff6ff] text-[10px] font-medium text-[#2563eb]">
          {getOwnerInitials(option.label, option.email)}
        </AvatarFallback>
      </Avatar>

      <span className="truncate">{option.label}</span>
    </div>
  )
}

function TestOwnerSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  options: OwnerOption[]
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options

    const query = searchQuery.trim().toLowerCase()
    return options.filter((option) => option.searchValue.includes(query))
  }, [options, searchQuery])

  const selectedOption = useMemo(() => {
    if (!value) return null

    return (
      options.find((option) => option.value === value) ?? {
        value,
        label: formatOwnerName(value),
        email: value,
        avatarSrc: null,
        searchValue: value.toLowerCase(),
      }
    )
  }, [options, value])

  useEffect(() => {
    setSearchQuery('')
  }, [open])

  return (
    <Select
      open={open}
      onOpenChange={setOpen}
      value={value}
      onValueChange={onChange}
    >
      <SelectTrigger className="border-stock text-foreground !h-[3.5rem] w-full rounded-[1rem] border bg-white px-4 text-sm">
        {selectedOption ? (
          <OwnerOptionContent option={selectedOption} />
        ) : (
          <span className="text-paragraph">
            {placeholder || 'Select an option'}
          </span>
        )}
      </SelectTrigger>

      <SelectContent className="bg-white">
        <div className="p-1">
          <Input
            placeholder="Search by name or email"
            className="bg-white/80"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              event.stopPropagation()
              event.nativeEvent.stopImmediatePropagation()
            }}
          />
        </div>

        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            hidden={!filteredOptions.includes(option)}
          >
            <OwnerOptionContent option={option} />
          </SelectItem>
        ))}

        {filteredOptions.length === 0 && (
          <p className="text-muted-foreground px-6 py-2 text-sm">
            No owners found
          </p>
        )}
      </SelectContent>
    </Select>
  )
}

export function FormBasicSection({ form }: { form: FormType }) {
  const client = useApolloClient()
  const organizationId = useCurrentOrganization()?.id
  const { data } = useQuery(GET_ORGANIZATION_USERS, {
    fetchPolicy: 'cache-first',
    variables: { organizationId: organizationId! },
    skip: !organizationId,
  })
  const organizationUsers = useMemo(
    () => arrayNonNullable(data?.GetOrganizationUsers),
    [data?.GetOrganizationUsers]
  )
  const [ownerProfiles, setOwnerProfiles] = useState<
    Record<string, { name: string; avatarSrc: string | null }>
  >({})

  useEffect(() => {
    let isDisposed = false

    const userIds = organizationUsers
      .map((user) => user.userId)
      .filter((userId): userId is string => Boolean(userId))

    if (userIds.length === 0) {
      setOwnerProfiles({})
      return
    }

    void Promise.allSettled(
      userIds.map(async (userId) => {
        const { data } = await client.query({
          query: GET_PUBLIC_ACCOUNT_INFO,
          variables: { accountId: userId },
          fetchPolicy: 'cache-first',
        })

        const accountInfo = data.GetPubAccountByID?.accountInfo
        const name = [
          accountInfo?.firstName?.trim(),
          accountInfo?.lastName?.trim(),
        ]
          .filter(Boolean)
          .join(' ')

        return [
          userId,
          {
            name,
            avatarSrc: accountInfo?.imageUrl || accountInfo?.image || null,
          },
        ] as const
      })
    ).then((results) => {
      if (isDisposed) return

      setOwnerProfiles((previous) => {
        const next = { ...previous }
        let hasChanges = false

        for (const result of results) {
          if (result.status !== 'fulfilled') continue

          const [userId, profile] = result.value
          const currentProfile = previous[userId]

          if (
            currentProfile?.name === profile.name &&
            currentProfile?.avatarSrc === profile.avatarSrc
          ) {
            continue
          }

          next[userId] = profile
          hasChanges = true
        }

        return hasChanges ? next : previous
      })
    })

    return () => {
      isDisposed = true
    }
  }, [client, organizationUsers])

  const testOwnerOptions = useMemo(
    () =>
      Array.from(
        organizationUsers
          .reduce((map, user) => {
            const email = user.email?.trim()
            if (!email || map.has(email)) return map

            const profile = user.userId ? ownerProfiles[user.userId] : undefined
            const label = profile?.name || formatOwnerName(email)

            map.set(email, {
              value: email,
              label,
              email,
              avatarSrc: profile?.avatarSrc ?? null,
              searchValue: `${label} ${email}`.toLowerCase(),
            })

            return map
          }, new Map<string, OwnerOption>())
          .values()
      ).sort((left, right) => left.label.localeCompare(right.label)),
    [organizationUsers, ownerProfiles]
  )

  return (
    <>
      <div className="mb-4">
        <Label className="mb-2 text-sm font-normal text-[#111110]">Title</Label>
        <Controller
          name="title"
          control={form.control}
          render={({ field }) => (
            <Input
              placeholder="e.g. Verify user can log in with valid credentials"
              value={field.value ?? ''}
              onChange={field.onChange}
              className="h-[56px] rounded-[16px] border border-[#E5E7E9] bg-white px-6 [font-family:'DM_Sans',sans-serif] text-[13px] text-[#1e293b]"
            />
          )}
        />
        <FieldMessage message={form.formState.errors.title?.message} />
      </div>

      <div className="mb-4">
        <Label className="mb-2 text-sm font-normal text-[#111110]">
          Description <span className="text-xs text-[#94a3b8]">(optional)</span>
        </Label>
        <Controller
          name="description"
          control={form.control}
          render={({ field }) => (
            <Textarea
              placeholder="What is this test validating and why? Help the next engineer understand the intent."
              value={field.value ?? ''}
              onChange={field.onChange}
              rows={2}
              className="resize-y rounded-[16px] border border-[#E5E7E9] bg-white px-6 py-4 [font-family:'DM_Sans',sans-serif] text-[13px] leading-[1.6] text-[#1e293b]"
            />
          )}
        />
        <FieldMessage message={form.formState.errors.description?.message} />
      </div>

      <div className="mb-4">
        <Label className="mb-2 text-sm font-normal text-[#111110]">Type</Label>
        <Controller
          name="type"
          control={form.control}
          render={({ field }) => (
            <div className="grid grid-cols-5 gap-1.5">
              {TEST_TYPES.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    field.onChange(item.id)
                  }}
                  className={cn(
                    'border-stock h-11 rounded-[12px] border bg-white px-1 py-2.5 text-center outline-2 -outline-offset-2 outline-transparent outline-solid hover:bg-white',
                    field.value === item.id &&
                      'bg-shading-gray outline-primary hover:bg-shading-gray'
                  )}
                >
                  <div className="mb-[3px] text-[18px]">{item.icon}</div>
                  <div
                    className={cn(
                      'text-paragraph text-[11px] font-semibold',
                      field.value === item.id && 'text-primary'
                    )}
                  >
                    {item.label}
                  </div>
                </Button>
              ))}
            </div>
          )}
        />
        <FieldMessage message={form.formState.errors.type?.message} />
      </div>

      <div className="mb-4">
        <Label className="mb-2 text-sm font-normal text-[#111110]">
          Priority
        </Label>
        <Controller
          name="priority"
          control={form.control}
          render={({ field }) => (
            <div className="flex gap-2">
              {PRIORITY_OPTIONS.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    field.onChange(item.id)
                  }}
                  className={cn(
                    'border-stock h-11 flex-1 rounded-[12px] border bg-white px-1 py-2 text-xs font-medium text-[#94a3b8] outline-2 -outline-offset-2 outline-transparent outline-solid hover:bg-white',

                    item.id === 'p0' &&
                      field.value === item.id &&
                      'bg-[#fef2f2] text-[#ef4444]! outline-[#ef4444] hover:bg-[#fef2f2]',

                    item.id === 'p1' &&
                      field.value === item.id &&
                      'bg-[#fff7ed] text-[#f97316]! outline-[#f97316] hover:bg-[#fff7ed]',

                    item.id === 'p2' &&
                      field.value === item.id &&
                      'bg-[#fefce8] text-[#eab308]! outline-[#eab308] hover:bg-[#fefce8]',

                    item.id === 'p3' &&
                      field.value === item.id &&
                      'bg-[#f9fafb] text-[#6b7280]! outline-[#6b7280] hover:bg-[#f9fafb]'
                  )}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          )}
        />
        <FieldMessage message={form.formState.errors.priority?.message} />
      </div>

      <div className="mb-4">
        <Label className="mb-2 text-sm font-normal text-[#111110]">
          Linked UI Map Node{' '}
          <span className="text-xs text-[#94a3b8]">(optional)</span>
        </Label>
        <Controller
          name="linkedMapNode"
          control={form.control}
          render={({ field }) => (
            <LinkUiMapNodeSelect
              value={
                (field.value ?? '') as '' | `${string}:${string}:${string}`
              }
              onChange={field.onChange}
            />
          )}
        />
        <FieldMessage message={form.formState.errors.linkedMapNode?.message} />
      </div>

      <div className="mb-4">
        <Label className="mb-2 text-sm font-normal text-[#111110]">
          Tags <span className="text-xs text-[#94a3b8]">(optional)</span>
        </Label>

        <Controller
          name="tags"
          control={form.control}
          render={({ field }) => (
            <TagInput value={field.value || []} onChange={field.onChange} />
          )}
        />
        <FieldMessage message={form.formState.errors.tags?.message} />
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <div>
          <Label className="mb-2 text-sm font-normal text-[#111110]">
            Linked Ticket{' '}
            <span className="text-xs text-[#94a3b8]">(optional)</span>
          </Label>
          <Controller
            name="linkedTicket"
            control={form.control}
            render={({ field }) => (
              <Input
                placeholder="JIRA-1234"
                value={field.value ?? ''}
                onChange={field.onChange}
                className="h-[56px] rounded-[16px] border border-[#E5E7E9] bg-white px-6"
              />
            )}
          />
          <FieldMessage message={form.formState.errors.linkedTicket?.message} />
        </div>
        <div>
          <Label className="mb-2 text-sm font-normal text-[#111110]">
            Est. Duration (min){' '}
            <span className="text-xs text-[#94a3b8]">(optional)</span>
          </Label>
          <Controller
            name="estimatedMins"
            control={form.control}
            render={({ field }) => (
              <Input
                placeholder="5"
                type="number"
                value={field.value ?? ''}
                onChange={field.onChange}
                className="h-[56px] rounded-[16px] border border-[#E5E7E9] bg-white px-6"
              />
            )}
          />
          <FieldMessage
            message={form.formState.errors.estimatedMins?.message}
          />
        </div>
        <div>
          <Label className="mb-2 text-sm font-normal text-[#111110]">
            Test Owner{' '}
            <span className="text-xs text-[#94a3b8]">(optional)</span>
          </Label>
          <Controller
            name="testOwner"
            control={form.control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <TestOwnerSelect
                    options={testOwnerOptions}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    placeholder="Search owner"
                  />
                </div>

                {field.value && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => field.onChange('')}
                    aria-label="Clear test owner"
                    title="Clear test owner"
                    className="h-10 w-10 shrink-0 rounded-full p-0 text-[#64748b] hover:bg-[#f8fafc]"
                  >
                    <RxCross2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          />
          <FieldMessage message={form.formState.errors.testOwner?.message} />
        </div>
      </div>
    </>
  )
}

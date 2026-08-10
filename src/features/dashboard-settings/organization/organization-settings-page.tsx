import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  refreshOrganizations,
  useCurrentOrganization,
} from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { SquarePen, Trash2, Upload, X } from 'lucide-react'
import { ChangeEvent, FormEvent, useRef, useState } from 'react'
import { toast } from 'sonner'
import { SettingsHeader } from '../components/settings-header'
import {
  CREATE_ORGANIZATION_DOMAIN,
  DELETE_ORGANIZATION_DOMAIN,
  ORGANIZATION_DOMAINS,
  removeOrganizationLogo,
  UPDATE_ORGANIZATION,
  uploadOrganizationLogo,
} from './api'

export function OrganizationSettingsPage() {
  const organization = useCurrentOrganization()

  if (!organization) {
    return null
  }

  return (
    <OrganizationSettings key={organization.id} organization={organization} />
  )
}

function OrganizationSettings({
  organization,
}: {
  organization: NonNullable<ReturnType<typeof useCurrentOrganization>>
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [name, setName] = useState(organization.name)
  const [newDomain, setNewDomain] = useState('')
  const [isUpdatingLogo, setIsUpdatingLogo] = useState(false)
  const [updateOrganization, { loading: isUpdating }] =
    useMutation(UPDATE_ORGANIZATION)
  const domainsQuery = useQuery(ORGANIZATION_DOMAINS, {
    variables: { orgId: organization.id },
    onError: (error) => toast.error(error.message),
  })
  const domainRefetch = {
    awaitRefetchQueries: true,
    refetchQueries: [
      {
        query: ORGANIZATION_DOMAINS,
        variables: { orgId: organization.id },
      },
    ],
  }
  const [createDomain, { loading: isCreatingDomain }] = useMutation(
    CREATE_ORGANIZATION_DOMAIN,
    domainRefetch
  )
  const [deleteDomain, { loading: isDeletingDomain }] = useMutation(
    DELETE_ORGANIZATION_DOMAIN,
    domainRefetch
  )
  const domains = domainsQuery.data?.orgDomains ?? []
  const domain = domains[0]

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedName = name.trim()

    if (!trimmedName) {
      toast.error('Organization name is required')
      return
    }

    try {
      await updateOrganization({
        variables: {
          id: organization.id,
          input: { name: trimmedName },
        },
      })
      await refreshOrganizations()
      setName(trimmedName)
      setIsEditMode(false)
      toast.success('Organization updated successfully')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update organization'
      )
    }
  }

  async function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    setIsUpdatingLogo(true)
    try {
      await uploadOrganizationLogo(organization.id, file)
      await refreshOrganizations()
      toast.success('Organization logo updated')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update organization logo'
      )
    } finally {
      setIsUpdatingLogo(false)
    }
  }

  async function handleLogoRemove() {
    setIsUpdatingLogo(true)
    try {
      await removeOrganizationLogo(organization.id)
      await refreshOrganizations()
      toast.success('Organization logo removed')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to remove organization logo'
      )
    } finally {
      setIsUpdatingLogo(false)
    }
  }

  async function handleAddDomain(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const domain = newDomain.trim().toLowerCase()

    if (!domain) {
      toast.error('Enter a domain')
      return
    }

    try {
      await createDomain({
        variables: { orgId: organization.id, domain },
      })
      setNewDomain('')
      toast.success('Domain added')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to add domain'
      )
    }
  }

  const initials = organization.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  if (isEditMode) {
    return (
      <>
        <SettingsHeader
          title="Edit Organization Settings"
          description="Manage the identity of your current organization"
          cta={
            <div className="flex gap-3">
              <Button
                preset="outline"
                className="border-border text-muted-foreground h-[44px] rounded-[12.85px] bg-transparent text-sm leading-[1.33] hover:bg-[#1E2533]"
                onClick={() => {
                  setName(organization.name)
                  setIsEditMode(false)
                }}
                disabled={isUpdating || isUpdatingLogo}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                type="submit"
                form="organization-settings-form"
                className="h-[44px] rounded-[12.85px] bg-[#015AEB] text-sm leading-[1.33] text-white hover:bg-blue-700"
                disabled={isUpdating || isUpdatingLogo}
              >
                {isUpdating ? 'Updating...' : 'Update Organization'}
              </Button>
            </div>
          }
        />

        <div className="flex flex-col gap-8 rounded-[12px] border border-[#2A3242] p-6 lg:flex-row">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative size-[110px] rounded-[12px]">
              <Avatar className="h-[110px] w-[110px] rounded-[12px]">
                <AvatarImage
                  src={organization.logoUrl || ''}
                  alt={`${organization.name} logo`}
                  className="object-cover"
                />
                <AvatarFallback className="rounded-[12px] text-3xl font-bold">
                  {initials || 'OR'}
                </AvatarFallback>
              </Avatar>
              {isUpdatingLogo && (
                <div className="absolute inset-0 flex items-center justify-center rounded-[12px] bg-black/50">
                  <div className="text-white">Uploading...</div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
            <Button
              preset="outline"
              className="flex h-[44px] items-center gap-2 rounded-[12.85px] bg-[#2A3242] px-3 text-sm leading-[1.33] text-[#828DA3] hover:bg-[#1E2533]"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUpdatingLogo || isUpdating}
            >
              <Upload className="h-4 w-4" />
              {isUpdatingLogo ? 'Uploading...' : 'Upload Logo'}
            </Button>
            {organization.logoUrl && (
              <Button
                preset="outline"
                className="flex h-[44px] items-center gap-2 rounded-[12.85px] bg-transparent px-3 text-sm leading-[1.33] text-[#828DA3] hover:bg-[#1E2533]"
                onClick={handleLogoRemove}
                disabled={isUpdatingLogo || isUpdating}
              >
                <Trash2 className="h-4 w-4" />
                Remove Logo
              </Button>
            )}
          </div>

          <div className="flex-1 space-y-6">
            <form id="organization-settings-form" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="organization-name" className="text-textPrimary">
                  Organization name
                </Label>
                <Input
                  id="organization-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-14 rounded-[12px] border border-[#2A3242]"
                  disabled={isUpdating || isUpdatingLogo}
                  autoComplete="organization"
                />
              </div>
            </form>

            <div className="space-y-4 border-t border-[#2A3242] pt-6">
              <div>
                <Label className="text-textPrimary">Domain name</Label>
                <p className="mt-1 text-sm text-[#828DA3]">
                  People with an email address at these domains can find this
                  organization when signing in.
                </p>
              </div>

              {!domain ? (
                <form
                  className="flex flex-col gap-3 sm:flex-row sm:items-center"
                  onSubmit={handleAddDomain}
                >
                  <Input
                    value={newDomain}
                    onChange={(event) => setNewDomain(event.target.value)}
                    placeholder="example.com"
                    aria-label="Domain name"
                    className="h-11 rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4 sm:max-w-sm"
                    autoComplete="off"
                    disabled={isCreatingDomain || isDeletingDomain}
                  />
                  <Button
                    type="submit"
                    className="h-11 rounded-[0.75rem] px-6 text-sm"
                    disabled={isCreatingDomain || isDeletingDomain}
                  >
                    {isCreatingDomain ? 'Adding...' : 'Add domain'}
                  </Button>
                </form>
              ) : (
                <div className="flex items-center justify-between rounded-[12px] border border-[#2A3242] px-6 py-3">
                  <p className="font-mono text-sm text-[#F4F7FC]">
                    {domain.domain}
                  </p>
                  <button
                    type="button"
                    aria-label={`Remove ${domain.domain}`}
                    title={`Remove ${domain.domain}`}
                    className="flex size-8 items-center justify-center rounded-md border border-red-500/30 text-red-600 transition-colors hover:border-red-500/40 hover:bg-red-500/10"
                    disabled={isCreatingDomain || isDeletingDomain}
                    onClick={async () => {
                      try {
                        await deleteDomain({
                          variables: {
                            orgId: organization.id,
                            domainId: domain.id,
                          },
                        })
                        toast.success('Domain removed')
                      } catch (error) {
                        toast.error(
                          error instanceof Error
                            ? error.message
                            : 'Failed to remove domain'
                        )
                      }
                    }}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <SettingsHeader
        title="Organization Settings"
        description="Manage the identity of your current organization"
        cta={
          <Button
            className="h-[44px] rounded-[12.85px] bg-[#015AEB] text-sm leading-[1.33] text-white hover:bg-blue-700"
            onClick={() => setIsEditMode(true)}
          >
            <SquarePen className="mr-0.5 h-4 w-4" />
            Edit Organization
          </Button>
        }
      />
      <div className="space-y-3 p-6">
        <div className="bg-card rounded-[12px] border border-[#2A3242] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 rounded-[12px]">
                <AvatarImage
                  src={organization.logoUrl || ''}
                  alt={`${organization.name} logo`}
                  className="object-cover"
                />
                <AvatarFallback className="rounded-[12px] text-lg font-bold">
                  {initials || 'OR'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-[#F4F7FC]">
                  {organization.name}
                </h2>
              </div>
            </div>
            <button
              className="flex h-11 items-center gap-2 rounded-[12.85px] bg-[#2A3242] px-3 text-sm leading-[1.33] font-normal text-[#D2D9E6] hover:bg-[#3B4658]"
              onClick={() => setIsEditMode(true)}
            >
              <SquarePen className="mr-0.5 h-4 w-4" />
              Edit
            </button>
          </div>
        </div>
        <div className="bg-card rounded-[12px] border border-[#2A3242] p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-[16px] leading-[1.33] font-semibold text-[#F4F7FC]">
              Organization Information
            </h3>
            <button
              className="flex h-11 items-center gap-2 rounded-[12.85px] bg-[#2A3242] px-3 text-sm leading-[1.33] font-normal text-[#D2D9E6] hover:bg-[#3B4658]"
              onClick={() => setIsEditMode(true)}
            >
              <SquarePen className="mr-0.5 h-4 w-4" />
              Edit
            </button>
          </div>

          <div className="grid max-w-[40rem] grid-cols-2 gap-x-[64px] gap-y-6">
            <div>
              <Label className="text-sm leading-[1.33] font-normal text-[#828DA3]">
                Organization name
              </Label>
              <p className="text-[1rem] leading-[1.33] font-normal text-[#F4F7FC]">
                {organization.name}
              </p>
            </div>

            <div>
              <Label className="text-sm leading-[1.33] font-normal text-[#828DA3]">
                Domain name
              </Label>
              <p className="text-[1rem] leading-[1.33] font-normal text-[#F4F7FC]">
                {domainsQuery.loading
                  ? 'Loading...'
                  : domain?.domain || 'Not configured'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

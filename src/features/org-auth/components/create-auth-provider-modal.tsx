'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { CopyButton } from '@/components/copy-button'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Check, CircleHelp, Plus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm, type FieldPath } from 'react-hook-form'
import { FaFileSignature, FaOpenid } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AUTH_PROVIDERS, CREATE_AUTH_PROVIDER } from '../api/org-auth'
import {
  AUTH_PROVIDER_DEFAULTS,
  oidcRedirectUri,
  samlAcsUrl,
  samlMetadataUrl,
  schema,
  signInUrl,
  toInput,
  type AuthProviderFormValues,
} from '../helpers/provider-form'

const STEPS = [
  { label: 'General' },
  { label: 'Configuration' },
  { label: 'Attributes' },
  { label: 'User Management' },
]

const OIDC_CONNECTION_FIELDS: FieldPath<AuthProviderFormValues>[] = [
  'type',
  'apiUrl',
  'clientId',
  'clientSecret',
  'authUrl',
  'tokenUrl',
  'userinfoUrl',
  'scopes',
]

const SAML_CONNECTION_FIELDS: FieldPath<AuthProviderFormValues>[] = [
  'idpMetadataUrl',
  'idpMetadataXml',
  'idpEntityId',
  'idpSsoUrl',
  'idpCert',
  'signRequests',
]

const OIDC_ATTRIBUTE_FIELDS: FieldPath<AuthProviderFormValues>[] = [
  'emailClaim',
  'nameClaim',
  'subClaim',
]

const SAML_ATTRIBUTE_FIELDS: FieldPath<AuthProviderFormValues>[] = [
  'emailAttribute',
  'nameAttribute',
  'nameIdFormat',
]

const labelClass = 'text-sm font-medium text-[#D2D9E6]'
const inputClass =
  'h-[48px] rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4'
const readOnlyInputClass =
  'h-[48px] rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4 font-mono text-xs'
const copyButtonClass =
  'size-[48px] shrink-0 rounded-[12px] border border-[#2A3242] bg-[#1E2533] text-[#D2D9E6] hover:border-[#3A4252] hover:bg-[#1E2533]'
const textareaClass =
  'rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4 py-3 font-mono text-xs'
const toggleRowClass =
  'flex items-center justify-between rounded-[12px] border border-[#2A3242] px-4 py-3'
const errorClass = 'text-destructive text-sm'
const hintIconClass = 'text-[#586378] transition-colors hover:text-[#D2D9E6]'

export function CreateAuthProviderModal() {
  const orgId = useCurrentOrganization()?.id as string
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: AUTH_PROVIDER_DEFAULTS,
  })

  const [createProvider] = useMutation(CREATE_AUTH_PROVIDER, {
    awaitRefetchQueries: true,
    refetchQueries: [{ query: AUTH_PROVIDERS, variables: { orgId } }],
  })

  const errors = form.formState.errors
  const kind = form.watch('kind')
  const type = form.watch('type')
  const slug = form.watch('slug')
  const previewSlug = slug || '<slug>'
  const derivedPlaceholder = `Derived from the ${type === 'entra' ? 'directory ID' : 'Okta domain'}`

  function fieldsForStep(index: number): FieldPath<AuthProviderFormValues>[] {
    if (index === 0) return ['displayName', 'slug', 'allowedDomains']
    if (index === 1) {
      if (kind === 'oidc') return OIDC_CONNECTION_FIELDS
      if (kind === 'saml') return SAML_CONNECTION_FIELDS
      throw new Error(`unknown provider kind ${kind}`)
    }
    if (index === 2) {
      if (kind === 'oidc') return OIDC_ATTRIBUTE_FIELDS
      if (kind === 'saml') return SAML_ATTRIBUTE_FIELDS
      throw new Error(`unknown provider kind ${kind}`)
    }
    if (index === 3) return ['allowSignUp', 'defaultRole']
    throw new Error(`unknown step ${index}`)
  }

  async function handleNext() {
    const isValid = await form.trigger(fieldsForStep(step))
    if (!isValid) return
    setStep(step + 1)
  }

  function handleInvalid() {
    const errored = Object.keys(form.formState.errors)

    for (let index = 0; index < STEPS.length; index++) {
      const fields = fieldsForStep(index) as string[]
      if (errored.some((field) => fields.includes(field))) {
        setStep(index)
        toast.error('Check the highlighted fields before continuing')
        return
      }
    }

    throw new Error(`no step owns the invalid fields ${errored.join(', ')}`)
  }

  async function handleCreate(values: AuthProviderFormValues) {
    try {
      await createProvider({ variables: { orgId, input: toInput(values) } })
      toast.success('Provider added')
      await navigate(`/settings/sso/${values.slug}`)
    } catch (error) {
      const message = (error as Error).message

      if (message === 'conflict') {
        form.setError('slug', {
          message: 'A provider with this name or slug already exists',
        })
        setStep(0)
        return
      }

      toast.error(message)
    }
  }

  return (
    <BetterDialogContent
      title="Add identity provider"
      description="Configure how members sign in and which access they receive."
      _footerContent={
        <div className="flex w-full items-center justify-between gap-3 p-6 pt-3">
          <Button
            type="button"
            preset="outline"
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button type="submit" form="create-auth-provider-form">
              Next
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              form="create-auth-provider-form"
              disabled={form.formState.isSubmitting}
            >
              <Plus className="size-4" />
              Create provider
            </Button>
          )}
        </div>
      }
    >
      <ol className="mb-6 flex items-center gap-3">
        {STEPS.map((item, index) => (
          <li key={item.label} className="flex flex-1 items-center gap-3">
            <button
              type="button"
              disabled={index > step}
              onClick={() => setStep(index)}
              className="flex min-w-0 items-center gap-2.5 disabled:cursor-not-allowed"
            >
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium',
                  index < step && 'border-primary bg-primary/10 text-primary',
                  index === step && 'border-primary bg-primary text-white',
                  index > step && 'border-[#2A3242] bg-[#1E2533] text-[#586378]'
                )}
              >
                {index < step ? <Check className="size-3.5" /> : index + 1}
              </span>
              <span
                className={cn(
                  'truncate text-sm',
                  index <= step ? 'text-[#F4F7FC]' : 'text-[#586378]'
                )}
              >
                {item.label}
              </span>
            </button>
            {index < STEPS.length - 1 && (
              <span
                className={cn(
                  'h-px flex-1',
                  index < step ? 'bg-primary/40' : 'bg-[#2A3242]'
                )}
              />
            )}
          </li>
        ))}
      </ol>

      <form
        id="create-auth-provider-form"
        onSubmit={(event) => {
          event.preventDefault()
          if (step < STEPS.length - 1) {
            void handleNext()
            return
          }
          void form.handleSubmit(handleCreate, handleInvalid)()
        }}
        className="space-y-5"
      >
        {step === 0 && (
          <>
            <Controller
              name="kind"
              control={form.control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label className={labelClass}>Protocol</Label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      aria-pressed={field.value === 'oidc'}
                      onClick={() => field.onChange('oidc')}
                      className={cn(
                        'relative flex min-h-20 items-center gap-3 rounded-[12px] border p-4 text-left transition-colors',
                        field.value === 'oidc'
                          ? 'border-[#015AEB] bg-[#015AEB]/10 text-[#F4F7FC]'
                          : 'border-[#2A3242] bg-[#1E2533] text-[#D2D9E6] hover:border-[#3A4252] hover:bg-[#222A3A]'
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-10 shrink-0 items-center justify-center rounded-lg border',
                          field.value === 'oidc'
                            ? 'border-[#015AEB]/40 bg-[#015AEB]/15 text-[#6E8DFF]'
                            : 'border-[#2A3242] bg-[#141925] text-[#828DA3]'
                        )}
                      >
                        <FaOpenid className="size-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">
                          OpenID Connect
                        </span>
                        <span className="mt-0.5 block text-xs font-normal text-[#828DA3]">
                          OAuth 2.0 identity tokens
                        </span>
                      </span>
                      {field.value === 'oidc' && (
                        <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-[#015AEB] text-white">
                          <Check className="size-3" />
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      aria-pressed={field.value === 'saml'}
                      onClick={() => field.onChange('saml')}
                      className={cn(
                        'relative flex min-h-20 items-center gap-3 rounded-[12px] border p-4 text-left transition-colors',
                        field.value === 'saml'
                          ? 'border-[#015AEB] bg-[#015AEB]/10 text-[#F4F7FC]'
                          : 'border-[#2A3242] bg-[#1E2533] text-[#D2D9E6] hover:border-[#3A4252] hover:bg-[#222A3A]'
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-10 shrink-0 items-center justify-center rounded-lg border',
                          field.value === 'saml'
                            ? 'border-[#015AEB]/40 bg-[#015AEB]/15 text-[#6E8DFF]'
                            : 'border-[#2A3242] bg-[#141925] text-[#828DA3]'
                        )}
                      >
                        <FaFileSignature className="size-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">
                          SAML 2.0
                        </span>
                        <span className="mt-0.5 block text-xs font-normal text-[#828DA3]">
                          Signed identity assertions
                        </span>
                      </span>
                      {field.value === 'saml' && (
                        <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-[#015AEB] text-white">
                          <Check className="size-3" />
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            />

            <div className="space-y-2">
              <Label className={labelClass}>Display Name</Label>
              <Input
                {...form.register('displayName')}
                placeholder="Acme Okta"
                className={inputClass}
                autoComplete="off"
              />
              {errors.displayName && (
                <p className={errorClass}>{errors.displayName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label className={labelClass}>Slug</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className={hintIconClass}>
                      <CircleHelp className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    Permanent. Your identity provider will be configured with
                    the URL below, so it cannot be changed later.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                {...form.register('slug')}
                placeholder="acme-okta"
                className={inputClass}
                autoComplete="off"
              />
              {errors.slug ? (
                <p className={errorClass}>{errors.slug.message}</p>
              ) : (
                <p className="truncate font-mono text-xs text-[#586378]">
                  {signInUrl(orgId, previewSlug)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label className={labelClass}>Allowed Email Domains</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className={hintIconClass}>
                      <CircleHelp className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    Restricts who may sign in through this provider. It is not
                    the organization&apos;s email domain list.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                {...form.register('allowedDomains')}
                placeholder="acme.com, acme.co.uk"
                className={inputClass}
                autoComplete="off"
              />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            {kind === 'saml' && (
              <>
                <div className="space-y-2">
                  <Label className={labelClass}>Entity ID (Audience)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={samlMetadataUrl(orgId, previewSlug)}
                      className={readOnlyInputClass}
                    />
                    <CopyButton
                      text={samlMetadataUrl(orgId, previewSlug)}
                      className={copyButtonClass}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={labelClass}>ACS URL (Reply URL)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={samlAcsUrl(orgId, previewSlug)}
                      className={readOnlyInputClass}
                    />
                    <CopyButton
                      text={samlAcsUrl(orgId, previewSlug)}
                      className={copyButtonClass}
                    />
                  </div>
                </div>
              </>
            )}

            {kind === 'oidc' && (
              <div className="space-y-2">
                <Label className={labelClass}>
                  Redirect URI (Callback URL)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={oidcRedirectUri(orgId, previewSlug)}
                    className={readOnlyInputClass}
                  />
                  <CopyButton
                    text={oidcRedirectUri(orgId, previewSlug)}
                    className={copyButtonClass}
                  />
                </div>
              </div>
            )}

            <div className="space-y-5 pt-2">
              {kind === 'oidc' && (
                <>
                  <Controller
                    name="type"
                    control={form.control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label className={labelClass}>Provider Type</Label>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className={cn(inputClass, 'w-full')}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="generic">
                              Generic OIDC
                            </SelectItem>
                            <SelectItem value="entra">
                              Microsoft Entra ID
                            </SelectItem>
                            <SelectItem value="okta">Okta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  />

                  {type !== 'generic' && (
                    <div className="space-y-2">
                      <Label className={labelClass}>
                        {type === 'entra'
                          ? 'Directory (Tenant) ID'
                          : 'Okta Domain'}
                      </Label>
                      <Input
                        {...form.register('apiUrl')}
                        placeholder={
                          type === 'entra'
                            ? '00000000-0000-0000-0000-000000000000'
                            : 'your-org.okta.com'
                        }
                        className={inputClass}
                        autoComplete="off"
                      />
                      {errors.apiUrl && (
                        <p className={errorClass}>{errors.apiUrl.message}</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className={labelClass}>Client ID</Label>
                    <Input
                      {...form.register('clientId')}
                      className={inputClass}
                      autoComplete="off"
                    />
                    {errors.clientId && (
                      <p className={errorClass}>{errors.clientId.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>Client Secret</Label>
                    <Input
                      {...form.register('clientSecret')}
                      type="password"
                      className={inputClass}
                      autoComplete="off"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>Authorization URL</Label>
                    <Input
                      {...form.register('authUrl')}
                      placeholder={
                        type === 'generic'
                          ? 'https://idp.example.com/oauth2/authorize'
                          : derivedPlaceholder
                      }
                      className={inputClass}
                      autoComplete="off"
                    />
                    {errors.authUrl && (
                      <p className={errorClass}>{errors.authUrl.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>Token URL</Label>
                    <Input
                      {...form.register('tokenUrl')}
                      placeholder={
                        type === 'generic'
                          ? 'https://idp.example.com/oauth2/token'
                          : derivedPlaceholder
                      }
                      className={inputClass}
                      autoComplete="off"
                    />
                    {errors.tokenUrl && (
                      <p className={errorClass}>{errors.tokenUrl.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>Userinfo URL</Label>
                    <Input
                      {...form.register('userinfoUrl')}
                      placeholder={
                        type === 'generic'
                          ? 'https://idp.example.com/oauth2/userinfo'
                          : derivedPlaceholder
                      }
                      className={inputClass}
                      autoComplete="off"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>Scopes</Label>
                    <Input
                      {...form.register('scopes')}
                      placeholder="openid email profile"
                      className={inputClass}
                      autoComplete="off"
                    />
                  </div>
                </>
              )}

              {kind === 'saml' && (
                <>
                  <div className="space-y-2">
                    <Label className={labelClass}>IdP Metadata URL</Label>
                    <Input
                      {...form.register('idpMetadataUrl')}
                      placeholder="https://idp.example.com/metadata"
                      className={inputClass}
                      autoComplete="off"
                    />
                    {errors.idpMetadataUrl && (
                      <p className={errorClass}>
                        {errors.idpMetadataUrl.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>IdP Metadata XML</Label>
                    <Textarea
                      {...form.register('idpMetadataXml')}
                      placeholder="<EntityDescriptor ...>"
                      className={cn(textareaClass, 'min-h-32')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>IdP Entity ID</Label>
                    <Input
                      {...form.register('idpEntityId')}
                      placeholder="Read from the metadata when blank"
                      className={inputClass}
                      autoComplete="off"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>IdP SSO URL</Label>
                    <Input
                      {...form.register('idpSsoUrl')}
                      placeholder="Read from the metadata when blank"
                      className={inputClass}
                      autoComplete="off"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>
                      IdP Signing Certificate
                    </Label>
                    <Textarea
                      {...form.register('idpCert')}
                      placeholder="Read from the metadata when blank"
                      className={cn(textareaClass, 'min-h-24')}
                    />
                  </div>

                  <Controller
                    name="signRequests"
                    control={form.control}
                    render={({ field }) => (
                      <div className={toggleRowClass}>
                        <Label className={labelClass}>
                          Sign authentication requests
                        </Label>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </div>
                    )}
                  />
                </>
              )}
            </div>
          </>
        )}

        {step === 2 && kind === 'oidc' && (
          <>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label className={labelClass}>Email Claim</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className={hintIconClass}>
                      <CircleHelp className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    The account key. Sign-in fails when this claim is missing
                    from the token.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                {...form.register('emailClaim')}
                placeholder="email"
                className={inputClass}
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label className={labelClass}>Name Claim</Label>
              <Input
                {...form.register('nameClaim')}
                placeholder="name"
                className={inputClass}
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label className={labelClass}>Subject Claim</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className={hintIconClass}>
                      <CircleHelp className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    The stable identifier that keeps an account linked to this
                    provider.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                {...form.register('subClaim')}
                placeholder="sub"
                className={inputClass}
                autoComplete="off"
              />
            </div>
          </>
        )}

        {step === 2 && kind === 'saml' && (
          <>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label className={labelClass}>Email Attribute</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className={hintIconClass}>
                      <CircleHelp className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    The account key. Sign-in fails when this attribute is
                    missing from the assertion.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                {...form.register('emailAttribute')}
                placeholder="email"
                className={inputClass}
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label className={labelClass}>Name Attribute</Label>
              <Input
                {...form.register('nameAttribute')}
                placeholder="displayName"
                className={inputClass}
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label className={labelClass}>Name ID Format</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className={hintIconClass}>
                      <CircleHelp className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    The format we ask for the Name ID in. The Name ID is what
                    keeps an account linked to this provider.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                {...form.register('nameIdFormat')}
                className={cn(inputClass, 'font-mono text-xs')}
                autoComplete="off"
              />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <Controller
              name="allowSignUp"
              control={form.control}
              render={({ field }) => (
                <div className={toggleRowClass}>
                  <Label className={labelClass}>
                    Allow new users to sign up
                  </Label>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </div>
              )}
            />

            <Controller
              name="defaultRole"
              control={form.control}
              render={({ field }) => (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label className={labelClass}>Default Role</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className={hintIconClass}>
                          <CircleHelp className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        Everyone gets this role. You can add rules that override
                        it once the provider exists.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={cn(inputClass, 'w-full')}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
          </>
        )}
      </form>
    </BetterDialogContent>
  )
}

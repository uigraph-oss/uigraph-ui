'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Check, Plus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm, type FieldPath } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AUTH_PROVIDERS, CREATE_AUTH_PROVIDER } from './api/org-auth'
import {
  ProviderAttributeFields,
  ProviderConnectionFields,
} from './provider-field-groups'
import {
  AUTH_PROVIDER_DEFAULTS,
  CopyRow,
  Field,
  TextField,
  ToggleField,
  oidcRedirectUri,
  samlAcsUrl,
  samlMetadataUrl,
  schema,
  signInUrl,
  toInput,
  type AuthProviderFormValues,
} from './provider-form-fields'

const STEPS = [
  { label: 'General', note: 'Name it and choose how members will sign in.' },
  {
    label: 'Configuration',
    note: 'Register our URLs in your identity provider, then fill in what it gives you back.',
  },
  {
    label: 'Attributes',
    note: "Where each person's details come from in what your identity provider sends back.",
  },
  { label: 'User Management', note: 'Who becomes a member, and as what.' },
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

export function CreateAuthProviderPage() {
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
  const slug = form.watch('slug')
  const previewSlug = slug || '<slug>'

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
    <div className="px-6 py-6">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-[1rem] leading-[1.33] font-semibold text-[#F4F7FC]">
            Add an identity provider
          </h2>
          <p className="text-paragraph mt-1.5 text-sm leading-[1.33]">
            {STEPS[step].note}
          </p>
        </div>

        <Button
          preset="outline"
          className="shrink-0"
          onClick={() => navigate('/settings/sso')}
        >
          <ArrowLeft className="size-4" />
          Back to SSO
        </Button>
      </div>

      <ol className="mb-8 flex items-center gap-3">
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
        onSubmit={(event) => {
          event.preventDefault()
          if (step < STEPS.length - 1) {
            void handleNext()
            return
          }
          void form.handleSubmit(handleCreate, handleInvalid)()
        }}
        className="max-w-2xl space-y-5"
      >
        {step === 0 && (
          <>
            <Controller
              name="kind"
              control={form.control}
              render={({ field }) => (
                <Field label="Protocol">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => field.onChange('oidc')}
                      className={
                        field.value === 'oidc'
                          ? 'rounded-[12px] border border-[#015AEB] bg-[#015AEB]/10 px-4 py-3 text-sm font-medium text-[#F4F7FC]'
                          : 'rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4 py-3 text-sm font-medium text-[#828DA3] transition-colors hover:border-[#3A4252]'
                      }
                    >
                      OpenID Connect
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange('saml')}
                      className={
                        field.value === 'saml'
                          ? 'rounded-[12px] border border-[#015AEB] bg-[#015AEB]/10 px-4 py-3 text-sm font-medium text-[#F4F7FC]'
                          : 'rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4 py-3 text-sm font-medium text-[#828DA3] transition-colors hover:border-[#3A4252]'
                      }
                    >
                      SAML 2.0
                    </button>
                  </div>
                </Field>
              )}
            />

            <Controller
              name="displayName"
              control={form.control}
              render={({ field }) => (
                <TextField
                  label="Display Name"
                  message={errors.displayName?.message}
                  hint="Shown on the sign-in button."
                  placeholder="Acme Okta"
                  field={field}
                />
              )}
            />

            <Controller
              name="slug"
              control={form.control}
              render={({ field }) => (
                <TextField
                  label="Slug"
                  message={errors.slug?.message}
                  hint={`Sign-in URL: ${signInUrl(orgId, previewSlug)} — it cannot be changed once your identity provider is configured with it.`}
                  placeholder="acme-okta"
                  field={field}
                />
              )}
            />

            <Controller
              name="allowedDomains"
              control={form.control}
              render={({ field }) => (
                <TextField
                  label="Allowed Email Domains"
                  message={errors.allowedDomains?.message}
                  hint="Comma-separated. Leave blank to accept any domain. This only restricts who may sign in through this provider — it is not the organization's email domain list."
                  placeholder="acme.com, acme.co.uk"
                  field={field}
                />
              )}
            />
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <h3 className="text-sm font-semibold text-[#D2D9E6]">
                Give these to your identity provider
              </h3>
              <p className="mt-1 text-sm text-[#828DA3]">
                Register them there, then fill in what it gives you back below.
              </p>
            </div>

            {kind === 'saml' && (
              <>
                <CopyRow
                  label="Entity ID (Audience)"
                  value={samlMetadataUrl(orgId, previewSlug)}
                />
                <CopyRow
                  label="ACS URL (Reply URL)"
                  value={samlAcsUrl(orgId, previewSlug)}
                />
                <CopyRow
                  label="Metadata URL"
                  hint="Serves our signing certificate once the provider is created."
                  value={samlMetadataUrl(orgId, previewSlug)}
                />
              </>
            )}

            {kind === 'oidc' && (
              <CopyRow
                label="Redirect URI (Callback URL)"
                hint="Add this to the allowed redirect URIs of your OIDC application."
                value={oidcRedirectUri(orgId, previewSlug)}
              />
            )}

            <div className="space-y-5 border-t border-[#2A3242] pt-5">
              <div>
                <h3 className="text-sm font-semibold text-[#D2D9E6]">
                  What your identity provider gave you
                </h3>
                <p className="mt-1 text-sm text-[#828DA3]">
                  The credentials and endpoints we use to reach it.
                </p>
              </div>

              <ProviderConnectionFields form={form} mode="create" />
            </div>
          </>
        )}

        {step === 2 && <ProviderAttributeFields form={form} />}

        {step === 3 && (
          <>
            <Controller
              name="allowSignUp"
              control={form.control}
              render={({ field }) => (
                <ToggleField
                  label="Allow new users to sign up"
                  hint="When off, only people who already have an account can sign in."
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name="defaultRole"
              control={form.control}
              render={({ field }) => (
                <Field
                  label="Default Role"
                  hint="The role everyone gets. You can add rules that override it once the provider exists."
                >
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-[48px] w-full rounded-[12px] border border-[#2A3242] bg-[#1E2533] px-4">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </>
        )}

        <div className="flex items-center justify-between border-t border-[#2A3242] pt-5">
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
            <Button type="submit">
              Next
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={form.formState.isSubmitting}>
              <Plus className="size-4" />
              Create provider
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

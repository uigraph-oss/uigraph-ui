import { z } from 'zod'
import { type AuthProvider } from './api/org-auth'

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

export const schema = z
  .object({
    slug: z.string(),
    kind: z.enum(['oidc', 'saml']),
    type: z.enum(['generic', 'entra', 'okta']),
    displayName: z.string().min(1, 'Display name is required'),
    enabled: z.boolean(),
    allowSignUp: z.boolean(),
    allowedDomains: z.string(),
    defaultRole: z.enum(['admin', 'editor', 'viewer']),

    clientId: z.string(),
    clientSecret: z.string(),
    authUrl: z.string(),
    tokenUrl: z.string(),
    userinfoUrl: z.string(),
    apiUrl: z.string(),
    scopes: z.string(),
    emailClaim: z.string(),
    nameClaim: z.string(),
    subClaim: z.string(),
    groupsClaim: z.string(),

    idpMetadataUrl: z.string(),
    idpMetadataXml: z.string(),
    idpEntityId: z.string(),
    idpSsoUrl: z.string(),
    idpCert: z.string(),
    signRequests: z.boolean(),
    nameIdFormat: z.string(),
    emailAttribute: z.string(),
    nameAttribute: z.string(),
    groupsAttribute: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.slug.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['slug'],
        message: 'Slug is required',
      })
    } else if (values.slug.length < 2 || values.slug.length > 63) {
      ctx.addIssue({
        code: 'custom',
        path: ['slug'],
        message: 'Slug must be between 2 and 63 characters',
      })
    } else if (!SLUG_PATTERN.test(values.slug)) {
      ctx.addIssue({
        code: 'custom',
        path: ['slug'],
        message:
          'Slug can only use lowercase letters, digits and single hyphens between them, e.g. acme-okta',
      })
    }

    if (values.kind === 'oidc') {
      if (values.clientId.trim().length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['clientId'],
          message: 'Client ID is required',
        })
      }
      if (values.type === 'entra' && values.apiUrl.trim().length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['apiUrl'],
          message: 'Directory (tenant) ID is required for Microsoft Entra ID',
        })
      }
      if (values.type === 'okta' && values.apiUrl.trim().length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['apiUrl'],
          message: 'Okta domain is required',
        })
      }
      if (values.type === 'generic' && values.authUrl.trim().length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['authUrl'],
          message: 'Authorization URL is required',
        })
      }
      if (values.type === 'generic' && values.tokenUrl.trim().length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['tokenUrl'],
          message: 'Token URL is required',
        })
      }
      return
    }

    if (values.kind === 'saml') {
      const hasMetadata =
        values.idpMetadataUrl.trim().length > 0 ||
        values.idpMetadataXml.trim().length > 0
      const hasExplicit =
        values.idpSsoUrl.trim().length > 0 && values.idpCert.trim().length > 0
      if (!hasMetadata && !hasExplicit) {
        ctx.addIssue({
          code: 'custom',
          path: ['idpMetadataUrl'],
          message:
            'Provide IdP metadata, or fill in the SSO URL and signing certificate below',
        })
      }
      return
    }

    throw new Error(`unknown provider kind`)
  })

export type AuthProviderFormValues = z.infer<typeof schema>

export const AUTH_PROVIDER_DEFAULTS: AuthProviderFormValues = {
  slug: '',
  kind: 'oidc',
  type: 'generic',
  displayName: '',
  enabled: true,
  allowSignUp: true,
  allowedDomains: '',
  defaultRole: 'viewer',

  clientId: '',
  clientSecret: '',
  authUrl: '',
  tokenUrl: '',
  userinfoUrl: '',
  apiUrl: '',
  scopes: 'openid email profile',
  emailClaim: 'email',
  nameClaim: 'name',
  subClaim: 'sub',
  groupsClaim: 'groups',

  idpMetadataUrl: '',
  idpMetadataXml: '',
  idpEntityId: '',
  idpSsoUrl: '',
  idpCert: '',
  signRequests: false,
  nameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
  emailAttribute: 'email',
  nameAttribute: 'displayName',
  groupsAttribute: 'groups',
}

export function toFormValues(provider: AuthProvider): AuthProviderFormValues {
  return {
    slug: provider.slug,
    kind: provider.kind === 'saml' ? 'saml' : 'oidc',
    type:
      provider.type === 'entra' || provider.type === 'okta'
        ? provider.type
        : 'generic',
    displayName: provider.displayName,
    enabled: provider.enabled,
    allowSignUp: provider.allowSignUp,
    allowedDomains: provider.allowedDomains,
    defaultRole:
      provider.defaultRole === 'admin' || provider.defaultRole === 'editor'
        ? provider.defaultRole
        : 'viewer',

    clientId: provider.clientId,
    clientSecret: '',
    authUrl: provider.authUrl,
    tokenUrl: provider.tokenUrl,
    userinfoUrl: provider.userinfoUrl,
    apiUrl: provider.apiUrl,
    scopes: provider.scopes,
    emailClaim: provider.emailClaim,
    nameClaim: provider.nameClaim,
    subClaim: provider.subClaim,
    groupsClaim: provider.groupsClaim,

    idpMetadataUrl: provider.idpMetadataUrl,
    idpMetadataXml: provider.idpMetadataXml,
    idpEntityId: provider.idpEntityId,
    idpSsoUrl: provider.idpSsoUrl,
    idpCert: provider.idpCert,
    signRequests: provider.signRequests,
    nameIdFormat: provider.nameIdFormat,
    emailAttribute: provider.emailAttribute,
    nameAttribute: provider.nameAttribute,
    groupsAttribute: provider.groupsAttribute,
  }
}

export function toInput(values: AuthProviderFormValues) {
  return {
    slug: values.slug,
    kind: values.kind,
    type: values.type,
    displayName: values.displayName,
    enabled: values.enabled,
    allowSignUp: values.allowSignUp,
    allowedDomains: values.allowedDomains,
    defaultRole: values.defaultRole,

    clientId: values.clientId,
    clientSecret: values.clientSecret,
    authUrl: values.authUrl,
    tokenUrl: values.tokenUrl,
    userinfoUrl: values.userinfoUrl,
    apiUrl: values.apiUrl,
    scopes: values.scopes,
    emailClaim: values.emailClaim,
    nameClaim: values.nameClaim,
    subClaim: values.subClaim,
    groupsClaim: values.groupsClaim,

    idpMetadataUrl: values.idpMetadataUrl,
    idpMetadataXml: values.idpMetadataXml,
    idpEntityId: values.idpEntityId,
    idpSsoUrl: values.idpSsoUrl,
    idpCert: values.idpCert,
    signRequests: values.signRequests,
    nameIdFormat: values.nameIdFormat,
    emailAttribute: values.emailAttribute,
    nameAttribute: values.nameAttribute,
    groupsAttribute: values.groupsAttribute,
  }
}

export function signInUrl(orgId: string, slug: string) {
  return `${window.location.origin}/api/v1/auth/orgs/${orgId}/login/${slug}`
}

export function oidcRedirectUri(orgId: string, slug: string) {
  return `${window.location.origin}/api/v1/auth/orgs/${orgId}/callback/${slug}`
}

export function samlAcsUrl(orgId: string, slug: string) {
  return `${window.location.origin}/api/v1/auth/orgs/${orgId}/saml/${slug}/acs`
}

export function samlMetadataUrl(orgId: string, slug: string) {
  return `${window.location.origin}/api/v1/auth/orgs/${orgId}/saml/${slug}/metadata`
}

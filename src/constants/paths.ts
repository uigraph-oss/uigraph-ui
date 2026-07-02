export const Paths = {
  root: '/',
  auth: {
    signin: '/sign-in',
    signup: '/signup',
    emailConfirm: '/confirm-email',
    forgotPassword: '/forgot-password',
    authorize: '/authorize',
  },
  workspace: {
    create: '/create-workspace',
  },
  dashboard: {
    root: '/dashboard',
  },
  services: {
    root: '/services',
    detail: (serviceId: string) => `/services/${serviceId}`,
    overview: (serviceId: string) => `/services/${serviceId}/overview`,
    apis: (serviceId: string) => `/services/${serviceId}/apis`,
    diagrams: (serviceId: string) => `/services/${serviceId}/diagrams`,
    data: (serviceId: string) => `/services/${serviceId}/data`,
    operations: (serviceId: string) => `/services/${serviceId}/operations`,
    people: (serviceId: string) => `/services/${serviceId}/people`,
  },
  localDashboard: {
    root: 'http://localhost:3001/dashboard',
  },
}

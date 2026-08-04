import type { CloudProvider } from '../types'

export const PROVIDERS: Record<
  CloudProvider,
  { label: string; chartColor: string; badgeClassName: string }
> = {
  aws: {
    label: 'AWS',
    chartColor: 'var(--chart-1)',
    badgeClassName: 'bg-[var(--chart-1)]/15 text-[var(--chart-1)]',
  },
  azure: {
    label: 'Azure',
    chartColor: 'var(--chart-2)',
    badgeClassName: 'bg-[var(--chart-2)]/15 text-[var(--chart-2)]',
  },
  gcp: {
    label: 'GCP',
    chartColor: 'var(--chart-3)',
    badgeClassName: 'bg-[var(--chart-3)]/15 text-[var(--chart-3)]',
  },
}

export const PROVIDER_ORDER: CloudProvider[] = ['aws', 'azure', 'gcp']

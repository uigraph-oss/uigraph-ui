import { env } from '@/env'

const trackingEnabled = !!env.googleAnalyticsId

export function trackFb(eventName: string, data?: Record<string, unknown>) {
  if (!trackingEnabled) return console.log('Tracking is disabled')

  try {
    window.fbq?.('track', eventName, { ...data })
  } catch {}
}

export function trackGTag(eventName: string, data?: Record<string, unknown>) {
  if (!trackingEnabled) return console.log('Tracking is disabled')

  try {
    window.gtag?.('event', eventName, { ...data })
  } catch {}
}

export function trackX(eventName: string, data?: Record<string, unknown>) {
  if (!trackingEnabled) return console.log('Tracking is disabled')

  try {
    window.twq?.('track', eventName, { ...data })
  } catch {}
}

export function trackClarity(
  eventName: string,
  data?: Record<string, unknown>
) {
  if (!trackingEnabled) return console.log('Tracking is disabled')

  try {
    window.clarity?.('track', eventName, { ...data })
  } catch {}
}

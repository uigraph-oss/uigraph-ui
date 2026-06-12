'use client'

export function getClientSubdomain() {
  if (typeof location === 'undefined') return null

  if (location.host.includes('localhost')) return null

  return location.host.split('.')[0] || null
}

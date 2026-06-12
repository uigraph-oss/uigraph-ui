export function getControlKey(): 'Meta' | 'Control' {
  if (typeof window === 'undefined') {
    return 'Control'
  }

  const platform = window.navigator.platform.toLowerCase()
  const isMac =
    platform.includes('mac') ||
    platform.includes('iphone') ||
    platform.includes('ipad')

  return isMac ? 'Meta' : 'Control'
}

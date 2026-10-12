export type NexusFeature = 'core' | 'agent'
export type AIProvider = 'openai' | 'openrouter'

export interface Preferences {
  feature: NexusFeature
  provider: AIProvider
}

const storageKey = 'nexus.preferences'

export function readPreferences(): Preferences | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) ?? 'null')
    if (!value || typeof value !== 'object') return null
    const { feature, provider } = value as Record<string, unknown>
    if ((feature === 'core' || feature === 'agent') &&
      (provider === 'openai' || provider === 'openrouter')) return { feature, provider }
  } catch {
    // Unavailable storage or invalid preferences must not block onboarding.
  }
  return null
}

export function savePreferences({ feature, provider }: Preferences): boolean {
  try {
    // Persist this allowlist only. Credentials never enter this function.
    localStorage.setItem(storageKey, JSON.stringify({ feature, provider }))
    return true
  } catch {
    return false
  }
}

import type { MaskFunction } from 'neatlogs'

// Keep rotated/deleted values masked until process exit, including buffered spans.
const protectedCredentials = new Set<string>()
export function protectCredential(value: string): void {
  if (value) protectedCredentials.add(value)
}

// Applied to the SDK's canonical export envelope, including serialized I/O.
// This is credential protection; arbitrary personal data still needs an allowlist.
export function createTelemetryMask(secretValues: string[]): MaskFunction {
  const secrets = secretValues.filter((value) => value.length > 0)
  const credentialField = /(?:^|_)(?:authorization|cookie|set_cookie|password|secret|token|api_key|apikey|access_token|refresh_token|api_token|agent37_key|publish_token)(?:$|_)/i
  function redact(value: unknown): unknown {
    if (typeof value === 'string') {
      try {
        const parsed: unknown = JSON.parse(value)
        if (parsed !== null && typeof parsed === 'object') return JSON.stringify(redact(parsed))
      } catch { /* Ordinary strings need literal credential removal only. */ }
      return [...secrets, ...protectedCredentials].reduce((text, secret) => text.split(secret).join('[REDACTED]'), value)
    }
    if (Array.isArray(value)) return value.map(redact)
    if (value !== null && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [
        key, credentialField.test(key.replace(/[.-]/g, '_')) ? '[REDACTED]' : redact(item)
      ]))
    }
    return value
  }
  return (item) => redact(item) as Record<string, unknown>
}

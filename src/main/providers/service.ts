import { randomUUID } from 'node:crypto'
import type { ProviderConfiguration, ProviderId, ProviderModel, ProviderState } from '../../shared/providers'
import type { CredentialStore, SavedCredentials } from './store'
import { protectCredential } from '../observability/redact.ts'

const endpoints = {
  openai: { baseUrl: 'https://api.openai.com/v1', models: 'https://api.openai.com/v1/models' },
  openrouter: { baseUrl: 'https://openrouter.ai/api/v1', models: 'https://openrouter.ai/api/v1/models/user' }
} as const
export const providerErrors: Record<string, string> = {
  INVALID_REQUEST: 'Invalid provider configuration. Choose a provider and enter a key without spaces.',
  MISSING_CREDENTIALS: 'No saved key for this provider. Enter an API key.',
  INVALID_KEY: 'The provider rejected this key. Replace it in Settings.',
  PERMISSION_DENIED: 'The key lacks permission or is blocked by an account budget. Check provider permissions and billing.',
  RATE_LIMITED: 'The provider is rate limiting requests. Wait, then try again.',
  PROVIDER_ERROR: 'The provider is unavailable or returned an unexpected response. Try again later.',
  NETWORK_ERROR: 'Could not reach the provider. Check your connection and try again.',
  STORAGE_UNAVAILABLE: 'Secure storage is unavailable. Unlock or configure your operating system keyring, then restart Nexus. Keys will not be saved insecurely.',
  STORAGE_ERROR: 'Saved credentials could not be read or saved. Unlock your keyring and check access to Nexus application data.',
  VALIDATION_EXPIRED: 'Validate the key again before saving. The previous check has expired.',
  MODEL_UNAVAILABLE: 'Choose a model returned by the provider for this key.',
  CANCELLED: 'Provider setup was cancelled. Check the key again to continue.',
  BUSY: 'Another provider change is in progress. Try again when it finishes.',
  FORBIDDEN: 'This window is not allowed to configure providers.'
}
export function isProvider(value: unknown): value is ProviderId { return value === 'openai' || value === 'openrouter' }
function fail(code: string): never { throw new Error(code) }

// One shared trusted-process configuration for Core and the future agent runtime.
// Keys are never part of ProviderState or any preload response.
export class ProviderService {
  private pending?: { id: string; provider: ProviderId; apiKey: string; models: ProviderModel[]; expires: number }
  private busy = false
  private expiryTimer?: ReturnType<typeof setTimeout>
  private readonly store: CredentialStore
  private readonly request: typeof fetch
  private revision = 0
  constructor(store: CredentialStore, request: typeof fetch = (...args) => fetch(...args)) {
    this.store = store
    this.request = request
  }

  private async credentials(): Promise<SavedCredentials> {
    const saved = await this.store.read()
    for (const record of Object.values(saved.credentials)) if (record) protectCredential(record.apiKey)
    return saved
  }
  async status(): Promise<ProviderState> {
    const saved = await this.credentials()
    const record = saved.active ? saved.credentials[saved.active] : undefined
    return {
      secureStorage: this.store.available(), savedProviders: Object.keys(saved.credentials).filter(isProvider),
      active: record ? { provider: record.provider, model: record.model, tools: record.tools, verifiedAt: record.verifiedAt } : null
    }
  }
  private async exclusive<T>(operation: () => Promise<T>): Promise<T> {
    if (this.busy) fail('BUSY')
    this.busy = true
    try { return await operation() } finally { this.busy = false }
  }
  async validate(provider: ProviderId, suppliedKey?: string): Promise<{ validationId: string; models: ProviderModel[] }> {
    return this.exclusive(async () => {
      this.discardPending()
      const revision = this.revision
      if (!this.store.available()) fail('STORAGE_UNAVAILABLE')
      const apiKey = suppliedKey ?? (await this.credentials()).credentials[provider]?.apiKey
      if (!apiKey) fail('MISSING_CREDENTIALS')
      if (!/^[\x21-\x7e]{1,4096}$/.test(apiKey)) fail('INVALID_REQUEST')
      protectCredential(apiKey)
      const read = async (url: string): Promise<Record<string, unknown>> => {
        let response: Response
        try {
          response = await this.request(url, { headers: { Authorization: `Bearer ${apiKey}` }, redirect: 'error', signal: AbortSignal.timeout(15_000) })
        } catch { fail('NETWORK_ERROR') }
        if (!response.ok) {
          // Never parse/relay error bodies, which can contain echoed credentials.
          if (response.status === 401) fail('INVALID_KEY')
          if (response.status === 403 || response.status === 402) fail('PERMISSION_DENIED')
          if (response.status === 429) fail('RATE_LIMITED')
          fail('PROVIDER_ERROR')
        }
        try {
          const reader = response.body?.getReader()
          if (!reader) fail('PROVIDER_ERROR')
          const chunks: Uint8Array[] = []
          let size = 0
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            size += value.byteLength
            if (size > 8_000_000) { await reader.cancel(); fail('PROVIDER_ERROR') }
            chunks.push(value)
          }
          const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'))
          if (!parsed || typeof parsed !== 'object') fail('PROVIDER_ERROR')
          return parsed as Record<string, unknown>
        } catch { fail('PROVIDER_ERROR') }
      }
      if (provider === 'openrouter') {
        const keyInfo = await read('https://openrouter.ai/api/v1/key')
        if (!keyInfo.data || typeof keyInfo.data !== 'object') fail('PROVIDER_ERROR')
      }
      const response = await read(endpoints[provider].models)
      if (!Array.isArray(response.data)) fail('PROVIDER_ERROR')
      const models: ProviderModel[] = []
      for (const item of response.data) {
        if (!item || typeof item !== 'object' || typeof item.id !== 'string' ||
          !/^[a-zA-Z0-9._:/@+-]{1,200}$/.test(item.id) || item.id.includes(apiKey)) continue
        if (provider === 'openai' && (!/^(gpt-|o[134](?:[-.]|$))/.test(item.id) || /audio|realtime|transcrib|image|tts|codex|search/.test(item.id))) continue
        if (provider === 'openrouter' && Array.isArray(item.architecture?.output_modalities) && !item.architecture.output_modalities.includes('text')) continue
        const tools = provider === 'openrouter' && Array.isArray(item.supported_parameters)
          ? item.supported_parameters.includes('tools') ? 'supported' : 'unsupported' : 'unknown'
        if (!models.some(model => model.id === item.id)) models.push({ id: item.id, tools })
      }
      models.sort((a, b) => a.id.localeCompare(b.id))
      if (!models.length) fail('MODEL_UNAVAILABLE')
      if (revision !== this.revision) fail('CANCELLED')
      const id = randomUUID()
      this.pending = { id, provider, apiKey, models, expires: Date.now() + 600_000 }
      this.expiryTimer = setTimeout(() => this.discardPending(), 600_000)
      this.expiryTimer.unref()
      return { validationId: id, models }
    })
  }
  async save(validationId: string, model: string): Promise<ProviderState> {
    return this.exclusive(async () => {
      const pending = this.pending
      if (!pending || pending.id !== validationId || pending.expires < Date.now()) fail('VALIDATION_EXPIRED')
      const choice = pending.models.find(item => item.id === model)
      if (!choice) fail('MODEL_UNAVAILABLE')
      const saved = await this.credentials()
      saved.active = pending.provider
      saved.credentials[pending.provider] = { provider: pending.provider, model, tools: choice.tools, apiKey: pending.apiKey, verifiedAt: new Date().toISOString() }
      await this.store.write(saved)
      this.discardPending()
      return this.status()
    })
  }
  async remove(provider: ProviderId): Promise<ProviderState> {
    return this.exclusive(async () => {
      this.discardPending()
      const saved = await this.credentials()
      delete saved.credentials[provider]
      if (saved.active === provider) saved.active = null
      await this.store.write(saved)
      return this.status()
    })
  }
  discardPending(): void {
    this.revision += 1
    this.pending = undefined
    clearTimeout(this.expiryTimer)
    this.expiryTimer = undefined
  }
  async runtimeConfiguration(): Promise<RuntimeProviderConfiguration | null> {
    const saved = await this.credentials()
    const record = saved.active ? saved.credentials[saved.active] : undefined
    return record ? { ...record, baseUrl: endpoints[record.provider].baseUrl } : null
  }
}

// For trusted main-process consumers only. Never bridge this object to a renderer.
export interface RuntimeProviderConfiguration extends ProviderConfiguration {
  baseUrl: string
  apiKey: string
}

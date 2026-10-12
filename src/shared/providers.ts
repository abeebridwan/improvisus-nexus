export type ProviderId = 'openai' | 'openrouter'
export type ToolSupport = 'supported' | 'unsupported' | 'unknown'
export interface ProviderModel { id: string; tools: ToolSupport }
export interface ProviderConfiguration {
  provider: ProviderId
  model: string
  tools: ToolSupport
  verifiedAt: string
}
export interface ProviderState {
  secureStorage: boolean
  savedProviders: ProviderId[]
  active: ProviderConfiguration | null
}
export type ProviderResult<T> = { ok: true; value: T } | { ok: false; code: string; message: string }
export interface ProviderBridge {
  status(): Promise<ProviderResult<ProviderState>>
  validate(request: { provider: ProviderId; apiKey?: string }): Promise<ProviderResult<{ validationId: string; models: ProviderModel[] }>>
  save(request: { validationId: string; model: string }): Promise<ProviderResult<ProviderState>>
  remove(request: { provider: ProviderId }): Promise<ProviderResult<ProviderState>>
  cancel(): Promise<ProviderResult<null>>
}

import OpenAI from 'openai'
import type { ProviderService } from '../providers/service'

let service: ProviderService | undefined

export function configureAiRuntime(providers: ProviderService): void {
  service = providers
}

export async function getAiRuntime() {
  if (!service) throw new Error('Nexus Core is not initialized')
  const configuration = await service.runtimeConfiguration()
  if (!configuration) throw new Error('Connect a provider and save a model in Nexus Settings')
  return {
    provider: configuration.provider,
    model: configuration.model,
    client: new OpenAI({ apiKey: configuration.apiKey, baseURL: configuration.baseUrl })
  }
}

export type AiRuntime = Awaited<ReturnType<typeof getAiRuntime>>

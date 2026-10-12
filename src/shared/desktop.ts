import type { ProviderBridge } from './providers'

export interface DesktopInfo {
  readonly platform: string
  readonly electron: string
  readonly providers: ProviderBridge
}

import type { CoreBridge } from './core'
import type { ProviderBridge } from './providers'

export interface DesktopInfo {
  readonly platform: string
  readonly electron: string
  readonly core: CoreBridge
  readonly providers: ProviderBridge
}


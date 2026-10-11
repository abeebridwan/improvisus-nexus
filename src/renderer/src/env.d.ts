import type { DesktopInfo } from '../../shared/desktop'

declare global {
  interface Window {
    nexus: DesktopInfo
  }
}

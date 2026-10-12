/// <reference types="vite/client" />

import type { DesktopInfo } from '../../shared/desktop'

declare global {
  interface Window {
    nexus: DesktopInfo
  }
}

declare module '*.css' {}

export {}
import { contextBridge } from 'electron'
import type { DesktopInfo } from '../shared/desktop'

const desktop: DesktopInfo = Object.freeze({
  platform: process.platform,
  electron: process.versions.electron
})

contextBridge.exposeInMainWorld('nexus', desktop)

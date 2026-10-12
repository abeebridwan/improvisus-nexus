import { contextBridge, ipcRenderer } from 'electron'
import type { DesktopInfo } from '../shared/desktop'
import type { ProviderBridge, ProviderResult } from '../shared/providers'

async function invoke<T>(name: string, request?: unknown): Promise<ProviderResult<T>> {
  try { return await ipcRenderer.invoke(`nexus:providers:${name}`, ...(request === undefined ? [] : [request])) } catch {
    return { ok: false, code: 'IPC_UNAVAILABLE', message: 'Could not reach provider settings. Restart Nexus.' }
  }
}

const desktop: DesktopInfo = Object.freeze({
  platform: process.platform,
  electron: process.versions.electron,
  providers: Object.freeze<ProviderBridge>({
    status: () => invoke('status'),
    validate: (request) => invoke('validate', request),
    save: (request) => invoke('save', request),
    remove: (request) => invoke('remove', request),
    cancel: () => invoke('cancel')
  })
})

contextBridge.exposeInMainWorld('nexus', desktop)

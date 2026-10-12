import type { CoreBridge, CoreResult } from '../shared/core'
import type { AgentBridge, AgentResult } from '../shared/agent'
import { contextBridge, ipcRenderer } from 'electron'
import type { DesktopInfo } from '../shared/desktop'
import type { ProviderBridge, ProviderResult } from '../shared/providers'

async function invoke<T>(name: string, request?: unknown): Promise<ProviderResult<T>> {
  try { return await ipcRenderer.invoke(`nexus:providers:${name}`, ...(request === undefined ? [] : [request])) } catch {
    return { ok: false, code: 'IPC_UNAVAILABLE', message: 'Could not reach provider settings. Restart Nexus.' }
  }
}

async function invokeCore<T>(name: string, request?: unknown): Promise<CoreResult<T>> {
  try {
    return await ipcRenderer.invoke(`nexus:core:${name}`, ...(request === undefined ? [] : [request]))
  } catch {
    return { ok: false, message: 'Could not reach Nexus Core. Restart Nexus.' }
  }
}

async function invokeAgent<T>(name: string, request?: unknown): Promise<AgentResult<T>> {
  try { return await ipcRenderer.invoke(`nexus:agent:${name}`, ...(request === undefined ? [] : [request])) } catch {
    return { ok: false, message: 'Could not reach Nexus Agent. Restart Nexus.' }
  }
}

const desktop: DesktopInfo = Object.freeze({
  platform: process.platform,
  electron: process.versions.electron,
  agent: Object.freeze<AgentBridge>({
    connect: request => invokeAgent('connect', request),
    refresh: () => invokeAgent('refresh'),
    search: request => invokeAgent('search', request),
    open: request => invokeAgent('open', request),
    run: request => invokeAgent('run', request),
    approve: request => invokeAgent('approve', request),
    cancel: () => invokeAgent('cancel'),
    clear: () => invokeAgent('clear'),
    onEvent: callback => {
      const listener = (_event: unknown, event: unknown) => {
        if (event && typeof event === 'object' && 'message' in event && typeof event.message === 'string') callback(event as Parameters<typeof callback>[0])
      }
      ipcRenderer.on('nexus:agent:event', listener)
      return () => ipcRenderer.removeListener('nexus:agent:event', listener)
    }
  }),
  core: Object.freeze<CoreBridge>({
    pickFolder: () => invokeCore('pick-folder'),
    discover: source => invokeCore('discover', source),
    prepare: request => invokeCore('prepare', request),
    approve: request => invokeCore('approve', request),
    discard: request => invokeCore('discard', request),
    onStep: callback => {
      const listener = (_event: unknown, step: unknown) => {
        if (step && typeof step === 'object' && 'message' in step && typeof step.message === 'string') {
          callback(step as Parameters<typeof callback>[0])
        }
      }
      ipcRenderer.on('nexus:core:step', listener)
      return () => ipcRenderer.removeListener('nexus:core:step', listener)
    }
  }),
  providers: Object.freeze<ProviderBridge>({
    status: () => invoke('status'),
    validate: (request) => invoke('validate', request),
    save: (request) => invoke('save', request),
    remove: (request) => invoke('remove', request),
    cancel: () => invoke('cancel')
  })
})

contextBridge.exposeInMainWorld('nexus', desktop)

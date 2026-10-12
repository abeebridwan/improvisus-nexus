import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'
import { trace } from 'neatlogs'
import { isProvider, providerErrors, ProviderService } from './service'
import type { ProviderResult } from '../../shared/providers'

export function trustedProviderSender(event: IpcMainInvokeEvent, window: BrowserWindow, development: boolean): boolean {
  const frame = event.senderFrame
  if (event.sender !== window.webContents || !frame || frame !== event.sender.mainFrame) return false
  return (frame.url === 'nexus://app/' && frame.origin === 'nexus://app') ||
    (development && frame.url === 'http://127.0.0.1:5173/' && frame.origin === 'http://127.0.0.1:5173')
}
function object(value: unknown, fields: string[]): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value) &&
    Object.keys(value).every(key => fields.includes(key))
}

export function registerProviderIPC(window: BrowserWindow, service: ProviderService, development: boolean, traced: boolean): void {
  const handle = (name: string, run: (request: unknown) => Promise<unknown>) => {
    window.webContents.ipc.handle(`nexus:providers:${name}`, async (event, ...args): Promise<ProviderResult<unknown>> => {
      if (!trustedProviderSender(event, window, development)) return { ok: false, code: 'FORBIDDEN', message: providerErrors.FORBIDDEN }
      try {
        if (args.length > 1) throw new Error('INVALID_REQUEST')
        let value: unknown
        // Only static operation metadata enters tracing, never IPC arguments,
        // provider bodies, key-info payloads, models or credentials.
        if (traced && name !== 'status') {
          await trace({ name: `provider.${name}`, kind: 'CHAIN', input: { operation: name } }, async (span) => {
            value = await run(args[0])
            span.setAttribute('output.value', JSON.stringify({ completed: true }))
          })
        } else { value = await run(args[0]) }
        return { ok: true, value }
      } catch (error) {
        const candidate = error instanceof Error ? error.message : ''
        const code = Object.hasOwn(providerErrors, candidate) ? candidate : 'PROVIDER_ERROR'
        return { ok: false, code, message: providerErrors[code] }
      }
    })
  }
  handle('status', async request => {
    if (request !== undefined) throw new Error('INVALID_REQUEST')
    return service.status()
  })
  handle('validate', async request => {
    if (!object(request, ['provider', 'apiKey']) || !isProvider(request.provider) ||
      (request.apiKey !== undefined && typeof request.apiKey !== 'string')) throw new Error('INVALID_REQUEST')
    return service.validate(request.provider, request.apiKey as string | undefined)
  })
  handle('save', async request => {
    if (!object(request, ['validationId', 'model']) || typeof request.validationId !== 'string' || request.validationId.length > 64 ||
      typeof request.model !== 'string' || request.model.length > 200) throw new Error('INVALID_REQUEST')
    return service.save(request.validationId, request.model)
  })
  handle('remove', async request => {
    if (!object(request, ['provider']) || !isProvider(request.provider)) throw new Error('INVALID_REQUEST')
    return service.remove(request.provider)
  })
  handle('cancel', async request => {
    if (request !== undefined) throw new Error('INVALID_REQUEST')
    service.discardPending()
    return null
  })
  window.on('closed', () => service.discardPending())
}

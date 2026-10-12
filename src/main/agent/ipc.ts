import type { BrowserWindow } from 'electron'
import { z } from 'zod'
import { trustedProviderSender } from '../providers/ipc'
import { AgentController } from './controller'
const Task = z.string().trim().min(1).max(4000)
export function registerAgentIPC(window: BrowserWindow, development: boolean, traced: boolean): void {
  const agent = new AgentController(event => { if (!window.isDestroyed()) window.webContents.send('nexus:agent:event', event) }, traced)
  let operation = false
  const handle = (name: string, run: (request: unknown) => unknown | Promise<unknown>, interrupt = false) => {
    window.webContents.ipc.handle(`nexus:agent:${name}`, async (event, ...args) => {
      if (!trustedProviderSender(event, window, development) || args.length > 1) return { ok: false, message: 'This window cannot control Nexus Agent' }
      if (!interrupt && operation) return { ok: false, message: 'An agent operation is already active' }
      if (!interrupt) operation = true
      try { return { ok: true, value: await run(args[0]) } } catch (error) {
        return { ok: false, message: error instanceof z.ZodError ? 'Invalid Agent request' : error instanceof Error ? error.message : 'Agent operation failed' }
      } finally { if (!interrupt) operation = false }
    })
  }
  handle('connect', request => agent.chrome.connect(z.object({ endpoint: z.string().max(200) }).strict().parse(request).endpoint))
  handle('refresh', request => { z.undefined().parse(request); return agent.chrome.refresh() })
  handle('search', request => agent.search(z.object({ task: Task }).strict().parse(request).task))
  handle('open', async request => { const { id } = z.object({ id: z.string().max(200) }).strict().parse(request); const hit = agent.hits.find(item => item.id === id); if (!hit) throw new Error('Search result is no longer available'); return agent.chrome.open(hit.url) })
  handle('run', request => { const input = z.object({ task: Task, tabId: z.string().uuid() }).strict().parse(request); return agent.run(input.task, input.tabId) })
  handle('approve', request => { const input = z.object({ id: z.string().uuid(), allow: z.boolean() }).strict().parse(request); agent.approve(input.id, input.allow); return null }, true)
  handle('cancel', request => { z.undefined().parse(request); agent.cancel(); return null }, true)
  handle('clear', request => { z.undefined().parse(request); agent.clear(); return null })
  window.on('closed', () => { agent.cancel(); void agent.chrome.disconnect() })
}

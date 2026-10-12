import { dialog, type BrowserWindow } from 'electron'
import { trustedProviderSender } from '../providers/ipc'
import { CoreController } from './pipeline'
import { BatchIdSchema, PrepareSchema, SourceSchema } from './types'
import type { CoreResult } from '../../shared/core'

export function registerCoreIPC(window: BrowserWindow, development: boolean): void {
  const controller = new CoreController(step => {
    if (!window.isDestroyed()) window.webContents.send('nexus:core:step', step)
  })
  const handle = (name: string, run: (request: unknown) => Promise<unknown>) => {
    window.webContents.ipc.handle(`nexus:core:${name}`, async (event, ...args): Promise<CoreResult<unknown>> => {
      if (!trustedProviderSender(event, window, development)) return { ok: false, message: 'This window cannot run Core' }
      if (args.length > 1) return { ok: false, message: 'Invalid Core request' }
      try { return { ok: true, value: await controller.execute(() => run(args[0])) } } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : 'Core operation failed' }
      }
    })
  }
  handle('pick-folder', async request => {
    if (request !== undefined) throw new Error('Folder selection takes no input')
    const result = await dialog.showOpenDialog(window, { title: 'Choose website project', properties: ['openDirectory'] })
    return result.canceled ? null : result.filePaths[0]
  })
  handle('discover', request => controller.discover(SourceSchema.parse(request)))
  handle('prepare', request => {
    const input = PrepareSchema.parse(request)
    return controller.prepare(input.catalogId, input.workflowIds)
  })
  handle('approve', request => controller.approve(BatchIdSchema.parse(request).batchId))
  handle('discard', request => controller.discard(request === undefined ? undefined : BatchIdSchema.parse(request).batchId))
  window.on('closed', () => controller.close())
}

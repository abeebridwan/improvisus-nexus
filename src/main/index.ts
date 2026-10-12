import { app, BrowserWindow, net, protocol, safeStorage } from 'electron'
import { dirname, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'
import { trace } from 'neatlogs'
import { initializeTracing, stopTracing } from './observability'
import { EncryptedCredentialStore } from './providers/store'
import { ProviderService } from './providers/service'
import { registerProviderIPC } from './providers/ipc'
import { configureAiRuntime } from './core/ai-client'
import { registerCoreIPC } from './core/ipc'
import { registerAgentIPC } from './agent/ipc'

const here = dirname(fileURLToPath(import.meta.url))
const rendererRoot = resolve(here, '../renderer')
const appUrl = 'nexus://app/'
const devUrl = process.env.ELECTRON_RENDERER_URL
const csp = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-src 'none'; form-action 'none'"
let tracingEnabled = false
let providers: ProviderService

const envPath = resolve(app.getAppPath(), '.env')
if (!app.isPackaged && existsSync(envPath)) loadEnvFile(envPath)

protocol.registerSchemesAsPrivileged([
  { scheme: 'nexus', privileges: { standard: true, secure: true, supportFetchAPI: true } }
])

function serveRenderer(): void {
  protocol.handle('nexus', async (request) => {
    const url = new URL(request.url)
    if (url.host !== 'app' || request.method !== 'GET') {
      return new Response('Forbidden', { status: 403 })
    }
    const pathname = decodeURIComponent(url.pathname)
    const file = resolve(rendererRoot, `.${pathname === '/' ? '/index.html' : pathname}`)
    if (!file.startsWith(`${rendererRoot}${sep}`)) {
      return new Response('Forbidden', { status: 403 })
    }
    try {
      const response = await net.fetch(pathToFileURL(file).toString())
      const headers = new Headers(response.headers)
      headers.set('Content-Security-Policy', csp)
      headers.set('X-Content-Type-Options', 'nosniff')
      return new Response(response.body, { status: response.status, headers })
    } catch {
      return new Response('Not found', { status: 404 })
    }
  })
}

async function createWindow(): Promise<{ rendererLoaded: true }> {
  const window = new BrowserWindow({
    title: 'Improvisus Nexus',
    width: 1080,
    height: 760,
    minWidth: 720,
    minHeight: 600,
    show: false,
    backgroundColor: '#111411',
    autoHideMenuBar: true,
    webPreferences: {
      preload: resolve(here, '../preload/index.cjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webSecurity: true,
      webviewTag: false
    }
  })

  window.webContents.session.setPermissionRequestHandler((_contents, _permission, callback) => callback(false))
  window.webContents.session.setPermissionCheckHandler(() => false)
  if (!app.isPackaged && devUrl) {
    window.webContents.session.webRequest.onHeadersReceived(
      { urls: ['http://127.0.0.1:5173/*'] },
      (details, callback) => callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': ["default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws://127.0.0.1:5173; object-src 'none'; base-uri 'none'; frame-src 'none'; form-action 'none'"]
        }
      })
    )
  }
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  registerProviderIPC(window, providers, !app.isPackaged && !!devUrl, tracingEnabled)
  registerCoreIPC(window, !app.isPackaged && !!devUrl)
  registerAgentIPC(window, !app.isPackaged && !!devUrl, tracingEnabled)
  window.webContents.on('will-navigate', (event) => event.preventDefault())
  window.webContents.on('will-redirect', (event) => event.preventDefault())
  window.webContents.on('will-attach-webview', (event) => event.preventDefault())
  window.once('ready-to-show', () => window.show())

  const loadRenderer = async (): Promise<{ rendererLoaded: true }> => {
    if (!app.isPackaged && devUrl) {
      const url = new URL(devUrl)
      if (url.origin !== 'http://127.0.0.1:5173') throw new Error('Unexpected renderer development origin')
      await window.loadURL(url.toString())
    } else {
      await window.loadURL(appUrl)
    }
    return { rendererLoaded: true }
  }
  return tracingEnabled
    ? trace({ name: 'desktop.renderer.load', kind: 'CHAIN', input: { source: devUrl ? 'development' : 'bundled' } }, loadRenderer)
    : loadRenderer()
}

app.setName('Improvisus Nexus')
app.whenReady().then(async () => {
  serveRenderer()
  providers = new ProviderService(new EncryptedCredentialStore(app.getPath('userData'), safeStorage))
  configureAiRuntime(providers)

  // Register saved keys with the telemetry mask before enabling any export.
  await providers.status().catch(() => {})
  tracingEnabled = await initializeTracing()
  if (tracingEnabled) {
    let traceId = ''
    await trace({ name: 'desktop.start', kind: 'WORKFLOW', input: { operation: 'launch-desktop' } }, async (span) => {
      traceId = span.spanContext().traceId
      return createWindow()
    })
    // Opt-in main-process diagnostics; no SDK or secret is bridged to the renderer.
    if (process.env.NEXUS_TRACE_STDOUT === '1') console.log(`NEXUS_START_TRACE ${traceId}`)
  } else {
    await createWindow()
  }
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) void createWindow()
  })
}).catch((error: unknown) => {
  console.error('Desktop startup failed:', error)
  process.exitCode = 1
  app.quit()
})

app.on('before-quit', (event) => {
  if (!tracingEnabled) return
  event.preventDefault()
  tracingEnabled = false
  void stopTracing().catch(() => {
    console.error('neatlogs: shutdown failed')
  }).finally(() => app.quit())
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

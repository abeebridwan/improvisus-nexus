import { app, BrowserWindow, net, protocol } from 'electron'
import { dirname, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const rendererRoot = resolve(here, '../renderer')
const appUrl = 'nexus://app/'
const devUrl = process.env.ELECTRON_RENDERER_URL
const csp = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-src 'none'; form-action 'none'"

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

async function createWindow(): Promise<void> {
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
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  window.webContents.on('will-navigate', (event) => event.preventDefault())
  window.webContents.on('will-redirect', (event) => event.preventDefault())
  window.webContents.on('will-attach-webview', (event) => event.preventDefault())
  window.once('ready-to-show', () => window.show())

  if (!app.isPackaged && devUrl) {
    const url = new URL(devUrl)
    if (url.origin !== 'http://127.0.0.1:5173') throw new Error('Unexpected renderer development origin')
    await window.loadURL(url.toString())
  } else {
    await window.loadURL(appUrl)
  }
}

app.setName('Improvisus Nexus')
app.whenReady().then(async () => {
  serveRenderer()
  await createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) void createWindow()
  })
}).catch((error: unknown) => {
  console.error('Desktop startup failed:', error)
  app.exit(1)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

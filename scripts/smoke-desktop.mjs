import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { _electron } from 'playwright'

// Electron uses its own Chromium. No separate browser download is needed here.
const env = { ...process.env }
delete env.ELECTRON_RUN_AS_NODE
delete env.ELECTRON_RENDERER_URL
const desktop = await _electron.launch({ args: ['.'], env, chromiumSandbox: true, timeout: 30_000 })
try {
  const page = await desktop.firstWindow()
  await page.getByRole('heading', { name: 'A place for agents to get work done.' }).waitFor()
  assert.equal(await page.title(), 'Improvisus Nexus')
  assert.equal(page.url(), 'nexus://app/')
  assert.equal(await page.getByText('Desktop shell ready', { exact: true }).count(), 1)
  const isolation = await page.evaluate(() => ({
    node: typeof window.require,
    process: typeof window.process,
    electron: window.nexus.electron,
    bridge: Object.keys(window.nexus).sort()
  }))
  assert.equal(isolation.node, 'undefined')
  assert.equal(isolation.process, 'undefined')
  assert.ok(isolation.electron)
  assert.deepEqual(isolation.bridge, ['electron', 'platform'])
  const preferences = await desktop.evaluate(({ BrowserWindow }) => {
    const window = BrowserWindow.getAllWindows()[0]
    const prefs = window.webContents.getLastWebPreferences()
    return { sandbox: prefs.sandbox, contextIsolation: prefs.contextIsolation, nodeIntegration: prefs.nodeIntegration, webSecurity: prefs.webSecurity }
  })
  assert.deepEqual(preferences, { sandbox: true, contextIsolation: true, nodeIntegration: false, webSecurity: true })
  const launchArgs = await desktop.evaluate(() => process.argv)
  assert.equal(launchArgs.includes('--no-sandbox'), false)
  assert.equal(launchArgs.includes('--disable-setuid-sandbox'), false)
  assert.equal(await page.evaluate(() => Notification.requestPermission()), 'denied')
  await page.evaluate(() => window.open('https://example.com'))
  assert.equal(desktop.windows().length, 1)
  const policy = await desktop.evaluate(async ({ net }) => {
    const response = await net.fetch('nexus://app/')
    return response.headers.get('Content-Security-Policy')
  })
  assert.ok(policy.includes("script-src 'self'"))
  assert.ok(policy.includes("connect-src 'none'"))
  await mkdir('artifacts', { recursive: true })
  await page.screenshot({ path: 'artifacts/desktop-smoke.png' })
  console.log('PASS: Electron launch with Chromium sandbox enabled, React render, preload, isolation, permission denial, popup denial')
} finally {
  await desktop.close()
}

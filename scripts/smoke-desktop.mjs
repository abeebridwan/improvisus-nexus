import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { _electron } from 'playwright'
import electron from 'electron'
import { desktopEnvironment, prepareLinuxSandbox } from './electron-env.mjs'

// Electron uses its own Chromium. No separate browser download is needed here.
const env = desktopEnvironment()
prepareLinuxSandbox(electron, env)
delete env.ELECTRON_RENDERER_URL
// Test preferences in an isolated profile, never in the user's desktop profile.
const profile = await mkdtemp(join(tmpdir(), 'nexus-onboarding-'))
let desktop
try {
  desktop = await _electron.launch({ args: ['.', `--user-data-dir=${profile}`], env, chromiumSandbox: true, timeout: 30_000 })
  const page = await desktop.firstWindow()
  await page.getByRole('heading', { name: 'What will you do with Nexus?' }).waitFor()
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
  await page.screenshot({ path: 'artifacts/onboarding-feature.png', fullPage: true })

  const messages = []
  page.on('console', message => messages.push(message.text()))
  page.on('pageerror', error => messages.push(error.message))
  const fixtureKey = 'nexus-ui-test-only-not-a-real-api-key'
  const continueButton = page.getByRole('button', { name: 'Continue', exact: true })
  const explore = page.getByRole('button', { name: 'Save preferences & explore workspace' })
  const key = page.getByLabel('API key', { exact: false })
  assert.equal(await continueButton.isDisabled(), true)
  await page.getByRole('radio', { name: /Nexus Core/ }).check()
  await continueButton.click()
  await page.getByRole('heading', { name: 'Bring your own AI.' }).waitFor()
  assert.equal(await key.isDisabled(), true)
  assert.equal(await explore.isDisabled(), true)
  await page.getByRole('radio', { name: 'OpenRouter', exact: true }).check()
  assert.equal(await key.getAttribute('type'), 'password')
  await key.fill('   ')
  assert.equal(await key.getAttribute('aria-invalid'), 'true')
  await key.fill(fixtureKey)
  assert.equal(await key.getAttribute('aria-invalid'), 'false')
  assert.ok((await page.locator('#key-status').innerText()).includes('not verified'))
  assert.equal(await page.evaluate(() => localStorage.length), 0)
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  assert.equal(await page.getByRole('radio', { name: /Nexus Core/ }).isChecked(), true)
  await continueButton.click()
  assert.equal(await page.getByRole('radio', { name: 'OpenRouter', exact: true }).isChecked(), true)
  assert.equal(await key.inputValue(), '')
  await key.fill(fixtureKey)
  await page.getByRole('radio', { name: 'OpenAI', exact: true }).check()
  assert.equal(await key.inputValue(), '')
  await page.getByRole('radio', { name: 'OpenRouter', exact: true }).check()
  await page.screenshot({ path: 'artifacts/onboarding-provider.png', fullPage: true })
  await key.fill(fixtureKey)
  assert.equal((await page.locator('body').innerText()).includes(fixtureKey), false)
  await explore.click()
  await page.getByRole('heading', { name: 'Nexus Core', exact: true }).waitFor()
  assert.equal(await page.locator('input[type="password"]').count(), 0)
  assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('nexus.preferences'))), { feature: 'core', provider: 'openrouter' })
  assert.equal(await page.evaluate(() => sessionStorage.length), 0)
  assert.equal(messages.some(message => message.includes(fixtureKey)), false)
  assert.equal((await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }))).includes(fixtureKey), false)
  await page.screenshot({ path: 'artifacts/onboarding-workspace.png', fullPage: true })
  await page.getByRole('button', { name: 'Nexus Agent', exact: true }).click()
  await page.getByRole('heading', { name: 'Nexus Agent', exact: true }).waitFor()
  await page.reload()
  await page.getByRole('heading', { name: 'Nexus Agent', exact: true }).waitFor()
  assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('nexus.preferences'))), { feature: 'agent', provider: 'openrouter' })
  await page.getByRole('button', { name: 'Change provider' }).click()
  assert.equal(await key.inputValue(), '')

  // Stored preferences never imply a connected provider, and malformed state
  // must fall back to onboarding rather than crashing or accepting unknown IDs.
  await page.evaluate(() => localStorage.setItem('nexus.preferences', '{invalid'))
  await page.reload()
  await page.getByRole('heading', { name: 'What will you do with Nexus?' }).waitFor()
  assert.equal(await continueButton.isDisabled(), true)
  await page.evaluate(() => localStorage.clear())
  await page.getByRole('radio', { name: /Nexus Agent/ }).check()
  await continueButton.click()
  await page.getByRole('radio', { name: 'OpenAI', exact: true }).check()
  for (const width of [720, 1080]) {
    await page.setViewportSize({ width, height: 600 })
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true)
  }
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('Unavailable', 'SecurityError') } })
  await explore.click()
  await page.getByRole('heading', { name: 'Nexus Agent', exact: true }).waitFor()
  await page.getByText('Preferences could not be saved on this device. You can still explore this session.').waitFor()
  console.log('PASS: sandboxed desktop, security controls, onboarding, back navigation, workspace switching, preference reload, key non-persistence, storage failure, responsive layout')
} finally {
  await desktop?.close()
  await rm(profile, { recursive: true, force: true })
}

import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { _electron } from 'playwright'
import electron from 'electron'
import { desktopEnvironment, prepareLinuxSandbox } from './electron-env.mjs'

// Electron uses its own Chromium. No separate browser download is needed here.
const env = { ...desktopEnvironment(), NEATLOGS_API_KEY: '' }
prepareLinuxSandbox(electron, env)
delete env.ELECTRON_RENDERER_URL
// Test preferences in an isolated profile, never in the user's desktop profile.
const profile = await mkdtemp(join(tmpdir(), 'nexus-onboarding-'))
let desktop
const passwordStore = process.env.NEXUS_TEST_PASSWORD_STORE
if (passwordStore && !['gnome-libsecret', 'kwallet', 'kwallet5', 'kwallet6'].includes(passwordStore)) throw new Error('Unsupported test keyring')
const keyringPreload = fileURLToPath(new URL('./electron-test-keyring.cjs', import.meta.url))
const args = ['-r', keyringPreload, '.', `--user-data-dir=${profile}`]
async function launch() {
  return _electron.launch({ args, env, chromiumSandbox: true, timeout: 30_000 })
}
// Only the transport is replaced, in this test process. Production IPC,
// provider service, encryption, file storage and UI remain the actual code.
async function providerFixtures() {
  await desktop.evaluate(() => {
    globalThis.fetch = async (url, options) => {
      const allowed = ['https://api.openai.com/v1/models', 'https://openrouter.ai/api/v1/key', 'https://openrouter.ai/api/v1/models/user']
      if (!allowed.includes(String(url))) throw new Error('Unexpected fixture request')
      const key = options?.headers?.Authorization
      if (key === 'Bearer fixture-invalid-key') return new Response('Echoed fixture-invalid-key', { status: 401 })
      if (key === 'Bearer fixture-provider-error') return new Response('Echoed fixture-provider-error', { status: 503 })
      if (!key?.startsWith('Bearer fixture-saved-')) throw new Error('Unexpected fixture key')
      if (String(url).endsWith('/key')) return Response.json({ data: { label: 'fixture' } })
      return Response.json({ data: String(url).includes('openrouter')
        ? [{ id: 'fixture/text-model', architecture: { output_modalities: ['text'] }, supported_parameters: ['tools'] }]
        : [{ id: 'gpt-4.1-mini' }] })
    }
  })
}
try {
  desktop = await launch()
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
  assert.deepEqual(isolation.bridge, ['electron', 'platform', 'providers'])
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

  assert.deepEqual(await page.evaluate(() => Object.keys(window.nexus.providers).sort()), ['cancel', 'remove', 'save', 'status', 'validate'])
  const badRequest = await page.evaluate(() => window.nexus.providers.validate({ provider: 'openai', endpoint: 'https://example.com' }))
  assert.equal(badRequest.code, 'INVALID_REQUEST')
  // A child frame cannot access the privileged, main-frame provider handlers.
  const denied = await desktop.evaluate(async ({ BrowserWindow }) => {
    const contents = BrowserWindow.getAllWindows()[0].webContents
    await contents.executeJavaScript(`document.body.appendChild(document.createElement('iframe'))`)
    const child = contents.mainFrame.frames[0]
    const result = await child.executeJavaScript(`window.nexus ? window.nexus.providers.status() : null`)
    await contents.executeJavaScript(`document.querySelector('iframe').remove()`)
    return result
  })
  assert.ok(denied === null || (denied.ok === false && denied.code === 'FORBIDDEN'))
  const continueButton = page.getByRole('button', { name: 'Continue', exact: true })
  assert.equal(await continueButton.isDisabled(), true)
  await page.getByRole('radio', { name: /Nexus Core/ }).check()
  await continueButton.click()
  const keyInput = page.getByLabel('API key', { exact: false })
  assert.equal(await keyInput.getAttribute('type'), 'password')
  await keyInput.fill('fixture-unsaved-key')
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  assert.equal(await page.getByRole('radio', { name: /Nexus Core/ }).isChecked(), true)
  await continueButton.click()
  assert.equal(await keyInput.inputValue(), '')
  const status = await page.evaluate(() => window.nexus.providers.status())
  assert.equal(status.ok, true)
  await page.screenshot({ path: 'artifacts/provider-settings.png', fullPage: true })
  if (!status.value.secureStorage) {
    console.log('Storage diagnostic:', await desktop.evaluate(({ safeStorage }) => ({
      backend: process.platform === 'linux' ? safeStorage.getSelectedStorageBackend() : process.platform,
      encryptionAvailable: safeStorage.isEncryptionAvailable()
    })))
    assert.equal(await page.getByRole('button', { name: 'Check key & load models' }).isDisabled(), true)
    assert.equal((await page.evaluate(() => window.nexus.providers.validate({ provider: 'openai', apiKey: 'fixture-unsaved-key' }))).code, 'STORAGE_UNAVAILABLE')
    assert.equal(await page.evaluate(() => localStorage.length), 0)
    console.log('PASS: sandboxed desktop, restricted IPC, onboarding, key clearing and refusal of unavailable secure storage')
    console.log('SKIP: secure save/restart/workspace checks need an unlocked OS keyring; Linux GNOME: NEXUS_TEST_PASSWORD_STORE=gnome-libsecret npm test')
  } else {
    await providerFixtures()
    const missing = await page.evaluate(() => window.nexus.providers.validate({ provider: 'openai' }))
    assert.equal(missing.code, 'MISSING_CREDENTIALS')
    await keyInput.fill('fixture-invalid-key')
    await page.getByRole('button', { name: 'Check key & load models' }).click()
    await page.getByText('The provider rejected this key. Replace it in Settings.').waitFor()
    assert.equal(await keyInput.inputValue(), '')
    await keyInput.fill('fixture-provider-error')
    await page.getByRole('button', { name: 'Check key & load models' }).click()
    await page.getByText('The provider is unavailable or returned an unexpected response. Try again later.').waitFor()
    await keyInput.fill('fixture-saved-openai-key')
    await page.getByRole('button', { name: 'Check key & load models' }).click()
    await page.getByLabel('Model', { exact: true }).selectOption('gpt-4.1-mini')
    await page.getByRole('button', { name: 'Save & open workspace' }).click()
    await page.getByRole('heading', { name: 'Nexus Core', exact: true }).waitFor()
    await page.getByLabel('Local project path').fill('/tmp/example-project')
    await page.getByRole('radio', { name: 'Website URL', exact: true }).check()
    await page.getByRole('textbox', { name: 'Website URL', exact: true }).fill('https://example.com')
    assert.equal(await page.getByRole('button', { name: 'Discover workflows' }).isDisabled(), true)
    await page.getByRole('button', { name: 'Nexus Agent', exact: true }).click()
    await page.getByLabel('What would you like Nexus to do?').fill('Find one capability')
    assert.equal(await page.getByRole('button', { name: 'Discover capabilities' }).isDisabled(), true)
    assert.equal(await page.getByRole('button', { name: 'Run task' }).isDisabled(), true)
    await page.getByRole('button', { name: 'Settings', exact: true }).click()
    await page.getByRole('radio', { name: 'OpenRouter', exact: true }).check()
    await keyInput.fill('fixture-saved-openrouter-key')
    await page.getByRole('button', { name: 'Check key & load models' }).click()
    await page.getByLabel('Model', { exact: true }).selectOption('fixture/text-model')
    await page.getByRole('button', { name: 'Save & open workspace' }).click()
    await page.getByRole('heading', { name: 'Nexus Agent', exact: true }).waitFor()
    const configured = await page.evaluate(() => window.nexus.providers.status())
    assert.equal(configured.value.active.provider, 'openrouter')
    const ciphertext = await readFile(join(profile, 'provider-config.enc'))
    assert.equal(ciphertext.includes(Buffer.from('fixture-saved-')), false)
    assert.equal((await stat(join(profile, 'provider-config.enc'))).mode & 0o777, 0o600)
    const frontendStorage = await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }))
    assert.equal(frontendStorage.includes('fixture-saved-'), false)
    assert.deepEqual(JSON.parse(frontendStorage)['nexus.preferences'], JSON.stringify({ feature: 'agent', provider: 'openrouter' }))
    await page.screenshot({ path: 'artifacts/provider-workspace.png', fullPage: true })
    await desktop.close()
    desktop = await launch()
    const restarted = await desktop.firstWindow()
    await restarted.getByRole('heading', { name: 'Nexus Agent', exact: true }).waitFor()
    assert.deepEqual(await restarted.evaluate(() => window.nexus.providers.status()), configured)
    await providerFixtures()
    await restarted.getByRole('button', { name: 'Settings', exact: true }).click()
    const replacement = restarted.getByLabel('API key', { exact: false })
    assert.equal(await replacement.inputValue(), '')
    await replacement.fill('fixture-saved-replacement-key')
    await restarted.getByRole('button', { name: 'Check key & load models' }).click()
    await restarted.getByRole('button', { name: 'Save & open workspace' }).click()
    await restarted.getByRole('heading', { name: 'Nexus Agent', exact: true }).waitFor()
    await restarted.getByRole('button', { name: 'Settings', exact: true }).click()
    await restarted.getByRole('button', { name: 'Delete saved OpenRouter key' }).click()
    await restarted.getByText('Saved key deleted.', { exact: true }).waitFor()
    assert.equal((await restarted.evaluate(() => window.nexus.providers.status())).value.active, null)
    await restarted.getByRole('radio', { name: 'OpenAI', exact: true }).check()
    await restarted.getByRole('button', { name: 'Delete saved OpenAI key' }).click()
    await restarted.getByText('Saved key deleted.', { exact: true }).waitFor()
    assert.deepEqual((await restarted.evaluate(() => window.nexus.providers.status())).value.savedProviders, [])
    console.log('PASS: sandboxed Electron, restricted IPC, fixture provider outcomes, real OS-encrypted save/restart, replacement/deletion, shared provider navigation; no live inference')
  }

} finally {
  await desktop?.close()
  await rm(profile, { recursive: true, force: true })
}

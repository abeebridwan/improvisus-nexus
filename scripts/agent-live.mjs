// Opt-in live verification. Uses an isolated Chrome/profile and the supplied
// public demo. Production Nexus itself only connects to existing Chrome.
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, copyFile, rm } from 'node:fs/promises'
import { tmpdir, homedir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, _electron } from 'playwright'
import electron from 'electron'
import { desktopEnvironment, prepareLinuxSandbox } from './electron-env.mjs'
if (!process.argv.includes('--live')) throw new Error('This uses your configured provider for real inference. Run with --live only when intended.')
const root = await mkdtemp(join(tmpdir(), 'nexus-agent-live-'))
let chrome, desktop
try {
  const profile = join(root, 'desktop')
  await mkdir(profile)
  await copyFile(join(homedir(), '.config/Improvisus Nexus/provider-config.enc'), join(profile, 'provider-config.enc'))
  chrome = await chromium.launchPersistentContext(join(root, 'chrome'), { channel: 'chrome', headless: false, chromiumSandbox: true, args: ['--enable-features=WebMCP', '--remote-debugging-port=9225', '--remote-debugging-address=127.0.0.1'] })
  const website = await chrome.newPage()
  await website.goto('https://prod-main-web-8e9af6-00m6pcgptg8.compute.instacloud-edge.com/', { waitUntil: 'networkidle', timeout: 30_000 })
  const env = { ...desktopEnvironment(), NEXUS_TEST_PASSWORD_STORE: 'gnome-libsecret' }
  delete env.ELECTRON_RENDERER_URL
  prepareLinuxSandbox(electron, env)
  desktop = await _electron.launch({ args: ['-r', fileURLToPath(new URL('./electron-test-keyring.cjs', import.meta.url)), '.', `--user-data-dir=${profile}`], env, chromiumSandbox: true })
  const page = await desktop.firstWindow()
  await page.getByRole('heading', { name: 'What will you do with Nexus?' }).waitFor()
  const status = await page.evaluate(() => window.nexus.providers.status())
  assert.ok(status.ok && status.value.active, 'Saved provider configuration could not be restored securely')
  await page.evaluate(provider => { localStorage.setItem('nexus.preferences', JSON.stringify({ feature: 'agent', provider })); window.__agentEvents = [] }, status.value.active.provider)
  await page.reload()
  await page.getByRole('heading', { name: 'Nexus Agent', exact: true }).waitFor()
  await page.evaluate(() => { window.__agentEvents = []; window.nexus.agent.onEvent(event => { window.__agentEvents.push(event); if (event.approval) void window.nexus.agent.cancel() }) })
  await page.getByLabel('Chrome debugging endpoint').fill('http://127.0.0.1:9225')
  await page.getByRole('button', { name: 'Connect Chrome' }).click()
  await page.getByText('Connected', { exact: true }).waitFor()
  const connection = await page.evaluate(() => window.nexus.agent.refresh())
  assert.ok(connection.ok, 'Chrome connection failed')
  const tab = connection.value.find(tab => tab.url.includes('prod-main-web-8e9af6'))
  assert.ok(tab, 'Demo Chrome tab not discovered')
  console.log(JSON.stringify({ provider: status.value.active.provider, model: status.value.active.model, liveTools: tab.tools.map(tool => ({ name: tool.name, annotations: tool.annotations, schema: tool.inputSchema })), issue: tab.issue }))
  if (!tab.tools.length) throw new Error('Actual demo does not currently expose WebMCP tools in Chrome; no execution was simulated')
  await page.getByLabel('Existing Chrome tab').selectOption(tab.id)
  await page.getByLabel('What would you like Nexus to do?').fill("Call the available read-only search tool for 'a', then for 'e'. Report both actual returned values. Empty results are valid completed searches. Verify both returned values with JSON-pointer checks. Do not invent matches.")
  await page.getByRole('button', { name: 'Run task', exact: true }).click()
  await page.waitForFunction(() => !!document.querySelector('[role="alert"]') || [...document.querySelectorAll('h3')].some(h => ['Verified tool evidence','Outcome not verified'].includes(h.textContent)), undefined, { timeout: 180_000 })
  const verified = await page.getByRole('heading', { name: 'Verified tool evidence', exact: true }).count() > 0
  const result = { verified, error: await page.locator('[role="alert"]').textContent({ timeout: 500 }).catch(() => null) }
  const events = await page.evaluate(() => window.__agentEvents)
  console.log(JSON.stringify({ outcome: result, toolCalls: events.filter(event => event.result).map(event => event.result.tool), verification: events.filter(event => ['verified', 'unverified'].includes(event.stage)).map(event => event.message), traceIds: events.flatMap(event => event.traceId ? [event.traceId] : []) }))
  assert.ok(result.verified, 'Live agent outcome was not verified')
  assert.ok(events.filter(event => event.result).length >= 2, 'Expected a real multi-step task')
  // Agent Clear leaves the attached browser and pages intact.
  await page.getByRole('button', { name: 'Clear', exact: true }).click()
  assert.equal(await page.getByLabel('What would you like Nexus to do?').inputValue(), '')
  assert.equal(website.isClosed(), false)
  console.log('PASS: real configured LLM, actual demo tool discovery, multi-step native WebMCP execution and tool-result verification; Chrome remains open after Agent Clear')
} finally {
  await desktop?.close()
  await chrome?.close()
  await rm(root, { recursive: true, force: true })
}

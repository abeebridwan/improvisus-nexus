import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { createRequire } from 'node:module'
import http from 'node:http'
import { _electron } from 'playwright'
import { desktopEnvironment, prepareLinuxSandbox } from './electron-env.mjs'
const executablePath = resolve(process.argv[2] || 'release/linux-unpacked/improvisus-nexus')
const resources = join(dirname(executablePath), 'resources')
const require = createRequire(import.meta.url)
const files = require('@electron/asar').listPackage(join(resources, 'app.asar'))
assert.equal(files.some(file => /(^|\/)(\.env(?:\..*)?|provider-config\.enc|\.entire|\.codex)(\/|$)/.test(file)), false)
assert.ok(files.includes('/out/renderer/index.html'))
assert.ok(files.includes('/out/preload/index.cjs'))
assert.deepEqual(Object.keys(JSON.parse(await readFile(join(resources, 'judge-integrations.json'), 'utf8'))).sort(), ['AGENT37_API_KEY', 'AGENT37_INSTANCE_ID', 'INSTA_ADAPTER_HOST_URL', 'INSTA_PUBLISH_TOKEN'].sort())
const profile = await mkdtemp(join(tmpdir(), 'nexus-packaged-'))
const env = { ...desktopEnvironment(), NEATLOGS_API_KEY: '', NEXUS_TRACE_STDOUT: '' }
delete env.ELECTRON_RENDERER_URL
for (const name of ['AGENT37_API_KEY','AGENT37_INSTANCE_ID','AGENT37_INSTANCE_URL','INSTA_ADAPTER_HOST_URL','INSTA_PUBLISH_TOKEN']) delete env[name]
prepareLinuxSandbox(executablePath, env)
let desktop
const server = http.createServer((_request, response) => { response.writeHead(200, { 'Content-Type': 'text/html' }); response.end('<!doctype html><title>Bundled browser</title>') })
try {
  await new Promise((accept, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', accept) })
  const fixtureUrl = `http://127.0.0.1:${server.address().port}`
  desktop = await _electron.launch({ executablePath, args: [`--user-data-dir=${profile}`], env, chromiumSandbox: true, timeout: 30_000 })
  const page = await desktop.firstWindow()
  await page.getByRole('heading', { name: 'What will you do with Nexus?' }).waitFor()
  assert.equal(page.url(), 'nexus://app/')
  const state = await desktop.evaluate(({ app, BrowserWindow }) => {
    const preferences = BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences()
    return { packaged: app.isPackaged, sandbox: preferences.sandbox, isolated: preferences.contextIsolation, node: preferences.nodeIntegration,
      integrations: ['AGENT37_API_KEY','AGENT37_INSTANCE_ID','INSTA_ADAPTER_HOST_URL','INSTA_PUBLISH_TOKEN'].every(name => Boolean(process.env[name])), browsers: process.env.PLAYWRIGHT_BROWSERS_PATH }
  })
  assert.deepEqual({ packaged: state.packaged, sandbox: state.sandbox, isolated: state.isolated, node: state.node, integrations: state.integrations }, { packaged: true, sandbox: true, isolated: true, node: false, integrations: true })
  assert.equal(state.browsers, join(resources, 'browsers'))
  const browserResult = await desktop.evaluate(async (_electron, fixtureUrl) => {
    const { createRequire } = process.getBuiltinModule('module')
    const { chromium } = createRequire(`${process.resourcesPath}/app.asar/package.json`)('playwright')
    const browser = await chromium.launch({ headless: false, args: ['--enable-features=WebMCP'] })
    try {
      const page = await browser.newPage()
      await page.goto(fixtureUrl)
      return { executablePath: chromium.executablePath(), title: await page.title(), webmcp: await page.evaluate(() => Boolean(document.modelContext)) }
    } finally { await browser.close() }
  }, fixtureUrl)
  assert.ok(browserResult.executablePath.startsWith(join(resources, 'browsers')))
  assert.equal(browserResult.title, 'Bundled browser')
  assert.equal(browserResult.webmcp, true)
  assert.equal(existsSync(browserResult.executablePath), true)
  console.log('PASS: packaged production launch, renderer/preload, sandbox/isolation, integration defaults loaded in main process, excluded source secrets/session files, bundled Chromium launch and native WebMCP availability')
} finally { await desktop?.close(); await new Promise(accept => server.close(accept)); await rm(profile, { recursive: true, force: true }) }

import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { writeFile, mkdir } from 'node:fs/promises'
import electron from 'electron'
import { chromium } from 'playwright'
import { desktopEnvironment } from './electron-env.mjs'

// Real application startup, not SDK Doctor or an invented agent operation.
const env = { ...desktopEnvironment(), NEXUS_TRACE_STDOUT: '1' }
delete env.ELECTRON_RENDERER_URL
const child = spawn(electron, ['--remote-debugging-address=127.0.0.1', '--remote-debugging-port=0', '.'], { env, stdio: ['ignore', 'pipe', 'pipe'] })
const exited = once(child, 'exit')
void exited.catch(() => {})
const timeout = AbortSignal.timeout(45_000)
let browser
let traceId
let output = ''
let errors = ''
const ready = new Promise((resolve, reject) => {
  child.on('error', reject)
  child.once('exit', () => reject(new Error('Desktop exited before debugging endpoint was ready')))
  timeout.addEventListener('abort', () => reject(new Error('Desktop startup timed out')), { once: true })
  child.stderr.on('data', (chunk) => {
    errors = (errors + chunk.toString()).slice(-16_384)
    const match = errors.match(/DevTools listening on (ws:\/\/127\.0\.0\.1:[^\s]+)/)
    if (match) resolve(match[1])
  })
})
const traced = new Promise((resolve, reject) => {
  timeout.addEventListener('abort', () => reject(new Error('No startup trace ID received')), { once: true })
  child.stdout.on('data', (chunk) => {
    output = (output + chunk.toString()).slice(-16_384)
    const match = output.match(/NEXUS_START_TRACE ([a-f0-9]{32})/)
    if (match) resolve(match[1])
  })
})
// Attach rejection handlers immediately while waiting on the other startup event.
void traced.catch(() => {})
try {
  browser = await chromium.connectOverCDP(await ready)
  const context = browser.contexts()[0]
  const page = context.pages()[0] ?? await context.waitForEvent('page', { timeout: 30_000 })
  await page.getByRole('heading', { name: 'A place for agents to get work done.' }).waitFor()
  assert.equal(page.url(), 'nexus://app/')
  assert.equal(await page.title(), 'Improvisus Nexus')
  traceId = await traced
  await page.evaluate(() => window.close())
  const [code] = await Promise.race([exited, new Promise((_, reject) => timeout.addEventListener('abort', () => reject(new Error('Desktop shutdown timed out')), { once: true }))])
  assert.equal(code, 0)
  assert.equal(/neatlogs:.*(?:failed|not fully exported|did not complete)/.test(errors), false, 'Telemetry lifecycle reported a failure')
  await mkdir('artifacts', { recursive: true })
  await writeFile('artifacts/neatlogs-desktop.json', JSON.stringify({ traceId, workflow: 'improvisus-nexus', localChecks: 'passed', readback: 'not-yet-verified' }, null, 2) + '\n', { mode: 0o600 })
  console.log(JSON.stringify({ traceId, operation: 'desktop startup and renderer load', localChecks: 'passed', readback: 'not-yet-verified' }))
} finally {
  await browser?.close().catch(() => {})
  if (child.exitCode === null) child.kill('SIGTERM')
}

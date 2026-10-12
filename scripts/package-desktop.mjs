import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { parseEnv } from 'node:util'

async function run(script, args, env = process.env) {
  await new Promise((accept, reject) => {
    const child = spawn(process.execPath, [resolve(script), ...args], { env, stdio: 'inherit' })
    child.on('error', reject)
    child.on('exit', code => code === 0 ? accept() : reject(new Error(`Packaging command exited ${code}`)))
  })
}
const browserPath = resolve('.release-resources/browsers')
await mkdir(browserPath, { recursive: true })
// Generated only at build time. GitHub injects these encrypted repository
// secrets; local packaging can use the ignored .env file. Never log values.
let local = {}
try { local = parseEnv(await readFile('.env', 'utf8')) } catch (error) { if (error.code !== 'ENOENT') throw error }
const defaults = {}
for (const name of ['AGENT37_API_KEY', 'AGENT37_INSTANCE_ID', 'INSTA_ADAPTER_HOST_URL', 'INSTA_PUBLISH_TOKEN']) {
  const value = process.env[name] || local[name]
  if (!value) throw new Error(`Missing release integration configuration: ${name}`)
  defaults[name] = value
}
await writeFile(resolve('.release-resources/judge-integrations.json'), JSON.stringify(defaults), { mode: 0o600 })
await run('node_modules/playwright/cli.js', ['install', '--no-shell', 'chromium'], { ...process.env, PLAYWRIGHT_BROWSERS_PATH: browserPath })
await run('node_modules/electron-vite/bin/electron-vite.js', ['build'])
await run('node_modules/electron-builder/cli.js', [...process.argv.slice(2), '--publish', 'never'])

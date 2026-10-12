import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { mkdir } from 'node:fs/promises'

async function run(script, args, env = process.env) {
  await new Promise((accept, reject) => {
    const child = spawn(process.execPath, [resolve(script), ...args], { env, stdio: 'inherit' })
    child.on('error', reject)
    child.on('exit', code => code === 0 ? accept() : reject(new Error(`Packaging command exited ${code}`)))
  })
}
const browserPath = resolve('.release-resources/browsers')
await mkdir(browserPath, { recursive: true })
await run('node_modules/playwright/cli.js', ['install', '--no-shell', 'chromium'], { ...process.env, PLAYWRIGHT_BROWSERS_PATH: browserPath })
await run('node_modules/electron-vite/bin/electron-vite.js', ['build'])
await run('node_modules/electron-builder/cli.js', [...process.argv.slice(2), '--publish', 'never'])

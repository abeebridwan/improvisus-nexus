import { app } from 'electron'
import { join } from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import { loadEnvFile } from 'node:process'

// Playwright reads this variable during module initialization. Set it before
// importing the actual app so packaged Core uses its shipped Chromium.
if (app.isPackaged) {
  app.setName('Improvisus Nexus')
  const localConfig = join(app.getPath('userData'), 'nexus.env')
  if (existsSync(localConfig)) loadEnvFile(localConfig)
  process.env.PLAYWRIGHT_BROWSERS_PATH = join(process.resourcesPath, 'browsers')
  // Builder explicitly authorized these shared judge integrations on the
  // production branch. Environment/local configuration can override defaults.
  const defaults = JSON.parse(readFileSync(join(process.resourcesPath, 'judge-integrations.json'), 'utf8')) as Record<string, unknown>
  for (const name of ['AGENT37_API_KEY', 'AGENT37_INSTANCE_ID', 'INSTA_ADAPTER_HOST_URL', 'INSTA_PUBLISH_TOKEN']) {
    if (typeof defaults[name] === 'string') process.env[name] ??= defaults[name]
  }
}
await import('./index')

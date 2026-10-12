import { app } from 'electron'
import { join } from 'node:path'

// Playwright reads this variable during module initialization. Set it before
// importing the actual app so packaged Core uses its shipped Chromium.
if (app.isPackaged) process.env.PLAYWRIGHT_BROWSERS_PATH = join(process.resourcesPath, 'browsers')
await import('./index')

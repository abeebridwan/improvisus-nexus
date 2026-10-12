import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { desktopEnvironment } from './electron-env.mjs'

// Some coding environments inherit this flag. Electron must run as a desktop app.
const env = desktopEnvironment()
if (env.CHROME_DEVEL_SANDBOX) console.log(`Linux sandbox helper: ${env.CHROME_DEVEL_SANDBOX}`)
// Electron 44 downloads lazily through its official entry point. electron-vite
// reads path.txt directly, so resolve the binary before starting its CLI.
env.ELECTRON_EXEC_PATH ||= (await import('electron')).default
const cli = fileURLToPath(new URL('../node_modules/electron-vite/bin/electron-vite.js', import.meta.url))
const child = spawn(process.execPath, [cli, ...process.argv.slice(2)], { env, stdio: 'inherit' })
child.on('error', (error) => { console.error(error); process.exitCode = 1 })
child.on('exit', (code) => { process.exitCode = code ?? 1 })
process.on('SIGINT', () => child.kill('SIGINT'))
process.on('SIGTERM', () => child.kill('SIGTERM'))

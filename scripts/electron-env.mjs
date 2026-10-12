import { existsSync, lstatSync, renameSync, statSync, symlinkSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

function trustedHelper(path) {
  try {
    const file = statSync(path)
    return file.isFile() && file.uid === 0 && (file.mode & 0o4000) !== 0 &&
      (file.mode & 0o022) === 0 && (file.mode & 0o111) === 0o111
  } catch (error) {
    if (error.code !== 'ENOENT' && error.code !== 'EACCES') throw error
    return false
  }
}

// Shared by normal launches and browser checks so they use the same sandbox.
export function desktopEnvironment() {
  if (process.platform === 'linux' && process.getuid() === 0) {
    throw new Error('Run the desktop as your normal user: npm start (without sudo).')
  }
  const env = { ...process.env }
  delete env.ELECTRON_RUN_AS_NODE
  if (process.platform === 'linux' && env.CHROME_DEVEL_SANDBOX === undefined) {
    // Chromium documents reusing the system-installed Chrome SUID helper for
    // developer binaries when Ubuntu restricts unprivileged user namespaces.
    const helper = '/opt/google/chrome/chrome-sandbox'
    if (trustedHelper(helper)) env.CHROME_DEVEL_SANDBOX = helper
  }
  return env
}

export function prepareLinuxSandbox(electronPath, env) {
  if (process.platform !== 'linux' || !env.CHROME_DEVEL_SANDBOX ||
    !trustedHelper(env.CHROME_DEVEL_SANDBOX)) return
  // Chromium prefers the adjacent helper over CHROME_DEVEL_SANDBOX. Electron's
  // extracted helper is user-owned, so link the already installed trusted one.
  const local = join(dirname(electronPath), 'chrome-sandbox')
  if (trustedHelper(local)) return
  const original = lstatSync(local)
  const backup = `${local}.nexus-original`
  if (!original.isFile() || original.uid !== process.getuid() || existsSync(backup)) {
    throw new Error('Cannot safely replace the local sandbox helper; see docs/linux-development.md')
  }
  renameSync(local, backup)
  try {
    symlinkSync(resolve(env.CHROME_DEVEL_SANDBOX), local)
  } catch (error) {
    renameSync(backup, local)
    throw error
  }
  console.log('Linked Electron to the installed root-owned sandbox helper; original preserved.')
}

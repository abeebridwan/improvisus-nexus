import { statSync } from 'node:fs'

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
    try {
      const file = statSync(helper)
      if (file.isFile() && file.uid === 0 && (file.mode & 0o4000) !== 0 &&
        (file.mode & 0o022) === 0 && (file.mode & 0o111) === 0o111) {
        env.CHROME_DEVEL_SANDBOX = helper
      }
    } catch (error) {
      if (error.code !== 'ENOENT' && error.code !== 'EACCES') throw error
    }
  }
  return env
}

import { spawn, type ChildProcess } from 'node:child_process'

function websiteEnvironment(): NodeJS.ProcessEnv {
  const env = { ...process.env }
  for (const name of ['OPENAI_API_KEY', 'OPENROUTER_API_KEY', 'AGENT37_API_KEY', 'INSTA_PUBLISH_TOKEN', 'NEATLOGS_API_KEY']) delete env[name]
  return env
}
function npm(projectPath: string, args: string[], detached = false): ChildProcess {
  return spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, {
    cwd: projectPath, env: websiteEnvironment(), stdio: ['ignore', 'pipe', 'pipe'],
    detached: detached && process.platform !== 'win32', shell: process.platform === 'win32'
  })
}
export async function buildWebsite(projectPath: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = npm(projectPath, ['run', 'build'])
    let output = ''
    const collect = (chunk: Buffer) => { output = (output + chunk.toString()).slice(-12_000) }
    child.stdout?.on('data', collect)
    child.stderr?.on('data', collect)
    child.on('error', reject)
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`Website build failed:\n${output}`)))
  })
}
export function startWebsite(projectPath: string): ChildProcess {
  const child = npm(projectPath, ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], true)
  child.stdout?.resume(); child.stderr?.resume()
  return child
}
export function stopWebsite(child: ChildProcess): void {
  if (!child.pid) return
  try {
    if (process.platform === 'win32') child.kill()
    else process.kill(-child.pid, 'SIGTERM')
  } catch { child.kill() }
}
export async function waitForWebsite(url: string, child: ChildProcess): Promise<void> {
  let spawnError: Error | undefined
  child.once('error', error => { spawnError = error })
  const end = Date.now() + 30_000
  while (Date.now() < end) {
    if (spawnError) throw spawnError
    if (child.exitCode !== null) throw new Error('Website dev server exited before becoming ready')
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1000) })
      if (response.ok) return
    } catch { /* Site is still starting. */ }
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  throw new Error('Website did not start on port 4173')
}

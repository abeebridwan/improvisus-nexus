import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

// Ubuntu's documented per-executable userns permission keeps Chromium's sandbox
// enabled without changing the system-wide user namespace restriction.
if (process.platform !== 'linux') throw new Error('This setup is only for Linux with AppArmor')
const printOnly = process.argv.includes('--print')
const electronPath = await realpath((await import('electron')).default)
if (/["\\\n\r*?\[\]{}]/.test(electronPath)) throw new Error('Electron path contains unsupported AppArmor pattern characters')
const abi = existsSync('/etc/apparmor.d/abi/5.0') ? '5.0' : '4.0'
if (!existsSync(`/etc/apparmor.d/abi/${abi}`)) throw new Error('AppArmor is not installed; consult docs/linux-development.md')
const name = `improvisus-nexus-electron-${createHash('sha256').update(electronPath).digest('hex').slice(0, 12)}`
const destination = `/etc/apparmor.d/${name}`
const profile = `# Local Improvisus Nexus development executable only.\nabi <abi/${abi}>,\ninclude <tunables/global>\n\nprofile ${name} "${electronPath}" flags=(unconfined) {\n  userns,\n  @{exec_path} mr,\n}\n`
console.log(`AppArmor profile: ${destination}\n${profile}`)
if (!printOnly) {
  const directory = await mkdtemp(join(tmpdir(), 'nexus-apparmor-'))
  const source = join(directory, name)
  function run(command, args) {
    const result = spawnSync(command, args, { stdio: 'inherit' })
    if (result.error) throw result.error
    if (result.status !== 0) throw new Error(`${command} failed; setup did not complete`)
  }
  try {
    await writeFile(source, profile, { mode: 0o600 })
    run('/usr/sbin/apparmor_parser', ['--skip-kernel-load', '--skip-read-cache', source])
    // Never overwrite a different existing policy for this executable.
    if (existsSync(destination) && await readFile(destination, 'utf8') !== profile) {
      throw new Error('A different AppArmor profile already exists; review it manually')
    }
    console.log('Administrator access is required to install and load this profile.')
    run('sudo', ['install', '-o', 'root', '-g', 'root', '-m', '644', source, destination])
    run('sudo', ['/usr/sbin/apparmor_parser', '-r', destination])
    console.log('Installed. Run npm run dev, npm test, or npm start as your normal user.')
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

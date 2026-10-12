import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import type { ProviderConfiguration, ProviderId } from '../../shared/providers'

export interface SavedCredentials {
  active: ProviderId | null
  credentials: Partial<Record<ProviderId, ProviderConfiguration & { apiKey: string }>>
}
export interface CredentialStore {
  available(): boolean
  read(): Promise<SavedCredentials>
  write(value: SavedCredentials): Promise<void>
}
interface Encryption {
  isEncryptionAvailable(): boolean
  getSelectedStorageBackend(): string
  encryptString(value: string): Buffer
  decryptString(value: Buffer): string
}

export class EncryptedCredentialStore implements CredentialStore {
  private readonly file: string
  private readonly directory: string
  private readonly encryption: Encryption
  constructor(directory: string, encryption: Encryption) {
    this.directory = directory
    this.encryption = encryption
    this.file = join(directory, 'provider-config.enc')
  }
  available(): boolean {
    return this.encryption.isEncryptionAvailable() && (process.platform !== 'linux' ||
      ['gnome_libsecret', 'kwallet', 'kwallet5', 'kwallet6'].includes(this.encryption.getSelectedStorageBackend()))
  }
  async read(): Promise<SavedCredentials> {
    let ciphertext: Buffer
    try { ciphertext = await readFile(this.file) } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { active: null, credentials: {} }
      throw new Error('STORAGE_ERROR')
    }
    if (!this.available()) throw new Error('STORAGE_UNAVAILABLE')
    try {
      if (ciphertext.length > 65_536) throw new Error()
      const value = JSON.parse(this.encryption.decryptString(ciphertext)) as SavedCredentials
      if (!value || typeof value.credentials !== 'object' || !value.credentials || Array.isArray(value.credentials) ||
        ![null, 'openai', 'openrouter'].includes(value.active)) throw new Error()
      for (const [provider, record] of Object.entries(value.credentials)) {
        if (!['openai', 'openrouter'].includes(provider) || !record || record.provider !== provider ||
          typeof record.apiKey !== 'string' || !/^[\x21-\x7e]{1,4096}$/.test(record.apiKey) ||
          typeof record.model !== 'string' || !/^[a-zA-Z0-9._:/@+-]{1,200}$/.test(record.model) ||
          typeof record.verifiedAt !== 'string' || !['supported', 'unsupported', 'unknown'].includes(record.tools)) throw new Error()
      }
      if (value.active && !value.credentials[value.active]) throw new Error()
      return value
    } catch { throw new Error('STORAGE_ERROR') }
  }
  async write(value: SavedCredentials): Promise<void> {
    if (!this.available()) throw new Error('STORAGE_UNAVAILABLE')
    // Nothing plaintext is written, including temporary files.
    let ciphertext: Buffer
    try { ciphertext = this.encryption.encryptString(JSON.stringify(value)) } catch { throw new Error('STORAGE_ERROR') }
    const temporary = `${this.file}.${randomUUID()}.tmp`
    try {
      await mkdir(this.directory, { recursive: true, mode: 0o700 })
      await writeFile(temporary, ciphertext, { mode: 0o600, flag: 'wx' })
      await rename(temporary, this.file)
    } catch { throw new Error('STORAGE_ERROR') } finally { await rm(temporary, { force: true }).catch(() => {}) }
  }
}

import assert from 'node:assert/strict'
import test from 'node:test'
import { ProviderService } from '../src/main/providers/service.ts'
import { EncryptedCredentialStore } from '../src/main/providers/store.ts'

function memoryStore() {
  let saved = { active: null, credentials: {} }
  return { available: () => true, read: async () => structuredClone(saved), write: async value => { saved = structuredClone(value) } }
}
const key = 'fixture-provider-key-not-a-real-credential'

test('provider fixtures: available models, configuration, replacement and deletion share one trusted configuration', async () => {
  const store = memoryStore()
  const calls = []
  const service = new ProviderService(store, async (url, options) => {
    calls.push(url)
    assert.equal(options.redirect, 'error')
    assert.ok(options.signal)
    if (options.headers.Authorization === 'Bearer fixture-invalid-replacement') return new Response('private error', { status: 401 })
    if (url.endsWith('/key')) return Response.json({ data: { label: 'fixture' } })
    return Response.json({ data: url.includes('openrouter') ? [
      { id: 'fixture/text', architecture: { output_modalities: ['text'] }, supported_parameters: ['tools'] },
      { id: 'fixture/plain', architecture: { output_modalities: ['text'] }, supported_parameters: [] }
    ] : [{ id: 'gpt-4.1-mini' }, { id: 'tts-1' }] })
  })
  assert.equal((await service.status()).active, null)
  await assert.rejects(service.validate('openai'), { message: 'MISSING_CREDENTIALS' })
  const first = await service.validate('openai', key)
  assert.deepEqual(first.models, [{ id: 'gpt-4.1-mini', tools: 'unknown' }])
  await assert.rejects(service.save(first.validationId, 'not-in-catalog'), { message: 'MODEL_UNAVAILABLE' })
  const state = await service.save(first.validationId, 'gpt-4.1-mini')
  assert.equal(JSON.stringify(state).includes(key), false)
  assert.equal((await service.runtimeConfiguration()).apiKey, key)
  await assert.rejects(service.validate('openai', 'fixture-invalid-replacement'), { message: 'INVALID_KEY' })
  assert.equal((await service.runtimeConfiguration()).apiKey, key)
  const replacement = await service.validate('openai', key + '-replacement')
  await service.save(replacement.validationId, 'gpt-4.1-mini')
  assert.equal((await service.runtimeConfiguration()).apiKey, key + '-replacement')
  const router = await service.validate('openrouter', key)
  assert.equal(router.models.find(model => model.id === 'fixture/plain').tools, 'unsupported')
  await service.save(router.validationId, 'fixture/text')
  assert.equal((await service.runtimeConfiguration()).provider, 'openrouter')
  await service.remove('openrouter')
  assert.equal((await service.status()).active, null)
  await service.remove('openai')
  assert.deepEqual((await service.status()).savedProviders, [])
  assert.ok(calls.every(url => ['https://api.openai.com/v1/models', 'https://openrouter.ai/api/v1/key', 'https://openrouter.ai/api/v1/models/user'].includes(url)))
})

test('provider failures are sanitized and never save a failed validation', async () => {
  for (const [status, code] of [[401, 'INVALID_KEY'], [403, 'PERMISSION_DENIED'], [429, 'RATE_LIMITED'], [503, 'PROVIDER_ERROR']]) {
    const service = new ProviderService(memoryStore(), async () => new Response(`private error ${key}`, { status }))
    await assert.rejects(service.validate('openai', key), { message: code })
    assert.equal((await service.status()).active, null)
  }
  const offline = new ProviderService(memoryStore(), async () => { throw new Error(`private network error ${key}`) })
  await assert.rejects(offline.validate('openai', key), { message: 'NETWORK_ERROR' })
})

test('credential store refuses unavailable encryption and the Linux plaintext fallback', async () => {
  const encryption = { isEncryptionAvailable: () => false, getSelectedStorageBackend: () => 'basic_text', encryptString: () => { throw new Error('must not encrypt') }, decryptString: () => { throw new Error('must not decrypt') } }
  const store = new EncryptedCredentialStore('/unused-provider-test-directory', encryption)
  await assert.rejects(store.write({ active: null, credentials: {} }), { message: 'STORAGE_UNAVAILABLE' })
  if (process.platform === 'linux') {
    encryption.isEncryptionAvailable = () => true
    assert.equal(store.available(), false)
  }
})

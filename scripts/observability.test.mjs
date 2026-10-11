import assert from 'node:assert/strict'
import test from 'node:test'
import { createTelemetryMask } from '../src/main/observability/redact.ts'

test('export masking removes credentials from nested I/O, events and logs without losing metrics', async () => {
  const sentinel = 'local-test-secret-not-a-credential'
  const mask = createTelemetryMask([sentinel])
  const input = {
    attributes: {
      'input.value': JSON.stringify({ headers: { Authorization: 'Bearer test', 'X-Agent37-Key': 'test' }, apiKey: 'test', query: sentinel }),
      'output.value': JSON.stringify([{ result: 'ok', refresh_token: 'test' }]),
      'llm.prompt_tokens': 7, 'llm.completion_tokens': 2, cost: 0.01
    },
    events: [{ message: `error ${sentinel}`, password: 'test' }],
    body: `log ${sentinel}`
  }
  const result = await mask(input)
  assert.equal(JSON.stringify(result).includes(sentinel), false)
  const parsed = JSON.parse(result.attributes['input.value'])
  assert.deepEqual(parsed.headers, { Authorization: '[REDACTED]', 'X-Agent37-Key': '[REDACTED]' })
  assert.equal(parsed.apiKey, '[REDACTED]')
  assert.equal(JSON.parse(result.attributes['output.value'])[0].refresh_token, '[REDACTED]')
  assert.equal(result.events[0].password, '[REDACTED]')
  assert.equal(result.attributes['llm.prompt_tokens'], 7)
  assert.equal(result.attributes['llm.completion_tokens'], 2)
  assert.equal(result.attributes.cost, 0.01)
  assert.equal(input.events[0].password, 'test')
})

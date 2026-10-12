import assert from 'node:assert/strict'
import test from 'node:test'
import { askJson, parseModelJson } from '../src/main/core/model-json.ts'

test('model JSON accepts fenced objects and repairs syntax without evaluating output', () => {
  assert.deepEqual(parseModelJson('```json\n{"startPath":"/"}\n```'), { startPath: '/' })
  assert.deepEqual(parseModelJson("{startPath:'/', name:'Search',}"), { startPath: '/', name: 'Search' })
  const source = 'const message = "hello";\nreturn { message };'
  assert.equal(parseModelJson(JSON.stringify({ adapterSource: source })).adapterSource, source)
  assert.throws(() => parseModelJson('{"workflows":['), /incomplete JSON object/)
})

test('model JSON retries incomplete responses and handles explicit unsupported JSON mode', async () => {
  const requests = []
  const runtime = { model: 'fixture-model', client: { chat: { completions: {
    async create(request) {
      requests.push(structuredClone(request))
      if (requests.length === 1) throw Object.assign(new Error('response_format json_object is not supported'), { status: 400 })
      if (requests.length === 2) return { choices: [{ message: { content: '{"workflows":[' }, finish_reason: 'length' }] }
      return { choices: [{ message: { content: '{"workflows":[]}' }, finish_reason: 'stop' }] }
    }
  } } } }
  assert.deepEqual(await askJson(runtime, 'Return a JSON workflow catalog'), { workflows: [] })
  assert.deepEqual(requests[0].response_format, { type: 'json_object' })
  assert.equal(requests[1].response_format, undefined)
  assert.match(requests[2].messages.at(-1).content, /cut off/)
  assert.equal(requests.length, 3)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { validateArguments, permission, evidence } from '../src/main/agent/guard.ts'
const tool = { name: 'search_items', description: 'Find matching items', frameId: 'fixture-frame', annotations: { readOnly: true }, inputSchema: { type: 'object', required: ['query'], additionalProperties: false, properties: { query: { type: 'string' } } } }
test('Guard validates actual schema, rejects unsupported schemas and requires consequential approval', () => {
  validateArguments(tool, { query: 'laptop' })
  assert.throws(() => validateArguments(tool, { query: 3 }))
  assert.throws(() => validateArguments(tool, { query: 'x', other: true }))
  assert.throws(() => validateArguments({ ...tool, inputSchema: { $ref: 'https://example.invalid/schema' } }, {}))
  assert.equal(permission(tool), 'automatic')
  assert.equal(permission({ ...tool, annotations: {} }), 'approval')
  assert.equal(permission({ ...tool, annotations: { readOnly: true, consequential: true } }), 'approval')
  assert.throws(() => permission({ ...tool, name: 'delete', description: 'Delete account' }))
})
test('Verification checks actual values and cannot traverse inherited properties', () => {
  assert.equal(evidence({ items: [{ name: 'Laptop' }] }, '/items/0/name', 'Laptop'), true)
  assert.equal(evidence({ items: [] }, '/items/0/name', 'Laptop'), false)
  assert.equal(evidence({}, '/toString', undefined), false)
})

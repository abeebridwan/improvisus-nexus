import { Ajv } from 'ajv'
import type { AgentTool } from '../../shared/agent'
const ajv = new Ajv({ strict: true, allErrors: false, ownProperties: true, logger: false })
export function validateArguments(tool: AgentTool, args: Record<string, unknown>): void {
  if (JSON.stringify(tool.inputSchema).length > 30_000 || JSON.stringify(args).length > 16_000) throw new Error('Tool schema or arguments exceed the safety limit')
  try { if (!ajv.compile(tool.inputSchema)(args)) throw new Error('invalid') } catch { throw new Error('Tool arguments are invalid or its schema is unsupported. No tool was invoked.') }
}
export function permission(tool: AgentTool): 'automatic' | 'approval' {
  const label = `${tool.name.replace(/[_-]/g, ' ')} ${tool.description}`
  if (tool.annotations.debugging || /\b(delete|destroy|erase|withdraw|password|credential|shell|eval)\b/i.test(label)) throw new Error('Guard blocked a dangerous or debugging capability')
  return tool.annotations.readOnly === true && tool.annotations.consequential !== true &&
    !/\b(buy|purchase|checkout|book|send|submit|update|write|create|transfer|pay)\b/i.test(label) ? 'automatic' : 'approval'
}
export function evidence(output: unknown, pointer: string, expected: unknown): boolean {
  if (!pointer.startsWith('/') && pointer !== '') return false
  let value = output
  for (const part of pointer === '' ? [] : pointer.slice(1).split('/').map(p => p.replaceAll('~1', '/').replaceAll('~0', '~'))) {
    if (!value || typeof value !== 'object' || !Object.hasOwn(value, part)) return false
    value = (value as Record<string, unknown>)[part]
  }
  return JSON.stringify(value) === JSON.stringify(expected)
}

import type { TraceOptions } from 'neatlogs'

// Options for native neatlogs.trace() calls when the corresponding work exists.
// Importing these options does not start a span or execute an agent.
export const nexusSpans = {
  workflow: { name: 'nexus.run', kind: 'WORKFLOW' },
  reasoning: { name: 'agent37.reasoning', kind: 'AGENT' },
  llm: { name: 'llm.call', kind: 'LLM' },
  discovery: { name: 'webmcp.discover', kind: 'TOOL' },
  webmcp: { name: 'webmcp.invoke', kind: 'TOOL' },
  approval: { name: 'approval.check', kind: 'GUARDRAIL' },
  retry: { name: 'execution.retry', kind: 'CHAIN' },
  verification: { name: 'result.verify', kind: 'CHAIN' }
} as const satisfies Record<string, TraceOptions>

// Failures belong on the actual failing operation: trace() captures thrown errors.
// For a handled failure, recordException() + setStatus() on that operation's span.

import type { Plan } from './types'

export function bundleAdapters(origin: string, plans: Plan[]): string {
  if (!plans.length || plans.length > 5) throw new Error('Select between one and five workflows')
  if (new Set(plans.map(plan => plan.toolName)).size !== plans.length) throw new Error('Duplicate generated tool names')
  const bodies = plans.map(plan => `await (async () => {\n${plan.adapterSource}\n})();`).join('\n')
  return `void (async () => {\nif (location.origin !== ${JSON.stringify(origin)}) return;\nif (!document.modelContext) throw new Error("WebMCP is unavailable");\n${bodies}\n})().catch(error => console.error("Nexus adapter registration failed", error));\n`
}

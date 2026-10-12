import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'
import type { AiRuntime } from './ai-client'
import { askJson } from './model-json'
import { projectFile } from './apply'
import type { Candidate, CoreSource, Plan } from './types'

const CodeSchema = z.object({ description: z.string().min(1), adapterSource: z.string().min(1) })

export async function generatePlan(source: CoreSource, candidate: Candidate, runtime: AiRuntime): Promise<Plan> {
  if (source.mode !== candidate.mode) throw new Error('Workflow source does not match this batch')
  let context: string
  let adapterPath: string | undefined
  if (candidate.mode === 'local' && source.mode === 'local') {
    adapterPath = `src/webmcp/nexus-${candidate.toolName}.ts`
    const adapterDirectory = path.dirname(adapterPath)
    const files = await Promise.all(candidate.files.map(async file => {
      const content = await readFile(projectFile(source.projectPath, file), 'utf8')
      const importPath = path.relative(adapterDirectory, file).replaceAll('\\', '/').replace(/\.(tsx?|jsx?)$/, '')
      return `FILE ${file}; import from adapter as ${importPath.startsWith('.') ? importPath : './' + importPath}\n${content.slice(0, 24_000)}`
    }))
    context = `Generate a COMPLETE TypeScript module to save at ${adapterPath}.
Reuse the existing exported function ${candidate.exportedFunction}; do not duplicate application business logic.
Use the exact adapter-relative import paths provided with the source files.
Do not require a new npm dependency, webmcp-types, or global document type augmentation.
Use (document as any).modelContext and explicitly type callback parameters to satisfy strict TypeScript.
Define execute as async (input: unknown, options: { signal: AbortSignal }) => ...; call options.signal.throwIfAborted().
Guard missing modelContext. Register with void modelContext.registerTool(...); do not use top-level await.
SOURCE:\n${files.join('\n\n')}`
  } else if (candidate.mode === 'url') {
    context = `Generate a JavaScript REGISTRATION BODY, not a module and not an outer IIFE.
It will run inside its own awaited async function. No imports/exports or TypeScript.
Use document.modelContext and await modelContext.registerTool(...).
Use execute: async (input, { signal }) => ..., and signal.throwIfAborted().
Resolve DOM selectors lazily inside execute, so registration does not require every workflow's controls on every page.
Use only the observed selectors and actions in the supplied evidence. Return serializable observed results.
Do not navigate/reload the document during execution, access cookies/storage, fetch unrelated URLs, use eval, or simulate a result.
The delivery bundle has an origin guard for ${new URL(candidate.startUrl).origin}.`
  } else { throw new Error('Unsupported workflow source') }
  const raw = await askJson(runtime, `Create exactly ONE read-only WebMCP capability named ${JSON.stringify(candidate.toolName)}.
Register that exact name once. Supply description, JSON inputSchema with additionalProperties:false,
annotations:{readOnlyHint:true,consequentialHint:false}, and execute. Return JSON-serializable workflow results.
Use the actual input names from the supplied tests; do not assume product search or query.
The output must genuinely satisfy the tests using existing logic/observed website behavior; never hardcode expected output.
${context}
WORKFLOW EVIDENCE:\n${JSON.stringify(candidate)}
Return {"description":"short description","adapterSource":"complete source as a JSON string"}.`)
  const code = CodeSchema.parse(raw)
  const registrations = code.adapterSource.match(/\.registerTool\s*\(/g) ?? []
  if (registrations.length !== 1 || !code.adapterSource.includes(candidate.toolName) ||
    !code.adapterSource.includes('inputSchema') || !code.adapterSource.includes('throwIfAborted') ||
    !/additionalProperties\s*:\s*false/.test(code.adapterSource) || !/readOnlyHint\s*:\s*true/.test(code.adapterSource)) {
    throw new Error(`Generated adapter failed readiness checks: ${candidate.name}`)
  }
  return {
    workflowId: candidate.id, mode: candidate.mode, name: candidate.name, toolName: candidate.toolName,
    ...code, tests: candidate.tests, adapterPath,
    entryFile: candidate.mode === 'local' ? candidate.entryFile : undefined,
    startUrl: candidate.mode === 'url' ? candidate.startUrl : undefined
  }
}

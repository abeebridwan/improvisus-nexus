import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { getAiRuntime } from './ai-client'
import { askJson } from './model-json'
import { discoverRepository } from './discover'
import { discoverCloudWorkflows } from './agent37'
import { LocalCatalogSchema, type Candidate, type CoreSource, type CandidateEvidence } from './types'

function assign(candidate: CandidateEvidence): Candidate {
  const id = randomUUID()
  const slug = candidate.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 70) || 'workflow'
  return { ...candidate, id, toolName: `${slug}_${id.slice(0, 8)}` }
}

export async function discoverCandidates(source: CoreSource): Promise<Candidate[]> {
  if (source.mode === 'url') {
    const catalog = await discoverCloudWorkflows(source.targetUrl)
    return catalog.workflows.map(assign)
  }
  const files = await discoverRepository(path.resolve(source.projectPath), 'search filter catalog product workflow route export main app form')
  if (!files.length) throw new Error('No supported application source files found')
  const runtime = await getAiRuntime()
  const result = await askJson(runtime, `Inspect this repository source and identify up to 10 distinct existing read-only workflows.
Each workflow must reuse an actual exported function; do not propose missing features.
Choose an existing browser application entry file that runs on the workflow's page. Use relative repository paths.
For each, propose meaningful example inputs and an expected result grounded in the source/data. These are proposed tests until browser verification.
Return {"workflows":[{"mode":"local","name":"title","goal":"purpose","files":["actual source file"],
"entryFile":"actual application entry file","exportedFunction":"actual exported function name",
"tests":[{"name":"example","input":{"actualArgumentName":"example"},"expectedText":"expected nonempty result substring","startPath":"/"}]}]}.
Only include supported workflows visible in these files; fewer than five is valid.
SOURCE:\n${files.map(file => `FILE ${file.path}\n${file.content}`).join('\n\n')}`)
  const catalog = LocalCatalogSchema.parse(result)
  const known = new Set(files.map(file => file.path))
  for (const item of catalog.workflows) {
    if (!known.has(item.entryFile) || item.files.some(file => !known.has(file))) {
      throw new Error('A proposed workflow references files outside the discovered source context')
    }
  }
  return catalog.workflows.map(assign)
}

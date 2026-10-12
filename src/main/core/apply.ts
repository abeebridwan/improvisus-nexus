import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createTwoFilesPatch } from 'diff'
import type { Plan, PreparedChange } from './types'

export function projectFile(projectPath: string, relativePath: string): string {
  const root = path.resolve(projectPath)
  const absolute = path.resolve(root, relativePath)
  if (!absolute.startsWith(root + path.sep)) throw new Error('Generated file path leaves the selected project')
  return absolute
}
async function readOptional(file: string): Promise<string | null> {
  try { return await readFile(file, 'utf8') } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
}
export async function prepareBatchChanges(projectPath: string, plans: Plan[]): Promise<PreparedChange[]> {
  const changes = new Map<string, PreparedChange>()
  const adapters = new Set<string>()
  const entries = new Set(plans.map(plan => plan.entryFile))
  for (const plan of plans) {
    if (!plan.adapterPath || !plan.entryFile) throw new Error('Local plan has no adapter/entry path')
    if (adapters.has(plan.adapterPath) || entries.has(plan.adapterPath)) throw new Error('Conflicting adapter destinations')
    adapters.add(plan.adapterPath)
    const adapterBefore = await readOptional(projectFile(projectPath, plan.adapterPath))
    changes.set(plan.adapterPath, { path: plan.adapterPath, before: adapterBefore, after: plan.adapterSource })
    let entry = changes.get(plan.entryFile)
    if (!entry) {
      const before = await readOptional(projectFile(projectPath, plan.entryFile))
      if (before === null) throw new Error(`Application entry file is missing: ${plan.entryFile}`)
      entry = { path: plan.entryFile, before, after: before }
      changes.set(plan.entryFile, entry)
    }
    let relative = path.relative(path.dirname(plan.entryFile), plan.adapterPath).replaceAll('\\', '/').replace(/\.ts$/, '')
    if (!relative.startsWith('.')) relative = './' + relative
    const line = `import ${JSON.stringify(relative)};`
    if (!entry.after.includes(line)) entry.after = line + '\n' + entry.after
  }
  return [...changes.values()]
}
export function reviewDiff(changes: PreparedChange[]): string {
  return changes.map(change => createTwoFilesPatch(change.path, change.path, change.before ?? '', change.after, 'before', 'generated')).join('\n')
}
export async function applyBatch(projectPath: string, changes: PreparedChange[]): Promise<void> {
  for (const change of changes) {
    const file = projectFile(projectPath, change.path)
    await mkdir(path.dirname(file), { recursive: true })
    await writeFile(file, change.after, 'utf8')
  }
}
export async function rollbackBatch(projectPath: string, changes: PreparedChange[]): Promise<void> {
  for (const change of [...changes].reverse()) {
    const file = projectFile(projectPath, change.path)
    if (change.before === null) await rm(file, { force: true })
    else await writeFile(file, change.before, 'utf8')
  }
}

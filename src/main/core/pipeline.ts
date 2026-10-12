import { app } from 'electron'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { simpleGit } from 'simple-git'
import { createTwoFilesPatch } from 'diff'
import { getAiRuntime } from './ai-client'
import { discoverCandidates } from './discover-workflows'
import { generatePlan } from './generate'
import { applyBatch, prepareBatchChanges, reviewDiff, rollbackBatch } from './apply'
import { bundleAdapters } from './bundle'
import { verifyBatch } from './verify'
import { publishBatch } from './instacloud'
import { buildWebsite, startWebsite, stopWebsite, waitForWebsite } from './local-server'
import type { Catalog, Completion, CoreSource, Emit, PreparedChange, Review, TestResult } from './types'

type GitSnapshot = { branch: string; head: string }
type StoredCatalog = Catalog & { git?: GitSnapshot }
type Pending = { review: Review; source: CoreSource; changes: PreparedChange[]; combinedSource?: string; git?: GitSnapshot }
let owner: CoreController | undefined

async function snapshot(projectPath: string): Promise<GitSnapshot> {
  const git = simpleGit(projectPath)
  if (!await git.checkIsRepo()) throw new Error('The selected website must be a Git repository')
  if ((await git.status()).files.length) throw new Error('Commit or stash changes in the selected website first')
  const branch = (await git.revparse(['--abbrev-ref', 'HEAD'])).trim()
  if (branch === 'HEAD' || branch.startsWith('mini-core/')) throw new Error('Select the original website branch before starting')
  return { branch, head: (await git.revparse(['HEAD'])).trim() }
}
async function sameSnapshot(projectPath: string, original: GitSnapshot): Promise<void> {
  const current = await snapshot(projectPath)
  if (current.branch !== original.branch || current.head !== original.head) throw new Error('Website source changed; discover its workflows again')
}
function requirePass(results: TestResult[], expected: number): void {
  if (results.length !== expected || results.some(result => !result.pass)) {
    throw new Error(results.find(result => !result.pass)?.error ?? 'Batch verification did not complete every required test')
  }
}

export class CoreController {
  private catalog?: StoredCatalog
  private pending?: Pending
  private busy = false
  private closed = false
  constructor(private readonly emit: Emit) {}

  private assertOpen(): void { if (this.closed) throw new Error('The owning Nexus window was closed') }
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    this.assertOpen()
    if (this.busy || (owner && owner !== this)) throw new Error('Another Core run is active')
    owner = this; this.busy = true
    try { return await operation() } finally {
      this.busy = false
      if (this.closed) { this.catalog = undefined; this.pending = undefined }
      if (!this.catalog && !this.pending && owner === this) owner = undefined
    }
  }
  close(): void {
    this.closed = true
    if (!this.busy) { this.catalog = undefined; this.pending = undefined; if (owner === this) owner = undefined }
  }
  async discover(source: CoreSource): Promise<Catalog> {
    if (this.pending) throw new Error('Approve or discard the pending batch first')
    this.catalog = undefined
    if (source.mode === 'local') source = { mode: 'local', projectPath: path.resolve(source.projectPath) }
    const git = source.mode === 'local' ? await snapshot(source.projectPath) : undefined
    this.emit({ stage: 'discovering', message: 'Discovering existing website workflows…' })
    const candidates = await discoverCandidates(source)
    this.assertOpen()
    this.catalog = { catalogId: randomUUID(), source, candidates, git }
    this.emit({ stage: 'selecting', message: `Found ${candidates.length} workflows. Select up to five.` })
    return { catalogId: this.catalog.catalogId, source, candidates }
  }
  async prepare(catalogId: string, workflowIds: string[]): Promise<Review> {
    if (this.pending) throw new Error('Approve or discard the pending batch first')
    const catalog = this.catalog
    if (!catalog || catalog.catalogId !== catalogId) throw new Error('Discover this source again')
    if (catalog.source.mode === 'local' && catalog.git) await sameSnapshot(catalog.source.projectPath, catalog.git)
    const selected = workflowIds.map(id => {
      const candidate = catalog.candidates.find(item => item.id === id)
      if (!candidate) throw new Error('A selected workflow is not in this catalog')
      return candidate
    })
    if (!selected.length || selected.length > 5 || new Set(workflowIds).size !== workflowIds.length) throw new Error('Select one to five distinct workflows')
    const runtime = await getAiRuntime()
    const plans = []
    for (const candidate of selected) {
      this.assertOpen()
      this.emit({ stage: 'generating', workflowId: candidate.id, message: `Generating ${candidate.name}…` })
      plans.push(await generatePlan(catalog.source, candidate, runtime))
    }
    this.assertOpen()
    if (new Set(plans.map(plan => plan.toolName)).size !== plans.length) throw new Error('Duplicate generated tool names')
    const changes = catalog.source.mode === 'local' ? await prepareBatchChanges(catalog.source.projectPath, plans) : []
    const combinedSource = catalog.source.mode === 'url' ? bundleAdapters(new URL(catalog.source.targetUrl).origin, plans) : undefined
    const diff = combinedSource ? createTwoFilesPatch('/dev/null', 'nexus-adapter.js', '', combinedSource, 'before', 'generated') : reviewDiff(changes)
    const review: Review = {
      batchId: randomUUID(), mode: catalog.source.mode, plans, diff,
      checks: [{ name: 'Distinct tool names and valid plans', pass: true }, { name: `${plans.length} workflow adapters prepared`, pass: true }]
    }
    this.pending = { review, source: catalog.source, changes, combinedSource, git: catalog.git }
    this.emit({ stage: 'review', message: 'Review the complete batch before approving.' })
    return review
  }
  async approve(batchId: string): Promise<Completion> {
    const pending = this.pending
    if (!pending || pending.review.batchId !== batchId) throw new Error('This batch is not waiting for approval')
    this.pending = undefined; this.catalog = undefined
    const evidenceDirectory = path.join(app.getPath('userData'), 'core-artifacts', batchId)
    const expected = pending.review.plans.reduce((sum, plan) => sum + plan.tests.length, 0)
    if (pending.source.mode === 'url') {
      const tests = await verifyBatch({ plans: pending.review.plans, mode: 'url', siteUrl: pending.source.targetUrl,
        combinedSource: pending.combinedSource, evidenceDirectory }, this.emit)
      requirePass(tests, expected)
      this.assertOpen()
      if (!pending.combinedSource) throw new Error('Combined adapter is missing')
      this.emit({ stage: 'publishing', message: 'Publishing the verified bundle to the existing publisher…' })
      const delivery = await publishBatch(pending.source.targetUrl, batchId, pending.combinedSource)
      return { batchId, pass: true, tests, delivery }
    }
    if (!pending.git) throw new Error('Original Git state is missing')
    const projectPath = pending.source.projectPath
    await sameSnapshot(projectPath, pending.git)
    const git = simpleGit(projectPath)
    const branch = `mini-core/batch-${batchId}`
    let branchCreated = false
    let server: ReturnType<typeof startWebsite> | undefined
    try {
      await git.checkoutLocalBranch(branch); branchCreated = true
      await applyBatch(projectPath, pending.changes)
      this.emit({ stage: 'building', message: 'Building the website with all selected adapters…' })
      await buildWebsite(projectPath)
      this.assertOpen()
      server = startWebsite(projectPath)
      const siteUrl = 'http://127.0.0.1:4173'
      await waitForWebsite(siteUrl, server)
      const tests = await verifyBatch({ plans: pending.review.plans, mode: 'local', siteUrl, evidenceDirectory }, this.emit)
      requirePass(tests, expected)
      this.assertOpen()
      await git.add(pending.changes.map(change => change.path))
      await git.commit(`feat: add ${pending.review.plans.length} verified Nexus WebMCP capabilities`)
      return { batchId, pass: true, tests, branch, commit: (await git.revparse(['HEAD'])).trim() }
    } catch (error) {
      if (branchCreated) {
        await rollbackBatch(projectPath, pending.changes)
        await git.reset(['--hard', pending.git.head])
        await git.checkout(pending.git.branch)
        await git.deleteLocalBranch(branch, true)
      }
      throw error
    } finally { if (server) stopWebsite(server) }
  }
  async discard(batchId?: string): Promise<null> {
    if (batchId && this.pending?.review.batchId !== batchId) throw new Error('This batch is not pending')
    this.pending = undefined; this.catalog = undefined
    return null
  }
}

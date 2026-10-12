import { z } from 'zod'

export type RepoFile = { path: string; content: string; score: number }
export const TestSchema = z.object({
  name: z.string().min(1),
  input: z.record(z.string(), z.unknown()),
  expectedText: z.string().min(1),
  startPath: z.string().startsWith('/').optional()
})
const common = {
  name: z.string().min(1),
  goal: z.string().min(1),
  tests: z.array(TestSchema).min(1).max(5)
}
export const LocalCandidateSchema = z.object({
  ...common,
  mode: z.literal('local'),
  files: z.array(z.string().min(1)).min(1),
  entryFile: z.string().min(1),
  exportedFunction: z.string().min(1)
})
export const UrlCandidateSchema = z.object({
  ...common,
  mode: z.literal('url'),
  startUrl: z.string().url(),
  inputs: z.array(z.object({ name: z.string(), selector: z.string(), description: z.string() })),
  actions: z.array(z.object({
    type: z.enum(['fill', 'click', 'select', 'wait']),
    selector: z.string(), description: z.string(), inputName: z.string().optional()
  })),
  result: z.object({ selector: z.string().min(1), description: z.string() })
})
export const LocalCatalogSchema = z.object({ workflows: z.array(LocalCandidateSchema).min(1).max(20) })
export const UrlCatalogSchema = z.object({ workflows: z.array(UrlCandidateSchema).min(1).max(20) })
export type CandidateEvidence = z.infer<typeof LocalCandidateSchema> | z.infer<typeof UrlCandidateSchema>
export type Candidate = CandidateEvidence & { id: string; toolName: string }
export type WorkflowTest = z.infer<typeof TestSchema>
export type CoreSource = { mode: 'local'; projectPath: string } | { mode: 'url'; targetUrl: string }
export const SourceSchema = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('local'), projectPath: z.string().trim().min(1) }).strict(),
  z.object({ mode: z.literal('url'), targetUrl: z.string().url() }).strict()
])
export const PrepareSchema = z.object({
  catalogId: z.string().uuid(),
  workflowIds: z.array(z.string().uuid()).min(1).max(5)
    .refine(ids => new Set(ids).size === ids.length, 'Select distinct workflows')
}).strict()
export const BatchIdSchema = z.object({ batchId: z.string().uuid() }).strict()
export type Catalog = { catalogId: string; source: CoreSource; candidates: Candidate[] }
export type Plan = {
  workflowId: string; mode: 'local' | 'url'; toolName: string; name: string
  description: string; adapterSource: string; tests: WorkflowTest[]
  entryFile?: string; adapterPath?: string; startUrl?: string
}
export type PreparedChange = { path: string; before: string | null; after: string }
export type Review = {
  batchId: string; mode: 'local' | 'url'; plans: Plan[]; diff: string
  checks: { name: string; pass: boolean }[]
}
export type TestResult = {
  workflowId: string; toolName: string; testName: string
  pass: boolean; screenshot?: string; error?: string
}
export type Delivery = { url: string; scriptTag: string; hash: string }
export type Completion = {
  batchId: string; pass: true; tests: TestResult[]
  branch?: string; commit?: string; delivery?: Delivery
}
export type Step = { stage: string; message: string; workflowId?: string }
export type Emit = (step: Step) => void

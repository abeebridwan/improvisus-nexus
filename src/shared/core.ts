import type { Catalog, Completion, CoreSource, Review, Step } from '../main/core/types'

export type CoreResult<T> = { ok: true; value: T } | { ok: false; message: string }
export interface CoreBridge {
  pickFolder(): Promise<CoreResult<string | null>>
  discover(source: CoreSource): Promise<CoreResult<Catalog>>
  prepare(request: { catalogId: string; workflowIds: string[] }): Promise<CoreResult<Review>>
  approve(request: { batchId: string }): Promise<CoreResult<Completion>>
  discard(request?: { batchId: string }): Promise<CoreResult<null>>
  onStep(callback: (step: Step) => void): () => void
}

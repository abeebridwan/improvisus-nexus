export type AgentTool = { name: string; description: string; frameId: string; inputSchema: Record<string, unknown>; annotations: { readOnly?: boolean; consequential?: boolean; debugging?: boolean } }
export type AgentTab = { id: string; url: string; title: string; tools: AgentTool[]; issue?: string }
export type SearchHit = { id: string; name: string; description: string; url: string }
export type Approval = { id: string; tool: string; origin: string; args: Record<string, unknown>; reason: string }
export type AgentEvent = { stage: string; message: string; plan?: string[]; approval?: Approval; result?: { tool: string; output: unknown }; hits?: SearchHit[]; traceId?: string }
export type AgentResult<T> = { ok: true; value: T } | { ok: false; message: string }
export interface AgentBridge {
  connect(request: { endpoint: string }): Promise<AgentResult<AgentTab[]>>
  refresh(): Promise<AgentResult<AgentTab[]>>
  search(request: { task: string }): Promise<AgentResult<SearchHit[]>>
  open(request: { id: string }): Promise<AgentResult<AgentTab[]>>
  run(request: { task: string; tabId: string }): Promise<AgentResult<{ verified: boolean; summary: string }>>
  approve(request: { id: string; allow: boolean }): Promise<AgentResult<null>>
  cancel(): Promise<AgentResult<null>>
  clear(): Promise<AgentResult<null>>
  onEvent(callback: (event: AgentEvent) => void): () => void
}

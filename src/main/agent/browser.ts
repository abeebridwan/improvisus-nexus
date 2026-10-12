import { randomUUID } from 'node:crypto'
import { chromium, type Browser, type CDPSession, type Page } from 'playwright'
import type { AgentTab, AgentTool } from '../../shared/agent'
// Uses the same native WebMCP/CDP protocol as Core verification, without its
// browser launcher, DOM adapter injection or test-only contexts.
export class ChromeConnection {
  browser?: Browser
  records = new Map<string, { page: Page; cdp: CDPSession; tab: AgentTab }>()
  ids = new WeakMap<Page, string>()
  async connect(endpoint: string): Promise<AgentTab[]> {
    const url = new URL(endpoint)
    if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error('Use a loopback Chrome debugging URL, such as http://127.0.0.1:9222')
    await this.disconnect()
    try { this.browser = await chromium.connectOverCDP(url.href, { timeout: 5000 }) } catch { throw new Error('Could not connect to Chrome. Enable a reachable local debugging connection and WebMCP support; Nexus will not launch a separate browser.') }
    return this.refresh()
  }
  async inspect(page: Page): Promise<{ cdp: CDPSession; tab: AgentTab }> {
    const id = this.ids.get(page) ?? randomUUID(); this.ids.set(page, id)
    const tab: AgentTab = { id, url: page.url(), title: await page.title().catch(() => 'Chrome tab'), tools: [] }
    const cdp = await page.context().newCDPSession(page)
    try {
      const tree = await cdp.send('Page.getFrameTree')
      const tools = new Map<string, AgentTool>()
      cdp.on('WebMCP.toolsAdded', event => {
        for (const tool of event.tools) if (tool.frameId === tree.frameTree.frame.id) tools.set(tool.name, { name: tool.name, description: tool.description, frameId: tool.frameId, inputSchema: tool.inputSchema ?? { type: 'object', properties: {}, additionalProperties: false }, annotations: tool.annotations ?? {} })
      })
      cdp.on('WebMCP.toolsRemoved', (event: { tools: { name: string }[] }) => { for (const tool of event.tools) tools.delete(tool.name) })
      await cdp.send('WebMCP.enable')
      await new Promise(resolve => setTimeout(resolve, 250))
      tab.tools = [...tools.values()]
      if (!tab.tools.length) tab.issue = 'This page exposes no registered top-frame WebMCP tools.'
    } catch { tab.issue = 'WebMCP is unavailable in this Chrome version or page. Enable the required WebMCP flags.' }
    return { cdp, tab }
  }
  async refresh(): Promise<AgentTab[]> {
    if (!this.browser?.isConnected()) throw new Error('Connect to Chrome first')
    for (const record of this.records.values()) await record.cdp.detach().catch(() => {})
    this.records.clear()
    for (const context of this.browser.contexts()) for (const page of context.pages()) {
      if (!/^https?:/.test(page.url())) continue
      const inspected = await this.inspect(page)
      this.records.set(inspected.tab.id, { page, ...inspected })
    }
    return [...this.records.values()].map(record => record.tab)
  }
  async open(url: string): Promise<AgentTab[]> {
    const target = new URL(url)
    if (!['https:', 'http:'].includes(target.protocol) || target.username || target.password || /^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|\[)/.test(target.hostname)) throw new Error('Search result does not contain an allowed public website URL')
    const context = this.browser?.contexts()[0]
    if (!context) throw new Error('Connect to Chrome first')
    const page = await context.newPage()
    try { await page.goto(target.href, { waitUntil: 'domcontentloaded', timeout: 30_000 }) } catch { throw new Error('Could not open the discovered website in Chrome') }
    return this.refresh()
  }
  async invoke(tabId: string, tool: AgentTool, args: Record<string, unknown>, signal: AbortSignal): Promise<unknown> {
    const record = this.records.get(tabId)
    if (!record || record.page.isClosed() || record.page.url() !== record.tab.url) throw new Error('The selected tab changed; refresh its tools before running again')
    const { cdp } = record
    let invocationId: string | undefined
    const responses = new Map<string, { status: string; output?: unknown }>()
    const listener = (event: { invocationId: string; status: string; output?: unknown }) => responses.set(event.invocationId, event)
    const cancel = () => { if (invocationId) void cdp.send('WebMCP.cancelInvocation', { invocationId }).catch(() => {}) }
    cdp.on('WebMCP.toolResponded', listener); signal.addEventListener('abort', cancel, { once: true })
    try {
      signal.throwIfAborted()
      // Protocol typings narrow input values to strings; native WebMCP accepts
      // JSON values, validated against the actual registered schema above.
      invocationId = (await cdp.send('WebMCP.invokeTool', { frameId: tool.frameId, toolName: tool.name, input: args as Record<string, string> })).invocationId
      if (signal.aborted) cancel()
      const end = Date.now() + 45_000
      while (Date.now() < end) {
        signal.throwIfAborted()
        if (record.page.isClosed() || record.page.url() !== record.tab.url) throw new Error('The website navigated during execution; outcome is uncertain')
        const result = responses.get(invocationId)
        if (result) {
          if (result.status !== 'Completed') throw new Error('WebMCP tool failed or was cancelled. It was not retried.')
          return result.output
        }
        await new Promise(resolve => setTimeout(resolve, 50))
      }
      cancel(); throw new Error('WebMCP tool timed out. Outcome is uncertain; it was not retried.')
    } finally { cdp.off('WebMCP.toolResponded', listener); signal.removeEventListener('abort', cancel) }
  }
  async disconnect(): Promise<void> {
    for (const record of this.records.values()) await record.cdp.detach().catch(() => {})
    this.records.clear()
    // connectOverCDP close disconnects the transport, leaving Chrome/tabs open.
    await this.browser?.close().catch(() => {}); this.browser = undefined
  }
}

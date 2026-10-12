import { useEffect, useRef, useState } from 'react'
import type { AgentEvent, AgentTab, Approval, SearchHit } from '../../shared/agent'
export function AgentWorkspace({ configured, onLockChange }: { configured: boolean; onLockChange: (locked: boolean) => void }) {
  const [endpoint, setEndpoint] = useState('http://127.0.0.1:9222')
  const [tabs, setTabs] = useState<AgentTab[]>([])
  const [selected, setSelected] = useState('')
  const [connected, setConnected] = useState(false)
  const [task, setTask] = useState('')
  const [busy, setBusy] = useState(false)
  const active = useRef(false)
  const [events, setEvents] = useState<AgentEvent[]>([])
  const [hits, setHits] = useState<SearchHit[]>([])
  const [approval, setApproval] = useState<Approval | null>(null)
  const [error, setError] = useState('')
  const [outcome, setOutcome] = useState<{ verified: boolean; summary: string } | null>(null)
  useEffect(() => { onLockChange(busy) }, [busy, onLockChange])
  useEffect(() => window.nexus.agent.onEvent(event => {
    if (!active.current) return
    setEvents(items => [...items, event])
    if (event.hits) setHits(event.hits)
    if (event.approval) setApproval(event.approval)
  }), [])
  async function action(run: () => Promise<void>) {
    if (active.current) return
    active.current = true; setBusy(true); onLockChange(true); setError('')
    try { await run() } catch (cause) { setError(cause instanceof Error ? cause.message : 'Agent operation failed') }
    finally { active.current = false; setBusy(false); setApproval(null) }
  }
  function acceptTabs(value: AgentTab[]) { setConnected(true); setTabs(value); setSelected(current => value.some(tab => tab.id === current) ? current : '') }
  const tab = tabs.find(item => item.id === selected)
  return <div className="core-workspace">
    <div className="core-toolbar"><p className="muted">Your configured model reasons locally in Nexus. Actions use registered Chrome WebMCP tools.</p>
      <button disabled={busy} onClick={() => void action(async () => {
        const result = await window.nexus.agent.clear(); if (!result.ok) throw new Error(result.message)
        setTask(''); setEvents([]); setHits([]); setApproval(null); setError(''); setOutcome(null); setSelected('')
      })}>Clear</button></div>
    <section className="core-panel">
      <div className="core-section-heading"><h3>Chrome connection</h3><span className="badge">{connected ? 'Connected' : 'Not connected'}</span></div>
      <p className="muted">Use a recent Chrome version with WebMCP support and the required WebMCP flags enabled.</p>
      <details><summary>Connection instructions</summary><p>Chrome must expose a reachable local debugging connection. Modern Chrome requires a separate user-data directory for command-line debugging; your normal default profile cannot be attached using the port flag. Start that Chrome session yourself, sign in there if needed, and keep its tabs open. Nexus never launches a substitute browser.</p>
        <pre className="core-output">google-chrome --remote-debugging-address=127.0.0.1 --remote-debugging-port=9222 --user-data-dir="$HOME/.nexus-chrome" --enable-features=WebMCP</pre>
        <p>Keep the debugging port local. If this Chrome build does not support WebMCP, use a recent supported Chrome build. Nexus detects registered tools rather than assuming support.</p></details>
      <div className="key-field"><label htmlFor="chrome-endpoint">Chrome debugging endpoint</label><div className="core-input-row"><input id="chrome-endpoint" value={endpoint} disabled={busy} onChange={event => setEndpoint(event.target.value)} />
        <button disabled={busy} onClick={() => void action(async () => { setConnected(false); const result = await window.nexus.agent.connect({ endpoint }); if (!result.ok) throw new Error(result.message); acceptTabs(result.value) })}>Connect Chrome</button></div></div>
      <button disabled={busy || !connected} onClick={() => void action(async () => { const result = await window.nexus.agent.refresh(); if (!result.ok) { setConnected(false); throw new Error(result.message) }; acceptTabs(result.value) })}>Refresh Tabs</button>
      {connected && <div className="key-field"><label htmlFor="agent-tab">Existing Chrome tab</label><select id="agent-tab" value={selected} disabled={busy} onChange={event => setSelected(event.target.value)}><option value="">Choose a tab</option>{tabs.map(item => <option key={item.id} value={item.id}>{item.title} — {item.url}</option>)}</select></div>}
      {tab && <><p className="muted">{tab.tools.length} registered tools · {tab.url}</p>{tab.issue && <p className="notice">{tab.issue} Nexus cannot execute WebMCP tasks on this page.</p>}
        {tab.tools.map(tool => <details className="core-plan" key={tool.name}><summary>{tool.name}<small>{tool.annotations.readOnly && !tool.annotations.consequential ? 'Read-only hint; Guard still checks the call' : 'Approval required'}</small></summary><p>{tool.description}</p><pre className="core-output">{JSON.stringify(tool.inputSchema, null, 2)}</pre></details>)}</>}
    </section>
    <section className="core-panel"><h3>Give your agent a goal</h3><div className="key-field"><label htmlFor="task">What would you like Nexus to do?</label><textarea id="task" value={task} disabled={busy} onChange={event => setTask(event.target.value)} placeholder="Describe the task and the outcome you want…" /></div>
      <div className="actions"><button disabled={busy || !task.trim()} onClick={() => void action(async () => { const result = await window.nexus.agent.search({ task }); if (!result.ok) throw new Error(result.message); setHits(result.value) })}>Discover capabilities</button>
        <button className="primary" disabled={busy || !configured || !connected || !selected || !task.trim()} onClick={() => void action(async () => { setEvents([]); setOutcome(null); setHits([]); const result = await window.nexus.agent.run({ task, tabId: selected }); if (!result.ok) throw new Error(result.message); setOutcome(result.value) })}>Run task</button>
        {busy && <button onClick={() => void window.nexus.agent.cancel().then(result => { if (!result.ok) setError(result.message) })}>Cancel</button>}</div>
      <p className="muted">Tasks, available tool schemas and returned results are sent to your configured provider. Browser credentials stay in Chrome. Cancellation cannot undo completed website actions.</p>
    </section>
    {hits.length > 0 && <section className="core-panel"><h3>Discovered websites</h3>{hits.map(hit => <div className="core-plan" key={hit.id}><strong>{hit.name}</strong><p>{hit.description}</p><code>{hit.url}</code><div className="actions"><button disabled={busy || !connected} onClick={() => void action(async () => { const result = await window.nexus.agent.open({ id: hit.id }); if (!result.ok) throw new Error(result.message); acceptTabs(result.value); setSelected(result.value.find(item => item.url === hit.url)?.id ?? '') })}>Open in Chrome</button></div></div>)}</section>}
    {events.length > 0 && <section className="core-panel"><h3>Plan and execution</h3><p role="status" aria-live="polite">{events.at(-1)?.message}</p>{events.filter(event => event.plan?.length).at(-1)?.plan?.map((step, index) => <p key={index}>{index + 1}. {step}</p>)}<details><summary>Activity log</summary>{events.map((event, index) => <p key={index}>{event.stage} · {event.message}{event.traceId && <><br /><code>Trace: {event.traceId}</code></>}</p>)}</details>
      {events.filter(event => event.result).map((event, index) => <details className="core-plan" key={index} open><summary>{event.result?.tool}: actual result</summary><pre className="core-output">{JSON.stringify(event.result?.output, null, 2)}</pre></details>)}</section>}
    {approval && <section className="core-panel core-error" role="dialog" aria-modal="false" aria-labelledby="approval-title"><h3 id="approval-title">Approve consequential action?</h3><p>{approval.tool} · {approval.origin}</p><p>{approval.reason}</p><pre className="core-output">{JSON.stringify(approval.args, null, 2)}</pre><div className="actions">{[false, true].map(allow => <button key={String(allow)} className={allow ? 'primary' : ''} onClick={() => { const id = approval.id; setApproval(null); void window.nexus.agent.approve({ id, allow }).then(result => { if (!result.ok) setError(result.message) }) }}>{allow ? 'Approve this call' : 'Deny'}</button>)}</div></section>}
    {error && <p className="core-error" role="alert">{error}</p>}
    {outcome && <section className={`core-panel ${outcome.verified ? 'core-success' : ''}`}><h3>{outcome.verified ? 'Verified tool evidence' : 'Outcome not verified'}</h3><p>{outcome.summary}</p><small>Verification checks actual returned tool data. It does not independently prove an external purchase or server-side effect.</small></section>}
  </div>
}

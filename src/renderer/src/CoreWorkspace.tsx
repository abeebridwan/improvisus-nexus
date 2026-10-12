import { useEffect, useState } from 'react'
import type { Catalog, Completion, Review } from '../../main/core/types'

export function CoreWorkspace({ configured, onLockChange }: {
  configured: boolean; onLockChange: (locked: boolean) => void
}) {
  const [mode, setMode] = useState<'local' | 'url'>('local')
  const [target, setTarget] = useState('')
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [review, setReview] = useState<Review | null>(null)
  const [completion, setCompletion] = useState<Completion | null>(null)
  const [busy, setBusy] = useState(false)
  const [messages, setMessages] = useState<string[]>([])
  const [error, setError] = useState('')
  const locked = busy || review !== null
  useEffect(() => window.nexus.core.onStep(step => setMessages(items => [...items, step.message])), [])
  useEffect(() => { onLockChange(locked) }, [locked, onLockChange])

  async function action(run: () => Promise<void>) {
    setBusy(true); setError('')
    try { await run() } catch (cause) { setError(cause instanceof Error ? cause.message : 'Core operation failed') }
    finally { setBusy(false) }
  }
  async function clearReview() {
    const result = await window.nexus.core.discard(review ? { batchId: review.batchId } : undefined)
    if (!result.ok) throw new Error(result.message)
    setReview(null); setCatalog(null); setSelected([])
  }
  function changeTarget(value: string) {
    setTarget(value); setCatalog(null); setSelected([]); setCompletion(null)
  }
  function toggle(id: string) {
    setSelected(ids => ids.includes(id) ? ids.filter(value => value !== id) : ids.length < 5 ? [...ids, id] : ids)
  }

  return <>
    <fieldset className="source-options" disabled={locked}>
      <legend>Website source</legend>
      {(['local', 'url'] as const).map(value => <label key={value}>
        <input type="radio" name="core-source" checked={mode === value} onChange={() => { setMode(value); changeTarget('') }} />
        {value === 'local' ? 'Local project' : 'Website URL'}
      </label>)}
    </fieldset>
    <div className="key-field">
      <label htmlFor="core-target">{mode === 'local' ? 'Local project path' : 'Public website URL'}</label>
      <input id="core-target" type={mode === 'url' ? 'url' : 'text'} value={target} disabled={locked}
        onChange={event => changeTarget(event.target.value)} />
      {mode === 'local' && <button disabled={locked} onClick={() => void action(async () => {
        const result = await window.nexus.core.pickFolder()
        if (!result.ok) throw new Error(result.message)
        if (result.value) changeTarget(result.value)
      })}>Browse</button>}
    </div>
    <button disabled={!configured || locked || !target.trim()} onClick={() => void action(async () => {
      setMessages([]); setCompletion(null); setCatalog(null); setSelected([])
      const result = await window.nexus.core.discover(mode === 'local'
        ? { mode, projectPath: target.trim() } : { mode, targetUrl: target.trim() })
      if (!result.ok) throw new Error(result.message)
      setCatalog(result.value)
    })}>Discover workflows</button>
    {catalog && <fieldset disabled={locked}>
      <legend>Select up to five workflows ({selected.length}/5)</legend>
      {catalog.candidates.map(candidate => <label className="core-candidate" key={candidate.id}>
        <input type="checkbox" checked={selected.includes(candidate.id)}
          disabled={!selected.includes(candidate.id) && selected.length >= 5}
          onChange={() => toggle(candidate.id)} />
        <span><strong>{candidate.name}</strong><br />{candidate.goal}</span>
      </label>)}
      <button className="primary" disabled={locked || !selected.length} onClick={() => void action(async () => {
        setCompletion(null)
        const result = await window.nexus.core.prepare({ catalogId: catalog.catalogId, workflowIds: selected })
        if (!result.ok) throw new Error(result.message)
        setReview(result.value)
      })}>Generate selected capabilities</button>
    </fieldset>}
    {messages.length > 0 && <pre className="core-output" aria-live="polite">{messages.join('\n')}</pre>}
    {review && <section>
      <h3>Review {review.plans.length} generated capabilities</h3>
      {review.plans.map(plan => <p key={plan.workflowId}>{plan.name} · {plan.toolName}</p>)}
      <pre className="core-output">{review.diff}</pre>
      <div className="actions">
        <button disabled={busy} onClick={() => void action(clearReview)}>Discard batch</button>
        <button className="primary" disabled={busy} onClick={() => void action(async () => {
          try {
            const result = await window.nexus.core.approve({ batchId: review.batchId })
            if (!result.ok) throw new Error(result.message)
            setCompletion(result.value)
          } finally { setReview(null); setCatalog(null); setSelected([]) }
        })}>Approve & Verify</button>
      </div>
    </section>}
    {!review && catalog && <button disabled={busy} onClick={() => void action(clearReview)}>Clear discovery</button>}
    {completion && <section>
      <h3>All selected capabilities passed verification</h3>
      {completion.tests.map((test, index) => <p key={index}>✓ {test.toolName}: {test.testName}<br />{test.screenshot}</p>)}
      {completion.delivery ? <pre className="core-output">{completion.delivery.scriptTag}</pre>
        : <p>Branch: {completion.branch}<br />Commit: {completion.commit}</p>}
    </section>}
    {error && <p className="error" role="alert">{error}</p>}
  </>
}

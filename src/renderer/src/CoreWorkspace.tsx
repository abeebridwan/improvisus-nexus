import { useEffect, useRef, useState } from 'react'
import type { Catalog, Completion, Review, Step } from '../../main/core/types'

type Mode = 'local' | 'url'
type Session = {
  target: string; catalog: Catalog | null; catalogReady: boolean; selected: string[]
  review: Review | null; completion: Completion | null; steps: Step[]; error: string
}
const fresh = (): Session => ({ target: '', catalog: null, catalogReady: false, selected: [], review: null, completion: null, steps: [], error: '' })
const stages = ['Source', 'Workflows', 'Generate', 'Review', 'Verify & results']

export function CoreWorkspace({ configured, onLockChange }: {
  configured: boolean; onLockChange: (locked: boolean) => void
}) {
  const [mode, setMode] = useState<Mode>('local')
  const [sessions, setSessions] = useState<Record<Mode, Session>>({ local: fresh(), url: fresh() })
  const [busy, setBusy] = useState('')
  const operation = useRef<{ mode: Mode; epoch: number } | null>(null)
  const epochs = useRef({ local: 0, url: 0 })
  const catalogOwner = useRef<Mode | null>(null)
  const session = sessions[mode]
  const { target, catalog, selected, review, completion, steps, error } = session
  const locked = Boolean(busy || review)
  const lastStep = steps.at(-1)
  const phase = completion || ['building', 'verifying', 'publishing'].includes(lastStep?.stage ?? '') ? 4
    : review ? 3 : busy === 'Generating capabilities' ? 2 : catalog ? 1 : 0
  let validTarget = Boolean(target.trim())
  if (mode === 'url') {
    try { validTarget = ['http:', 'https:'].includes(new URL(target.trim()).protocol) } catch { validTarget = false }
  }

  function update(source: Mode, patch: Partial<Session> | ((current: Session) => Partial<Session>)) {
    setSessions(current => ({ ...current, [source]: { ...current[source], ...(typeof patch === 'function' ? patch(current[source]) : patch) } }))
  }
  useEffect(() => {
    const unsubscribe = window.nexus.core.onStep(step => {
      const active = operation.current
      if (!active || active.epoch !== epochs.current[active.mode]) return
      update(active.mode, current => ({ steps: [...current.steps, step] }))
    })
    return () => { operation.current = null; unsubscribe() }
  }, [])
  useEffect(() => { onLockChange(locked) }, [locked, onLockChange])

  async function action(label: string, run: () => Promise<void>) {
    if (operation.current) return
    const active = { mode, epoch: epochs.current[mode] }
    operation.current = active
    setBusy(label); onLockChange(true); update(mode, { error: '' })
    try { await run() } catch (cause) {
      if (operation.current === active && active.epoch === epochs.current[mode]) {
        update(mode, { error: cause instanceof Error ? cause.message : 'Core operation failed' })
      }
    } finally {
      if (operation.current === active) { operation.current = null; setBusy('') }
    }
  }
  function changeTarget(value: string) {
    update(mode, { ...fresh(), target: value })
  }
  async function clear() {
    if (review || catalogOwner.current === mode) {
      const result = await window.nexus.core.discard(review ? { batchId: review.batchId } : undefined)
      if (!result.ok) throw new Error(result.message)
      catalogOwner.current = null
    }
    epochs.current[mode]++
    update(mode, fresh())
  }

  return <div className="core-workspace" aria-busy={Boolean(busy)}>
    <div className="core-toolbar">
      <p className="muted">Discover existing workflows. Choose up to five. Review before anything is installed or published.</p>
      <button disabled={Boolean(busy)} onClick={() => void action('Clearing session', clear)}>Clear</button>
    </div>
    <ol className="core-stages" aria-label="Capability setup progress">
      {stages.map((name, index) => <li key={name} aria-current={index === phase ? 'step' : undefined} className={index < phase ? 'complete' : ''}>
        <span>{index + 1}</span>{name}
      </li>)}
    </ol>
    <section className="core-panel" aria-labelledby="source-heading">
      <h3 id="source-heading">1. Choose your website source</h3>
      <fieldset className="core-source-options" disabled={locked}>
        <legend className="sr-only">Website source</legend>
        {(['local', 'url'] as const).map(value => <label className={`core-source ${mode === value ? 'selected' : ''}`} key={value}>
          <input type="radio" name="core-source" aria-label={value === 'local' ? 'Local project' : 'Website URL'} checked={mode === value} onChange={() => setMode(value)} />
          <span><strong>{value === 'local' ? 'Local project' : 'Website URL'}</strong>
            <small>{value === 'local' ? 'Review code changes on a new Git branch.' : 'Verify and publish an adapter for your website.'}</small></span>
        </label>)}
      </fieldset>
      <div className="key-field">
        <label htmlFor="core-target">{mode === 'local' ? 'Local project path' : 'Website URL'}</label>
        <div className="core-input-row">
          <input id="core-target" type={mode === 'url' ? 'url' : 'text'} value={target} disabled={locked}
            placeholder={mode === 'local' ? '/path/to/your/website' : 'https://your-website.com'}
            aria-describedby="core-source-help" onChange={event => changeTarget(event.target.value)} />
          {mode === 'local' && <button disabled={locked} onClick={() => void action('Choosing project', async () => {
            const result = await window.nexus.core.pickFolder()
            if (!result.ok) throw new Error(result.message)
            if (result.value) changeTarget(result.value)
          })}>Browse</button>}
        </div>
        <p id="core-source-help" className="muted">{mode === 'local'
          ? 'Choose a Git repository with a clean working tree and build/dev scripts.'
          : 'Use a public HTTP or HTTPS URL. Agent37 inspects the website; installation remains your choice.'}</p>
      </div>
      <button className="primary" disabled={!configured || locked || !validTarget} onClick={() => void action('Discovering workflows', async () => {
        catalogOwner.current = null
        update(mode === 'local' ? 'url' : 'local', { catalogReady: false })
        update(mode, { steps: [], completion: null, catalog: null, catalogReady: false, selected: [] })
        const result = await window.nexus.core.discover(mode === 'local'
          ? { mode, projectPath: target.trim() } : { mode, targetUrl: target.trim() })
        if (!result.ok) throw new Error(result.message)
        catalogOwner.current = mode
        update(mode, { catalog: result.value, catalogReady: true })
      })}>{busy === 'Discovering workflows' ? 'Discovering…' : 'Discover workflows'}</button>
      {!configured && <p className="muted">Connect your AI provider in Settings to begin.</p>}
      <p className="core-reset-note muted">Clear resets this session only. Files, Git history, published adapters and provider settings are retained.</p>
    </section>

    {catalog && <section className="core-panel" aria-labelledby="workflows-heading">
      <div className="core-section-heading"><h3 id="workflows-heading">2. Select workflows</h3><span className="badge">{selected.length} / 5 selected</span></div>
      <p className="muted">{catalog.candidates.length} workflows discovered. Proposed tests are verified after approval.</p>
      {!session.catalogReady && <p className="notice">Another source has been discovered. Rediscover this source before generating its capabilities.</p>}
      <fieldset className="core-candidates" disabled={locked || !session.catalogReady}>
        <legend className="sr-only">Select up to five workflows</legend>
        {catalog.candidates.map(candidate => <label className={`core-candidate ${selected.includes(candidate.id) ? 'selected' : ''}`} key={candidate.id}>
          <input type="checkbox" checked={selected.includes(candidate.id)}
            disabled={!selected.includes(candidate.id) && selected.length >= 5}
            onChange={() => update(mode, current => ({ selected: current.selected.includes(candidate.id)
              ? current.selected.filter(id => id !== candidate.id) : current.selected.length < 5 ? [...current.selected, candidate.id] : current.selected }))} />
          <span><strong>{candidate.name}</strong><span>{candidate.goal}</span>
            <small>{candidate.tests.length} proposed {candidate.tests.length === 1 ? 'test' : 'tests'} · {candidate.mode === 'local' ? candidate.exportedFunction : candidate.startUrl}</small></span>
        </label>)}
      </fieldset>
      <button className="primary" disabled={locked || !selected.length || !session.catalogReady} onClick={() => void action('Generating capabilities', async () => {
        update(mode, { completion: null, steps: [] })
        const result = await window.nexus.core.prepare({ catalogId: catalog.catalogId, workflowIds: selected })
        if (!result.ok) throw new Error(result.message)
        update(mode, { review: result.value })
      })}>{busy === 'Generating capabilities' ? 'Generating…' : `Generate ${selected.length || 'selected'} ${selected.length === 1 ? 'capability' : 'capabilities'}`}</button>
    </section>}

    {(busy || steps.length > 0) && <section className="core-panel core-progress" aria-labelledby="progress-heading">
      <div className="core-section-heading"><h3 id="progress-heading">Run progress</h3><span className="badge">{busy || (error ? 'Stopped with an error' : completion ? 'Complete' : review ? 'Awaiting approval' : 'Ready')}</span></div>
      <p role="status" aria-live="polite">{busy ? lastStep?.message || busy : error ? 'The operation stopped. Review the error below.' : completion ? 'Browser verification completed successfully.' : review ? 'Generation finished. Review this batch before approval.' : 'Choose your next step.'}</p>
      {steps.length > 0 && <details><summary>Activity log ({steps.length})</summary><ol className="core-activity">
        {steps.map((step, index) => <li key={index}><span className="muted">{step.stage}</span> {step.message}</li>)}
      </ol></details>}
    </section>}
    {error && <div className="core-error" role="alert"><strong>Operation could not complete</strong><p>{error}</p><small>You can retry an available action or Clear this session to start again.</small></div>}

    {review && <section className="core-panel" aria-labelledby="review-heading">
      <div className="core-section-heading"><h3 id="review-heading">4. Review generated capabilities</h3><span className="badge">Approval required</span></div>
      <ul className="core-checks">{review.checks.map((check, index) => <li key={index}>{check.pass ? '✓' : '✕'} {check.name}</li>)}</ul>
      {review.plans.map(plan => <details className="core-plan" key={plan.workflowId}>
        <summary>{plan.name}<small>{plan.toolName} · {plan.tests.length} browser tests</small></summary>
        <p>{plan.description}</p>
        {plan.adapterPath && <p className="muted">Adapter: <code>{plan.adapterPath}</code><br />Entry: <code>{plan.entryFile}</code></p>}
        <ul>{plan.tests.map((test, index) => <li key={index}>{test.name} — expected result: {test.expectedText}</li>)}</ul>
        <pre className="core-output">{plan.adapterSource}</pre>
      </details>)}
      <details className="core-diff"><summary>Review complete generated diff</summary><pre className="core-output">{review.diff}</pre></details>
      <p className="notice">{mode === 'local'
        ? 'Approval creates a new branch, applies these changes, builds the website and tests every capability in Chromium. The backend commits only after all tests pass.'
        : 'Approval tests these adapters on the website in Chromium, then publishes the bundle if all tests pass. Add the installation snippet to your website yourself.'}</p>
      <div className="actions">
        <button disabled={Boolean(busy)} onClick={() => void action('Discarding batch', async () => {
          const result = await window.nexus.core.discard({ batchId: review.batchId })
          if (!result.ok) throw new Error(result.message)
          catalogOwner.current = null
          update(mode, { review: null, catalog: null, catalogReady: false, selected: [], steps: [] })
        })}>Discard batch</button>
        <button className="primary" disabled={Boolean(busy) || review.checks.some(check => !check.pass)} onClick={() => void action('Verifying capabilities', async () => {
          update(mode, { steps: [] })
          try {
            const result = await window.nexus.core.approve({ batchId: review.batchId })
            if (!result.ok) throw new Error(result.message)
            update(mode, { completion: result.value })
          } finally {
            catalogOwner.current = null
            update(mode, { review: null, catalog: null, catalogReady: false, selected: [] })
          }
        })}>{busy === 'Verifying capabilities' ? 'Verifying…' : mode === 'local' ? 'Approve & verify' : 'Approve, verify & publish'}</button>
      </div>
    </section>}

    {completion && <section className="core-panel core-success" aria-labelledby="results-heading">
      <div className="core-section-heading"><h3 id="results-heading">5. Verified results</h3><span className="badge">{completion.tests.length} {completion.tests.length === 1 ? 'test' : 'tests'} passed</span></div>
      <p>{completion.delivery ? 'Your verified adapter bundle has been published.' : 'Your verified capabilities have been committed on a new branch.'}</p>
      <ul className="core-test-results">{completion.tests.map((test, index) => <li key={index}>
        <strong>{test.pass ? '✓ Passed' : '✕ Failed'} · {test.testName}</strong><code>{test.toolName}</code>
        {test.error && <p className="error">{test.error}</p>}
        {test.screenshot && <details><summary>Browser evidence path</summary><code>{test.screenshot}</code></details>}
      </li>)}</ul>
      {completion.delivery ? <>
        <div className="key-field"><label htmlFor="adapter-url">Published adapter URL</label><input id="adapter-url" readOnly value={completion.delivery.url} /></div>
        <div className="key-field"><label htmlFor="installation-snippet">Installation snippet</label><textarea id="installation-snippet" readOnly value={completion.delivery.scriptTag} /></div>
        <p className="muted">Copy this snippet into your website. Publishing and browser verification do not install it on your server.</p>
        <details><summary>Bundle integrity hash</summary><code>{completion.delivery.hash}</code></details>
      </> : <dl className="core-git"><dt>Git branch</dt><dd><code>{completion.branch}</code></dd><dt>Git commit</dt><dd><code>{completion.commit}</code></dd></dl>}
      <p className="muted">Clear when you are ready to start another workflow. Completed output is retained outside this session.</p>
    </section>}
  </div>
}

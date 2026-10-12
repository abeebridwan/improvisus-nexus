import { StrictMode, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { readPreferences, savePreferences, type AIProvider, type NexusFeature } from './preferences'
import './style.css'

const features = {
  core: {
    name: 'Nexus Core',
    purpose: 'Implement WebMCP on my website.',
    detail: 'Bring a local project or website URL, discover workflows, select up to five, and generate and verify capabilities in a real browser.'
  },
  agent: {
    name: 'Nexus Agent',
    purpose: 'Use my personal AI agent on WebMCP-enabled websites.',
    detail: 'An Agent37-powered personal agent that discovers capabilities through Improvisus Search, acts with permission, recovers, and verifies outcomes.'
  }
} as const
const providers = { openai: 'OpenAI', openrouter: 'OpenRouter' } as const

function App() {
  const [initial] = useState(readPreferences)
  const [feature, setFeature] = useState<NexusFeature | null>(initial?.feature ?? null)
  const [provider, setProvider] = useState<AIProvider | null>(initial?.provider ?? null)
  const [screen, setScreen] = useState<'feature' | 'provider' | 'workspace'>(initial ? 'workspace' : 'feature')
  const [apiKey, setApiKey] = useState('')
  const [keyTouched, setKeyTouched] = useState(false)
  const [storageUnavailable, setStorageUnavailable] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const keyInvalid = keyTouched && apiKey.length > 0 && !apiKey.trim()

  useEffect(() => { heading.current?.focus() }, [screen])

  function clearKey() {
    setApiKey('')
    setKeyTouched(false)
  }

  function openWorkspace() {
    if (!feature || !provider) return
    setStorageUnavailable(!savePreferences({ feature, provider }))
    clearKey()
    setScreen('workspace')
  }

  function switchWorkspace(next: NexusFeature) {
    setFeature(next)
    if (provider) setStorageUnavailable(!savePreferences({ feature: next, provider }))
  }

  return (
    <main>
      <header>
        <span className="wordmark">IMPROVISUS <span>NEXUS</span></span>
        <span className="badge">neatHack 2026</span>
      </header>
      {screen !== 'workspace' && (
        <ol className="steps" aria-label="Onboarding progress">
          <li aria-current={screen === 'feature' ? 'step' : undefined}>01 · Choose functionality</li>
          <li aria-current={screen === 'provider' ? 'step' : undefined}>02 · Connect AI provider</li>
        </ol>
      )}
      <section className="intro" aria-labelledby="title">
        <p className="eyebrow">{screen === 'workspace' ? 'YOUR WORKSPACE' : 'WELCOME TO IMPROVISUS NEXUS'}</p>
        <h1 id="title" ref={heading} tabIndex={-1}>
          {screen === 'feature' ? 'What will you do with Nexus?' : screen === 'provider' ? 'Bring your own AI.' : features[feature!].name}
        </h1>
        <p className="description">
          {screen === 'feature' ? 'Choose where to start. You can switch workspaces later.' :
            screen === 'provider' ? `Choose an AI provider for ${features[feature!].name}. Nexus uses your own API key; your provider bills you for usage.` : features[feature!].purpose}
        </p>
      </section>

      {screen === 'feature' && (
        <>
          <fieldset className="directions">
            <legend className="sr-only">Nexus functionality</legend>
            {(['core', 'agent'] as const).map((option, index) => (
              <label className={`choice ${feature === option ? 'selected' : ''}`} key={option}>
                <input type="radio" name="feature" value={option} checked={feature === option} onChange={() => setFeature(option)} />
                <span className="choice-copy">
                  <span className="number">0{index + 1} / {option === 'core' ? 'CREATE' : 'EXECUTE'}</span>
                  <strong>{features[option].name}</strong>
                  <span className="purpose">{features[option].purpose}</span>
                  <span className="description">{features[option].detail}</span>
                  <span className="planned">Planned capabilities · workspace preview</span>
                </span>
              </label>
            ))}
          </fieldset>
          <div className="actions end">
            <button className="primary" disabled={!feature} onClick={() => setScreen('provider')}>Continue</button>
          </div>
        </>
      )}

      {screen === 'provider' && (
        <>
          <fieldset className="directions providers">
            <legend>AI provider</legend>
            {(['openai', 'openrouter'] as const).map((option) => (
              <label className={`choice ${provider === option ? 'selected' : ''}`} key={option}>
                <input type="radio" name="provider" value={option} checked={provider === option} onChange={() => { setProvider(option); clearKey() }} />
                <strong>{providers[option]}</strong>
              </label>
            ))}
          </fieldset>
          <div className="key-field">
            <label htmlFor="api-key">API key <span className="muted">· optional for preview</span></label>
            <input id="api-key" type="password" value={apiKey} disabled={!provider} autoComplete="off" spellCheck={false}
              aria-describedby="key-status connection-note" aria-invalid={keyInvalid}
              onChange={(event) => { setApiKey(event.target.value); setKeyTouched(true) }} onBlur={() => setKeyTouched(true)} />
            <p id="key-status" className={keyInvalid ? 'error' : 'muted'} role="status">
              {keyInvalid ? 'Enter a key with more than whitespace, or leave it empty for preview.' :
                apiKey.trim() ? 'Key entered · not verified.' : 'No key entered · provider not connected.'}
            </p>
          </div>
          <aside className="notice" id="connection-note">
            <strong>Provider connection is coming next.</strong>
            <p>Secure key storage and live validation are not available yet. Your key is not sent or saved and is discarded when you leave this step. Only your provider and workspace preferences are saved.</p>
          </aside>
          <div className="actions">
            <button onClick={() => { clearKey(); setScreen('feature') }}>Back</button>
            <button className="primary" disabled={!provider} onClick={openWorkspace}>Save preferences &amp; explore workspace</button>
          </div>
        </>
      )}

      {screen === 'workspace' && (
        <>
          <nav className="workspace-switch" aria-label="Workspace">
            {(['core', 'agent'] as const).map((option) => (
              <button key={option} aria-pressed={feature === option} onClick={() => switchWorkspace(option)}>{features[option].name}</button>
            ))}
          </nav>
          <article className="workspace-preview">
            <span className="number">WORKSPACE PREVIEW</span>
            <h2>{feature === 'core' ? 'Make your website agent-ready.' : 'Give your agent a goal.'}</h2>
            <p>{features[feature!].detail}</p>
            <span className="planned">{feature === 'core' ? 'Workflow discovery, generation and browser verification are not implemented yet.' : 'Capability discovery, task execution and approvals are not implemented yet.'}</span>
          </article>
          <div className="provider-summary">
            <span>{providers[provider!]} · Not connected</span>
            <button onClick={() => setScreen('provider')}>Change provider</button>
          </div>
        </>
      )}
      {storageUnavailable && <p className="error" role="status">Preferences could not be saved on this device. You can still explore this session.</p>}
      <footer>
        <span><span className="dot" />Desktop shell ready</span>
        <span>Electron {window.nexus.electron} · {window.nexus.platform}</span>
      </footer>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)

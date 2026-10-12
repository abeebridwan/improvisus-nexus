
import { StrictMode, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { readPreferences, savePreferences, type AIProvider, type NexusFeature } from './preferences'
import { ProviderSettings } from './ProviderSettings'
import type { ProviderState } from '../../shared/providers'
import { CoreWorkspace } from './CoreWorkspace'

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
  const [screen, setScreen] = useState<'feature' | 'provider' | 'workspace' | 'settings' | 'loading'>(initial ? 'loading' : 'feature')
  const [providerState, setProviderState] = useState<ProviderState | null>(null)
  const [message, setMessage] = useState('')
  const [storageUnavailable, setStorageUnavailable] = useState(false)
  const [coreLocked, setCoreLocked] = useState(false)
  const [task, setTask] = useState('')
  const heading = useRef<HTMLHeadingElement>(null)

  useEffect(() => { heading.current?.focus() }, [screen])

  useEffect(() => {
    let mounted = true
    void window.nexus.providers.status().then(result => {
      if (!mounted) return
      if (result.ok) {
        setProviderState(result.value)
        if (initial) setScreen(result.value.active ? 'workspace' : 'provider')
      } else {
        setMessage(result.message)
        if (initial) setScreen('provider')
      }
    }).catch(() => {
      if (mounted) setMessage('Could not load provider settings. Restart Nexus.')
    })
    return () => { mounted = false }
  }, [initial])

  function openWorkspace(value: ProviderState) {
    setProviderState(value)
    setMessage('')
    if (!feature || !value.active) return
    setProvider(value.active.provider)
    setStorageUnavailable(!savePreferences({ feature, provider: value.active.provider }))
    setScreen('workspace')
  }

  function switchWorkspace(next: NexusFeature) {
    setFeature(next)
    setScreen('workspace')
    const selected = providerState?.active?.provider ?? provider
    if (selected) setStorageUnavailable(!savePreferences({ feature: next, provider: selected }))
  }

  const active = providerState?.active

  if (screen === 'loading') {
    return (
      <main>
        <p role="status" className="description">
          Loading secure provider settings…
        </p>
      </main>
    )
  }

  return (
    <main className={screen === 'workspace' && feature === 'core' ? 'core-screen' : undefined}>
      <header>
        <span className="wordmark">
          IMPROVISUS <span>NEXUS</span>
        </span>

        {(screen === 'workspace' || screen === 'settings') ? (
          <nav className="workspace-switch" aria-label="Nexus navigation">
            <button
              disabled={coreLocked}
              aria-pressed={screen === 'workspace' && feature === 'core'}
              onClick={() => switchWorkspace('core')}
            >
              Nexus Core
            </button>

            <button
              disabled={coreLocked}
              aria-pressed={screen === 'workspace' && feature === 'agent'}
              onClick={() => switchWorkspace('agent')}
            >
              Nexus Agent
            </button>

            <button
              disabled={coreLocked}
              aria-pressed={screen === 'settings'}
              onClick={() => setScreen('settings')}
            >
              Settings
            </button>
          </nav>
        ) : (
          <span className="badge">neatHack 2026</span>
        )}
      </header>

      {(screen === 'feature' || screen === 'provider') && (
        <ol className="steps" aria-label="Onboarding progress">
          <li aria-current={screen === 'feature' ? 'step' : undefined}>
            01 · Choose functionality
          </li>
          <li aria-current={screen === 'provider' ? 'step' : undefined}>
            02 · Connect AI provider
          </li>
        </ol>
      )}

      <section className="intro" aria-labelledby="title">
        <p className="eyebrow">
          {screen === 'workspace'
            ? 'YOUR WORKSPACE'
            : screen === 'settings'
              ? 'PROVIDER CONFIGURATION'
              : 'WELCOME TO IMPROVISUS NEXUS'}
        </p>

        <h1 id="title" ref={heading} tabIndex={-1}>
          {screen === 'feature'
            ? 'What will you do with Nexus?'
            : screen === 'provider'
              ? 'Bring your own AI.'
              : screen === 'settings'
                ? 'Settings'
                : features[feature!].name}
        </h1>

        <p className="description">
          {screen === 'feature'
            ? 'Choose where to start. You can switch workspaces later.'
            : screen === 'provider'
              ? `Choose an AI provider for ${features[feature!].name}. Nexus uses your own API key; your provider bills you for usage.`
              : screen === 'settings'
                ? 'One provider and model, shared by Nexus Core and Nexus Agent.'
                : features[feature!].purpose}
        </p>
      </section>

      {screen === 'feature' && (
        <>
          <fieldset className="directions">
            <legend className="sr-only">Nexus functionality</legend>

            {(['core', 'agent'] as const).map((option, index) => (
              <label
                className={`choice ${feature === option ? 'selected' : ''}`}
                key={option}
              >
                <input
                  type="radio"
                  name="feature"
                  value={option}
                  checked={feature === option}
                  onChange={() => setFeature(option)}
                />

                <span className="choice-copy">
                  <span className="number">
                    0{index + 1} / {option === 'core' ? 'CREATE' : 'EXECUTE'}
                  </span>
                  <strong>{features[option].name}</strong>
                  <span className="purpose">{features[option].purpose}</span>
                  <span className="description">{features[option].detail}</span>
                  <span className="planned">
                    Planned capabilities · workspace preview
                  </span>
                </span>
              </label>
            ))}
          </fieldset>

          <div className="actions end">
            <button
              className="primary"
              disabled={!feature}
              onClick={() => setScreen('provider')}
            >
              Continue
            </button>
          </div>
        </>
      )}

      {(screen === 'provider' || screen === 'settings') && (
        <ProviderSettings
          key={screen}
          state={providerState}
          preferred={provider}
          onSaved={openWorkspace}
          onChanged={setProviderState}
          onBack={() => setScreen(screen === 'settings' ? 'workspace' : 'feature')}
        />
      )}

      {screen === 'workspace' && (
        <>
          <div className="provider-summary">
            <span>
              {active
                ? `${providers[active.provider]} · ${active.model} · Configured`
                : 'No provider configured'}
            </span>

            <button
              disabled={coreLocked}
              onClick={() => setScreen('settings')}
            >
              Provider settings
            </button>
          </div>

          <article className="workspace-preview">
            <span className="number">
              {feature === 'core' ? 'WEBSITE CAPABILITIES' : 'PERSONAL AGENT'}
            </span>

            <h2>
              {feature === 'core'
                ? 'Make your website agent-ready.'
                : 'Give your agent a goal.'}
            </h2>

            {feature === 'core' ? (
              <CoreWorkspace
                configured={Boolean(active)}
                onLockChange={setCoreLocked}
              />
            ) : (
              <>
                <div className="key-field">
                  <label htmlFor="task">
                    What would you like Nexus to do?
                  </label>
                  <textarea
                    id="task"
                    value={task}
                    onChange={event => setTask(event.target.value)}
                    placeholder="Describe a task to complete across WebMCP-enabled websites…"
                  />
                </div>

                <div className="actions">
                  <button disabled>Discover capabilities</button>
                  <button className="primary" disabled>Run task</button>
                </div>

                <p className="planned">
                  Improvisus Search discovery and Agent37 execution are not connected yet.
                  Your task stays on this screen and is not sent anywhere.
                </p>
              </>
            )}
          </article>
        </>
      )}

      {message && (
        <p className="error" role="status">
          {message}
        </p>
      )}

      {storageUnavailable && (
        <p className="error" role="status">
          Preferences could not be saved on this device.
          You can still explore this session.
        </p>
      )}

      <footer>
        <span>
          <span className="dot" />
          Desktop shell ready
        </span>
        <span>
          Electron {window.nexus.electron} · {window.nexus.platform}
        </span>
      </footer>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

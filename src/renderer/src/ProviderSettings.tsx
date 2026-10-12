import { useEffect, useState } from 'react'
import type { ProviderId, ProviderModel, ProviderState } from '../../shared/providers'

const names = { openai: 'OpenAI', openrouter: 'OpenRouter' }
export function ProviderSettings({ state, preferred, onSaved, onChanged, onBack }: {
  state: ProviderState | null
  preferred: ProviderId | null
  onSaved: (value: ProviderState) => void
  onChanged: (value: ProviderState) => void
  onBack: () => void
}) {
  const [provider, setProvider] = useState<ProviderId>(state?.active?.provider ?? preferred ?? 'openai')
  const [apiKey, setApiKey] = useState('')
  const [models, setModels] = useState<ProviderModel[]>([])
  const [model, setModel] = useState('')
  const [validationId, setValidationId] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const saved = state?.savedProviders.includes(provider) ?? false
  useEffect(() => () => { void window.nexus.providers.cancel() }, [])
  function reset() { setValidationId(''); setModels([]); setModel(''); setMessage('') }

  async function validate() {
    setBusy(true)
    reset()
    const request = { provider, ...(apiKey ? { apiKey } : {}) }
    setApiKey('')
    try {
      const result = await window.nexus.providers.validate(request)
      if (!result.ok) { setMessage(result.message); return }
      setValidationId(result.value.validationId)
      setModels(result.value.models)
      if (state?.active?.provider === provider && result.value.models.some(item => item.id === state.active?.model)) setModel(state.active.model)
      setMessage('Key verified. Choose a model, then save your configuration.')
    } catch { setMessage('Could not reach provider settings. Restart Nexus.') } finally { setBusy(false) }
  }
  async function save() {
    setBusy(true)
    try {
      const result = await window.nexus.providers.save({ validationId, model })
      if (result.ok) onSaved(result.value)
      else setMessage(result.message)
    } catch { setMessage('Could not save provider settings. Restart Nexus.') } finally { setBusy(false) }
  }
  async function remove() {
    setBusy(true)
    setApiKey('')
    reset()
    try {
      const result = await window.nexus.providers.remove({ provider })
      if (result.ok) { onChanged(result.value); setMessage('Saved key deleted.') }
      else setMessage(result.message)
    } catch { setMessage('Could not delete the saved key. Restart Nexus.') } finally { setBusy(false) }
  }
  return (
    <>
      <fieldset className="directions providers" disabled={busy}>
        <legend>AI provider</legend>
        {(['openai', 'openrouter'] as const).map(option => (
          <label className={`choice ${provider === option ? 'selected' : ''}`} key={option}>
            <input type="radio" name="provider" checked={provider === option} onChange={() => { void window.nexus.providers.cancel(); setProvider(option); setApiKey(''); reset() }} />
            <strong>{names[option]}</strong>
          </label>
        ))}
      </fieldset>
      <div className="key-field">
        <label htmlFor="api-key">API key {saved && <span className="muted">· saved securely; leave empty to reuse</span>}</label>
        <input id="api-key" type="password" value={apiKey} disabled={busy} autoComplete="off" spellCheck={false}
          aria-describedby="connection-note" onChange={event => { if (validationId) void window.nexus.providers.cancel(); setApiKey(event.target.value); reset() }} />
      </div>
      <p className="muted" id="connection-note">Your key is encrypted using your operating system's secret store. It is sent only to the selected provider for authentication. Validation lists models without generating a response.</p>
      {state && !state.secureStorage && <p className="error" role="status">Secure storage is unavailable. Unlock or configure your operating system keyring and restart Nexus.</p>}
      <button disabled={busy || !state?.secureStorage || (!apiKey && !saved)} onClick={() => void validate()}>{busy ? 'Working…' : 'Check key & load models'}</button>
      <div className="key-field">
        <label htmlFor="model">Model</label>
        <select id="model" value={model} disabled={busy || !validationId} onChange={event => setModel(event.target.value)}>
          <option value="">{models.length ? 'Choose an available model' : 'Check a key to load available models'}</option>
          {models.map(item => <option key={item.id} value={item.id}>{item.id}</option>)}
        </select>
        {model && <p className="muted">Tool calling: {models.find(item => item.id === model)?.tools === 'supported' ? 'reported supported by the provider' : models.find(item => item.id === model)?.tools === 'unsupported' ? 'not supported by this model' : 'not confirmed by the model-list API'}.</p>}
      </div>
      {message && <p role="status" className="description">{message}</p>}
      <div className="actions">
        <button disabled={busy} onClick={onBack}>Back</button>
        <button className="primary" disabled={busy || !validationId || !model} onClick={() => void save()}>Save &amp; open workspace</button>
      </div>
      {saved && <button className="delete-key" disabled={busy} onClick={() => void remove()}>Delete saved {names[provider]} key</button>}
    </>
  )
}

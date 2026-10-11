import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

function App() {
  return (
    <main>
      <header>
        <span className="wordmark">IMPROVISUS <span>NEXUS</span></span>
        <span className="badge">neatHack 2026</span>
      </header>
      <section className="intro" aria-labelledby="title">
        <p className="eyebrow">DESKTOP FOUNDATION · 0.1.0</p>
        <h1 id="title">A place for agents<br />to get work done.</h1>
        <p className="description">Make websites agent-ready. Put their capabilities to work.<br />The desktop foundation is ready for the next build.</p>
      </section>
      <section className="directions" aria-label="Planned capabilities">
        <article>
          <span className="number">01 / CREATE</span>
          <h2>Make websites agent-ready</h2>
          <p>Discover a useful workflow, generate a WebMCP capability, and verify it in a real browser.</p>
          <span className="planned">Planned · workflow not implemented</span>
        </article>
        <article>
          <span className="number">02 / EXECUTE</span>
          <h2>Your personal AI agent</h2>
          <p>Discover capabilities, act with permission, recover from failures, and verify the outcome.</p>
          <span className="planned">Planned · agent not implemented</span>
        </article>
      </section>
      <footer>
        <span><span className="dot" />Desktop shell ready</span>
        <span>Electron {window.nexus.electron} · {window.nexus.platform}</span>
      </footer>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)

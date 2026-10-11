# Foundation verification

Verified locally on Linux on October 11, 2026 (WAT).

- `npm run typecheck`: passed for the Node/main/preload and React renderer projects.
- `npm test`: production build passed; the real Electron window rendered React and read-only preload metadata. Renderer Node globals were absent. Sandbox, context isolation, and web security were enabled. Browser permissions and new windows were denied. Production CSP was checked.
- `npm run dev`: launched successfully with the loopback Vite renderer and working preload. The development window was inspected through Playwright, then closed. An inherited `ELECTRON_RUN_AS_NODE` flag initially prevented development startup; launch scripts now clear it.
- `npm run browser:install`: installed the matching Playwright Chromium. A real Chromium process launched and rendered a local test page successfully. No website task was executed.
- `npm run neatlogs:doctor`: official local-only diagnostic passed. Its fixture spans are not app execution evidence. Dashboard export was not tested without credentials.
- `npm run insta -- --version`: official InstaCloud CLI returned `0.1.23`. No login or cloud action occurred.
- `entire doctor`: local Git hooks and Codex hook configuration installed; seven Codex hooks still require approval through `/hooks`. No captured coding-session checkpoint is claimed.
- `npm audit fix`: compatible fixes checked; 14 upstream dependency advisories remain (10 moderate, 4 high) in the mandatory neatlogs dependency tree.

The desktop screenshot is generated at `artifacts/desktop-smoke.png` and kept out of Git. Agent execution, WebMCP generation/installation, capability discovery, remote integrations, failed/successful agent run evidence, and the cfo.ai plan remain unimplemented.

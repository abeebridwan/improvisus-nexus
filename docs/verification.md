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

## Mandatory integration setup follow-up

On October 11, 2026, `npm run typecheck` passed with the new SDK-native instrumentation presets, and the official local neatlogs diagnostic passed again. The ignored `.env` has mode `0600`, is not tracked, and contains an empty key placeholder; no real key was supplied and no authenticated probe was run. The probe command's environment-file loading and CLI help were checked without exporting a trace.

`entire enable --agent codex` was rerun successfully. `entire status --detailed` confirms enabled Codex integration and `push_sessions=false`; `entire doctor` still reports seven hooks requiring approval. `entire session current` reports no captured state for this session. The two existing Git commit hashes remain unchanged.

The cfo.ai event signup URL was followed from the official hackathon page and its redirect confirmed. No account, payment, credit redemption, or financial model was created. Manual steps and required model inputs are in `docs/business-plan/README.md`.

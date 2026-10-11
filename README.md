# Improvisus Nexus

An Electron desktop personal AI agent for neatHack 2026. The intended product makes websites agent-ready with verified WebMCP capabilities and uses those capabilities to complete tasks with permission, failure recovery, and result verification.

This repository currently contains the desktop foundation only. The two capability descriptions in the shell are plans; no agent execution or WebMCP generation exists yet.

## Development

Use Node.js 22.12+ and npm. `.nvmrc` pins the locally verified development version to 22.23.0. With nvm installed, run `nvm install` and `nvm use` in this directory before the commands below. `.editorconfig` keeps UTF-8, LF, and two-space indentation consistent.

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
npm start
```

`npm start` opens the last build. `npm test` builds and launches the real Electron app through Playwright, verifies rendering and security settings, and writes `artifacts/desktop-smoke.png`. On Linux without a display, use `xvfb-run -a npm test`. Keep Chromium sandbox support enabled on the host.

Launch scripts clear an inherited `ELECTRON_RUN_AS_NODE` flag so the app also starts from coding environments that set it. Development uses a loopback Vite server and a development-only CSP relaxation for React refresh and HMR; built assets use the restrictive production policy.

`npm run browser:install` downloads Playwright Chromium for future website verification; the desktop smoke test uses Electron's bundled Chromium.

## Structure

```text
src/main/       Electron and Node.js backend
src/preload/    Read-only desktop metadata bridge
src/renderer/   React UI
src/shared/     Bridge types
scripts/        Desktop launch verification
docs/           Integration setup and cfo.ai placeholder
```

Future main-process responsibilities have small documentation placeholders under `agent/`, `browser/`, `discovery/`, and `webmcp/`. No workflow interfaces or implementations have been added.

The [demo acceptance checklist](docs/demo-acceptance.md) defines a planned product-search capability and procurement-shortlist task, including required browser verification, approval, failure recovery, and evidence before marking it complete.

[hackathon.md](hackathon.md) records actual progress, failures, fixes, verification, and demo/submission readiness. Repository instructions require a concise factual entry after each meaningful implementation session, following the official neatHack build companion.

The renderer is sandboxed, has no Node.js access, and uses context isolation. The production shell loads local assets through the restricted `nexus://app/` protocol with a Content Security Policy. New windows, page navigation, and browser permissions are denied. The preload exposes only platform and Electron version metadata. Privileged workflow APIs will need specific, validated IPC contracts when implemented.

Build tooling follows [electron-vite conventions](https://electron-vite.org/guide/dev). Security follows the [Electron checklist](https://www.electronjs.org/docs/latest/tutorial/security), and launch checks use [Playwright's Electron API](https://playwright.dev/docs/api/class-electron).

## Integration status

- **neatlogs:** official SDK installed; main-process startup tracing, graceful shutdown, and inert agent instrumentation presets prepared. Add a project key in the ignored, owner-only `.env`. Local diagnostic: `npm run neatlogs:doctor`; authenticated diagnostic after supplying a key: `npm run neatlogs:probe`. Dashboard delivery is unverified.
- **Entire:** CLI installed and Git/Codex hooks configured. Open `/hooks` in a project Codex session to approve capture. This initialization session was not captured. Check `npm run entire:status` and `entire doctor`.
- **Agent37:** official hosted API verified; configuration placeholders documented. No local runtime package or agent instance installed/provisioned.
- **InstaCloud:** official `insta` CLI installed and version checked. No cloud resources or custom publisher created.
- **cfo.ai:** [official signup and financial-plan inputs](docs/business-plan/README.md) documented; signup and plan remain manual work.

See [setup details and remaining manual steps](docs/integrations.md) and [verified results](docs/verification.md). Copy `.env.example` to `.env` if configuring tracing; all credentials are optional for the shell and no fake values are provided. The model provider and Search settings are reserved for future implementation.

The current neatlogs dependency tree has unresolved npm advisories; compatible fixes were checked. No remote repository has been published or pushed.

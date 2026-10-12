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

`npm start` builds and opens the production desktop. `npm test` builds and launches the real Electron app through Playwright with Chromium sandboxing enabled, verifies rendering and security settings, and writes `artifacts/desktop-smoke.png`. On Linux without a display, use `xvfb-run -a npm test`.

On Ubuntu with restricted user namespaces, run `npm run setup:linux` once from your own terminal; sudo installs a profile scoped to this checkout's Electron executable. Review it first with `npm run setup:linux -- --print`. See [Linux setup and rollback](docs/linux-development.md). This setup preserves Chromium sandboxing and survives dependency reinstalls at the same path.

Launch scripts clear an inherited `ELECTRON_RUN_AS_NODE` flag and resolve Electron's lazily downloaded executable before starting electron-vite. Development uses a loopback Vite server and a development-only CSP relaxation for React refresh and HMR; built assets use the restrictive production policy.

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

- **neatlogs:** official SDK initialized once in the main process, with credential masking and bounded shutdown. Real desktop startup and renderer-load spans were verified as finalized through authenticated CLI readback. `npm run neatlogs:verify-desktop` reproduces the local launch check; [verification notes](docs/verification.md) explain independent readback. Agent/LLM/WebMCP instrumentation remains dormant until real execution exists. Credentials stay in the ignored, owner-only `.env` or process environment.
- **Entire:** CLI and Git/Codex hooks configured; hook approval records are present. The saved checkpoint remains private at the builder's instruction, and fresh automatic capture is unverified. CLI login works; hosted repository import currently fails its GitHub App access check. See [checkpoint verification](docs/entire-checkpoints.md).
- **Agent37:** official hosted API verified; configuration placeholders documented. No local runtime package or agent instance installed/provisioned.
- **InstaCloud:** official `insta` CLI installed and version checked. No cloud resources or custom publisher created.
- **cfo.ai:** builder-generated plan share links and matching public metadata recorded in [business-plan documentation](docs/business-plan/README.md). Actual financial content and numerical review await readable exports; no runtime integration.

See [setup details and remaining manual steps](docs/integrations.md) and [verified results](docs/verification.md). Copy `.env.example` to `.env` if configuring tracing; all credentials are optional for the shell and no fake values are provided. The model provider and Search settings are reserved for future implementation.

The current neatlogs dependency tree has unresolved npm advisories; compatible fixes were checked. The [public GitHub repository](https://github.com/abeebridwan/improvisus-nexus) now contains the code and existing commit history on `main`. The reviewed [desktop screenshot](artifacts/desktop-smoke.png) and [sanitized startup trace evidence](artifacts/neatlogs-desktop.json) are published; other generated artifacts stay ignored. Private Entire checkpoint refs were excluded from the push.

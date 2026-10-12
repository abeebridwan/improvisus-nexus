# Improvisus Nexus

An Electron desktop personal AI agent for neatHack 2026. The intended product makes websites agent-ready with verified WebMCP capabilities and uses those capabilities to complete tasks with permission, failure recovery, and result verification.

This repository contains the secure desktop foundation, onboarding, shared provider Settings and Nexus Core's local-project/website-URL workflows. Core discovers workflows, generates up to five capabilities, requests approval and verifies them in Chromium before a local Git commit or remote adapter publication. OpenAI/OpenRouter keys use OS-backed encryption in the main process; storage fails closed without a usable keyring. The personal Agent workspace remains a task/discovery entry screen. See [Core usage and verification](docs/core-workspace.md), [onboarding](docs/onboarding.md) and [provider setup](docs/providers.md).

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

`npm start` builds and opens the production desktop. `npm test` runs focused provider/redaction tests, then launches real Electron with Chromium sandboxing and an isolated profile. Its fixture-provider checks use real IPC and OS encryption; encrypted restart/navigation checks explicitly skip if a keyring is unavailable. No real key or paid inference is used. On Linux without a display, use `xvfb-run -a npm test`.

On Linux, launch as your normal user, without `sudo`. When available, launch scripts reuse the verified root-owned sandbox helper installed by Google Chrome. On Ubuntu without that helper, `npm run setup:linux` installs an AppArmor profile scoped to this checkout's Electron executable. See [Linux setup and rollback](docs/linux-development.md). Both approaches preserve Chromium sandboxing.

Launch scripts clear an inherited `ELECTRON_RUN_AS_NODE` flag and resolve Electron's lazily downloaded executable before starting electron-vite. Development uses a loopback Vite server and a development-only CSP relaxation for React refresh and HMR; built assets use the restrictive production policy.

`npm run browser:install` downloads Playwright Chromium for Core website verification; the desktop smoke test uses Electron's bundled Chromium. `npm run test:core` runs controlled local and URL integrations through the real Core IPC/controller, Git and WebMCP browser runner. External model, Agent37 and publisher responses are fixtures; an unlocked OS keyring and a display are required. On GNOME, use `NEXUS_TEST_PASSWORD_STORE=gnome-libsecret npm run test:core`.

## Structure

```text
src/main/       Electron and Node.js backend
src/preload/    Desktop metadata and restricted provider/Core IPC
src/renderer/   React UI
src/shared/     Bridge types
scripts/        Desktop launch verification
docs/           Integration setup and cfo.ai placeholder
```

Core implementation lives under `src/main/core/`. Future personal-agent responsibilities retain documentation placeholders under `agent/`, `browser/`, `discovery/`, and `webmcp/`.

The [demo acceptance checklist](docs/demo-acceptance.md) defines a planned product-search capability and procurement-shortlist task, including required browser verification, approval, failure recovery, and evidence before marking it complete.

[hackathon.md](hackathon.md) records actual progress, failures, fixes, verification, and demo/submission readiness. Repository instructions require a concise factual entry after each meaningful implementation session, following the official neatHack build companion.

The renderer is sandboxed, has no Node.js access, and uses context isolation. The production shell loads local assets through the restricted `nexus://app/` protocol with a Content Security Policy. New windows, page navigation, and browser permissions are denied. Preload exposes metadata, five allowlisted provider operations, five Core operations and a Core progress subscription. Credentials can be submitted, but never read back.

Build tooling follows [electron-vite conventions](https://electron-vite.org/guide/dev). Security follows the [Electron checklist](https://www.electronjs.org/docs/latest/tutorial/security), and launch checks use [Playwright's Electron API](https://playwright.dev/docs/api/class-electron).

## Integration status

- **neatlogs:** official SDK initialized once in the main process, with credential masking and bounded shutdown. Real desktop startup and renderer-load spans were verified as finalized through authenticated CLI readback. `npm run neatlogs:verify-desktop` reproduces the local launch check; [verification notes](docs/verification.md) explain independent readback. Core model/tool trace coverage has not been independently verified; this frontend change preserves existing instrumentation. Credentials stay in the ignored, owner-only `.env` or process environment.
- **Entire:** CLI and Git/Codex hooks configured; hook approval records are present. The reviewed saved checkpoint is now public on GitHub at the builder's instruction; fresh automatic capture is unverified. CLI login works; hosted repository import currently fails its GitHub App access check. See [checkpoint verification](docs/entire-checkpoints.md).
- **Agent37:** Core URL discovery calls an existing hosted instance through its responses API. Its URL/ID and key require local configuration; no instance was provisioned here. The personal Agent executor is separate and remains unimplemented.
- **InstaCloud:** official `insta` CLI installed and version checked. Core calls a configured existing adapter publisher after browser verification. No cloud resources or custom publisher were created here.
- **cfo.ai:** builder-generated plan share links and matching public metadata recorded in [business-plan documentation](docs/business-plan/README.md). Actual financial content and numerical review await readable exports; no runtime integration.

See [setup details and remaining manual steps](docs/integrations.md) and [verified results](docs/verification.md). Copy `.env.example` to `.env` if configuring tracing; no fake values are provided. Configure AI provider keys through Settings, not frontend environment variables. Improvisus Search and personal-agent execution remain unimplemented.

The current neatlogs dependency tree has unresolved npm advisories; compatible fixes were checked. The [public GitHub repository](https://github.com/abeebridwan/improvisus-nexus) now contains the code and existing commit history on `main`. The reviewed [desktop screenshot](artifacts/desktop-smoke.png) and [sanitized startup trace evidence](artifacts/neatlogs-desktop.json) are published; other generated artifacts stay ignored. The one reviewed Entire checkpoint ref is also published; automatic publication of future checkpoints remains disabled.

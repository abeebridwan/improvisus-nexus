# Improvisus Nexus — neatHack build record

## Project

**Project:** Improvisus Nexus.

**Goal:** Build a personal AI agent that makes websites agent-ready through one generated WebMCP workflow and uses existing WebMCP capabilities to accomplish real tasks.

**Problem:** Website workflows need discoverable, tested capabilities, and personal agents need reliable execution with permissions, recovery, and independently verified results.

**Team:** No public names, handles, or team name supplied. Do not infer them from local accounts or Git authors.

**Current stage:** Desktop foundation and integration preparation. No product agent, WebMCP generator, or end-to-end task execution is implemented.

This record follows the [official neatHack build-companion skill](https://neatlogs.com/hackathon/skill), read on October 11, 2026. Append factual entries after meaningful implementation sessions; preserve earlier entries and label corrections. Dates use WAT. No secrets, private traces, personal data, or environment-file contents belong here.

## Stack and mandatory tools

| Component | Actual status |
| --- | --- |
| Electron, React, TypeScript, Node.js, Vite | Installed; desktop shell builds and launches. Node development pin and EditorConfig prepared. |
| Agent37 | Official hosted API reviewed; configuration documented. No instance, runtime request, reasoning, or execution verified. |
| Insta / InstaCloud | Official `insta` CLI installed; version check returned `0.1.23`. No publisher or cloud resources created. |
| Playwright / Chromium | Installed; desktop smoke and standalone Chromium launch checks passed. No website workflow runner implemented. |
| WebMCP | Generator/discovery boundaries and demo acceptance criteria documented. No capability generated, installed, or invoked. |
| neatlogs — mandatory | TypeScript SDK `1.1.28` in the main process; startup tracing lifecycle and inert agent span presets prepared. Local SDK diagnostic passed. No authenticated delivery or agent trace recorded. |
| Entire — mandatory | CLI `0.11.4`, Git hooks, and Codex hooks configured. Latest status: enabled, seven hooks awaiting approval; automatic checkpoint publishing disabled. No captured session checkpoint verified. |
| cfo.ai — mandatory | Official event signup and model-input checklist documented. No plan export, credit confirmation, or account completion evidence recorded. |

The intended model endpoint is OpenAI-compatible; no model client or call is implemented. Current credential configuration was not inspected in this documentation session.

## Build log

### October 11, 2026 (WAT) — retrospective: desktop initialization

- Created the secure Electron/React/TypeScript foundation, read-only preload bridge, and main-process boundaries. Commits: `d6fc694` (desktop app) and `544bd62` (runtime/tooling scaffold).
- Passed `npm run typecheck`, production build and Electron smoke verification, development launch, and standalone Playwright Chromium launch. The smoke checks cover rendering, preload, absent renderer Node globals, sandbox/context isolation, permission denial, popup denial, and production CSP.
- Development launch initially failed because the coding environment supplied `ELECTRON_RUN_AS_NODE`. The launch wrapper clears that flag; the development renderer then launched successfully.
- neatlogs' local SDK diagnostic passed; its controlled fixture is not an agent trace. Entire installation/enable succeeded, but hook approval prevented verified session capture. cfo.ai remained manual setup.
- Last recorded dependency audit: 14 upstream advisories (10 moderate, 4 high) in neatlogs' dependency tree. Compatible `npm audit fix` did not resolve them. No new audit was run for this log.
- Shareable records: [verification notes](docs/verification.md), [launch check](scripts/smoke-desktop.mjs), and the commits above. A local desktop screenshot was produced, but it is ignored and has not been published as submission evidence.

### October 11, 2026 (WAT) — retrospective: mandatory-tool preparation

- Commit `2fb17d2` added SDK-native span presets and error-recording guidance, the authenticated diagnostic command, and [cfo.ai setup inputs](docs/business-plan/README.md).
- Passed TypeScript checks, official neatlogs local diagnostic, and desktop smoke/build. Verified `entire enable --agent codex` and `entire status`; automatic checkpoint publishing stayed disabled.
- Authenticated neatlogs delivery and real agent instrumentation remained unverified. No Entire checkpoint was captured. No account, payment, business plan, or product feature was created by this setup.
- Evidence: [instrumentation preparation](src/main/observability/README.md) and [integration verification](docs/verification.md). No public agent-trace or business-plan link exists yet.

### October 11, 2026 (WAT) — preparation and build-companion adoption

- Prepared `.nvmrc` for the locally verified Node `22.23.0`, `.editorconfig`, and [demo acceptance criteria](docs/demo-acceptance.md). The preceding prep session was interrupted before its requested commit; TypeScript and Node-pin checks had passed.
- Read the official build-companion skill and current neatlogs/Luma pages; created this root record and additive `AGENTS.md` instructions for future session logging. Existing source code and credential files were left unchanged.
- Latest Entire status still requires approval of seven Codex hooks. No checkpoint capture is claimed. Registration/check-in are not verified; the Luma page currently displays registration closed.
- Checks: repository status/history inspection, source-document review, and `git diff --check`. No runtime tests or authenticated probes were rerun for these documentation/configuration changes.
- Commit preparation groups the pending prep files with this build-companion setup under the builder's earlier commit instruction. Existing commits remain intact; no push, registration, deployment, or submission was performed.
- Next: approve project Entire hooks, confirm participant registration/check-in with organizers, complete cfo.ai manual setup, and implement the first real workflow against the demo criteria when authorized.

## Demo

**Public demo/video URL:** Pending. **Fixture URL:** Pending. The [procurement-shortlist demo](docs/demo-acceptance.md) is a draft acceptance plan, not a working demonstration.

The foundation can be reproduced with `npm ci`, `npm run typecheck`, and `npm test`; use `npm run dev` for the desktop shell. On Linux without a display, use `xvfb-run -a npm test`. These commands demonstrate the shell only.

- [ ] One generated WebMCP workflow is installed after explicit approval and tested in Chromium.
- [ ] The personal agent discovers real capabilities, executes a useful task, and verifies the result.
- [ ] Denial/cancellation prevents the associated action; recovery is bounded and evidenced.
- [ ] A failed run, diagnosis, meaningful fix, and verified successful run have sanitized evidence.
- [ ] The demo explains real neatlogs instrumentation, Entire development context, and the cfo.ai plan.
- [ ] A public video of three minutes or less and reproducible instructions are ready.

## Known limitations and next steps

1. Product capabilities, Search integration, permissions for product actions, recovery, and task verification remain unimplemented. The desktop's denied permissions are foundation security settings, not an agent permission system.
2. neatlogs setup has local diagnostic evidence only; hosted Agent37 internal events require actual instrumentation/event access. Supplied credentials and live delivery must be checked separately without copying private values into this log.
3. Entire capture needs project hook approval and a real development session; Git commit hashes are not checkpoint IDs.
4. cfo.ai signup, billing/credit confirmation, pricing/cost/revenue/runway model, and exported submission evidence remain manual work.
5. Dependency advisories, public repository publication, demo evidence, and build-in-public posts remain outstanding. No remote is configured locally at this check; no public repository URL is recorded.

## Submission

Published requirements checked October 11, 2026 against the [official event page](https://neatlogs.com/hackathon) and [Luma](https://luma.com/s5blr882): build during October 10–12; solo or teams of 1–4, with each member registered under the same team name. Use all three mandatory tools and include the business plan. Submit a public repository and a video of at most three minutes through a quote of the official X submission post. Confirm build-period eligibility with organizers; this log makes no qualification claim.

Published opening: October 12, **2:30 PM WAT** (7:00 PM IST). Planned close: **7:25 PM WAT** (11:55 PM IST). **Final cutoff remains subject to Discord confirmation.** The official submission-post URL is not recorded; do not invent one.

- [ ] Registration, team name, check-in, and eligibility confirmed; Luma currently reports registration closed.
- [ ] Public repository URL and hackathon commit history available.
- [ ] Sanitized before/after traces, recovery/verification evidence, and real Entire checkpoints collected.
- [ ] Completed cfo.ai business plan included.
- [ ] Demo video and reproduction instructions complete.
- [ ] Public development updates with `#neatHack` linked after publication is authorized.
- [ ] Latest rules, official X post, and final cutoff checked with the builder/organizers.
- [ ] Quote post includes the builder-approved team identity, project, public repository, and demo.
- [ ] Builder explicitly authorizes publication/submission, and completion is verified afterward.

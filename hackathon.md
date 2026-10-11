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
| neatlogs — mandatory | TypeScript SDK `1.1.28` in the main process; startup lifecycle and inert agent presets prepared. Local diagnostic and authenticated hosted diagnostic passed. The controlled trace finalized with exact four-span readback; application startup finalization and agent workflows are not independently verified. |
| Entire — mandatory | CLI `0.11.4` and Git/Codex hooks configured; seven hooks still await approval. A real Codex transcript was manually captured as local checkpoint `01M4PJQYJYSVZHDH8GEB4A239Y` without amending HEAD. Automatic capture and hosted sync are not verified; publishing stays disabled. |
| cfo.ai — mandatory | Official event signup and model-input checklist documented. No plan export, credit confirmation, or account completion evidence recorded. |

The intended model endpoint is OpenAI-compatible; no model client or call is implemented. The latest neatlogs check verified that a project key was present and authenticated successfully, without recording its value.

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

### October 11, 2026 (WAT) — neatlogs live verification

- `npm run neatlogs:doctor` passed using installed TypeScript SDK `1.1.28`, Doctor v2, schema `2`.
- The first `npm run neatlogs:probe` attempt under restricted network access failed with `FLUSH_TIMEOUT` and `BACKEND_CONNECTION_FAILED`. Repeating the same command with network access passed; no key, endpoint, dependency, or instrumentation change was needed.
- Hosted verification confirmed the controlled diagnostic trace was visible, finalized, and read back with exactly four spans, one root, correct parent edges/metadata/input/output, numeric fixture tokens, and no duplicates. These are the official Doctor fixture results, not a real agent run or usage measurements.
- `npm test` rebuilt and launched the real Electron app with configured tracing, passed the shell/security smoke checks, and closed it. A separate attempt to inspect SDK flush/delivery counters in the main process failed because Playwright's evaluator has no dynamic-import callback; it did not establish application-trace delivery.
- Evidence: [verification notes](docs/verification.md) and the [official Doctor contract](https://docs.neatlogs.com/sdk/doctor). No private trace payloads, project details, credential values, or authenticated trace links were written to this log.
- Remaining check: confirm the actual `improvisus-nexus` / `desktop.start` span in the project's dashboard. Product workflows remain unimplemented. No credentials or runtime source files were changed.

### October 11, 2026 (WAT) — Entire session verification and safe recovery

- Read the official Entire neatHack guide and checked CLI `0.11.4`, repository hooks, status, current session, and checkpoint commands. Initially there were zero checkpoints and `explain HEAD` found no trailer; seven Codex hooks still required approval.
- The installed version's official attachment implementation was checked. Noninteractive `entire session attach --agent codex` captured the real current session and returned `01M4PJQYJYSVZHDH8GEB4A239Y`, while preserving the existing HEAD. This is manual capture, not proof of automatic hook execution.
- Added a small [checkpoint verification/recovery guide](docs/entire-checkpoints.md) that separates local session capture, commit linkage, and hosted sharing. A new documentation commit will use only the real returned trailer; existing commits are not amended.
- At the builder's instruction, created public GitHub repository `abeebridwan/improvisus-nexus` and connected `origin`, without pushing code or checkpoint data. Entire CLI login is absent; hosted GitHub App access and checkpoint sync are unverified.
- Checks include repository hook inspection, checkpoint metadata verification, documentation diff checks, and preservation of prior history. A sandboxed Node subprocess ancestry check encountered `EPERM`; the read-only ancestry check was retried with execution permission.
- No product code, credentials, private transcripts, or customer data were published. Next: approve Codex hooks, complete Entire GitHub onboarding, then review and explicitly authorize any checkpoint synchronization before claiming a shareable link.

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
2. neatlogs' authenticated controlled pipeline is verified. Application startup finalization still needs independent dashboard confirmation, and hosted Agent37 internals require actual instrumentation/event access. Never copy private values into this log.
3. Entire now has a real manually captured session checkpoint; automatic capture still needs project hook approval. Hosted synchronization and shareable access are unverified; Git commit hashes are not checkpoint IDs.
4. cfo.ai signup, billing/credit confirmation, pricing/cost/revenue/runway model, and exported submission evidence remain manual work.
5. Dependency advisories, source/checkpoint publication, demo evidence, and build-in-public posts remain outstanding. The public GitHub repository exists at `https://github.com/abeebridwan/improvisus-nexus`; `origin` is connected, but no code or checkpoint was pushed.

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

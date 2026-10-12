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
| neatlogs — mandatory | TypeScript SDK `1.1.28` initialized once in the main process with credential masking and bounded shutdown. Local/authenticated diagnostics passed. Real desktop startup finalized with exact two-span authenticated CLI readback on October 12. Agent/LLM/WebMCP operations remain unimplemented. |
| Entire — mandatory | CLI `0.11.4` and Git/Codex hooks configured; approval records now present. Real manually captured checkpoint `01M4PJQYJYSVZHDH8GEB4A239Y` remains private by builder instruction. EU CLI login succeeds; hosted repository import fails the GitHub App access check. Fresh automatic capture and hosted checkpoint sync remain unverified. |
| cfo.ai — mandatory | Builder reports plans generated in cfo.ai; four original share URLs and matching public metadata verified on October 12. [Business plan](https://app.cfo.ai/s/-G5cxfokWZuJPsQW) and [source evidence](docs/business-plan/cfo-ai-evidence.json) recorded. Financial contents, calculations, exports and billing/credits remain unverified. |

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

### October 11, 2026 (WAT) — Entire linkage verification result

- Documentation commit `1ba47ed` references real checkpoint `01M4PJQYJYSVZHDH8GEB4A239Y`. `entire checkpoint list` now returns one checkpoint; `entire checkpoint explain HEAD --short --no-pager` confirms the Codex session/commit association.
- Privately checked that the stored transcript includes the actual verification request and no literal matches for configured credential values. The transcript was not printed into this log or published. Its intent preview is a context marker, not a generated task summary; actual session content is retained.
- Network-enabled `git ls-remote origin` returned no refs; GitHub confirms the public repository is empty. `entire status --detailed` reports one checkpoint not on origin, disabled automatic pushing, and seven hooks still needing approval. Entire repository lookup reports no CLI login, so hosted import and shareable access are unverified.
- Confirmed all five pre-existing code commits remain ancestors of the new HEAD. No history was rewritten. The local recovery and documentation-link checks passed; no runtime tests were needed for this documentation-only improvement.
- Next: approve project hooks for automatic capture, sign in to Entire and authorize its GitHub App for the selected repository, then privately review captured context before explicitly authorizing any sync. The share URL remains conditional on that review and synchronization.

### October 12, 2026 (WAT) — real desktop observability verification

- Inspected the existing Electron architecture and Agent37/LLM placeholders before edits; no executable agent or model client exists. Read the official neatlogs setup guide and current SDK/CLI skills. No agent features or substitute runtime were implemented.
- Added single-process initialization/shutdown guards, bounded flush/shutdown, export-boundary credential masking, and a real renderer-load child beneath the startup workflow. Prepared dormant WebMCP discovery options and retained supported failure/approval/retry/verification guidance.
- Builder-approved device OAuth stored read credentials in the OS keychain. Standalone CLI `0.2.1` was installed only in `/tmp`; project SDK stays `1.1.28`, with no dependency additions. SDK ingestion and Public API read credentials remained isolated.
- Passed local Doctor, TypeScript, masking test, production build, real Electron security smoke, final startup verification, script syntax and diff checks. Two actual startup checks ran; final trace `ce86d68cc277c0f8327a06fff49c04f3` was finalized `OK` with exactly `desktop.start` (`WORKFLOW`) and its `desktop.renderer.load` (`CHAIN`) child. Authenticated canonical/raw pagination and safe input/output checks passed with no duplicates. Evidence: [verification notes](docs/verification.md); generated local evidence remains ignored.
- A final credential-exposure scan initially hit sandbox `EPERM` when Node spawned Git. Collecting paths directly through the shell avoided that subprocess restriction; the scan then confirmed the configured Project API key was absent from changed files and renderer/preload bundles, without displaying its value.
- No product failure/retry, model usage/cost, Agent37 reasoning, WebMCP task, or agent verification occurred. Prior diagnostic failures remain recorded above; they are not product recovery evidence. No key, private account data, private prompts, public trace sharing, Git push or submission was added.
- Next: implement the first real executor/client when authorized, attach one supported capture owner per operation, and verify its actual run separately. Read-only CLI login may need renewed human approval when it expires.

### October 12, 2026 (WAT) — cfo.ai plan sources and access verification

- Committed the verified neatlogs changes as `08f273a`, preserving existing history; no push occurred.
- The builder supplied four cfo.ai share URLs and reported generating the plans there. Retrieved every supplied URL: HTTP 200, matching document titles, block counts and original update timestamps. The [original business plan](https://app.cfo.ai/s/-G5cxfokWZuJPsQW), [financial forecast](https://app.cfo.ai/s/JN59kUsONUBOrQTV), [assumptions/simulator](https://app.cfo.ai/s/jlhLdv8fJr0BEYFF), and [customer/unit-economics model](https://app.cfo.ai/s/uzjG7iuZ7IQ_a3xF) are indexed in [business-plan documentation](docs/business-plan/README.md).
- Web retrieval could not open the links. Direct HTTP retrieval recovered their public metadata, but page content remained “Opening shared link…”. The browser tool reports no available browser surfaces. This verifies source-link metadata, not financial contents or whether login is required. Readable original exports are needed to review the actual figures.
- Added a [sanitized evidence record](docs/business-plan/cfo-ai-evidence.json) and [review checklist](docs/business-plan/review.md) covering pricing/limits, costs, 12-month scenarios, unit economics, break-even, runway and clearly labeled provisional review questions. No hypothetical forecast or substituted pricing was created.
- Checks: original URL/title/timestamp metadata comparison, evidence JSON parsing, local documentation links and `git diff --check`. No runtime test was needed for these documentation-only changes. No product code, financial model, sharing permission, billing setting or account credential was changed.
- Next: obtain readable exports of all four plans, preserve the original results, review their calculations, and add sanitized cfo.ai demo evidence. Financial recommendations require separate approval before implementation.

### October 12, 2026 (WAT) — Electron lazy installation and Linux sandbox repair

- Diagnosed the builder's `Electron uninstall` and SUID helper abort. Electron `44.7.0` downloads lazily; electron-vite expected `path.txt` first. The launch wrapper now resolves the official Electron entry point before invoking electron-vite.
- Added a reviewed, syntax-validated `npm run setup:linux` for Ubuntu's per-executable AppArmor user-namespace permission, with setup/rollback documentation. The tool could not authenticate interactive sudo; the builder reported completing setup locally. The profile was not visible to the tool filesystem, so no independent inspection of host installation is claimed. No global sandbox restriction or setuid bit was changed by project code.
- Corrected Playwright smoke verification to require `chromiumSandbox: true` and reject sandbox-disabling launch arguments. Earlier renderer sandbox-preference checks masked the platform failure because Playwright disabled Chromium sandboxing by default.
- Passed fresh dependency installation, lazy binary resolution, TypeScript, masking test, build, sandbox-enabled Electron smoke, and actual dev/production preview rendering and graceful exit. The first dev verification harness timed out; using supported CLI argument forwarding corrected its debugging connection. Evidence: [verification notes](docs/verification.md) and [Linux setup](docs/linux-development.md).
- Preserved existing staged `.gitignore` and artifacts, including the original screenshot. No dependencies, credentials, product features or external publications changed. Entire session attachment returned old checkpoint `01M4PJQYJYSVZHDH8GEB4A239Y`; it did not capture this debugging iteration or amend HEAD. Fresh automatic checkpoint capture remains unverified; pushing stays disabled.
- Next: use the working desktop commands for the first browser capability milestone, and verify fresh Entire capture in a new development session.

### October 12, 2026 (WAT) — GitHub publication and Entire hosted-connection attempt

- Confirmed neatlogs currently traces real desktop startup and renderer loading; Agent37/model/WebMCP operations are still unimplemented and their span options dormant. Published only the reviewed screenshot and sanitized trace metadata, not private trace payloads.
- At the builder's instruction, committed those artifacts as `42f6d7f` and pushed `main` with existing history to [abeebridwan/improvisus-nexus](https://github.com/abeebridwan/improvisus-nexus). GitHub and the remote branch confirm publication. No history rewrite or force push occurred. Artifact ignore rules now allow only the two reviewed evidence files.
- Checked staged files and main-branch history locally: 130 blob checks found no configured credential values or private-key blocks; `.env` stays untracked. Reviewed the screenshot and validated trace metadata against the earlier verified run. No runtime code changed, so existing passing launch/typecheck/smoke evidence applies.
- Builder-approved Entire device login succeeded, with credentials stored in the OS keyring. The repository's scoped EU import was rejected twice by the service's GitHub App access check, including after the builder confirmed repository selection. Login is working; a hosted repository mirror is not verified. The official guide allows up to an hour for access changes to synchronize.
- Privately scanned the existing checkpoint; no configured credential values were found, but it retains actual prompts and tool context. The builder chose to keep it private. Remote inspection confirms no checkpoint ref was uploaded; automatic pushing stays disabled, and status reports one checkpoint not on origin. No new checkpoint or hosted share URL is claimed.
- Documentation/diff checks and exact remote-commit verification were performed. Next: confirm saved GitHub App access after propagation, retry the same scoped Entire import, and verify fresh capture in a new Codex session before claiming new development checkpoints.

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
2. neatlogs' diagnostic pipeline and real desktop startup are independently verified. Hosted Agent37/model/WebMCP internals still require implemented paths, real credentials and instrumentation/event access. Never copy private values into this log.
3. Entire's local hooks have approval records and CLI login works, but the saved session is ended and fresh automatic capture is unverified. Hosted repository import is rejected by the GitHub App access check. The builder chose to keep the existing checkpoint private; no hosted checkpoint synchronization or public share URL is claimed.
4. The builder reports cfo.ai plans generated, and their share-link metadata is verified. Financial content/calculation review, readable exports, demo evidence and billing/credit confirmation remain outstanding.
5. Code/history and reviewed desktop evidence are published at `https://github.com/abeebridwan/improvisus-nexus`; private checkpoint refs remain local. Dependency advisories, real agent demo evidence, and build-in-public posts remain outstanding.

## Submission

Published requirements checked October 11, 2026 against the [official event page](https://neatlogs.com/hackathon) and [Luma](https://luma.com/s5blr882): build during October 10–12; solo or teams of 1–4, with each member registered under the same team name. Use all three mandatory tools and include the business plan. Submit a public repository and a video of at most three minutes through a quote of the official X submission post. Confirm build-period eligibility with organizers; this log makes no qualification claim.

Published opening: October 12, **2:30 PM WAT** (7:00 PM IST). Planned close: **7:25 PM WAT** (11:55 PM IST). **Final cutoff remains subject to Discord confirmation.** The official submission-post URL is not recorded; do not invent one.

- [ ] Registration, team name, check-in, and eligibility confirmed; Luma currently reports registration closed.
- [x] Public repository URL and hackathon commit history available on GitHub.
- [ ] Sanitized before/after traces, recovery/verification evidence, and real Entire checkpoints collected.
- [ ] cfo.ai business-plan contents and review evidence included; original share links are recorded, readable exports still needed.
- [ ] Demo video and reproduction instructions complete.
- [ ] Public development updates with `#neatHack` linked after publication is authorized.
- [ ] Latest rules, official X post, and final cutoff checked with the builder/organizers.
- [ ] Quote post includes the builder-approved team identity, project, public repository, and demo.
- [ ] Builder explicitly authorizes publication/submission, and completion is verified afterward.

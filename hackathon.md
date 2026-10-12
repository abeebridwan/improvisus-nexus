# Improvisus Nexus — neatHack build record

## Project

**Project:** Improvisus Nexus.

**Goal:** Build a personal AI agent that makes websites agent-ready through one generated WebMCP workflow and uses existing WebMCP capabilities to accomplish real tasks.

**Problem:** Website workflows need discoverable, tested capabilities, and personal agents need reliable execution with permissions, recovery, and independently verified results.

**Team:** No public names, handles, or team name supplied. Do not infer them from local accounts or Git authors.

**Current stage:** Secure desktop foundation, onboarding, provider Settings and Core/Agent entry screens. Main-process provider metadata validation and encrypted storage are implemented. The builder confirmed OS-backed save/restart/navigation tests with fixture credentials; real-key authentication remains unverified. Agent execution, WebMCP generation and end-to-end tasks remain unimplemented.

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
| Entire — mandatory | CLI `0.11.4` and Git/Codex hooks configured; approval records now present. Real manually captured checkpoint `01M4PJQYJYSVZHDH8GEB4A239Y` is now public on GitHub by subsequent explicit builder instruction. EU CLI login succeeds; hosted repository import fails the GitHub App access check. Fresh automatic capture and the hosted GitHub viewer remain unverified. |
| cfo.ai — mandatory | Builder reports plans generated in cfo.ai; four original share URLs and matching public metadata verified on October 12. [Business plan](https://app.cfo.ai/s/-G5cxfokWZuJPsQW) and [source evidence](docs/business-plan/cfo-ai-evidence.json) recorded. Financial contents, calculations, exports and billing/credits remain unverified. |

Provider metadata requests now use fixed OpenAI/OpenRouter endpoints; no inference client or model generation is implemented. The latest neatlogs check verified that a project key was present and authenticated successfully, without recording its value.

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


### October 12, 2026, 03:07 WAT — normal-user desktop launch and approved checkpoint publication

- The builder's normal terminal still failed with Chromium's SUID helper error after the earlier AppArmor setup; `sudo npm start` then failed as root and left root-owned output. Earlier launch tests ran under the coding tool's different AppArmor context and did not prove the separate terminal was configured correctly.
- Added shared launch-environment preparation that selects the existing root-owned, setuid, non-writable Google Chrome helper through Chromium's documented `CHROME_DEVEL_SANDBOX` variable. Caller configuration takes precedence; root launches are rejected before building. Development, production preview, smoke and trace verification use the same setup. No sandbox-disabling switch, dependency, system permission or global namespace setting was introduced.
- Interactive sudo was unavailable. Preserved the old generated output in a local backup outside the repository and recreated user-owned output, avoiding another administrator step. Passed `npm run check` (TypeScript, credential masking, production build and sandbox-enabled desktop smoke), all changed-script syntax checks, environment-selection checks, and both real dev/preview launcher checks with rendered React and graceful exit. Restored the original published screenshot and trace evidence instead of relabeling a new run as the old trace.
- Started a normal-user `npm start` and left it running; confirmation that its window is visible in the builder's desktop is pending. GPU driver warnings appeared, but the observed process did not hit the earlier sandbox fatal errors.
- At the builder's subsequent explicit instruction, re-reviewed and published only existing checkpoint `01M4PJQYJYSVZHDH8GEB4A239Y`. Exact GitHub ref/API checks confirm object `bd3f128e46ee63c8654751875af61a211b466f3d`; its [public checkpoint tree](https://github.com/abeebridwan/improvisus-nexus/tree/bd3f128e46ee63c8654751875af61a211b466f3d) returned HTTP 200 without authentication. No configured credential values or private-key blocks were found in the six checkpoint files. Original prompts/tool context were explicitly authorized for publication and are not copied into this log.
- The first hook-mediated checkpoint push reached the existing private Entire-native repository; a second, exact-ref push bypassed hooks for that command to reach GitHub. Hooks/settings remain unchanged, with future automatic publishing disabled. Entire's local queue still counts one unpushed checkpoint; this does not override verified remote evidence. The GitHub App import was retried and still rejected access, so its hosted commit viewer is not claimed working.
- No new checkpoint was fabricated or attached to this fix, and no history was rewritten. Product features remain unimplemented. Next: confirm the visible user desktop and resolve Entire GitHub App access separately before claiming its GitHub-backed share viewer.


### October 12, 2026 (WAT) — terminal-context sandbox correction

- The builder confirmed the desktop window launched by the tool was visible. Fix commit `089d90f` was pushed, but a stricter reproduction using `aa-exec -p unconfined` still hit the original SUID error. This disproved that the helper environment variable alone fixed normal terminal launches.
- Checked Chromium's official source: an adjacent helper takes precedence over `CHROME_DEVEL_SANDBOX`. Verified that replacing only the user-owned extracted helper with a reversible symlink to the existing root-owned Chrome helper lets both real dev and production launchers render and exit cleanly in the previously failing terminal context, with sandboxing enabled. Shared startup preparation now performs this only after validating the trusted helper and preserving the original; no system permissions are changed.
- The builder's request to consider disabling sandboxing did not require a permanent security downgrade. The trusted-helper link is a verified alternative; no sandbox-disabling command or product feature was added.
- Passed the full `npm run check` under `aa-exec -p unconfined`, including TypeScript, masking, production build and sandbox-enabled Electron smoke; syntax/diff checks also passed. Preserved the previously published evidence. New Entire Brain guide files appeared during this session and were reviewed for instructions, but are left untouched for a separate change. No fresh checkpoint capture is claimed.


### October 12, 2026 (WAT) — two-step onboarding and workspace navigation

- Inspected the existing single React component, styling, read-only preload, security policy and test scripts. Reused React state and the dark olive design; no routing library or dependency was added. Reviewed current React controlled-input/state guidance through Context7.
- Added required Core/Agent selection, OpenAI/OpenRouter choices, a masked optional key field, honest unverified/invalid-input states, back navigation and selected workspace previews. Both workspaces can be switched later, and provider settings can be reopened.
- Persisted only allowlisted feature/provider IDs. Keys stay in transient memory and are cleared when leaving provider setup or changing provider; no key is saved, logged, bridged or sent. Provider connection remains explicitly unavailable because secure storage and live validation do not exist. Preview navigation is not presented as successful authentication.
- Passed TypeScript and production build, then `npm test` under the ordinary terminal's AppArmor context with Chromium sandboxing enabled. The isolated-profile Electron checks cover required selection, back navigation, key clearing/masking/non-persistence, both workspace routes, switching/reload, malformed preferences, failed storage and desktop widths of 720/1080 pixels, plus existing security controls. Reviewed screenshots of all three screens locally; original public trace/screenshot evidence remains unchanged.
- Updated [onboarding boundary documentation](docs/onboarding.md) and the tracing launch verifier's renderer-ready selector. Main/preload security and tracing remain unchanged; no agent, provider request, WebMCP generation or tool execution was implemented.
- Entire doctor reports Git/Codex hooks installed and approved; current session status remains ended, so no fresh captured checkpoint is claimed. Existing hook settings were preserved. Additional neatlogs Codex hooks appeared concurrently and are left intact outside this onboarding commit.
- Next: implement and independently verify main-process secure credential storage and live provider validation before showing a connected provider or enabling AI tasks.


### October 12, 2026 (WAT) — secure provider configuration and workspace entry screens

- Inspected the existing Electron security policy, preload, Agent37 runtime placeholder, renderer state and telemetry mask. Verified current Electron/OpenAI/OpenRouter APIs and Agent37's models/chat/BYOK documentation. No provider SDK, routing dependency or hosted infrastructure was added.
- Implemented main-process OpenAI/OpenRouter metadata checks, returned-catalog model selection, key replacement/deletion and a shared trusted-process runtime configuration. OpenAI tool support is explicitly unknown because its model list lacks that metadata; OpenRouter uses reported supported parameters. No inference is performed during validation.
- Added OS-backed encrypted credential persistence using Electron safeStorage, atomic ciphertext-only writes and owner-only file permissions. Linux plaintext/unknown backends are refused. Preload exposes only five validated provider operations, scoped to the application's main frame/origin; credentials are never returned. Expiring/cancellable validation keeps unsaved keys out of persistent storage.
- Added Settings and persistent Core/Agent navigation. Core has local-project/URL entry options; Agent has a task input and discovery entry point. Both share provider/model status. Workflow generation, capability discovery and task execution remain disabled and clearly disconnected; local credentials do not silently configure a hosted Agent37 instance.
- Extended existing neatlogs masking to keys registered after initialization and restored encrypted credentials before tracing startup. Provider spans use static operation names/completion/error codes, without request/response/key data. No provider credential was exposed to coding tools, Search or crash reporting. Existing startup evidence and concurrent Codex/Entire hooks were preserved.
- Passed TypeScript, production build, changed-script syntax/diff checks and focused fixture tests for successful configuration, unavailable models, invalid/missing keys, permissions/rate/provider/network failures, invalid replacement retention, replacement/deletion and secure-fallback refusal. A test initially failed because Node's strip-only loader rejects TypeScript parameter properties; explicit class fields fixed it without another dependency.
- Real Electron probing initially found basic_text with encryption unavailable; a follow-up probe was blocked when automatic approval review hit its usage limit (not a safety rejection). The builder's terminal reproduced the skip, including after explicit GNOME selection. Inspection then found Playwright's Electron loader forcibly selecting basic storage/mock keychain. A test-only Node preload now removes those overrides before ready; production secure-storage code is unchanged.
- The corrected harness reached secure saving, then failed on an ambiguous Website URL label shared by a radio and text field. A textbox-specific selector fixed this test error. The builder subsequently confirmed the corrected desktop check passed: real OS-encrypted file permissions/non-plaintext data, fixture-provider configuration/error handling, shared Core/Agent Settings navigation, restored configuration after an actual Electron restart, replacement/deletion and restricted IPC/sandbox controls. These desktop results were run in the builder's terminal; they are not authenticated live OpenAI/OpenRouter evidence. No real provider key is configured locally.
- Reviewed the provider screen locally. Original published startup evidence remains unchanged. Provider request limits/timeouts are bounded; unsaved validation is cancellable/expiring; no Chromium sandbox setting or OS permission was weakened.
- Entire status still resolves the old ended session and reports four hook approvals needed. Hooks/history remain intact; no fresh checkpoint or hosted sync is claimed for this implementation. [Provider setup and verification](docs/providers.md) documents supported APIs, Agent37 binding limits and remaining manual checks.
- Next: check real keys directly through Settings, then separately connect actual workflow and Agent37 backends.

### October 12, 2026 (WAT) — retrospective: local workflow discovery JSON troubleshooting and rollback

- Local Project → Discover workflows failed with `Unexpected token '/', ..."startPath":/ ... is not valid JSON`. The main-process helper attempted to parse model-generated text directly; this was not evidence of a completed discovery or browser-verified workflow.
- Tried JSON-object response mode, bounded retries, schema validation and sanitized errors. TypeScript, production build and offline fixture checks passed for that first change, but no successful live discovery was verified. The builder subsequently reported `The model returned invalid JSON after two attempts. Retry discovery or choose another model in Settings.`
- Follow-up attempts added jsonrepair syntax recovery, supplied the rejected response to the retry, and replaced greedy brace extraction with fenced/balanced-object extraction. No tests, builds or live provider calls were run for these follow-ups, as requested. The builder confirmed restarting the application and using OpenRouter, but the exact selected model and raw response were not inspected. These attempts did not establish a successful fix.
- Latest builder-reported failure: `Expected ':' after property name in JSON at position 849 (line 29 column 42)`. This reports malformed JSON syntax; its position alone does not establish why the model produced it. No response fragments, credentials or private source data are included here.
- At the builder's rollback request, inspection found the original parser/request implementation already restored, with the added repair dependency, regression-test script and modified call sites absent. No further code rollback was necessary; existing Core development changes were preserved. This entry restores the factual troubleshooting record without claiming the issue is fixed.
- Discovery remains unresolved. Next investigation: identify the exact model and inspect safe response metadata/format before choosing a supported structured-output approach. No tests, builds, application launches, API requests, commits or checkpoint-publication operations were performed in this documentation session.

### October 12, 2026 (WAT) — Core implementation commit preparation

- The builder reports successful Local Project and Website URL runs. Inspected the uncommitted controller, validated IPC, discovery/generation, reviewed-batch approval, local apply/build/Git flow, Chromium verification and remote publishing code. These paths are implemented; this session has not independently reproduced the builder's live provider/publisher runs.
- Existing staged Core implementation and the separate working-tree JSON repair change can be attributed to distinct commits. Preserving unrelated Codex observability-hook changes outside these commits. Current TypeScript checks pass. Entire reports Codex enabled with four hook approvals pending; no new checkpoint capture or publication is claimed.
- Next: commit the existing implementation and JSON repair separately, then improve only the Core frontend and verify controlled fixture flows through its real IPC/backend.

### October 12, 2026 (WAT) — existing model JSON fix preserved

- Committed the builder's separate JSON-output fix: explicit JSON request mode, supported-format fallback, bounded application retries, complete-object checks, syntax repair and sanitized errors. No replacement provider or model API was introduced.
- Two offline regression cases pass for fenced/repaired JSON, unchanged adapter string content, incomplete-output rejection, retry correction and unsupported JSON-mode fallback. An initial fixture assumption that an unquoted slash path would be faithfully repaired failed; jsonrepair can misinterpret that form, so arbitrary malformed JSON is not guaranteed recoverable. Existing workflow schema validation remains in place; no live model verification was performed here.

### October 12, 2026 (WAT) — polished Core frontend and safe session reset

- Preserved the working backend and created distinct commits for its existing implementation (`4a1f01c`) and the builder's separate model JSON fix (`64efc8a`). No history rewrite, push or runtime/backend refactor was performed. Unrelated staged Codex hook changes remain untouched.
- Reworked the existing React Core workspace around the actual discover/prepare/approve/discard IPC and progress events. Added source cards, a five-workflow limit, generated plan/test/diff review, explicit approval, progress/activity/errors, browser evidence paths, local Git results, and remote adapter URL/hash/installation snippet. Remote publishing is clearly distinguished from manual installation.
- Added visible Clear in both modes. It releases the current catalog/unapproved batch using existing discard IPC, resets only that mode's displayed session, and retains files, Git history, published adapters and provider settings. Clear and navigation are locked during active work; pending approval locks mode/provider switching but remains discardable/clearable. Independent mode state retains inputs, selections and completed results; stale catalogs require rediscovery because the backend stores one active catalog. Idle late progress events are ignored.
- Passed current TypeScript checks and production build. `NEXUS_TEST_PASSWORD_STORE=gnome-libsecret npm test` passed all seven JSON/provider/redaction cases and the real sandboxed Electron checks, including restricted provider/Core IPC, actual OS-encrypted credential save/restart, navigation and deletion.
- `NEXUS_TEST_PASSWORD_STORE=gnome-libsecret npm run test:core` passed controlled Local Project and Website URL flows through the real application, preload, controller, file operations, Git and native Chromium WebMCP. Verified local apply/commit and failed-test rollback; five remote tool invocations before fixture publication; selections capped at five; actual plan/diff review; Clear after discovery, review, generation/verification failure and success; active Clear lock, stale-catalog handling, independent mode data, idle late-event rejection, retained provider configuration and 720px layout. External model, Agent37 and publisher responses were fixtures, not authenticated hosted-service evidence. Temporary fixture projects/profiles were removed; no real adapter or trace was published.
- Test development exposed a timing-sensitive disabled-button assertion and missing node_modules exclusion in the temporary Vite fixture's Git ignore. Response gating and the fixture ignore fixed those harness issues; the production backend was not changed. Reviewed fixture screenshots of local/remote results and expanded review/diff locally. They remain ignored; original published desktop trace/screenshot evidence is unchanged.
- Entire remains enabled for Codex, with four hook approvals pending. Hooks were preserved; no fresh checkpoint or remote sync is claimed. Existing neatlogs instrumentation was preserved without adding duplicate capture. Next: reproduce the builder's real-service demo against the updated UI and verify its trace coverage separately.

### October 12, 2026 (WAT) — commit existing Codex observability hooks

- At the builder's request, included the previously staged neatlogs-codex lifecycle/tool/permission/compaction hook configuration. JSON parsing and a comparison with HEAD confirmed all seven existing Entire hook groups are preserved; Git whitespace checks passed. Hook configuration contains commands and metadata, with no credential values.
- No application/runtime change, live hook-capture verification, fresh checkpoint claim or push was performed. Hook approvals and authenticated capture remain separate from committing the configuration.

### October 12, 2026 (WAT) — Nexus Agent: configured-model reasoning and live Chrome execution

- Implemented the personal Agent using the existing main-process OpenAI/OpenRouter provider/model, a six-decision loop, native Chrome CDP/WebMCP discovery/invocation, schema-valid arguments, exact-call approvals, origin/schema rechecks, cancellation, duplicate-call prevention and actual-return-data verification. Agent37's LLM is not used; existing Core Agent37 discovery and Core backend files are unchanged. Added AJV for registered JSON-schema validation, with unsupported schemas rejected rather than coerced.
- Added Agent connection/tab/tool/schema UI, task/Run/Search, plan/progress/results, approval/deny, Cancel and idle Clear. Production connects to user-started Chrome only and never substitutes a browser or uses DOM/click execution fallback. A debugging connection with WebMCP-enabled recent Chrome is a prerequisite; the user's normal endpoint at 127.0.0.1:9222 was unavailable. Clear preserves Chrome, credentials and settings.
- Verified the real Improvisus Search endpoint: the supplied request returned HTTP 400 because summarize/filters are unsupported. A discovery-only request with query, limit and execute:false returned HTTP 200/root ok:true and real capability metadata. The implementation uses that observed schema and client-filters actual verified/read-only fields; registry entries still require native Chrome rediscovery.
- Live test against the builder's supplied demo in isolated Google Chrome 155 used the actual saved OpenRouter model dots-studio/dots-3-note-preview:free. Initial planning failed safely on an unsupported JSON decision; JSON mode plus one bounded model-format retry resolved it. A later run invoked two real searches but failed evidence checks; transport JSON decoding improved result handling. Another run reached the decision limit after repeated reads; associating results with their actual arguments and blocking duplicate calls resolved that failure.
- Final live Agent UI run passed: discovered the actual search_products tool/schema, invoked it twice through native WebMCP, used real model reasoning and verified actual returned values. Agent Clear left the attached Chrome page open. No tool/results were simulated, no consequential action was approved, and no website UI automation was used. This was an explicitly isolated test Chrome, not the user's normal browser profile. Local sanitized evidence is ignored at artifacts/agent-live.json.
- Actual final Agent trace ID: `07629219eb68cdd1fd014cde2aa4d9b8`. SDK instrumentation records workflow, planning/model calls, token/reported-cost metrics, discovery, Search, Guard approvals, calls, retries, failures and verification while excluding private content. Failed real runs produced `1fdc2fc2f86d3465f7dd195cce3f57da`, `61ed6f9cdd0c50b4aa8f3a46e603650b`, and `9e2a30d9699f1b100f92a5963e7cf02c`. Authenticated CLI readback initially rejected its local configuration with UNSAFE_CONFIG_FILE; dashboard visibility is not yet claimed.
- Passed current TypeScript and production build, all nine focused JSON/provider/redaction/Guard cases, actual sandboxed Electron/OS-keyring/restricted-IPC regressions, and the existing Core local/URL Git/Chromium regression. Raw SDK/provider credentials were not printed or persisted in renderer storage. Unrelated builder README changes remain outside this implementation commit.
- Entire remains enabled with pending hook approvals and the existing session reported ended. A separate capture attempt will use the actual session transcript without authorizing an amend or automatic public publication. Verification covers returned tool evidence, not independent proof of purchases/server-side effects; metadata hints are not a website implementation audit. See docs/agent-workspace.md for setup and these limits.

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

1. Core local/URL workflows are implemented and their UI/controller/Git/WebMCP paths are verified with controlled external-service fixtures. Nexus Agent has a verified real configured-model/two-call demo using native Chrome WebMCP. Guard and returned-data checks are minimal controls, not a full website trust audit or independent verification of external transactional effects.
2. neatlogs' diagnostic pipeline and real desktop startup are independently verified. Core's hosted Agent37/model/WebMCP trace coverage still requires independent real-run readback; frontend fixture tests are not public agent-trace evidence. Never copy private values into this log.
3. Entire's local hooks have approval records and CLI login works, but the saved session is ended and fresh automatic capture is unverified. Hosted repository import is rejected by the GitHub App access check. The builder subsequently authorized publication of the reviewed existing checkpoint, and its exact public GitHub ref is verified. The GitHub-backed Entire viewer remains unverified.
4. The builder reports cfo.ai plans generated, and their share-link metadata is verified. Financial content/calculation review, readable exports, demo evidence and billing/credit confirmation remain outstanding.
5. Code/history and reviewed desktop evidence are published at `https://github.com/abeebridwan/improvisus-nexus`; the one reviewed checkpoint is also public on GitHub, while future automatic publication stays disabled. Dependency advisories, real agent demo evidence, and build-in-public posts remain outstanding.

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

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

## neatlogs authenticated verification — October 11, 2026

The configured project key was checked for presence without displaying or recording its value. Local Doctor passed with TypeScript SDK `1.1.28`, Doctor v2, schema `2`.

The initial authenticated probe failed under restricted network access (`FLUSH_TIMEOUT`, `BACKEND_CONNECTION_FAILED`). A network-enabled retry of `npm run neatlogs:probe` passed, including exact hosted trace readback, finalization, four spans, one root, hierarchy, attributes, metadata, inputs/outputs, numeric fixture tokens, and zero duplicates. No configuration change was required. This verifies the official controlled SDK diagnostic, not application or agent execution.

`npm test` also passed the production build and Electron smoke checks with tracing configured. A direct SDK counter inspection through Playwright's Electron evaluator failed with a missing dynamic-import callback; no counter result is claimed. Independently verifying the finalized real `desktop.start` application span in the dashboard remains outstanding.

No secret values, private trace payloads, or authenticated trace URLs are included in this record. No runtime implementation changed.

## Real desktop neatlogs verification — October 12, 2026 (WAT)

Followed the [official setup guide](https://neatlogs.com/hackathon/neatlogs-setup-guide.html), current TypeScript documentation, and official TypeScript/Public CLI skills. The installed SDK and latest published SDK were both `1.1.28`; no dependency upgrade was needed. The current published standalone CLI was verified as `0.2.1` and installed under `/tmp/nexus-neatlogs-cli` for this check, without adding project dependencies or replacing the SDK Doctor binary.

After the builder approved device login, CLI OAuth succeeded with `context:read` and `observability:read`; credentials were saved to the OS keychain, not repository files. Project discovery and project-scoped `whoami` succeeded on `https://app.neatlogs.com`. Readback explicitly selected profile `nexus-us` and `--credential-source profile`, while removing SDK-key/token overrides from child environments. The application's Project API key remained available only to its main process.

Two real bundled desktop startup checks ran. The final-code run produced **trace `ce86d68cc277c0f8327a06fff49c04f3`**, workflow `improvisus-nexus`, name `desktop.start`, status `OK`, finalization status `finalized`.

| Actual operation | Span ID | Kind / parent | Observed result |
| --- | --- | --- | --- |
| Desktop startup | `d31438e71cda8b9e` | `WORKFLOW`; root | `OK`, 648 ms; safe launch label and renderer-loaded result read back |
| Bundled renderer load | `4342521468b475fe` | `CHAIN`; parent `d31438e71cda8b9e` | `OK`, 503 ms; bundled-source label and renderer-loaded result read back |

Authenticated `traces get`, `traces spans list`, `traces raw-spans`, and both `traces payload --fields input,output` reads all succeeded for that exact trace. Canonical and raw pages each returned two spans, `hasMore=false`, and `nextCursor=null`: one root, its expected child, and no duplicate operation spans. Both safe payloads were present and untruncated. This verifies real desktop capture and persisted readback, separately from Doctor's controlled fixture. No private trace or account data was copied into this document.

Checks passed: documented local Doctor v2/schema 2, `npm run check` (TypeScript, credential-masking test, production build and Electron security smoke), final `npm run neatlogs:verify-desktop`, final TypeScript checks, script syntax and `git diff --check`. The real window rendered the expected shell and closed normally; no telemetry lifecycle failure was reported. `.env` remains ignored and untracked. Local evidence is ignored at `artifacts/neatlogs-desktop.json` with owner-only permissions.

Coverage is **partial for the requested product instrumentation**: no Agent37 executor, model client, WebMCP runner, approvals, retries, or result-verification feature exists. Their presets remain inert. No agent/model/tool operation, reasoning, usage, cost, failure or recovery was measured in this desktop run. Zero model/tool counts in the metadata match that exclusion. macOS reopening and development-mode tracing were not independently read back in this session.

A final exposure scan confirmed the configured Project API key was absent from changed files and renderer/preload bundles without printing its value. The scan initially encountered sandbox `EPERM` when Node spawned Git; shell-based path collection resolved that local check limitation.

### Reproduce and inspect

```sh
npm run check
npm run neatlogs:verify-desktop
```

The second command requires a real Project API key and a desktop display. It prints the new actual trace ID and explicitly reports readback as unverified until inspected independently. Use `xvfb-run -a` on Linux without a display. The script's loopback debugging port exists only for this verification process.

The verification CLI currently resides in `/tmp`; for a persistent command, install the separate official CLI with `npm install --global neatlogs-cli@0.2.1`. This does not replace the project's local SDK Doctor. Select the UUID returned by project discovery, and use the newly printed trace ID:

```sh
env -u NEATLOGS_PROJECT_ID neatlogs --host https://app.neatlogs.com --profile nexus-us --credential-source profile projects list --json
neatlogs --host https://app.neatlogs.com --profile nexus-us --credential-source profile --project '<project-uuid>' traces get '<trace-id>' --json
neatlogs --host https://app.neatlogs.com --profile nexus-us --credential-source profile --project '<project-uuid>' traces spans list '<trace-id>' --limit 50 --json
```

Follow `nextCursor` until pagination completes. `traces get` alone does not return spans. Use the installed CLI's help/schema for raw previews or selected payloads. If saved login expires, repeat the human-approved device flow; another machine needs its own login. For an EU project, select its actual EU dashboard and a separate matching profile. No trace-sharing setting was enabled and no public/share URL is claimed.

## Electron installation and Linux sandbox fix — October 12, 2026 (WAT)

The builder's terminal exposed two launch failures: electron-vite reported `Electron uninstall` immediately after `npm ci`, and production preview aborted because the extracted `chrome-sandbox` helper was not configured for setuid use. Electron `44.7.0` installs its executable lazily through its package entry point; electron-vite `5.0.0` instead reads `path.txt` directly. The launch wrapper now resolves Electron's official entry point first and supplies `ELECTRON_EXEC_PATH` to electron-vite.

Ubuntu's AppArmor user-namespace restriction was enabled. Added `npm run setup:linux` to validate and install a per-executable AppArmor profile using administrator authentication, following Ubuntu's documented browser-profile approach. It grants the local Electron binary user-namespace permission without changing the global restriction, adding sandbox-disabling flags or setting the binary setuid. See [Linux setup](linux-development.md). Profile syntax passed; automated installation stopped at sudo's interactive-authentication requirement. The builder then reported setup completed in their terminal. The installed profile file was not visible in this tool filesystem, so independent host-policy inspection is not claimed.

Earlier Playwright smoke runs allowed its default `chromiumSandbox: false`. Their passing renderer preferences did not establish OS sandboxing. The smoke test now explicitly sets `chromiumSandbox: true` and checks the main-process arguments for sandbox-disabling flags.

Verification passed after a fresh `npm ci --no-audit --no-fund`: resolving Electron downloaded the binary and electron-vite's version command succeeded; `npm run check` passed TypeScript, credential masking, build and the sandbox-enabled Electron smoke. Both actual dev and production preview launchers rendered the expected React window and exited normally, with no sandbox-disabling arguments in Chromium's command line. The first temporary dev harness timed out because electron-vite replaced the debug environment arguments; retrying with its supported `--` argument forwarding passed. That was a verification-harness correction, not an additional product failure.

Existing staged `.gitignore` and artifact changes were preserved, including the original screenshot. Dependency versions, application features and `.env` were unchanged. Entire attachment returned the previously captured session checkpoint rather than capturing this new debugging iteration; no fresh checkpoint or current-session linkage is claimed. Automatic checkpoint publishing remains disabled.


## October 12 — provider settings and workspace integration

- TypeScript, production build and focused provider/redaction fixture tests passed in the coding environment. They cover successful configuration, invalid/missing keys, permission/rate/provider/network failures, model catalog choices, failed-replacement retention, key replacement/deletion and refusal of plaintext storage.
- The builder ran the real sandbox-enabled Electron check from the project terminal. Initial secure-storage skips were caused by Playwright forcing basic/mock keychain settings, not established OS-keyring failure. A test-only preload removes those settings before ready; an ambiguous URL-field selector was also corrected.
- The builder confirmed the corrected desktop test passed: real OS-backed ciphertext/owner-only file mode, restart restoration, shared Core/Agent navigation, key replacement/deletion, restricted IPC, context isolation and sandboxing. Provider responses and credentials in this test are explicit fixtures; the actual store/IPC/UI are production code. No real account authentication or inference is claimed.
- Live OpenAI/OpenRouter keys must still be checked through Settings. Agent37 instance/provider binding, capability discovery, WebMCP generation and task execution remain unimplemented. [Storage, provider APIs and remaining boundaries](providers.md).
- Existing neatlogs startup instrumentation/evidence and Entire hooks remain preserved. Runtime-key export redaction passed; no new hosted trace or fresh Entire checkpoint was verified in this increment.

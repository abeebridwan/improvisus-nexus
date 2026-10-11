# neatlogs instrumentation preparation

The official [TypeScript SDK](https://docs.neatlogs.com/sdk/typescript) is installed in the Electron main/Node.js process. Initialization is cached once per process, awaits a real configured key, and falls back to an untraced desktop if initialization fails. Quit awaits `flushAll(5000)` and `shutdown('desktop.quit', 5000)` once. No SDK, credentials, or tracing configuration is exposed to the React renderer.

The real `app.whenReady()` path creates one `desktop.start` (`WORKFLOW`) root and a `desktop.renderer.load` (`CHAIN`) child around `BrowserWindow.loadURL()`. Inputs contain only fixed operation/source labels; the output reports `rendererLoaded: true` after loading succeeds. `NEXUS_TRACE_STDOUT=1` prints the root's real trace ID to main-process stdout for verification. It is disabled during normal launches.

`spans.ts` provides typed options for native `neatlogs.trace()` calls. These presets are inert: no agent, model, tool, or approval code invokes them yet. When actual work is implemented, create one workflow root, nest actual operations beneath it, and bind real run/session IDs. Add inputs, outputs, and attributes only from the operation being measured.

| Operation | Preset / SDK mechanism | Record when implemented |
| --- | --- | --- |
| Agent37 reasoning | `nexusSpans.reasoning` (`AGENT`) | Runtime-reported reasoning/planning step, state before/after, real session ID |
| Model request | `nexusSpans.llm` (`LLM`) or official model-client wrapper | Provider/model, request/response, latency, actual token usage and reported/calculated cost |
| WebMCP discovery | `nexusSpans.discovery` (`TOOL`) | Actual capability enumeration, source and discovered capability count |
| WebMCP invocation | `nexusSpans.webmcp` (`TOOL`) | Capability name, validated arguments, permission decision, result |
| Human approval | `nexusSpans.approval` (`GUARDRAIL`) | Requested action, actual approve/deny/cancel decision, wait duration |
| Retry | `nexusSpans.retry` (`CHAIN`) | Attempt number, previous failure, retry reason and delay |
| Error | SDK exception capture on the failing span | Propagate the real exception through `trace()`; for a handled failure use the active span's `recordException()` and `setStatus()` and record a structured `log()` entry |
| Verification | `nexusSpans.verification` (`CHAIN`) | Actual check, observed evidence, pass/fail result |

WebMCP uses `TOOL` here: it is a browser capability, not a server MCP tool. A hosted Agent37 HTTP response alone does not expose its internal reasoning, model usage, or tool calls. Obtain harness events or instrument the hosted harness before claiming that coverage. Record unavailable usage/cost as unavailable, not zero or an estimate presented as a measurement.

Use SDK `log()` inside an active span for real state changes, retries, and handled failures; `captureLogs` is enabled. Never put credentials, authorization headers, cookies, or the `.env` contents in span inputs, outputs, attributes, or logs. The global client-side `mask` now removes credential fields and configured secret literals from nested/serialized I/O, events and logs before export. Its local test preserves numeric usage/cost fields. This does not make arbitrary personal data safe to capture: future payloads still require explicit allowlists. Do not override the global mask with a weaker per-span callback. Server-side `pii` settings do not provide client-side secret redaction.

Wrap each real OpenAI client instance once with the supported `wrapOpenAI()` when a client exists; do not also wrap the same model call in `nexusSpans.llm`. For Agent37's hosted API, instrument the actual request/orchestration once and use exposed harness events for internals. There is currently no client, agent execution path, or provider credential to instrument, and no Agent37-specific neatlogs helper is claimed.

## Actual coverage

| Process / capability | Entry point / capture owner | Verification and exclusions |
| --- | --- | --- |
| Electron main / desktop startup | `app.whenReady()` / native `trace()` root and renderer-load child | Real bundled launch and authenticated CLI readback verified; see [evidence](../../../docs/verification.md). macOS activation/reopening is not tested on this Linux host. |
| React renderer / shell | Electron preload and local assets / no SDK | UI and isolation smoke passed; no credentials or renderer tracing. |
| Agent37 / personal agent | No implemented entry point | Inert `AGENT` preset only; hosted reasoning, state, tools, usage and costs unverified. |
| LLM / model request | No implemented client | Inert `LLM` preset only; no model call or usage measured. |
| WebMCP / discovery and execution | No implemented runner | Inert `TOOL` presets only; no capabilities discovered or invoked. |
| Product approval, retry and verification | No implemented execution path | Presets/error guidance only; desktop security checks are not agent approval or recovery evidence. |

## Credentials and verification

The local `.env` is ignored by Git and created with owner-only permissions (`0600` on Linux). Enter a real `NEATLOGS_API_KEY` there in a local editor, or supply it through the main process environment. Do not paste it into chat or a command line. `.env.example` contains only an empty placeholder. Packaged applications use the process environment; `.env` loading is development-only. Never use a `VITE_*` variable for this key.

`npm run neatlogs:doctor` runs the official local-only SDK diagnostic. Its controlled fixture is not agent execution evidence and sends no fabricated agent run to the dashboard. It verifies SDK internals, not every future preset or authenticated delivery.

After adding credentials, `npm run neatlogs:probe` loads the ignored `.env` through Node's `--env-file` option and checks authenticated delivery of the official SDK diagnostic. Existing environment variables take precedence. The authenticated probe passed on October 11, 2026, with exact finalized four-span readback. This remains separate from the real desktop verification.

`npm run neatlogs:verify-desktop` builds and launches the real application, checks its rendered shell, obtains the startup trace ID and closes the window normally to drain telemetry. It temporarily enables loopback Chromium debugging for the check; normal launch commands do not. A display and a real project key are required. Its ignored `artifacts/neatlogs-desktop.json` reports local checks only until independently read back. See [verification notes](../../../docs/verification.md) for the exact verified run and CLI procedure. Agent traces remain unavailable until real agent operations exist.

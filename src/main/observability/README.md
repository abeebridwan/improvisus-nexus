# neatlogs instrumentation preparation

The official [TypeScript SDK](https://docs.neatlogs.com/sdk/typescript) is installed in the Electron main/Node.js process. `initializeTracing()` awaits SDK initialization only when a real key is present, and the existing desktop lifecycle awaits flush and shutdown. No SDK, credentials, or tracing configuration is exposed to the React renderer.

`spans.ts` provides typed options for native `neatlogs.trace()` calls. These presets are inert: no agent, model, tool, or approval code invokes them yet. When actual work is implemented, create one workflow root, nest actual operations beneath it, and bind real run/session IDs. Add inputs, outputs, and attributes only from the operation being measured.

| Operation | Preset / SDK mechanism | Record when implemented |
| --- | --- | --- |
| Agent37 reasoning | `nexusSpans.reasoning` (`AGENT`) | Runtime-reported reasoning/planning step, state before/after, real session ID |
| Model request | `nexusSpans.llm` (`LLM`) or official model-client wrapper | Provider/model, request/response, latency, actual token usage and reported/calculated cost |
| WebMCP invocation | `nexusSpans.webmcp` (`TOOL`) | Capability name, validated arguments, permission decision, result |
| Human approval | `nexusSpans.approval` (`GUARDRAIL`) | Requested action, actual approve/deny/cancel decision, wait duration |
| Retry | `nexusSpans.retry` (`CHAIN`) | Attempt number, previous failure, retry reason and delay |
| Error | SDK exception capture on the failing span | Propagate the real exception through `trace()`; for a handled failure use the active span's `recordException()` and `setStatus()` and record a structured `log()` entry |
| Verification | `nexusSpans.verification` (`CHAIN`) | Actual check, observed evidence, pass/fail result |

WebMCP uses `TOOL` here: it is a browser capability, not a server MCP tool. A hosted Agent37 HTTP response alone does not expose its internal reasoning, model usage, or tool calls. Obtain harness events or instrument the hosted harness before claiming that coverage. Record unavailable usage/cost as unavailable, not zero or an estimate presented as a measurement.

Use SDK `log()` inside an active span for real state changes, retries, and handled failures; `captureLogs` is enabled. Never put credentials, authorization headers, cookies, or the `.env` contents in span inputs, outputs, attributes, or logs. Use the documented client-side `mask` callback before introducing sensitive payload capture; server-side `pii` settings do not provide client-side secret redaction.

## Credentials and verification

The local `.env` is ignored by Git and created with owner-only permissions (`0600` on Linux). Enter a real `NEATLOGS_API_KEY` there in a local editor, or supply it through the main process environment. Do not paste it into chat or a command line. `.env.example` contains only an empty placeholder. Packaged applications use the process environment; `.env` loading is development-only. Never use a `VITE_*` variable for this key.

`npm run neatlogs:doctor` runs the official local-only SDK diagnostic. Its controlled fixture is not agent execution evidence and sends no fabricated agent run to the dashboard. It verifies SDK internals, not every future preset or authenticated delivery.

After adding credentials, `npm run neatlogs:probe` loads the ignored `.env` through Node's `--env-file` option and checks authenticated delivery of the official SDK diagnostic. Existing environment variables take precedence. The authenticated probe passed on October 11, 2026, with exact finalized four-span readback. Inspect the real application startup span in the dashboard separately; its finalization is not independently verified. Agent traces remain unavailable until real agent operations exist. See [verification notes](../../../docs/verification.md).

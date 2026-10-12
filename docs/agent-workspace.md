# Nexus Agent

Nexus uses the existing main-process OpenAI/OpenRouter configuration for reasoning. Agent37's separate hosted LLM is not used. The personal agent connects to a user-started Chrome session, discovers native top-frame WebMCP tools through CDP, and invokes only those tools. There is no DOM/click execution fallback or automatic browser launch.

Use a recent Chrome with WebMCP support and the required flags. Expose a loopback debugging endpoint, normally `http://127.0.0.1:9222`. Chrome 136+ requires a non-default user-data directory for command-line remote debugging. Start Chrome yourself, sign in there when necessary, then Connect Chrome, Refresh Tabs and explicitly select a tab. The Agent UI provides a launch example. Nexus cannot attach to a normal Chrome session that does not expose debugging.

Enter a task and Run. The configured model chooses up to six sequential decisions using the live schemas and actual results. AJV validates arguments without coercion, default insertion or remote schema loading; unsupported schemas/formats fail closed. Missing/consequential annotations and write-like tools require approval for the exact origin/tool/arguments. Dangerous/debugging capabilities are blocked. Live origin and tool definitions are checked again after approval. A consequential tool cannot be automatically invoked twice in a run. Tool failures/timeouts are not retried; cancellation requests native WebMCP cancellation and prevents later calls, but does not undo completed effects.

Search is discovery only. The live API rejected the originally supplied `summarize` and `filters` fields. Its verified contract is `POST https://improvisus.tech/api/search` with `{operation:"search",input:{query:<intent>,limit:5,execute:false}}`, returning root-level `ok` and `capabilities`. Nexus checks HTTP/ok and client-filters actual `effect`/`verification.status` fields. Returned sites require explicit opening/selection, followed by live Chrome tool discovery. A registry record never substitutes for a registered tool.

Verification checks model-proposed JSON-pointer assertions against actual returned tool data; empty or false checks cannot claim success. This supports reporting read-only results, but does not independently confirm external purchases/server-side effects. Tool hints are untrusted claims; Guard's metadata/name checks are a minimal policy, not an audit of website implementation. Users select the origin on which read-only calls may run automatically.

Clear removes the displayed task, selections, plan, search hits, approvals, events/errors and results after idle backend reset. It preserves Chrome tabs, provider credentials and settings. Clear/navigation are disabled while running; Cancel remains available. Disconnecting an attached CDP connection does not close Chrome.

neatlogs records actual agent workflow, reasoning/model requests, token usage/reported costs, discovery, Search, approvals, invocations, planning retries, errors and verification. Raw prompts, page content, arguments and tool results are excluded from tracing; only safe operation metadata and outcomes are exported. Existing credential masking and shutdown remain active. Tool results displayed/sent to the configured model are credential-masked. No duplicate LLM wrapper is added.

## Verification commands

- `npm run typecheck`, `npm run build`, `npm test` check the desktop, IPC, providers, masking and Guard.
- `npm run test:core` retains the existing controlled Core regression flow.
- `NEXUS_TEST_PASSWORD_STORE=gnome-libsecret node scripts/agent-live.mjs --live` is an explicit live check against the builder's public demo. It uses an isolated test Chrome/profile and a copy of the locally encrypted provider file, performs real model requests and native tool calls, and cancels any requested consequential action. It may incur model costs; it is never part of `npm test`. Keys are not printed. The script cleans up its own profiles/browser; production Nexus connects to existing Chrome only.

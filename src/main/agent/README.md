# Agent runtime boundary

Future planning, permission decisions, execution, recovery, and verification belong in the Electron main process. No agent loop, tools, or IPC endpoints are implemented.

Agent37 is a hosted harness API, not a local agent runtime installed by this project. Its official Node examples use native `fetch`; no Agent37 npm dependency is needed for that path. Configuration is reserved in `.env.example`. See [integration setup](../../../docs/integrations.md) for the verified endpoints and credential requirements.

The OpenAI-compatible model client is also deferred. Its base URL, model, and credential placeholders are main-process settings; never put them in `VITE_*` variables or expose them through preload.

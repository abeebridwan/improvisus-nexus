# Agent runtime boundary

Future planning, permission decisions, execution, recovery, and verification belong in the Electron main process. No agent loop or execution tools are implemented. Provider settings have a separate restricted IPC interface; no agent execution is exposed.

Agent37 is a hosted harness API, not a local agent runtime installed by this project. Its official Node examples use native `fetch`; no Agent37 npm dependency is needed for that path. Configuration is reserved in `.env.example`. See [integration setup](../../../docs/integrations.md) for the verified endpoints and credential requirements.

The shared `ProviderService.runtimeConfiguration()` supplies a trusted backend with the selected provider/model, fixed base URL, credential and reported tool support. Its public status is shared by Core and Agent UI; keys never return through preload. Provider metadata checks and encrypted storage are implemented; model inference remains deferred.

Agent37's current [models API](https://www.agent37.com/docs/agents-api/models) and [chat API](https://www.agent37.com/docs/agents-api/chat) support harness-specific catalog IDs and per-turn selection. They do not accept a local Nexus key as a credential override. The documented [BYOK guide](https://www.agent37.com/docs/agents-api/byo-model) requires a configured instance or reachable proxy. This application does not deploy that infrastructure, upload local keys or assume that an OpenAI/OpenRouter catalog ID is usable by an Agent37 instance. Bind the shared configuration to the instance's actual catalog and credential transport before enabling task execution.

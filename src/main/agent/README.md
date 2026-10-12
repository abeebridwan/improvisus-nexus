# Nexus personal agent

The configured main-process OpenAI/OpenRouter client owns intent interpretation and the bounded reasoning/execution loop. `browser.ts` connects to existing Chrome and uses the same native WebMCP/CDP protocol as Core. `guard.ts` validates schemas, enforces approval and checks actual result evidence. `ipc.ts` exposes only validated, main-frame operations.

Agent37 remains used by Core's existing URL discovery. Nexus Agent does not call a second Agent37 LLM, deploy a proxy or upload local provider credentials. See [Agent setup, Guard limits and verification](../../../docs/agent-workspace.md).

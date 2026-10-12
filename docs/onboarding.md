# Nexus onboarding

The renderer uses React state for two onboarding steps and workspace navigation; no router or state-management dependency was added.

1. Select Nexus Core or Nexus Agent. Continue stays disabled until one is selected.
2. Select OpenAI or OpenRouter, enter a key (or reuse a saved one), and explicitly check it to load available models. Select a model, then save and open the chosen workspace. Back retains the selected feature and clears the transient key.

**Provider configuration is implemented; workflow execution is not.** Nexus Core provides local-project and website-URL entry options. Nexus Agent provides a natural-language task input and discovery entry point. Workflow discovery/generation, capability discovery and task execution remain disabled and explicitly disconnected. Persistent Core, Agent and Settings navigation shares the selected provider/model without repeating onboarding.

Only `feature` and `provider` are stored under `nexus.preferences` in local storage. Invalid or unavailable storage falls back safely; failed writes show a nonfatal message. API keys are masked, handed once to the trusted main process for the explicit check, and cleared from the input. Saved credentials/model choices use OS-backed encryption and are never returned to the renderer. Reloading reads secure provider status rather than inferring connection from frontend preferences.

Settings supports key replacement/deletion, provider changes, available-model selection and metadata validation. See [provider storage, IPC, telemetry and Agent37 boundaries](providers.md). The existing main-process observability, context isolation and restrictive renderer CSP are preserved.

`npm run typecheck`, `npm run build` and `npm test` verify this increment. Electron tests use a temporary profile and fixture keys/transport; real OS-backed persistence requires an unlocked keyring and is explicitly skipped if unavailable. Screenshots remain ignored, and existing public startup evidence is not overwritten.

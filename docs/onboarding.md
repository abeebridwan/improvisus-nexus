# Nexus onboarding

The renderer uses React state for two onboarding steps and workspace navigation; no router or state-management dependency was added.

1. Select Nexus Core or Nexus Agent. Continue stays disabled until one is selected.
2. Select OpenAI or OpenRouter. The optional password field reports empty, whitespace-only, or entered-but-unverified input. Back retains the selected feature and provider.

**Provider connection is not implemented.** “Save preferences & explore workspace” opens the selected workspace preview; it does not authenticate a provider. Both workspaces explicitly label their product capabilities as planned. Users can switch workspaces or change their provider without starting onboarding over.

Only `feature` and `provider` are stored under `nexus.preferences` in local storage. Invalid or unavailable storage falls back safely; failed writes show a nonfatal message. API keys remain in transient React state, are masked, and are cleared on back navigation, provider changes, and workspace entry. They are never persisted, logged, passed through preload, or sent to a provider. Reloading remembers the workspace preference, not a connection or credential.

The integration boundary is future main-process secure credential storage and live provider validation through a narrowly scoped IPC contract. Only a real successful connection may be presented as connected. Credential values must not be returned in connection status, errors, tracing, or preferences. The current read-only preload, main-process observability and restrictive renderer CSP are preserved.

`npm run typecheck`, `npm run build` and `npm test` verify this increment. The Electron smoke test uses a temporary profile, tests navigation/persistence/key clearing/storage failures and existing security controls, and creates local screenshots at `artifacts/onboarding-{feature,provider,workspace}.png`. These screenshots are ignored; no real credential is used in the test.

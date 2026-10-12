# AI provider configuration

Nexus supports OpenAI and OpenRouter through a main-process `ProviderService`. Onboarding and Settings use the same configuration, shared by Core and Agent. Saving requires a successful credential check followed by a model returned by that provider; failed checks do not replace an existing saved key. Settings can replace keys, change models, select another saved provider, or delete a provider's saved credential.

## Credential boundary

The password input is transient. Preload exposes only `providers.status`, `validate`, `save`, `remove`, and `cancel`; no generic IPC, secret-read, filesystem or arbitrary-URL API exists. Handlers are scoped to the application window, require its main frame and exact production/development origin, and reject unknown fields. Only public provider/model/status values return to the renderer. Unmounting Settings cancels pending validation; unused validated keys expire after ten minutes.

Electron [`safeStorage`](https://www.electronjs.org/docs/latest/api/safe-storage) encrypts the complete configuration in the main process. The encryption key is protected by macOS Keychain, Windows DPAPI, or an available Linux Secret Service/KWallet backend. The ciphertext is atomically written to `provider-config.enc` in Electron's application-data directory with mode `0600`; temporary files also contain only ciphertext. Nothing secret is stored in localStorage or plaintext configuration. The Linux `basic_text` and unknown backends are refused, with no insecure fallback.

On Linux, unlock the desktop keyring. If Electron's automatic backend detection fails on a GNOME/Secret Service desktop, explicitly select the documented backend when starting the app:

```sh
npm start -- -- --password-store=gnome-libsecret
```

Use the appropriate supported KWallet backend on KDE. A selected backend still must pass Electron's encryption-availability check. Never use `--password-store=basic` to save credentials. Chromium sandboxing, context isolation and the restrictive renderer CSP remain enabled.

## Provider and model checks

- **OpenAI:** authenticated [`GET /v1/models`](https://developers.openai.com/api/reference/resources/models/methods/list). Text-model candidates are filtered from the returned catalog; model-list metadata does not establish tool support, so it is explicitly marked **unknown**.
- **OpenRouter:** authenticated [`GET /api/v1/key`](https://openrouter.ai/docs/api-reference/limits), then [`GET /api/v1/models/user`](https://openrouter.ai/docs/guides/overview/models), which reflects account preferences and restrictions. `supported_parameters` supplies reported tool support; absent metadata is **unknown**.

These are metadata requests, not paid inference or proof that a model can execute an agent task. Availability, billing, limits and endpoint compatibility may change after validation. Nexus uses fixed HTTPS endpoints, refuses redirects, applies timeouts/response limits, and never returns raw error bodies. Authentication, permissions/budget, rate-limit and network failures have fixed actionable messages.

## Telemetry and Agent37

Provider operation spans include static operation names and completion/error codes only. No credential, IPC argument, account/balance information or provider response is passed into traces. Newly entered and restored keys are registered with the existing neatlogs export mask; rotated/deleted values stay masked through process exit to protect buffered spans. Keys are not provided to Search, crash reporting or coding-session tools. Avoid pasting real keys into development prompts or terminal output.

`ProviderService.runtimeConfiguration()` is a trusted-process interface returning the active provider/model, fixed base URL, reported tool support and credential for future local backend consumers. It is deliberately absent from preload.

Agent37 remains a hosted harness. Its [model catalog](https://www.agent37.com/docs/agents-api/models) lists instance-supported IDs, and [turn requests](https://www.agent37.com/docs/agents-api/chat) accept harness-specific model/provider choices. A local Nexus credential does **not** configure a remote instance. Agent37's [documented BYOK path](https://www.agent37.com/docs/agents-api/byo-model) requires a configured instance or reachable proxy; no such infrastructure, credential upload, unsupported provider API or agent execution is introduced here. Both workspace UIs share Nexus's selected configuration, while remote Agent37 model binding remains a clearly documented next step.

## Focused verification

```sh
npm run typecheck
npm test
```

Provider unit tests use explicitly controlled transport/store fixtures for successful configuration, invalid/missing keys, provider failures, replacement/deletion and fallback refusal. The Electron smoke test uses an isolated temporary profile and fixture transport, but the real IPC, provider service, OS encryption and persistence. An additional test-only Node preload removes Playwright's forced `password-store=basic` and mock macOS keychain before app ready, allowing real OS storage to be tested. With an unlocked keyring it verifies save/restart/replacement/deletion and both workspace routes; without one it checks secure refusal and prints an explicit **SKIP** for persistence. No fixture is evidence of live provider authentication, and no inference is performed.

For a GNOME keyring test:

```sh
NEXUS_TEST_PASSWORD_STORE=gnome-libsecret npm test
```

Live OpenAI/OpenRouter verification requires the user's real key entered directly into Settings. Do not put it in a test fixture, CLI argument, source file or build log.

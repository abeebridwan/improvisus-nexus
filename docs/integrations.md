# Integration setup

The desktop, onboarding, secure provider settings and tracing lifecycle are wired. No agent workflow or publisher is implemented. Secrets stay in the Node.js main process; OpenAI/OpenRouter keys are entered through Settings and saved with OS-backed encryption. See [provider configuration and verification limits](providers.md). Local `.env` remains for other main-process integration credentials. No credentials are required to launch the shell.

## Agent37

Verified against the [official quickstart](https://www.agent37.com/docs/agents-api/agent-quickstart) and [chat API](https://www.agent37.com/docs/agents-api/chat).

The intended runtime is a hosted Agent37 harness. Official Node examples use `fetch`; no local runtime package was installed. Set `AGENT37_API_KEY` and `AGENT37_INSTANCE_URL` to a real, provisioned agent-template instance. The documented data-plane call is `POST {instanceUrl}/v1/responses` with `X-Agent37-Key`, and an `input` body. Preserve the returned `session_id` for continuation. Check the response `status`, because HTTP 200 can still contain an agent failure. Control-plane instance management uses `https://api.agent37.com/v1/instances` with Bearer authentication instead.

No instance was provisioned and no live health or agent request was made. A compatible harness, account funding/budget, and credentials are manual prerequisites. A hosted harness will also need an actual permission and observability design before it can run product tasks.

## InstaCloud

The intended Insta integration is **InstaCloud**, for later delivery of verified adapter scripts. The official package is the `insta` CLI from [InsForge/instacloud-cli](https://github.com/InsForge/instacloud-cli), confirmed by its [official website](https://www.instacloud.com/). It is installed as a development tool; `npm run insta -- --version` checks the local installation.

The future `/publish` API would belong to an application-specific adapter publisher. It is not an official InstaCloud endpoint. `INSTA_ADAPTER_HOST_URL` and `INSTA_PUBLISH_TOKEN` reserve that application configuration only. The official platform control plane is `https://api.instacloud.com`, documented separately by InstaCloud.

No login, project creation, service creation, deployment, or global agent/MCP setup was performed. When publishing enters scope, authenticate through the documented `insta login`, then define and deploy a real publisher. This foundation contains no hosting infrastructure or publisher service.

## neatlogs

The official `neatlogs` TypeScript SDK is installed following its [SDK documentation](https://docs.neatlogs.com/sdk/typescript) and [hackathon setup guide](https://neatlogs.com/hackathon/neatlogs-setup-guide.html). Main-process initialization awaits `init()` once. With a real `NEATLOGS_API_KEY`, a `WORKFLOW` root records desktop startup with one renderer-load child. App quit awaits bounded `flushAll()` and `shutdown()`. A client-side mask removes credential fields and configured secret literals before export. Without a key or with an initialization failure, the desktop continues without tracing. `NEATLOGS_ENDPOINT` is the ingest base URL; use the EU endpoint if your project requires it.

`npm run neatlogs:doctor` performs the official local-only SDK diagnostic. Its controlled fixture spans are SDK checks, not application runs, model calls, or hackathon demonstration evidence. On October 11, 2026, the authenticated `npm run neatlogs:probe` passed with exact finalized hosted readback after retrying with network access. On October 12, real desktop startup was independently verified through authenticated Public CLI metadata, complete span pagination, raw previews and safe input/output reads; see [the evidence and reproduction commands](verification.md). Agent workflows remain unimplemented and unverified.

Typed SDK-native presets and the [instrumentation checklist](../src/main/observability/README.md) now prepare workflow, Agent37 reasoning, LLM, WebMCP, approval, retry, error, and verification coverage. The presets create no spans themselves. Hosted Agent37 internals still require harness-side instrumentation or exposed runtime events; a single HTTP call cannot prove internal tool observability. The failed run, debugging iteration, and verified successful run remain future demo work.

The ignored local `.env` was created with owner-only permissions. Configure the key in a local editor or the main-process environment; never expose it to the renderer. The latest check confirmed a supplied key authenticated successfully, without printing or recording its value. No credential file was modified during verification.

The installed SDK currently brings upstream OpenTelemetry/protobuf dependencies with npm advisories. Compatible `npm audit fix` did not resolve them. No forced downgrade or incompatible OpenTelemetry overrides were applied; see `npm audit` before deployment and recheck upstream fixes.

## Entire

Installed through the checksum-verified [official installer](https://github.com/entireio/cli#quick-start), version 0.11.4. Setup used:

```sh
entire enable --agent codex --project --telemetry=false --skip-push-sessions --absolute-git-hook-path
entire status --detailed
entire doctor
```

Project settings and Codex hooks are tracked. Git hooks are local and need reinstalling after a fresh clone. Automatic checkpoint pushing is disabled; the one reviewed existing checkpoint has been explicitly published to GitHub at the builder's instruction. The code branch is now published on GitHub. On another machine, install Entire and run the enable command above.

Re-ran `entire enable --agent codex` and verified `entire status --detailed`; automatic checkpoint publishing remains disabled. The latest `entire doctor` reports hook approval records present, but the captured session is ended. Start a fresh project coding session to verify automatic capture. The saved session was recovered manually through the installed CLI, without amending history; this does not prove hooks ran for later changes. Check `entire session current`, `entire checkpoint list`, and `entire doctor` to verify the actual capture mode.

Keep `strategy_options.push_sessions=false` for local checkpoint storage, and do not explicitly push `refs/entire/checkpoints/*` or run a checkpoint sync/push unless the transcripts have been reviewed and publication is authorized. Local Entire checkpoints contain actual session transcripts, with best-effort secret redaction; they remain sensitive even when code is public.

No existing commit was amended, and no transcript or checkpoint was fabricated.

Entire CLI login now works through its EU server, with credentials in the OS keyring. Hosted import still fails the GitHub App repository-access check, despite the builder reporting the selected repository. The builder subsequently authorized public publication of the reviewed checkpoint, which GitHub now confirms. The existing Entire-native repository remains private and is separate from the failed GitHub import. For the latest capture result, code publication, remaining connection steps, and sync status, see [Entire checkpoint verification](entire-checkpoints.md). Manual transcript capture does not establish hosted sync.

## cfo.ai and submission

See [business-plan/README.md](business-plan/README.md) for the builder's original cfo.ai plan links, verified public share metadata, official signup link and remaining review checklist. The builder reports the plans were generated; direct retrieval did not expose their financial contents, so readable exports are required for numerical review. No cfo.ai runtime integration or financial recommendation was implemented. Billing/credit status and actual demo evidence remain unverified. Public repository publication, build-in-public posts, the end-to-end demo video, and the final submission are later steps. Hackathon deadlines and official submission instructions must be confirmed with the organizers before submitting.

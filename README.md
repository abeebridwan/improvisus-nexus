# Improvisus Nexus

> Make websites agent-ready. Give your personal agent reliable capabilities to work with.

Improvisus Nexus is an Electron desktop application with two workspaces:

- **Nexus Core** discovers existing website workflows, lets you select **up to five**, generates WebMCP capabilities, asks for your approval, and verifies every selected workflow in a real browser before delivery.
- **Nexus Agent** is the personal-agent workspace for giving an agent a goal and using capabilities exposed by WebMCP-enabled websites. Its interface is present; capability discovery and task execution are still under development.

The project is being developed for [neatHack 2026](https://neatlogs.com/hackathon), with neatlogs for observability, Entire for development context, and cfo.ai for business planning. [Event page on Luma](https://luma.com/s5blr882).

**Current status:** the Core backend and its React interface are implemented. The build record reports successful local-project and public-URL runs. The personal-agent execution loop, Improvisus Search integration, and complete Core/Agent runtime tracing remain unfinished. See [the build record](https://github.com/abeebridwan/improvisus-nexus/blob/main/hackathon.md) and [verification evidence](https://github.com/abeebridwan/improvisus-nexus/blob/main/docs/verification.md) for the distinction between implemented paths, controlled tests, and recorded live runs.

## Download and run

Source repository: [abeebridwan/improvisus-nexus](https://github.com/abeebridwan/improvisus-nexus).

Test Nexus through the desktop application, using the same download-and-run process as Mini Core:

1. Open [Improvisus Nexus Releases](https://github.com/abeebridwan/improvisus-nexus/releases).
2. Open the latest release and expand **Assets**.
3. Download the available package for your operating system and launch Nexus.
4. Open **Settings**, choose **OpenAI** or **OpenRouter**, and enter your own API key.
5. Validate the key, select a returned model you can use, and save the configuration.
6. Open **Nexus Core** and follow [Testing Nexus](#testing-nexus).

| Operating system | Desktop package |
| --- | --- |
| Linux | `.AppImage` |
| Windows | `.exe` / installer |
| macOS | `.dmg` |

Use the packages listed in the release's Assets. On Linux, mark the downloaded AppImage executable before launching it and use an unlocked OS keyring to save your provider key.

The hackathon desktop release will include the application, its verification browser, and the configuration for the existing Agent37 discovery service, adapter publisher, and neatlogs tracing. **Testers supply their own OpenAI or OpenRouter API key; the release does not supply a generation-provider key or automatic fallback.** Choose a model with the access or balance needed to run generation.

Release testing uses the configured hosted services directly. Testers do not need to create an Agent37 instance, deploy an InstaCloud publisher, configure neatlogs, create a `.env` file, or build Nexus from source. An internet connection is required. Local Project testing also requires Git, Node.js/npm, and installed dependencies for the target website.

## Why Nexus

Making a website useful to an AI agent takes more than generating a tool definition. The capability must reuse the website's actual behavior, accept meaningful inputs, return grounded results, and survive execution in a real browser.

Website owners also have different starting points. A developer may have the source repository; a store owner may have only a deployed website. Nexus Core supports both.

The personal-agent side completes the product vision: once websites expose usable capabilities, an agent should be able to discover them, plan a task, invoke the right tools, recover from supported failures, and verify the final result.

```text
WEBSITE OWNER                         PERSONAL AGENT USER
      │                                        │
      ▼                                        ▼
  Nexus Core                               Nexus Agent
  implemented                              planned execution
      │                                        │
  Discover workflows                       Receive a goal
  Select up to five                        Discover capabilities
  Generate capabilities                    Plan and invoke tools
  Review and approve                       Recover and verify
  Verify every workflow                    Return grounded results
      │                                        ▲
      └──────── WebMCP-enabled websites ────────┘
```

## Nexus Core: up to five workflows in one batch

Start with a local website repository or a public URL. Nexus discovers a catalog of supported, existing read-only workflows. Select between one and five candidates and generate one capability for each.

```text
Choose a source
→ Discover existing workflows
→ Select up to five
→ Generate one adapter per workflow
→ Review the complete batch
→ Approve & Verify
→ Invoke every workflow and check every required test
→ Commit once or publish one combined script
```

The selection limit is enforced in the UI and the backend. Duplicate IDs, unknown workflow IDs, and selections above five are rejected. A website with fewer supported workflows can return fewer candidates.

Each batch has distinct workflow IDs and tool names, a stored review, and a batch ID used for approval. Generated code stays in the main process until the user approves the reviewed batch.

### Local Project mode

For a website you own, choose its repository using **Browse** or enter its path.

Nexus:

1. Checks that the repository is clean and captures its current branch and commit.
2. Reads relevant source files and identifies existing exported business functions.
3. Generates a separate TypeScript WebMCP adapter for every selected workflow.
4. Merges all adapters and application-entry imports into one change set.
5. Shows the full diff before any generated files are applied.
6. After approval, creates one `mini-core/batch-*` branch, applies the reviewed changes, and builds the website.
7. Starts the website and invokes every selected tool through WebMCP in Chromium.
8. Creates one Git commit only when every required test passes.

If application, build, or verification fails, the controller attempts to restore all generated changes and the original branch. The verification server is stopped after the run.

Successful local delivery gives you a branch and commit. Deploying the website remains a separate action.

**Initial local requirements:** an existing Git repository, installed website dependencies, an exported function for each supported workflow, and `npm run build` / `npm run dev` scripts compatible with the current Vite-style launcher. Nexus uses port `4173` for the target website and `5173` for its desktop development renderer.

### Website URL mode

For a public website without source access, enter its URL.

Nexus:

1. Calls the configured, already deployed Agent37 instance to inspect the live website.
2. Receives observed workflow maps with controls, selectors, actions, result areas, and example tests.
3. Generates an adapter for each selected workflow and combines the adapters into one script with separate scopes.
4. Shows the combined source for review.
5. After approval, opens each workflow's starting page in an isolated Chromium context and temporarily injects the combined script.
6. Discovers and invokes the relevant WebMCP tool, checking its actual output against each required test.
7. Publishes the exact verified combined script to the existing InstaCloud-hosted publisher only after the whole batch passes.

Successful URL delivery returns one installation snippet:

```html
<script src="https://your-publisher.example/adapters/verified-batch.js" defer></script>
```

The website owner adds that snippet to the site. Verification injects the adapter only into its temporary browser session; it does not install code on the deployed website.

## Nexus Agent: the personal-agent workspace

Nexus Agent is designed for users who want to complete a task using capabilities already available on websites.

Example goal:

> Find in-stock running shoes within my budget, compare the options, and recommend the best match.

The intended execution flow is:

```text
User goal
→ Agent37-powered planning
→ Capability discovery through Improvisus Search
→ Validated WebMCP calls
→ Permission decisions when needed
→ Supported failure recovery
→ Independent result verification
→ A grounded answer with evidence
```

Both workspaces share Nexus's provider Settings. The current Agent screen accepts a task description, but **Discover capabilities** and **Run task** are disabled. The task is not sent to a running personal agent. Implementing that loop, verifying the Search API contract, and binding the hosted harness to the intended provider configuration are the next product milestones.

The [personal-agent demo plan](https://github.com/abeebridwan/improvisus-nexus/blob/main/docs/demo-acceptance.md) describes a procurement-shortlist task and its acceptance criteria. It is a plan, not evidence of completed agent execution.

## Human approval and browser verification

Nexus treats generated code as a proposal that must be reviewed and exercised.

- A pending review can be discarded before execution.
- Approval identifies the stored batch rather than accepting replacement source from the renderer.
- A changed local branch or commit invalidates the earlier source snapshot.
- The controller prevents overlapping Core runs.
- Every selected workflow must complete every required test before the batch succeeds.
- URL workflows must stay on the expected website origin.

The verifier uses Playwright Chromium with WebMCP enabled and Chrome DevTools Protocol operations including `WebMCP.enable`, `WebMCP.toolsAdded`, `WebMCP.invokeTool`, and `WebMCP.toolResponded`.

Current assertions check that returned output contains the expected text. Each independent test gets its own browser context. Screenshots are saved separately under:

```text
<Electron userData>/core-artifacts/<batchId>/<workflowId>/test-<number>.png
```

The standalone browser probe verifies WebMCP discovery and invocation using an echo tool. A passing probe establishes browser support; it does not prove a generated website batch works.

## AI providers and cloud integrations

### OpenAI and OpenRouter

Choose a provider, validate your key, select a returned model, and save it in **Settings**. Nexus uses the OpenAI JavaScript SDK for generation, connecting to the selected provider's fixed endpoint.

The main-process `ProviderService.runtimeConfiguration()` supplies the saved provider, model, endpoint, and credential. A generation batch captures one runtime configuration for its selected workflows. Nexus respects the chosen provider rather than silently preferring another saved key.

Provider metadata checks establish credential/model configuration; they do not guarantee a later inference request will succeed. Structured JSON requests, bounded retries, syntax repair, and Zod validation handle model-output formatting, with explicit failure when a valid plan cannot be recovered.

### Agent37

Core uses the existing hosted Agent37 instance for public-website discovery. It sends a read-only discovery task to `POST <instance URL>/v1/responses` with `X-Agent37-Key`, checks completion status, and validates the workflow maps.

Agent37 discovers how the website works. The selected inference model generates the WebMCP adapter afterward. The hosted instance has its own credentials and model configuration; a local OpenAI/OpenRouter key does not automatically configure that remote harness.

### InstaCloud

Core publishes verified URL batches through an application-specific publisher already hosted on InstaCloud:

```text
Nexus Core
→ all selected browser tests pass
→ authenticated POST /publish
→ publisher stores the combined JavaScript
→ public adapter URL and script tag
```

`/publish` is the application's publisher API, not the InstaCloud platform control plane. The `insta` CLI is also installed as a development tool; everyday Core publishing uses the configured HTTP endpoint.

## neatHack: observability, development context, and business planning

The [official hackathon requirements](https://neatlogs.com/hackathon) require neatlogs, Entire, and cfo.ai. Their roles in Nexus are distinct.

### neatlogs — inspect behavior and improve reliability

The TypeScript SDK initializes once in the Electron main process. Credential masking runs at the export boundary, and shutdown uses bounded flush/shutdown handling.

Implemented instrumentation covers desktop startup, renderer loading, and selected provider operations. The repository records independently read-back, finalized startup spans in [sanitized evidence](https://github.com/abeebridwan/improvisus-nexus/blob/main/artifacts/neatlogs-desktop.json), alongside the [desktop screenshot](https://github.com/abeebridwan/improvisus-nexus/blob/main/artifacts/desktop-smoke.png).

Span presets for agent reasoning, model calls, capability discovery/invocation, approval, retry, and verification are prepared. The current Core modules do not yet invoke those presets or wrap their model client, so complete Core/Agent traces, token/cost accounting, and a measured before/after improvement remain to be recorded.

See [observability design](https://github.com/abeebridwan/improvisus-nexus/blob/main/src/main/observability/README.md) and [verification notes](https://github.com/abeebridwan/improvisus-nexus/blob/main/docs/verification.md).

### Entire — retain the context behind development changes

Entire CLI and coding-agent/Git hooks are configured. The build record documents a real captured checkpoint, its commit linkage, and the later publication of that reviewed checkpoint.

[Public checkpoint evidence](https://github.com/abeebridwan/improvisus-nexus/tree/bd3f128e46ee63c8654751875af61a211b466f3d) is available on GitHub. Fresh automatic capture and the hosted GitHub-backed Entire viewer remain separate verification items. Automatic checkpoint publication is disabled.

See [checkpoint verification and sharing status](https://github.com/abeebridwan/improvisus-nexus/blob/main/docs/entire-checkpoints.md).

### cfo.ai — plan the business

The builder reports creating Nexus's business and financial plans in cfo.ai. The repository records the supplied share links and verified public document metadata:

| Document | Original plan |
| --- | --- |
| Business plan | [Improvisus Nexus business plan](https://app.cfo.ai/s/-G5cxfokWZuJPsQW) |
| Financial forecast | [Nexus forecast](https://app.cfo.ai/s/JN59kUsONUBOrQTV) |
| Assumptions and simulator | [Nexus assumptions](https://app.cfo.ai/s/jlhLdv8fJr0BEYFF) |
| Customers and unit economics | [Nexus unit economics](https://app.cfo.ai/s/uzjG7iuZ7IQ_a3xF) |

Readable exports and numerical review are still pending. No pricing, revenue, cost, or runway result is asserted here. cfo.ai is used for business planning, not as a runtime dependency.

See [business-plan evidence and review status](https://github.com/abeebridwan/improvisus-nexus/blob/main/docs/business-plan/README.md).

## Architecture and stack

```text
React desktop UI
        │
        ▼
window.nexus: typed preload bridge
        │
        ▼
Validated, window-scoped Electron IPC
        │
        ├── ProviderService → OS-encrypted credentials
        │
        └── CoreController → catalog, selection, stored batch review
                 │
                 ├── Local source / hosted Agent37 discovery
                 ├── OpenAI SDK generation + Zod validation
                 ├── Merged Git changes / combined URL adapter
                 ├── Playwright Chromium verification
                 └── One commit / one publisher upload
```

| Technology | Role |
| --- | --- |
| Electron | Desktop lifecycle, native folder picker, IPC and credential encryption |
| React, React DOM, HTML and CSS | Onboarding, Settings, workspace switching, Core controls and review UI |
| TypeScript and Node.js | Main-process orchestration, filesystem, HTTP and subprocess handling |
| Electron-Vite and Vite | Main/preload/renderer builds and desktop development server |
| OpenAI JavaScript SDK | Inference through OpenAI or OpenRouter |
| Agent37 hosted API | Live public-website workflow discovery |
| WebMCP and JSON Schema | Browser-discoverable tools and structured inputs |
| Playwright, Chromium and CDP | Independent capability discovery, invocation and verification |
| Git and simple-git | Source snapshots, batch branches, commit and rollback handling |
| Zod | Runtime request, catalog, plan and response validation |
| jsonrepair | Recovery of supported malformed JSON syntax before schema validation |
| diff | Unified review diffs |
| InstaCloud-hosted publisher | Verified JavaScript delivery |
| neatlogs | Observability SDK and diagnostic tooling |
| Entire | Coding context and checkpoints |
| cfo.ai | Business and financial planning |
| tsx | TypeScript browser-probe execution |

## Repository structure

```text
src/
  main/
    index.ts                 Electron startup and service registration
    core/
      ai-client.ts           Nexus-backed generation runtime
      agent37.ts             Hosted workflow discovery client
      discover.ts            Repository source scanning
      discover-workflows.ts  Catalog discovery and workflow identities
      model-json.ts          Structured model-output parsing and retries
      generate.ts            Local and URL adapter generation
      types.ts               Schemas, plans, reviews and results
      apply.ts               Merged source changes and review diffs
      bundle.ts              Combined URL adapter
      browser.ts             WebMCP-enabled Chromium launcher
      verify.ts              All-workflow browser verification
      local-server.ts        Target website build and development server
      instacloud.ts          Existing publisher client
      pipeline.ts            Batch controller and delivery gates
      ipc.ts                 Validated Core operations
    providers/               Shared provider service, storage and IPC
    observability/           SDK lifecycle, masking and span presets
    agent/                   Personal-agent execution boundary
    discovery/               Improvisus Search integration boundary
  preload/index.ts           Restricted window.nexus bridge
  renderer/src/              React application and CoreWorkspace
  shared/                    Desktop, provider and Core bridge types
scripts/                     Launch helpers, tests and browser probe
docs/                        Setup, evidence and business-plan records
artifacts/                   Reviewed shareable desktop evidence
hackathon.md                 Dated development and verification record
```

## Development: run from source

These instructions are for developing Nexus or running a source checkout. To test the packaged desktop application, use [Download and run](#download-and-run) and [Testing Nexus](#testing-nexus).

Requirements: Node.js **22.12+**, npm, Git, a desktop display, and an unlocked OS keyring for saving provider credentials. `.nvmrc` pins the documented development version to `22.23.0`.

```bash
git clone https://github.com/abeebridwan/improvisus-nexus.git
cd improvisus-nexus
npm ci
npm run browser:install
npm run dev
```

Use **Settings** to configure your provider and model. Provider keys are entered through the desktop UI and saved encrypted in Electron's application-data directory.

For a built desktop launch:

```bash
npm run build
npm start
```

The current `start` script previews existing build output. Build first after changing source.

On Linux, run as your normal user. The launch helpers retain Chromium sandboxing and handle the inherited `ELECTRON_RUN_AS_NODE` flag. See [Linux development setup](https://github.com/abeebridwan/improvisus-nexus/blob/main/docs/linux-development.md) if the sandbox or keyring needs configuration.

### Developer cloud-service configuration

When running a source checkout, create or edit `.env` in the Nexus root using your existing deployed service settings for public-URL discovery and publication. Release testers use the packaged service configuration described above.

```env
# Existing Agent37 instance; use its base URL, not just an ID.
AGENT37_API_KEY=your_agent37_service_key
AGENT37_INSTANCE_URL=https://your-instance-id.agent37.app

# Alternatively, omit INSTANCE_URL and use:
# AGENT37_INSTANCE_ID=your-instance-id

# Existing application publisher hosted on InstaCloud.
INSTA_ADAPTER_HOST_URL=https://your-publisher.example
INSTA_PUBLISH_TOKEN=your_publisher_token

# Optional tracing configuration.
NEATLOGS_API_KEY=your_neatlogs_key
NEATLOGS_ENDPOINT=https://ingest.neatlogs.com
```

These are placeholders. The clients append `/v1/responses` and `/publish`; do not put those suffixes in the base settings. A bare instance ID under `AGENT37_INSTANCE_URL` is not a valid URL. Restart the desktop after configuration changes.

Local Core workflows do not require Agent37 or publisher credentials. This `.env` setup applies to source development; preparing the desktop release includes supplying its runtime components and hosted-service configuration.

## Testing Nexus

Use the same demo website and download-first testing process documented in the [Mini Core README](https://github.com/abeebridwan/mini-core-spike#testing-mini-core). Download Nexus and save your own OpenAI or OpenRouter key in **Settings** before starting either test.

```text
Website URL → use the hosted demo store
Local Project → use the Nexus demo project or Mini Core's demo-store/
```

### 1. Test Website URL mode

For remote testing in Nexus, use this hosted demo website. Open the Nexus desktop application, select **Nexus Core → Website URL**, and paste the URL below:

[Nexus remote-testing demo website](https://prod-main-web-8e9af6-00m6pcgptg8.compute.instacloud-edge.com/)

```text
https://prod-main-web-8e9af6-00m6pcgptg8.compute.instacloud-edge.com/
```

1. Select **Nexus Core → Website URL** and enter the demo URL.
2. Click **Discover workflows**.
3. Select product search, or between one and five supported workflows returned by discovery.
4. Generate the capabilities and review the combined script and every workflow's required tests.
5. Click **Approve & Verify**.
6. Inspect the real browser results and screenshots. After every required test passes, Nexus publishes one verified script and returns its installation snippet.

No website source checkout is needed for this test. Verification temporarily injects the adapter into an isolated browser session. The website owner adds the returned script tag to install it on the deployed site.

Agent37 cannot reach your desktop's localhost from its hosted instance; use the public demo URL for Website URL testing.

### 2. Test Local Project mode

You can use the demo project provided in the [Improvisus Nexus repository](https://github.com/abeebridwan/improvisus-nexus) for local testing. Clone or download the repository, install the demo website's dependencies following its setup instructions, and select the demo project folder in the downloaded Nexus application. The demo website is a separate test target from Nexus's desktop renderer.

The Nexus demo supports search, category filtering, budget filtering, product details, stock lookup, and comparison. Discover its supported workflows and select between one and five candidates for a batch.

The demo must be inside a Git repository with at least one commit and a clean working tree. If you downloaded a ZIP or copied the demo into a separate folder, initialize Git and create a baseline commit before testing.

Alternatively, clone Mini Core to obtain its `demo-store` website, then install the website's dependencies:

```bash
git clone https://github.com/abeebridwan/mini-core-spike.git
cd mini-core-spike/demo-store
npm ci
git log -1 --oneline
git status
```

For this alternative, the target is `mini-core-spike/demo-store`. The same Git and dependency requirements apply to both demo projects.

1. Open the downloaded Nexus application.
2. Select **Nexus Core → Local Project** and use **Browse** to choose the Nexus demo project folder or `mini-core-spike/demo-store`, depending on which demo you prepared.
3. Click **Discover workflows** and select product search, or up to five supported candidates.
4. Generate the capabilities and review the complete diff, including adapter files, entry imports, and required tests.
5. Click **Approve & Verify**.
6. Nexus applies the reviewed changes on a batch branch, builds and starts the website, and invokes every selected tool in Chromium.
7. Inspect the test results and screenshots. A successful batch produces one branch and commit; a failed build or verification triggers rollback.

For product search, the Mini Core demo uses the query `black running` and expects `Black Running Shoes`. Review the actual inputs and expected results Nexus proposes before approving the batch.

### Quick test summary

| Mode | What the tester supplies | Successful result |
| --- | --- | --- |
| Website URL | Downloaded Nexus, own OpenAI/OpenRouter key, public demo URL | Verified hosted adapter URL and installation snippet |
| Local Project | Downloaded Nexus, own OpenAI/OpenRouter key, clean Nexus demo project or Mini Core demo-store checkout with dependencies installed | Verified batch branch and Git commit |

The personal-agent follow-on demo—using those capabilities to produce a verified shortlist—is a planned milestone.

## Checks and evidence

```bash
npm run typecheck
npm test
npm run core:probe
```

The test command includes redaction, provider and model-JSON tests, builds the application, and performs an Electron smoke check. Controlled fixtures establish those specific behaviors; they do not establish live inference, Agent37 discovery, publishing, or personal-agent task execution.

Useful evidence already recorded in the repository:

- [Desktop screenshot](https://github.com/abeebridwan/improvisus-nexus/blob/main/artifacts/desktop-smoke.png).
- [Sanitized finalized startup-trace evidence](https://github.com/abeebridwan/improvisus-nexus/blob/main/artifacts/neatlogs-desktop.json).
- [Detailed verification notes](https://github.com/abeebridwan/improvisus-nexus/blob/main/docs/verification.md).
- [Entire checkpoint record](https://github.com/abeebridwan/improvisus-nexus/blob/main/docs/entire-checkpoints.md).
- [Original cfo.ai plans and metadata](https://github.com/abeebridwan/improvisus-nexus/blob/main/docs/business-plan/README.md).
- [Development history and latest reported Core results](https://github.com/abeebridwan/improvisus-nexus/blob/main/hackathon.md).

The builder reports that the WebMCP probe passed and that both Core modes have run successfully. A public five-workflow demo, complete runtime trace evidence, and reproducible live-run artifacts still need to be attached before those outcomes can be independently assessed by a reviewer.

## Security boundaries and current limitations

The desktop renderer uses `sandbox: true`, `contextIsolation: true`, `nodeIntegration: false`, and a restricted production `nexus://app/` protocol/CSP. IPC handlers validate the owning window and frame. Provider credentials are encrypted with Electron `safeStorage`; unsupported/insecure keyring backends are refused.

Core validates selected IDs, confines generated paths to the selected project, checks source snapshots, and requires approval before applying or testing generated code. Those boundaries support review and isolation; generated adapters and example tests still require scrutiny.

Current limitations include:

- One website/project and up to five read-only workflows per batch.
- Local discovery depends on a bounded source context and actual exported business functions.
- The local server launcher currently expects Vite-style npm commands.
- Model JSON repair can recover some formatting problems, but cannot guarantee faithful recovery of every malformed response.
- Browser support must include both `document.modelContext` and the WebMCP CDP domain.
- URL testing bypasses CSP inside the isolated verification context; the installed script must also be allowed by the real website's policy.
- Workflows requiring authentication or navigation that destroys the invoking document need further support.
- Local rollback restores generated files and Git state; it cannot undo external website side effects.
- Personal-agent execution, Search discovery, consequential-action permissions, and task-level recovery remain unfinished.
- Full agent/Core tracing and usage/cost measurements remain unfinished. The hackathon desktop release will package the verification browser and hosted-service configuration for the download-and-run testing flow above.

## neatHack demo and submission materials

The event runs October 10–12, 2026. The official submission requirements call for a public repository, a demo video of at most three minutes covering neatlogs, Entire and cfo.ai, the business plan, and supporting evidence, submitted through the official X quote-post flow. The final cutoff is confirmed through the organizers' Discord. [Official requirements](https://neatlogs.com/hackathon).

| Judging area | Weight |
| --- | --- |
| Agent task completion | 30% |
| Use of neatlogs, Entire and cfo.ai | 25% |
| Demo video | 20% |
| Building in public | 15% |
| Usefulness and originality | 10% |

Prepare the remaining project evidence:

- A public video showing a real selected-workflow batch, approval, browser invocations and delivery.
- Sanitized traces of a real failure, its diagnosis/change, and a verified rerun.
- Development checkpoints tied to the relevant iterations.
- Readable cfo.ai business-plan contents and the assumptions behind them.
- A clearly labelled personal-agent demonstration when its execution path is implemented.
- Public development/demo links and the final submission link once published.

Registration, final submission, and eligibility are separate from having a README or a running desktop. [Luma event information](https://luma.com/s5blr882).

## Project lineage and links

Nexus's capability-generation and verification approach builds on [Mini Core](https://github.com/abeebridwan/mini-core-spike). Nexus adds a React desktop interface, shared encrypted provider configuration, discovery/selection of up to five workflows, combined batch review/delivery, and the personal-agent workspace. The repositories and dated commits document that lineage and the development timeline.

- [Improvisus Nexus repository](https://github.com/abeebridwan/improvisus-nexus).
- [Improvisus Nexus desktop releases](https://github.com/abeebridwan/improvisus-nexus/releases).
- [Mini Core repository](https://github.com/abeebridwan/mini-core-spike).
- [neatHack requirements](https://neatlogs.com/hackathon).
- [Luma event page](https://luma.com/s5blr882).
- [Project build and verification record](https://github.com/abeebridwan/improvisus-nexus/blob/main/hackathon.md).

**Demo video and final submission:** pending public links.

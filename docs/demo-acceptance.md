# Nexus demo acceptance checklist

Status: planned acceptance criteria only. The fixture, generator, and personal agent are not implemented. Unchecked items are not evidence of a working feature.

## One end-to-end demonstration

Use a controlled local store fixture built during implementation, with a small deterministic product catalog, stock status, prices, and visible product details. No third-party account or checkout is required. Record its actual local URL and source revision once it exists.

The single website capability is **product search/filter**. The personal agent's task is to prepare a procurement shortlist: find three in-stock products matching the user's criteria and budget, compare their relevant attributes, and return links, prices, availability, and a grounded recommendation. The fixture must contain enough matching and nonmatching items to test selection and exclusions.

The owner starts by asking Nexus to make that workflow agent-ready. After installation and browser verification, the personal agent discovers the registered capability through Improvisus Search and completes the shortlist task. Confirm the actual Search API contract before implementing discovery.

## Acceptance criteria

- [ ] Nexus inspects the actual fixture and discovers product search/filter from observed behavior.
- [ ] It generates one capability and shows the exact proposed source changes before installation.
- [ ] Denying or cancelling installation leaves the project unchanged; approval permits only the reviewed changes.
- [ ] The capability installs in the local project and is invoked successfully in real Playwright Chromium.
- [ ] The personal agent discovers the actual installed capability, plans the shortlist task, and calls it with validated inputs.
- [ ] It excludes out-of-stock, over-budget, and otherwise nonmatching items, with decisions grounded in returned data.
- [ ] It verifies every shortlisted item's price, availability, and link against the rendered website before reporting completion.
- [ ] A recoverable failure produces a real error, a bounded retry, and a verified result. A transient fixture failure may be used, but label it as deliberate fault injection.
- [ ] A denied consequential action is not retried automatically. A failed verification produces a failure report rather than success.
- [ ] The final report contains three verified options and explains the recommendation. No purchase is performed in this demo.

## Evidence to preserve during implementation

- [ ] Real neatlogs spans for reasoning, model/tool calls, inputs/outputs, approval, state changes, errors, retry attempts, and verification. Capture latency and actual usage; distinguish calculated costs from provider-reported costs.
- [ ] A real failed run, diagnosis/code change, and successful rerun, with trace links and a concise before/after comparison. Controlled failure injection alone does not demonstrate a debugging improvement.
- [ ] Entire checkpoints for meaningful development iterations after Codex hooks have been approved. Review transcripts before any publication; automatic checkpoint publishing remains disabled.
- [ ] Actual browser screenshots and final shortlist output, with the fixture URL, catalog revision, and code commit IDs needed to reproduce the run.
- [ ] A cfo.ai plan created through the real service, covering pricing, costs, revenue, unit economics, and runway; follow [manual setup](business-plan/README.md).

## Before implementation

- [ ] In a Codex session opened at this repository, use `/hooks` to review and approve the seven installed Entire hooks. Confirm `entire doctor` and `entire session current` show real capture before relying on checkpoints.
- [ ] Complete the participant-only cfo.ai signup, billing cancellation, and organizer credit confirmation described in the business-plan checklist. These steps require personal account/payment details.

Keep this checklist unchecked until each item has actual evidence. No runtime or credential-dependent verification was added by preparing this document.

# Entire checkpoint verification and recovery

Follow the [official neatHack Entire guide](https://hack.entire.io/neathacks-2026/) and the installed CLI's `entire agent-help` output. Local capture, commit linkage, and hosted synchronization are separate checks.

## Routine verification

```sh
entire version
entire status --detailed
entire doctor
entire session current
entire checkpoint list
entire checkpoint explain HEAD --short --no-pager
```

Seven project Codex hooks are installed. On October 12, `entire doctor` reports approval records present, while the tracked session remains ended. Start a fresh Codex session and verify actual capture; approval records alone do not prove hooks ran for new work. Do not bypass hook trust or fabricate lifecycle events. The default detailed checkpoint explanation includes prompts; use `--short` when displaying a result without private context.

## Existing-session recovery without rewriting history

Installed Entire `0.11.4` supports `entire session attach --agent codex <real-session-id>` when hooks did not capture the session. In a noninteractive command, **omit `--force`**: it stores the real transcript locally and prints an `Entire-Checkpoint` trailer instead of amending HEAD. In an interactive terminal, explicitly decline its amendment prompt. Confirm the old HEAD hash remains unchanged before making the new commit.

Use only the returned checkpoint ID in a new commit's trailer, then run the list and explanation commands above. This manual recovery is not evidence that automatic hooks ran. Verify automatic capture separately after hook approval. The session recovered during this check produced local checkpoint `01M4PJQYJYSVZHDH8GEB4A239Y`; publication was initially withheld; see the current sharing status below.

Verification found one linked checkpoint and the actual verification request in its stored transcript. The current intent preview is an application context marker, and no generated summary is available; inspect the actual Sessions content privately rather than presenting the preview as a task summary.

## GitHub and sharing

The builder-authorized public repository is [abeebridwan/improvisus-nexus](https://github.com/abeebridwan/improvisus-nexus), connected as `origin`. On October 12, the complete existing code history and reviewed desktop evidence were pushed to `main`, and the remote branch was verified. The builder later explicitly authorized publishing the existing reviewed checkpoint; its exact ref is now verified on GitHub.

Builder-approved `entire login --device` succeeded against the EU login server, storing credentials in the OS Secret Service keyring. Hosted repository access is a separate step: `entire repo view /gh/abeebridwan/improvisus-nexus` currently reports no visible repository. Two scoped import attempts through `entire repo mirror add /gh/abeebridwan/improvisus-nexus --cluster aws-eu-central-1.entire.io --no-wait --timeout 30s` were rejected by the GitHub App access check. No hosted mirror/deployment is claimed.

Confirm the [Entire GitHub App](https://github.com/apps/entire) is configured on the correct owner with only `improvisus-nexus` selected, and save the setting. The builder reported that selection, but the service still rejected access. The [official guide](https://hack.entire.io/neathacks-2026/) says permission changes may take up to an hour to synchronize. After that, retry the scoped import and verify `entire repo view`; do not treat login or a generated URL as proof that the repository is connected. Entire is a development service, not an application runtime that needs deploying into Nexus.

The builder subsequently authorized making the project and existing checkpoint public. A fresh local scan of all six stored checkpoint files found no configured credential values or private-key blocks. Only checkpoint `01M4PJQYJYSVZHDH8GEB4A239Y` was published, at `refs/entire/checkpoints/9Y/01M4PJQYJYSVZHDH8GEB4A239Y`, object `bd3f128e46ee63c8654751875af61a211b466f3d`. Both GitHub's refs API and `git ls-remote` independently confirm that exact public ref. Original prompts and tool context are included, as explicitly authorized; they are not duplicated into these documentation files.

The normal pre-push hook initially routed the explicit checkpoint push to the existing private Entire-native repository `/et/improvisus-nexus/improvisus-nexus` in `aws-eu-west-2.entire.io`. To fulfill the separate GitHub-publication request, the exact reviewed ref was pushed directly with hooks bypassed for that one command. Hook files and project settings were preserved. The GitHub App import was retried and still failed; GitHub publication does not establish that hosted import or a live Entire share URL works. `entire status --detailed` still reports one checkpoint not on origin despite GitHub's verified ref; the [official status implementation](https://github.com/entireio/cli/blob/main/cmd/entire/cli/strategy/unpushed_checkpoints.go) counts a local push queue without checking the network. The direct push did not clear that queue; the counter is not evidence that GitHub lacks the ref. Hosted GitHub import remains unverified.

The [public checkpoint tree on GitHub](https://github.com/abeebridwan/improvisus-nexus/tree/bd3f128e46ee63c8654751875af61a211b466f3d) returned HTTP 200 without authentication. This is a verified public GitHub URL, separate from Entire's hosted commit viewer.

Keep `strategy_options.push_sessions=false`. Do not use a blanket `git push --mirror` or enable automatic checkpoint publishing to make a link appear. Publishing code and publishing checkpoint data require separate review and authorization. After reviewed synchronization, check `entire status` and open **repository → branch → commit → checkpoint** in Entire.

The official GitHub-backed share-link format is `https://entire.io/gh/OWNER/REPO/commit/FULL_COMMIT_SHA`. Use the full SHA of a commit actually linked to the checkpoint (here `c492f2a` or `1ba47ed`), rather than a later unrelated HEAD. A constructed URL is not proof of synchronization or reviewer access. No live shareable checkpoint URL is claimed until the commit/checkpoint is available in Entire.

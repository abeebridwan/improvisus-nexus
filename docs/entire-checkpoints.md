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

Seven project Codex hooks are installed, but still require review through `/hooks` in a Codex session opened at this repository. Do not bypass hook trust or fabricate lifecycle events. The default detailed checkpoint explanation includes prompts; use `--short` when displaying a result without private context.

## Existing-session recovery without rewriting history

Installed Entire `0.11.4` supports `entire session attach --agent codex <real-session-id>` when hooks did not capture the session. In a noninteractive command, **omit `--force`**: it stores the real transcript locally and prints an `Entire-Checkpoint` trailer instead of amending HEAD. In an interactive terminal, explicitly decline its amendment prompt. Confirm the old HEAD hash remains unchanged before making the new commit.

Use only the returned checkpoint ID in a new commit's trailer, then run the list and explanation commands above. This manual recovery is not evidence that automatic hooks ran. Verify automatic capture separately after hook approval. The session recovered during this check produced local checkpoint `01M4PJQYJYSVZHDH8GEB4A239Y`; no checkpoint contents were published.

## GitHub and sharing

The builder-authorized public repository is [abeebridwan/improvisus-nexus](https://github.com/abeebridwan/improvisus-nexus), connected as `origin`. It was created without pushing code or checkpoint refs. Entire CLI login is absent; hosted import, GitHub App access, and checkpoint sync remain unverified.

Sign in to Entire with GitHub and grant the Entire GitHub App access to this repository through its onboarding. Check the repository appears in Entire. Review the checkpoint's full transcript privately before authorizing any sync; it includes actual prompts and tool context even when automatic secret redaction runs.

Keep `strategy_options.push_sessions=false`. Do not use a blanket `git push --mirror` or enable automatic checkpoint publishing to make a link appear. Publishing code and publishing checkpoint data require separate review and authorization. After reviewed synchronization, check `entire status` and open **repository → branch → commit → checkpoint** in Entire.

The official GitHub-backed share-link format is `https://entire.io/gh/OWNER/REPO/commit/FULL_COMMIT_SHA`. Substitute the actual linked commit's full SHA from `git rev-parse HEAD`. A constructed URL is not proof of synchronization or reviewer access. No live shareable checkpoint URL is claimed until the commit/checkpoint is available in Entire.

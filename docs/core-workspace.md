# Nexus Core workspace

Choose Local project or Website URL, enter the source, and discover existing workflows. Select one to five workflows, generate capabilities, then review each adapter, its proposed tests and the complete diff. Approval calls the existing backend: local mode applies changes on a new branch, builds the site, runs Chromium verification and commits after success; URL mode verifies the adapter against the site and publishes after success. Remote installation remains manual using the resulting snippet.

Results show browser test outcomes/evidence paths and either the Git branch/commit or published adapter URL, integrity hash and installation snippet. Provider/model configuration continues to come from shared Settings. URL discovery requires the configured Agent37 instance; publishing requires the configured adapter publisher.

Each mode retains its own inputs, selections, messages and results while switching modes. The existing backend owns one active discovery/batch: discovering a different source makes the previous catalog stale. The UI preserves that list but asks for rediscovery before generating it. Switching modes or providers is disabled while an operation or pending approval batch is active.

**Clear** resets the displayed mode only, including source, discovery, selections, review, progress, errors and results. Pending batches/catalogs are released through the existing discard IPC before resetting. Clear is disabled during active operations, and late events received outside an active operation are ignored. It does not delete project files, Git branches/commits, published adapters or provider credentials/settings. Discard batch drops the unapproved batch while retaining the source input.

## Controlled verification

```sh
npm run typecheck
npm test
npm run test:core
# GNOME keyring selection if needed:
NEXUS_TEST_PASSWORD_STORE=gnome-libsecret npm run test:core
```

The Core test uses a temporary Git repository, isolated desktop profile, local fixture website, and fixture external API responses. It exercises actual preload/IPC/controller code, file application, Git commit/rollback and native Chromium WebMCP invocation. It checks the five-workflow limit, both modes, approvals, errors, Clear after partial/failed/successful runs, preserved provider configuration and rejection of idle late events. It makes no live inference, hosted Agent37 or publisher calls, and produces no public trace or adapter. An unlocked OS keyring, display, installed Chromium and available local port 4173 are required. Fixture screenshots under `artifacts/` stay ignored.

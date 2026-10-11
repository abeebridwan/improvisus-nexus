# Improvisus Nexus

An Electron desktop personal AI agent for neatHack 2026. The intended product makes websites agent-ready with verified WebMCP capabilities and uses those capabilities to complete tasks with permission, failure recovery, and result verification.

This repository currently contains the desktop foundation only. The two capability descriptions in the shell are plans; no agent execution or WebMCP generation exists yet.

## Development

Use Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
npm start
```

`npm start` opens the last build. `npm test` builds and launches the real Electron app through Playwright, verifies rendering and security settings, and writes `artifacts/desktop-smoke.png`. On Linux without a display, use `xvfb-run -a npm test`. Keep Chromium sandbox support enabled on the host.

`npm run browser:install` downloads Playwright Chromium for future website verification; the desktop smoke test uses Electron's bundled Chromium.

## Structure

```text
src/main/       Electron and Node.js backend
src/preload/    Read-only desktop metadata bridge
src/renderer/   React UI
src/shared/     Bridge types
scripts/        Desktop launch verification
```

The renderer is sandboxed, has no Node.js access, and uses context isolation. The production shell loads local assets through the restricted `nexus://app/` protocol with a Content Security Policy. New windows, page navigation, and browser permissions are denied. The preload exposes only platform and Electron version metadata. Privileged workflow APIs will need specific, validated IPC contracts when implemented.

Build tooling follows [electron-vite conventions](https://electron-vite.org/guide/dev). Security follows the [Electron checklist](https://www.electronjs.org/docs/latest/tutorial/security), and launch checks use [Playwright's Electron API](https://playwright.dev/docs/api/class-electron).

No remote repository has been published or pushed.

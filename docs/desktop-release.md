# Desktop testing releases

Production release work lives on `Desktop/Production/Release`; `main` is not the release deployment branch. Tagged releases build Linux x64 `.deb`, Windows x64 installer and macOS Apple Silicon ZIP, with matching Chromium shipped for Core verification. Installers are testing prereleases; Windows/macOS code signing and macOS notarization are not configured.

Download the installer matching your OS from GitHub Releases. On Debian/Ubuntu:

```sh
sudo apt install ./improvisus-nexus-0.1.1-linux-amd64.deb
improvisus-nexus
```

Launch the application as your normal user. The Linux installer includes the Electron Builder AppArmor/sandbox setup. Do not run Nexus with sudo or disable sandboxing. Configure your OpenAI/OpenRouter key and model in Settings; an unlocked OS keyring is required. Agent execution needs a user-started recent Chrome with WebMCP and a reachable local debugging endpoint. Local Core projects still require Git, Node/npm and compatible website build/dev scripts.

At the builder's explicit request, these four judge integrations are available to the desktop main process: `AGENT37_API_KEY`, `AGENT37_INSTANCE_ID`, `INSTA_ADAPTER_HOST_URL`, `INSTA_PUBLISH_TOKEN`. Their values are stored as encrypted GitHub Actions secrets and injected only into the packaging step. An ignored `.release-resources/judge-integrations.json` is generated during the build and copied into app resources. Values are not tracked in source or printed in build logs. People who download the desktop can extract bundled integration values; rotate/restrict them after judging. No OpenAI/OpenRouter or neatlogs project key is embedded.

Optional local overrides/tracing configuration belong in `nexus.env` under Electron's user-data directory (Linux: `~/.config/Improvisus Nexus/nexus.env`). Keep this file private. No environment file, saved provider credentials, private coding session or checkpoint is packaged. Environment values take precedence over shipped defaults; the local production file can override defaults using Node's env-file precedence.

Build locally with `npm run package`. On a version-tag push, GitHub Actions performs TypeScript and focused tests, packages each OS, uploads installers and SHA256 checksums, and publishes the matching draft as a prerelease. For a new release, first create a draft targeting the production branch, then push the version tag pointing to that branch's commit. A manual workflow run builds downloadable Actions artifacts without publishing a release.

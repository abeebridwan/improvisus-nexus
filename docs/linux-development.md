# Linux desktop setup

Electron 44 downloads its executable on first use, not during `npm ci`. The desktop launch wrapper resolves Electron through its official package entry point before invoking electron-vite. This creates the binary and `path.txt` that electron-vite requires. The first launch can therefore download Electron; subsequent launches reuse it. See [Electron installation](https://www.electronjs.org/docs/latest/tutorial/installation).

## Ubuntu's Chromium sandbox

Ubuntu restricts unprivileged user namespaces through AppArmor. The extracted Electron binary does not automatically receive the distribution's browser profile. If native sandbox setup is unavailable, Chromium can report that `chrome-sandbox` is not root-owned with mode `4755` and abort. The repository uses a per-executable AppArmor permission to allow Chromium's namespace sandbox, following [Ubuntu's documented approach](https://documentation.ubuntu.com/release-notes/24.04/#unprivileged-user-namespace-restrictions).

From this repository, run once on your own terminal:

```sh
npm run setup:linux -- --print
npm run setup:linux
npm run dev
```

The first command prints the exact profile for review. The second validates its syntax, then uses `sudo` to install a root-owned `0644` profile in `/etc/apparmor.d/` and reload that profile. Enter your administrator password only into your own terminal's sudo prompt. It grants `userns` to the resolved Electron executable at this checkout's exact path; it does not alter the system-wide restriction or make a binary setuid. The profile's `unconfined` mode follows Ubuntu's browser profile pattern; this is a user-namespace permission, not a complete AppArmor confinement policy.

The path-specific profile survives `npm ci` at the same location. If you move the checkout or change the Electron executable location, run setup for the new location and retire the old profile if no longer needed. Different existing profile content is not overwritten automatically. Setup is for AppArmor systems with the supported ABI installed; it reports an error elsewhere rather than changing unrelated OS settings.

To undo the profile, use its exact path printed during setup:

```sh
sudo apparmor_parser -R /etc/apparmor.d/<printed-profile-name>
sudo rm /etc/apparmor.d/<printed-profile-name>
```

Both development and preview keep Chromium sandboxing enabled. `npm test` now sets Playwright's `chromiumSandbox: true` and checks that no sandbox-disabling arguments were passed. Earlier smoke runs checked renderer sandbox preferences, but Playwright's default disabled the Chromium sandbox and masked this host-configuration failure.

After setup, verify with `npm run check` and launch the production desktop with `npm start`. The 14 dependency advisories previously reported belong to the SDK dependency tree and are separate from these launch errors; this fix does not use forced dependency upgrades.

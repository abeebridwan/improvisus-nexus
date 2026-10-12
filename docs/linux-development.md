# Linux desktop setup

Electron 44 downloads its executable on first use, not during `npm ci`. The desktop launch wrapper resolves Electron through its official package entry point before invoking electron-vite. This creates the binary and `path.txt` that electron-vite requires. The first launch can therefore download Electron; subsequent launches reuse it. See [Electron installation](https://www.electronjs.org/docs/latest/tutorial/installation).

## Ubuntu's Chromium sandbox

Ubuntu restricts unprivileged user namespaces through AppArmor. The extracted Electron binary does not automatically receive the distribution's browser profile. If native sandbox setup is unavailable, Chromium can report that `chrome-sandbox` is not root-owned with mode `4755` and abort.

Launch scripts automatically set `CHROME_DEVEL_SANDBOX=/opt/google/chrome/chrome-sandbox` when the installed helper is a regular, root-owned, setuid executable without group/world write permissions. This follows [Chromium's documented developer-build approach](https://chromium.googlesource.com/chromium/src/+/main/docs/security/apparmor-userns-restrictions.md). An explicitly supplied `CHROME_DEVEL_SANDBOX` selects the candidate instead of the automatic Chrome path. However, [Chromium's actual helper lookup](https://chromium.googlesource.com/chromium/src/+/main/sandbox/linux/suid/client/setuid_sandbox_host.cc) prefers an adjacent `chrome-sandbox` over that variable. If Electron's adjacent helper is an ordinary file owned by the current user and lacks the required permissions, the launcher preserves it as `chrome-sandbox.nexus-original` and creates a symlink to the verified installed helper. An already valid adjacent helper is preserved. Unsafe replacement or an existing backup causes an error rather than overwriting files.

The same preparation is used by development, production preview, smoke tests and tracing verification. It changes only the local extracted dependency, with no sudo, new setuid permissions or system/kernel changes. After `npm ci` replaces the dependency, the next launch repeats this check. To undo the local link, remove that symlink and rename its `.nexus-original` backup to `chrome-sandbox`, or reinstall dependencies. The AppArmor alternative below can then provide the namespace sandbox.

Run `npm start` or `npm run dev` as your normal user. `sudo npm start` is rejected before building: Electron cannot normally run as root, and root builds leave files that your account cannot replace. If you previously built with sudo, repair generated output from your own terminal:

```sh
sudo chown -R --no-dereference "$(id -u):$(id -g)" out
npm start
```

Enter your administrator password only at your own terminal's sudo prompt. Never launch the application with sudo.

### AppArmor alternative

If the installed Chrome helper is unavailable, the repository also provides a per-executable AppArmor permission for Chromium's namespace sandbox, following [Ubuntu's documented approach](https://documentation.ubuntu.com/release-notes/24.04/#unprivileged-user-namespace-restrictions).

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

Verify with `npm run check` and launch the production desktop with `npm start`. A successful launch in a coding tool's AppArmor context does not prove that a separate terminal has the same namespace permissions; verify the actual user-terminal launch too. The 14 dependency advisories previously reported belong to the SDK dependency tree and are separate from these launch errors; this fix does not use forced dependency upgrades.

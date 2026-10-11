# Browser runner boundary

Playwright is installed. Run `npm run browser:install` to download its matching Chromium when website verification is needed. Future website sessions should use separate temporary browser contexts and remain outside the privileged desktop renderer.

There is no browser task runner yet. The current Playwright script checks the Electron shell only; it does not prove any website workflow works.

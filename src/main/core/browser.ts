import { chromium, type Browser } from "playwright";

export function launchWebMCPBrowser(): Promise<Browser> {
  return chromium.launch({
    headless: false,
    // channel: "chrome-beta", // uncomment only if bundled Chromium lacks WebMCP
    args: ["--enable-features=WebMCP"],
  });
}

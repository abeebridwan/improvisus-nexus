import http from "node:http";
import type { AddressInfo } from "node:net";

import { launchWebMCPBrowser } from "../src/main/core/browser";

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// The probe serves its own test page, so it does not depend on the demo
// store, a running dev server, or a probe.html file existing anywhere.
const PROBE_HTML = `<!doctype html>
<html>
  <head><meta charset="utf-8"><title>WebMCP probe</title></head>
  <body>
    <p id="status">loading</p>
    <script>
      const status = document.getElementById("status");
      const modelContext = document.modelContext;

      if (!modelContext) {
        status.textContent = "document.modelContext is unavailable";
      } else {
        modelContext.registerTool({
          name: "probe_echo",
          description: "Echoes the given text back.",
          inputSchema: {
            type: "object",
            required: ["text"],
            additionalProperties: false,
            properties: { text: { type: "string" } },
          },
          annotations: { readOnlyHint: true },
          execute: async (input) => ({ echo: input.text }),
        });
        status.textContent = "probe ready";
      }
    </script>
  </body>
</html>`;

function startProbeServer(): Promise<http.Server> {
  return new Promise((resolve) => {
    const server = http.createServer((_req, res) => {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(PROBE_HTML);
    });
    // Port 0 = any free port, so it can never clash with 4173.
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

async function main() {
  const server = await startProbeServer();
  const port = (server.address() as AddressInfo).port;
  const url = `http://127.0.0.1:${port}/`;

  console.log("Launching Chrome...");
  const browser = await launchWebMCPBrowser();

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    page.on("console", (m) => console.log("[page console]", m.text()));
    page.on("pageerror", (e) => console.log("[page error]", e.message));

    await page.goto(url, { waitUntil: "domcontentloaded" });

    console.log("Page:", await page.locator("#status").textContent({ timeout: 5000 }));

    const cdp: any = await context.newCDPSession(page);

    const discoveredTools: any[] = [];
    const responses: any[] = [];

    cdp.on("WebMCP.toolsAdded", (event: any) => {
      discoveredTools.push(...(event.tools ?? []));
    });

    cdp.on("WebMCP.toolResponded", (event: any) => {
      responses.push(event);
    });

    await cdp.send("WebMCP.enable");
    await sleep(500);

    console.log(
      "Tools:",
      discoveredTools.map((tool) => tool.name),
    );

    const probe = discoveredTools.find((tool) => tool.name === "probe_echo");

    if (!probe) {
      throw new Error("probe_echo was not discovered");
    }

    const frameTree = await cdp.send("Page.getFrameTree");
    const frameId = frameTree.frameTree.frame.id;

    console.log("Invoking probe_echo...");

    const invocation = await cdp.send("WebMCP.invokeTool", {
      frameId,
      toolName: "probe_echo",
      input: { text: "Core works" },
    });

    const started = Date.now();
    let response: any;

    while (Date.now() - started < 10_000) {
      response = responses.find((item) => item.invocationId === invocation.invocationId);
      if (response) break;
      await sleep(50);
    }

    if (!response) {
      throw new Error("Timed out waiting for WebMCP.toolResponded");
    }

    console.log("Status:", response.status);
    console.log("Output:", response.output);

    if (JSON.stringify(response.output).includes("Core works")) {
      console.log("\nWEBMCP BROWSER PROBE: PASS ✓");
    } else {
      throw new Error("Unexpected tool result");
    }

    await page.waitForTimeout(1500);
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((error) => {
  console.error("\nWEBMCP BROWSER PROBE: FAIL ✗");
  console.error(error);
  process.exit(1);
});

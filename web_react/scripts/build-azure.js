import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const outputServer = path.join(rootDir, ".output", "server", "index.mjs");
const outputPublicHtml = path.join(rootDir, ".output", "public", "index.html");

console.log("🚀 [1/3] Building web_react with Vite (node-server preset)...");
execSync("npx vite build", {
  cwd: rootDir,
  stdio: "inherit",
  env: { ...process.env, NITRO_PRESET: "node-server" },
});

console.log("⚡ [2/3] Pre-rendering static HTML for Azure Storage SPA...");
const TEST_PORT = 3199;
const serverProc = spawn("node", [outputServer], {
  cwd: rootDir,
  env: { ...process.env, PORT: String(TEST_PORT), NITRO_PORT: String(TEST_PORT) },
  stdio: "ignore",
});

function fetchWithRetry(retries = 20, delayMs = 300) {
  return new Promise((resolve, reject) => {
    function attempt(remaining) {
      const req = http.get(`http://localhost:${TEST_PORT}/`, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          if (res.statusCode === 200 && body.length > 500) {
            resolve(body);
          } else {
            retry(remaining);
          }
        });
      });
      req.on("error", () => retry(remaining));
    }

    function retry(remaining) {
      if (remaining <= 0) {
        reject(new Error("Server did not respond in time for pre-render"));
        return;
      }
      setTimeout(() => attempt(remaining - 1), delayMs);
    }

    attempt(retries);
  });
}

try {
  const html = await fetchWithRetry();
  fs.writeFileSync(outputPublicHtml, html, "utf-8");
  console.log(`✅ [3/3] Generated .output/public/index.html (${html.length} bytes)!`);
} finally {
  serverProc.kill("SIGTERM");
}

console.log("🎉 Static bundle ready in .output/public for Azure Storage Static Website!");

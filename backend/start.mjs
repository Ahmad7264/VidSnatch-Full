import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BGUTIL_SERVER = path.join(__dirname, ".bgutil", "server");

const BGUTIL_BUILD = path.join(BGUTIL_SERVER, "build", "main.js");

const PORT = process.env.BGUTIL_PORT || "4416";

function startProcess(command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: "inherit",
    ...options,
  });

  child.on("error", (error) => {
    console.error(`[${command}] error:`, error);
  });

  return child;
}

async function waitForProvider() {
  for (let i = 0; i < 60; i++) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/ping`);

      if (response.ok) {
        const data = await response.json();

        console.log(`bgutil provider ready: v${data.version}`);

        return;
      }
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`bgutil provider did not start on port ${PORT}`);
}

async function main() {
  try {
    if (!fs.existsSync(BGUTIL_BUILD)) {
      throw new Error(`bgutil provider is not built: ${BGUTIL_BUILD}`);
    }

    console.log(`Starting bgutil provider on port ${PORT}...`);

    const provider = startProcess(
      process.execPath,
      [BGUTIL_BUILD, "--port", String(PORT)],
      {
        cwd: BGUTIL_SERVER,
      },
    );

    await waitForProvider();

    console.log("Starting VidSnatch backend...");

    const server = startProcess(
      process.execPath,
      [path.join(__dirname, "server.mjs")],
      {
        cwd: __dirname,
        env: {
          ...process.env,
          BGUTIL_POT_BASE_URL: `http://127.0.0.1:${PORT}`,
        },
      },
    );

    const shutdown = () => {
      console.log("Shutting down VidSnatch...");

      provider.kill("SIGTERM");
      server.kill("SIGTERM");

      setTimeout(() => {
        try {
          provider.kill("SIGKILL");
          server.kill("SIGKILL");
        } catch {}

        process.exit(0);
      }, 5000).unref();
    };

    process.once("SIGTERM", shutdown);
    process.once("SIGINT", shutdown);

    server.on("exit", (code) => {
      try {
        provider.kill("SIGTERM");
      } catch {}

      process.exit(code ?? 0);
    });
  } catch (error) {
    console.error("Startup failed:", error);
    process.exit(1);
  }
}

main();

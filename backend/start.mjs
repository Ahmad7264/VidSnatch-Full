import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BGUTIL_SERVER = path.join(__dirname, ".bgutil", "server");
const BGUTIL_BUILD = path.join(BGUTIL_SERVER, "build", "main.js");
const PREFERRED_PORT = Number(process.env.BGUTIL_PORT || 4416);
let PORT = PREFERRED_PORT;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function isPortAvailable(port) {
  return await new Promise((resolve) => {
    const tester = net.createServer();
    const finish = (value) => { try { tester.close(); } catch {} resolve(value); };
    tester.once("error", () => finish(false));
    tester.once("listening", () => finish(true));
    tester.listen({ host: "127.0.0.1", port });
  });
}

async function providerPing(port, timeout = 1000) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/ping`, {
      signal: AbortSignal.timeout(timeout),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data?.version ? data : null;
  } catch {
    return null;
  }
}

async function chooseProviderPort() {
  const existing = await providerPing(PREFERRED_PORT, 700);
  if (existing) return { port: PREFERRED_PORT, existing };

  for (let port = PREFERRED_PORT; port <= PREFERRED_PORT + 100; port++) {
    if (await isPortAvailable(port)) {
      if (port !== PREFERRED_PORT) {
        console.warn(`Port ${PREFERRED_PORT} is unavailable; using bgutil port ${port} instead.`);
      }
      return { port, existing: null };
    }
  }
  throw new Error(`Could not find a free localhost port for bgutil provider (${PREFERRED_PORT}-${PREFERRED_PORT + 100}).`);
}

function startProcess(command, args, options = {}) {
  const child = spawn(command, args, { stdio: "inherit", ...options });
  child.on("error", (error) => console.error(`[${command}] error:`, error));
  return child;
}

async function runNpm(args, cwd) {
  const isWindows = process.platform === "win32";
  const command = isWindows ? "cmd.exe" : "npm";
  const commandArgs = isWindows ? ["/d", "/s", "/c", "npm " + args.join(" ")] : args;
  return await new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, { cwd, stdio: "inherit", shell: false, windowsHide: false });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolve() : reject(new Error(`npm ${args.join(" ")} exited with code ${code}`)));
  });
}

async function ensureBgutilDependencies() {
  if (!fs.existsSync(path.join(BGUTIL_SERVER, "package.json"))) {
    throw new Error(`bgutil provider package is missing: ${BGUTIL_SERVER}`);
  }
  const nodeModules = path.join(BGUTIL_SERVER, "node_modules");
  const commanderPkg = path.join(nodeModules, "commander", "package.json");
  const expressPkg = path.join(nodeModules, "express", "package.json");
  const axiosPkg = path.join(nodeModules, "axios", "package.json");
  if (fs.existsSync(commanderPkg) && fs.existsSync(expressPkg) && fs.existsSync(axiosPkg)) return;
  console.log("Installing bgutil provider dependencies...");
  await runNpm(["ci", "--omit=dev"], BGUTIL_SERVER);
}

async function waitForProvider(provider, port) {
  let exitInfo = null;
  const onExit = (code, signal) => { exitInfo = `code=${code ?? "unknown"}${signal ? `, signal=${signal}` : ""}`; };
  provider.once("exit", onExit);
  try {
    for (let i = 0; i < 120; i++) {
      const data = await providerPing(port, 1000);
      if (data) {
        console.log(`bgutil provider ready: v${data.version}`);
        return data;
      }
      if (exitInfo) {
        throw new Error(`bgutil provider exited before becoming ready (${exitInfo}).`);
      }
      await sleep(500);
    }
    throw new Error(`bgutil provider did not become reachable at http://127.0.0.1:${port}/ping within 60 seconds.`);
  } finally {
    provider.off("exit", onExit);
  }
}

async function main() {
  let provider = null;
  let server = null;
  let ownsProvider = false;
  try {
    if (!fs.existsSync(BGUTIL_BUILD)) throw new Error(`bgutil provider is not built: ${BGUTIL_BUILD}`);
    await ensureBgutilDependencies();

    const selected = await chooseProviderPort();
    PORT = selected.port;

    if (selected.existing) {
      console.log(`bgutil provider already running on port ${PORT}: v${selected.existing.version}`);
    } else {
      console.log(`Starting bgutil provider on port ${PORT}...`);
      provider = startProcess(process.execPath, [BGUTIL_BUILD, "--port", String(PORT)], { cwd: BGUTIL_SERVER });
      ownsProvider = true;
      await waitForProvider(provider, PORT);
    }

    console.log("Starting VidSnatch backend...");
    server = startProcess(process.execPath, [path.join(__dirname, "server.mjs")], {
      cwd: __dirname,
      env: { ...process.env, BGUTIL_POT_BASE_URL: `http://127.0.0.1:${PORT}` },
    });

    const shutdown = () => {
      try { if (server) server.kill("SIGTERM"); } catch {}
      try { if (ownsProvider && provider) provider.kill("SIGTERM"); } catch {}
      setTimeout(() => process.exit(0), 1200).unref();
    };
    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
    server.on("exit", (code) => {
      try { if (ownsProvider && provider) provider.kill("SIGTERM"); } catch {}
      process.exit(code ?? 0);
    });
  } catch (error) {
    console.error("Startup failed:", error);
    try { if (ownsProvider && provider) provider.kill("SIGTERM"); } catch {}
    try { if (server) server.kill("SIGTERM"); } catch {}
    process.exit(1);
  }
}

main();

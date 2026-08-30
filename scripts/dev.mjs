import { spawn } from "node:child_process";
import process from "node:process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const isWindows = process.platform === "win32";
const children = [];

function start(label, args, cwd) {
  const command = isWindows ? "cmd.exe" : "npm";
  const commandArgs = isWindows
    ? ["/d", "/s", "/c", "npm " + args.map((arg) => {
        // Arguments here are fixed internal npm arguments, not user input.
        return /[\s"]/.test(arg) ? `"${arg.replaceAll('"', '\\"')}"` : arg;
      }).join(" ")]
    : args;

  const child = spawn(command, commandArgs, {
    cwd,
    stdio: "inherit",
    env: process.env,
    shell: false,
    windowsHide: false,
  });

  children.push(child);
  child.on("error", (error) => console.error(`[${label}] failed to start:`, error));
  child.on("exit", (code, signal) => {
    if (signal) console.log(`[${label}] stopped by ${signal}`);
    else if (code !== 0) console.error(`[${label}] exited with code ${code}`);
  });
  return child;
}

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
start("backend", ["start", "--workspace", "backend"], projectRoot);
start("frontend", ["run", "dev", "--workspace", "frontend"], projectRoot);

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    try { child.kill("SIGTERM"); } catch {}
  }
  setTimeout(() => process.exit(0), 800).unref();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

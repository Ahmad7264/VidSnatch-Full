import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";

function extractZip(zipFile, outputDir) {
  const zip = new AdmZip(zipFile);
  zip.extractAllTo(outputDir, true);
}
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const binDir = path.join(root, "backend", "bin");

const target = path.join(binDir, "yt-dlp");

const bgutilDir = path.join(root, "backend", ".bgutil");

const bgutilServer = path.join(bgutilDir, "server");

const bgutilBuild = path.join(bgutilServer, "build", "main.js");

const pluginDir = path.join(
  binDir,
  "yt-dlp-plugins",
  "bgutil-ytdlp-pot-provider",
);

const asset =
  process.arch === "arm64"
    ? "yt-dlp_linux_aarch64"
    : process.arch === "x64"
      ? "yt-dlp_linux"
      : null;

if (!asset) {
  throw new Error(`Unsupported Render CPU architecture: ${process.arch}`);
}

await fs.mkdir(binDir, {
  recursive: true,
});

/* =========================================================
   1. Prepare yt-dlp
========================================================= */

let ytDlpReady = false;

try {
  const stat = await fs.stat(target);

  if (stat.size > 1_000_000) {
    ytDlpReady = true;
    console.log(`yt-dlp already prepared: ${target}`);
  }
} catch {}

if (!ytDlpReady) {
  const url = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${asset}`;

  const temp = `${target}.download`;

  console.log(`Downloading official yt-dlp binary: ${url}`);

  const response = await fetch(url, {
    redirect: "follow",
  });

  if (!response.ok || !response.body) {
    throw new Error(`yt-dlp download failed with HTTP ${response.status}`);
  }

  const reader = response.body.getReader();

  const chunks = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    chunks.push(Buffer.from(value));
    total += value.byteLength;
  }

  await fs.writeFile(temp, Buffer.concat(chunks, total));

  await fs.chmod(temp, 0o755);
  await fs.rename(temp, target);

  console.log(
    `yt-dlp prepared successfully: ${target} ` +
      `(${Math.round(total / 1024 / 1024)} MB)`,
  );
}

/* =========================================================
   2. Download/install bgutil yt-dlp plugin
========================================================= */

const pluginZip =
  "https://github.com/Brainicism/bgutil-ytdlp-pot-provider/releases/download/1.3.1/bgutil-ytdlp-pot-provider.zip";

const pluginTemp = path.join(root, "backend", "bgutil-plugin.zip");

console.log("Installing bgutil yt-dlp plugin...");

await fs.rm(pluginDir, {
  recursive: true,
  force: true,
});

await fs.mkdir(pluginDir, {
  recursive: true,
});

const pluginResponse = await fetch(pluginZip, {
  redirect: "follow",
});

if (!pluginResponse.ok || !pluginResponse.body) {
  throw new Error(
    `bgutil plugin download failed with HTTP ${pluginResponse.status}`,
  );
}

const pluginReader = pluginResponse.body.getReader();

const pluginChunks = [];
let pluginTotal = 0;

while (true) {
  const { done, value } = await pluginReader.read();

  if (done) break;

  pluginChunks.push(Buffer.from(value));

  pluginTotal += value.byteLength;
}

await fs.writeFile(pluginTemp, Buffer.concat(pluginChunks, pluginTotal));

/*
 * Use system unzip if available.
 */
extractZip(pluginTemp, pluginDir);

await fs.rm(pluginTemp, {
  force: true,
});

console.log("bgutil yt-dlp plugin installed.");

/* =========================================================
   3. Prepare bgutil HTTP provider
========================================================= */

if (await exists(bgutilBuild)) {
  console.log("bgutil provider already built.");
} else {
  console.log("Downloading bgutil provider 1.3.1...");

  await fs.rm(bgutilDir, {
    recursive: true,
    force: true,
  });

  await runCommand("git", [
    "clone",
    "--depth",
    "1",
    "--branch",
    "1.3.1",
    "https://github.com/Brainicism/bgutil-ytdlp-pot-provider.git",
    bgutilDir,
  ]);

  console.log("Installing bgutil provider dependencies...");

  await runCommand("npm", ["ci"], {
    cwd: bgutilServer,
  });

  console.log("Compiling bgutil provider...");

  await runCommand("npx", ["tsc"], {
    cwd: bgutilServer,
  });

  console.log("bgutil provider compiled successfully.");
}

console.log("Render preparation completed successfully.");

/* =========================================================
   Helpers
========================================================= */

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const executable =
      process.platform === "win32" && command === "npm" ? "npm.cmd" : command;

    console.log(`Running: ${executable} ${args.join(" ")}`);

    const child = spawn(executable, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
      ...options,
    });

    child.on("error", reject);

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${executable} exited with code ${code}`));
      }
    });
  });
}

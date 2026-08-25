import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const binDir = path.join(root, 'backend', 'bin');
const target = path.join(binDir, 'yt-dlp');

const asset = process.arch === 'arm64' ? 'yt-dlp_linux_aarch64' : process.arch === 'x64' ? 'yt-dlp_linux' : null;
if (!asset) throw new Error(`Unsupported Render CPU architecture: ${process.arch}`);

await fs.mkdir(binDir, { recursive: true });

try {
  const stat = await fs.stat(target);
  if (stat.size > 1_000_000) {
    console.log(`yt-dlp already prepared: ${target}`);
    process.exit(0);
  }
} catch {}

const url = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${asset}`;
const temp = `${target}.download`;
console.log(`Downloading official yt-dlp binary: ${url}`);

const response = await fetch(url, { redirect: 'follow' });
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

await fs.writeFile(temp, Buffer.concat(chunks, total), { mode: 0o755 });
await fs.chmod(temp, 0o755);
await fs.rename(temp, target);
console.log(`yt-dlp prepared successfully: ${target} (${Math.round(total / 1024 / 1024)} MB)`);

import express from "express";
import cors from "cors";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 10000);
const HOST = "0.0.0.0";
const MAX_ACTIVE_JOBS = Number(process.env.MAX_ACTIVE_JOBS || 2);
const JOB_TTL_MS = 15 * 60 * 1000;
const INFO_TIMEOUT_MS = 120 * 1000;
const DOWNLOAD_TIMEOUT_MS = 15 * 60 * 1000;
const DOWNLOAD_DIR = path.join(os.tmpdir(), "vidsnatch-jobs");
const BUNDLED_YTDLP = path.resolve(
  __dirname,
  "bin",
  process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp",
);
const YTDLP_PATH = path.join(
  DOWNLOAD_DIR,
  process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp",
);
const FRONTEND_DIST = path.resolve(__dirname, "../frontend/dist");

const jobs = new Map();
const activeJobs = new Set();
const requestLog = new Map();

await fsp.mkdir(DOWNLOAD_DIR, { recursive: true });

function allowedOrigins() {
  const configured = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

  return new Set([
    "https://vidsnatch.in",
    "https://www.vidsnatch.in",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    ...configured,
  ]);
}

const origins = allowedOrigins();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origins.has(origin)) return callback(null, true);
      return callback(null, false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    exposedHeaders: ["Content-Disposition", "Content-Length"],
  }),
);

app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: true, limit: "32kb" }));

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  next();
});

function rateLimit(maxRequests = 20) {
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || "unknown";
    const recent = (requestLog.get(key) || []).filter(
      (ts) => now - ts < 60_000,
    );
    if (recent.length >= maxRequests) {
      return res
        .status(429)
        .json({ error: "Too many requests. Please try again in a minute." });
    }
    recent.push(now);
    requestLog.set(key, recent);
    next();
  };
}

function isAllowedMediaUrl(rawUrl) {
  try {
    const parsed = new URL(String(rawUrl));
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    return [
      "instagram.com",
      "youtube.com",
      "youtu.be",
      "m.youtube.com",
      "music.youtube.com",
    ].includes(host);
  } catch {
    return false;
  }
}

function isInstagramUrl(rawUrl) {
  try {
    const host = new URL(rawUrl).hostname.toLowerCase().replace(/^www\./, "");
    return host === "instagram.com";
  } catch {
    return false;
  }
}

function isYouTubeUrl(rawUrl) {
  try {
    const host = new URL(rawUrl).hostname.toLowerCase().replace(/^www\./, "");
    return [
      "youtube.com",
      "youtu.be",
      "m.youtube.com",
      "music.youtube.com",
    ].includes(host);
  } catch {
    return false;
  }
}

function safeTitle(raw) {
  return (
    String(raw || "VidSnatch")
      .replace(/[\\/:*?"<>|\u0000-\u001F]/g, "")
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_")
      .slice(0, 100)
      .replace(/^[_\.]+|[_\.]+$/g, "") || "VidSnatch"
  );
}

function sanitizeError(message) {
  const text = String(message || "Unknown error")
    .replace(/\s+/g, " ")
    .trim();
  if (/sign in to confirm|not a bot|confirm you.?re not a bot/i.test(text)) {
    return "YouTube is temporarily blocking this request. Please try another public video or try again later.";
  }
  if (
    /private video|video unavailable|members-only|login required/i.test(text)
  ) {
    return "This video is not publicly downloadable.";
  }
  if (/unsupported url/i.test(text)) {
    return "Please use a valid public Instagram Reel or YouTube video URL.";
  }
  return text.slice(-700);
}

async function commandExists(command, args = ["--version"]) {
  try {
    await execFileAsync(command, args, { timeout: 10_000 });
    return true;
  } catch {
    return false;
  }
}

async function downloadBinary(url, target) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok || !response.body) {
    throw new Error(`yt-dlp download failed (HTTP ${response.status})`);
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
  await fsp.writeFile(target, Buffer.concat(chunks, total), { mode: 0o755 });
}

async function ensureYtDlp() {
  const configured = process.env.YTDLP_PATH;
  if (configured && fs.existsSync(configured)) return;
  if (fs.existsSync(BUNDLED_YTDLP)) return;
  if (fs.existsSync(YTDLP_PATH)) return;

  const asset =
    process.platform === "win32"
      ? "yt-dlp.exe"
      : { x64: "yt-dlp_linux", arm64: "yt-dlp_linux_aarch64" }[process.arch];
  if (!asset)
    throw new Error(`Unsupported CPU architecture for yt-dlp: ${process.arch}`);
  const url = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${asset}`;
  const tempPath = `${YTDLP_PATH}.download`;
  console.log(`Downloading yt-dlp: ${asset}`);
  await downloadBinary(url, tempPath);
  await fsp.chmod(tempPath, 0o755);
  await fsp.rename(tempPath, YTDLP_PATH);
  console.log("yt-dlp download complete");
}

function ytDlpExecutable() {
  return (
    process.env.YTDLP_PATH ||
    (fs.existsSync(BUNDLED_YTDLP) ? BUNDLED_YTDLP : YTDLP_PATH)
  );
}

function baseYtArgs() {
  return [
    "--no-warnings",
    "--no-playlist",
    "--js-runtimes",
    "node",
    "--socket-timeout",
    "30",

    "--extractor-args",
    `youtubepot-bgutilhttp:base_url=${process.env.BGUTIL_POT_BASE_URL || "http://127.0.0.1:4416"}`,
  ];
}

function buildFormatLabel(fmt) {
  const resolution = fmt.height ? `${fmt.height}p` : fmt.resolution || "?";
  const fps = fmt.fps && Number(fmt.fps) > 30 ? `${fmt.fps}fps` : "";
  const ext = fmt.ext ? String(fmt.ext).toUpperCase() : "";
  const note = fmt.format_note || "";
  const sizeBytes = fmt.filesize || fmt.filesize_approx || 0;
  const size = sizeBytes ? `~${(sizeBytes / 1048576).toFixed(1)} MB` : "";
  return [resolution, fps, note, ext, size].filter(Boolean).join(" · ");
}

function normalizeInfo(info, type) {
  if (type === "instagram") {
    const videoFmt = (info.formats || [])
      .filter(
        (f) =>
          f.vcodec && f.vcodec !== "none" && f.acodec && f.acodec !== "none",
      )
      .sort((a, b) => (b.height || 0) - (a.height || 0))[0];

    return {
      title: info.title || info.description || "Instagram Reel",
      duration: info.duration,
      resolution: videoFmt
        ? `${videoFmt.width || "?"}×${videoFmt.height || "?"}`
        : "HD",
      thumbnail: info.thumbnail || "",
      videoUrl: videoFmt?.url || info.url || "",
      audioUrl: videoFmt?.url || info.url || "",
    };
  }

  const allFormats = info.formats || [];
  const byHeight = new Map();

  for (const fmt of allFormats) {
    if (!fmt.vcodec || fmt.vcodec === "none" || !fmt.height) continue;
    const key = String(fmt.height);
    const previous = byHeight.get(key);
    if (!previous) {
      byHeight.set(key, fmt);
      continue;
    }

    const currentMuxed = fmt.acodec && fmt.acodec !== "none";
    const previousMuxed = previous.acodec && previous.acodec !== "none";
    const currentSize = fmt.filesize || fmt.filesize_approx || 0;
    const previousSize = previous.filesize || previous.filesize_approx || 0;

    if (
      (!previousMuxed && currentMuxed) ||
      (previousMuxed === currentMuxed && currentSize > previousSize)
    ) {
      byHeight.set(key, fmt);
    }
  }

  const sortedVideoFmts = [...byHeight.values()].sort(
    (a, b) => (b.height || 0) - (a.height || 0),
  );
  const audioFmt = allFormats
    .filter(
      (f) =>
        f.acodec && f.acodec !== "none" && (!f.vcodec || f.vcodec === "none"),
    )
    .sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];

  return {
    title: info.title || "YouTube Video",
    duration: info.duration,
    thumbnail: info.thumbnail || "",
    uploader: info.uploader || info.channel || "",
    viewCount: info.view_count,
    audioFormatId: audioFmt?.format_id || "bestaudio",
    formats: sortedVideoFmts.map((f) => ({
      formatId: String(f.format_id),
      resolution: `${f.height}p`,
      label: buildFormatLabel(f),
      isMuxed: !!(f.acodec && f.acodec !== "none"),
    })),
  };
}

async function getInfo(url, type) {
  const args = [
    ...baseYtArgs(),
    "--dump-single-json",
    "--skip-download",
    "--no-check-certificates",
    "--",
    url,
  ];

  const { stdout, stderr } = await execFileAsync(ytDlpExecutable(), args, {
    maxBuffer: 50 * 1024 * 1024,
    timeout: INFO_TIMEOUT_MS,
    windowsHide: true,
  });

  if (!stdout.trim())
    throw new Error(stderr || "No media information returned");
  return normalizeInfo(JSON.parse(stdout.trim()), type);
}

function jobPublic(job) {
  return {
    jobId: job.id,
    status: job.status,
    progress: Math.round(job.progress || 0),
    stage: job.stage,
    filename: job.filename || undefined,
    error: job.error || undefined,
  };
}

function setJob(job, patch) {
  Object.assign(job, patch, { updatedAt: Date.now() });
}

function parseProgress(line) {
  const clean = line.replace(/\x1B\[[0-?]*[ -\/]*[@-~]/g, "");
  const match = clean.match(/\[download\]\s+(\d+(?:\.\d+)?)%/i);
  return match ? Number(match[1]) : null;
}

async function findFinalFile(prefix) {
  const entries = await fsp.readdir(DOWNLOAD_DIR);
  const files = [];
  for (const name of entries) {
    if (
      !name.startsWith(prefix) ||
      name.endsWith(".part") ||
      name.endsWith(".ytdl")
    )
      continue;
    const filePath = path.join(DOWNLOAD_DIR, name);
    try {
      const stat = await fsp.stat(filePath);
      if (stat.isFile() && stat.size > 0)
        files.push({ filePath, size: stat.size });
    } catch {}
  }
  files.sort((a, b) => b.size - a.size);
  return files[0]?.filePath || null;
}

async function cleanupJobFiles(job) {
  if (!job?.prefix) return;
  const entries = await fsp.readdir(DOWNLOAD_DIR).catch(() => []);
  await Promise.all(
    entries
      .filter((name) => name.startsWith(job.prefix))
      .map((name) =>
        fsp.rm(path.join(DOWNLOAD_DIR, name), { force: true }).catch(() => {}),
      ),
  );
}

function startYtDlpJob(job, params) {
  const prefix = `job-${job.id}`;
  job.prefix = prefix;
  const outputTemplate = path.join(DOWNLOAD_DIR, `${prefix}.%(ext)s`);
  const isAudio = params.mediaType === "audio";

  const args = [
    ...baseYtArgs(),
    "--newline",
    "--progress",
    "--concurrent-fragments",
    "8",
    "--buffer-size",
    "1M",
    "--http-chunk-size",
    "10M",
    "--retries",
    "5",
    "--fragment-retries",
    "5",
    "--file-access-retries",
    "3",
    "-o",
    outputTemplate,
  ];

  if (isAudio) {
    args.push(
      "-f",
      "bestaudio/best",
      "-x",
      "--audio-format",
      "mp3",
      "--audio-quality",
      "0",
    );
  } else if (params.formatId) {
    const formatId = String(params.formatId).replace(/[^\w.+-]/g, "");
    args.push(
      "-f",
      `${formatId}+bestaudio/best`,
      "--merge-output-format",
      "mp4",
    );
  } else {
    args.push("-f", "bestvideo+bestaudio/best", "--merge-output-format", "mp4");
  }

  args.push("--", params.url);

  setJob(job, {
    status: "downloading",
    stage: "Downloading...",
    progress: 0,
    startedAt: Date.now(),
  });

  const child = spawn(ytDlpExecutable(), args, {
    cwd: DOWNLOAD_DIR,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  job.process = child;

  let stderrBuffer = "";
  let stdoutBuffer = "";
  let settled = false;

  const timeout = setTimeout(() => {
    if (!child.killed) child.kill("SIGTERM");
    setJob(job, {
      status: "error",
      error:
        "Download timed out. Please try a smaller video or try again later.",
    });
  }, DOWNLOAD_TIMEOUT_MS);

  const handleLine = (line) => {
    const clean = line.trim();
    if (!clean) return;
    const progress = parseProgress(clean);
    if (progress !== null)
      setJob(job, {
        progress,
        stage: progress >= 100 ? "Processing..." : "Downloading...",
      });
    if (/\[Merger\]|Merging formats/i.test(clean))
      setJob(job, {
        status: "merging",
        stage: "Merging video + audio...",
        progress: Math.max(job.progress || 0, 99),
      });
    if (/\[ExtractAudio\]|Deleting original file/i.test(clean))
      setJob(job, {
        status: "processing",
        stage: "Finalizing file...",
        progress: 99,
      });
    if (/Destination:/i.test(clean)) setJob(job, { stage: "Downloading..." });
  };

  child.stdout.on("data", (chunk) => {
    stdoutBuffer += chunk.toString();
    const lines = stdoutBuffer.split(/\r?\n|\r/);
    stdoutBuffer = lines.pop() || "";
    lines.forEach(handleLine);
  });

  child.stderr.on("data", (chunk) => {
    stderrBuffer += chunk.toString();
    const lines = stderrBuffer.split(/\r?\n|\r/);
    stderrBuffer = lines.pop() || "";
    lines.forEach(handleLine);
  });

  child.on("error", (err) => {
    if (settled) return;
    settled = true;
    clearTimeout(timeout);
    setJob(job, { status: "error", error: sanitizeError(err.message) });
    activeJobs.delete(job.id);
  });

  child.on("close", async (code) => {
    if (settled) return;
    settled = true;
    clearTimeout(timeout);

    if (code !== 0) {
      const diagnostic = `${stderrBuffer}\n${stdoutBuffer}`.trim();
      setJob(job, {
        status: "error",
        error: sanitizeError(diagnostic || `yt-dlp exited with code ${code}`),
      });
      activeJobs.delete(job.id);
      await cleanupJobFiles(job);
      return;
    }

    try {
      setJob(job, {
        status: "processing",
        stage: "Finalizing file...",
        progress: 99,
      });
      const outFile = await findFinalFile(prefix);
      if (!outFile)
        throw new Error("Downloaded file was not produced by yt-dlp.");

      const stat = await fsp.stat(outFile);
      if (!stat.isFile() || stat.size <= 0)
        throw new Error("Downloaded file is empty.");

      const extension = isAudio ? "mp3" : "mp4";
      const filename = `VidSnatch_${safeTitle(params.videoTitle)}.${extension}`;
      const finalPath = path.join(DOWNLOAD_DIR, `${prefix}-final.${extension}`);
      await fsp.rename(outFile, finalPath);

      setJob(job, {
        status: "ready",
        stage: "Ready",
        progress: 100,
        filePath: finalPath,
        filename,
        size: stat.size,
        expiresAt: Date.now() + JOB_TTL_MS,
      });
      activeJobs.delete(job.id);
    } catch (err) {
      setJob(job, { status: "error", error: sanitizeError(err.message) });
      activeJobs.delete(job.id);
      await cleanupJobFiles(job);
    }
  });
}

app.get("/healthz", async (req, res) => {
  let ytDlpReady = false;
  try {
    await ensureYtDlp();
    ytDlpReady = await commandExists(ytDlpExecutable());
  } catch {}
  res.json({
    ok: true,
    service: "vidsnatch-backend",
    ytDlpReady,
    ffmpegAvailable: await commandExists("ffmpeg", ["-version"]),
    activeJobs: activeJobs.size,
    time: new Date().toISOString(),
  });
});

app.post("/api/info", rateLimit(20), async (req, res) => {
  const { url, type } = req.body || {};

  if (!url || !isAllowedMediaUrl(url)) {
    return res
      .status(400)
      .json({ error: "Please use a valid public Instagram or YouTube URL." });
  }
  if (type === "instagram" && !isInstagramUrl(url)) {
    return res.status(400).json({ error: "Please use an Instagram Reel URL." });
  }
  if (type === "youtube" && !isYouTubeUrl(url)) {
    return res.status(400).json({ error: "Please use a YouTube URL." });
  }

  try {
    await ensureYtDlp();
    const data = await getInfo(url, type);
    return res.json(data);
  } catch (err) {
    console.error("[api/info]", err);
    return res
      .status(500)
      .json({ error: sanitizeError(err.stderr || err.message) });
  }
});

app.post("/api/download/start", rateLimit(5), async (req, res) => {
  const { url, type, mediaType, formatId, videoTitle } = req.body || {};

  if (!url || !isAllowedMediaUrl(url))
    return res.status(400).json({ error: "Unsupported or invalid media URL." });
  if (!["video", "audio"].includes(mediaType))
    return res.status(400).json({ error: "Invalid media type." });
  if (type === "instagram" && !isInstagramUrl(url))
    return res.status(400).json({ error: "Please use an Instagram URL." });
  if (type === "youtube" && !isYouTubeUrl(url))
    return res.status(400).json({ error: "Please use a YouTube URL." });
  if (activeJobs.size >= MAX_ACTIVE_JOBS)
    return res
      .status(429)
      .json({ error: "The downloader is busy. Please try again in a moment." });

  try {
    await ensureYtDlp();
  } catch (err) {
    return res.status(503).json({ error: sanitizeError(err.message) });
  }

  const id = crypto.randomUUID().replaceAll("-", "");
  const job = {
    id,
    status: "queued",
    progress: 0,
    stage: "Preparing download...",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    expiresAt: Date.now() + JOB_TTL_MS,
    process: null,
    filePath: null,
    filename: null,
    error: null,
  };

  jobs.set(id, job);
  activeJobs.add(id);
  startYtDlpJob(job, { url, type, mediaType, formatId, videoTitle });

  return res.status(202).json({ jobId: id, status: "queued" });
});

app.get("/api/download/status/:jobId", rateLimit(60), (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job)
    return res
      .status(404)
      .json({ error: "Download job not found or expired." });
  if (
    job.expiresAt < Date.now() &&
    job.status !== "downloading" &&
    job.status !== "processing" &&
    job.status !== "merging"
  ) {
    return res.status(404).json({ error: "Download job expired." });
  }
  return res.json(jobPublic(job));
});

app.get("/api/download/file/:jobId", async (req, res) => {
  const job = jobs.get(req.params.jobId);

  if (!job || job.status !== "ready" || !job.filePath) {
    return res
      .status(404)
      .json({ error: "Download file is not ready or has expired." });
  }

  try {
    const stat = await fsp.stat(job.filePath);

    if (!stat.isFile() || stat.size <= 0) {
      throw new Error("File is missing or empty.");
    }

    res.setHeader(
      "Content-Type",
      job.filename.endsWith(".mp3") ? "audio/mpeg" : "video/mp4",
    );

    res.setHeader("Content-Length", stat.size);
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${job.filename.replace(/"/g, "_")}"; filename*=UTF-8''${encodeURIComponent(job.filename)}`,
    );

    res.setHeader("X-Content-Type-Options", "nosniff");

    const stream = fs.createReadStream(job.filePath);

    stream.on("error", (err) => {
      console.error("[api/download/file]", err);

      if (!res.headersSent) {
        res.status(500).json({
          error: "Could not read the download file.",
        });
      } else {
        res.destroy(err);
      }
    });

    stream.on("close", () => {
      if (job.filePath) {
        fsp.rm(job.filePath, { force: true }).catch(() => {});
      }

      jobs.delete(job.id);
    });

    stream.pipe(res);
  } catch (err) {
    jobs.delete(job.id);
    await cleanupJobFiles(job);

    return res
      .status(404)
      .json({ error: "Download file is no longer available." });
  }
});

// Serve the Vite build when this repository is deployed as a single Render web service.
if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST, { extensions: ["html"] }));
  app.get(/^\/(?!api(?:\/|$)|healthz$).*/, (req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, "index.html"));
  });
}

app.use((err, req, res, next) => {
  console.error("[server]", err);
  if (res.headersSent) return next(err);
  return res.status(500).json({ error: "Internal server error." });
});

// Remove expired files/jobs so Render's ephemeral disk cannot fill up.
setInterval(async () => {
  const now = Date.now();
  for (const [id, job] of jobs) {
    const running = ["queued", "downloading", "merging", "processing"].includes(
      job.status,
    );
    if (!running && job.expiresAt <= now) {
      await cleanupJobFiles(job);
      jobs.delete(id);
    }
  }

  for (const [ip, timestamps] of requestLog) {
    const fresh = timestamps.filter((ts) => now - ts < 60_000);
    if (fresh.length) requestLog.set(ip, fresh);
    else requestLog.delete(ip);
  }
}, 60_000).unref();

const server = app.listen(PORT, HOST, () => {
  console.log(`VidSnatch backend listening on http://${HOST}:${PORT}`);
  console.log(`Frontend dist: ${FRONTEND_DIST}`);
});

server.requestTimeout = 0;
server.headersTimeout = 120_000;

process.on("SIGTERM", () => server.close(() => process.exit(0)));
process.on("SIGINT", () => server.close(() => process.exit(0)));

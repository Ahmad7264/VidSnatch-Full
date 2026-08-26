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

/*
 * Metadata extraction timeout.
 * 60 seconds is enough while avoiding very long hanging requests.
 */
const INFO_TIMEOUT_MS = 7 * 1000;

/*
 * Cache metadata for 5 minutes.
 * Repeating the same URL will not call yt-dlp again.
 */
const INFO_CACHE_TTL_MS = 5 * 60 * 1000;

const DOWNLOAD_TIMEOUT_MS = 15 * 60 * 1000;

const DOWNLOAD_DIR = path.join(os.tmpdir(), "vidsnatch-jobs");

/*
 * yt-dlp executable:
 * Windows -> yt-dlp.exe
 * Linux/Render -> yt-dlp
 */
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

/*
 * Metadata cache.
 *
 * key:
 * type:url
 *
 * value:
 * {
 *   data,
 *   expiresAt
 * }
 */
const infoCache = new Map();

/*
 * Prevent duplicate yt-dlp processes.
 *
 * If 2 requests for the same URL arrive together,
 * only ONE yt-dlp process is started.
 */
const infoInFlight = new Map();

await fsp.mkdir(DOWNLOAD_DIR, {
  recursive: true,
});

/* =========================================================
   CORS
   ========================================================= */

function allowedOrigins() {
  const configured = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

  return new Set([
    "https://vidsnatch.fun",
    "https://www.vidsnatch.fun",

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
      if (!origin || origins.has(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },

    methods: ["GET", "POST", "OPTIONS"],

    allowedHeaders: ["Content-Type"],

    exposedHeaders: [
      "Content-Disposition",
      "Content-Length",
      "Content-Range",
      "Accept-Ranges",
    ],
  }),
);

app.use(
  express.json({
    limit: "32kb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "32kb",
  }),
);

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

/* =========================================================
   RATE LIMIT
   ========================================================= */

function rateLimit(maxRequests = 20) {
  return (req, res, next) => {
    const now = Date.now();

    const key = req.ip || "unknown";

    const recent = (requestLog.get(key) || []).filter(
      (ts) => now - ts < 60_000,
    );

    if (recent.length >= maxRequests) {
      return res.status(429).json({
        error: "Too many requests. Please try again in a minute.",
      });
    }

    recent.push(now);

    requestLog.set(key, recent);

    next();
  };
}

/* =========================================================
   URL VALIDATION
   ========================================================= */

function isAllowedMediaUrl(rawUrl) {
  try {
    const parsed = new URL(String(rawUrl));

    if (parsed.protocol !== "https:") {
      return false;
    }

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

/* =========================================================
   HELPERS
   ========================================================= */

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
    await execFileAsync(command, args, {
      timeout: 10_000,
    });

    return true;
  } catch {
    return false;
  }
}

/* =========================================================
   YT-DLP DOWNLOAD
   ========================================================= */

async function downloadBinary(url, target) {
  const response = await fetch(url, {
    redirect: "follow",
  });

  if (!response.ok || !response.body) {
    throw new Error(`yt-dlp download failed (HTTP ${response.status})`);
  }

  const reader = response.body.getReader();

  const chunks = [];

  let total = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    chunks.push(Buffer.from(value));

    total += value.byteLength;
  }

  await fsp.writeFile(target, Buffer.concat(chunks, total), {
    mode: 0o755,
  });
}

/* =========================================================
   ENSURE YT-DLP
   ========================================================= */

async function ensureYtDlp() {
  const configured = process.env.YTDLP_PATH;

  if (configured && fs.existsSync(configured)) {
    return;
  }

  if (fs.existsSync(BUNDLED_YTDLP)) {
    return;
  }

  if (fs.existsSync(YTDLP_PATH)) {
    return;
  }

  const asset =
    process.platform === "win32"
      ? "yt-dlp.exe"
      : {
          x64: "yt-dlp_linux",
          arm64: "yt-dlp_linux_aarch64",
        }[process.arch];

  if (!asset) {
    throw new Error(`Unsupported CPU architecture for yt-dlp: ${process.arch}`);
  }

  const url = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${asset}`;

  const tempPath = `${YTDLP_PATH}.download`;

  console.log(`Downloading yt-dlp: ${asset}`);

  await downloadBinary(url, tempPath);

  await fsp.chmod(tempPath, 0o755);

  await fsp.rename(tempPath, YTDLP_PATH);

  console.log("yt-dlp download complete");
}

/* =========================================================
   YT-DLP EXECUTABLE
   ========================================================= */

function ytDlpExecutable() {
  return (
    process.env.YTDLP_PATH ||
    (fs.existsSync(BUNDLED_YTDLP) ? BUNDLED_YTDLP : YTDLP_PATH)
  );
}

/* =========================================================
   YOUTUBE COOKIES
   ========================================================= */

let youtubeCookiesPath = null;

async function prepareYouTubeCookies() {
  const cookieData = process.env.YOUTUBE_COOKIES;

  if (!cookieData || !cookieData.trim()) {
    console.log("YouTube cookies not configured.");

    return null;
  }

  const cookiePath = path.join(os.tmpdir(), "vidsnatch-youtube-cookies.txt");

  await fsp.writeFile(cookiePath, cookieData, {
    encoding: "utf8",

    mode: 0o600,
  });

  console.log("YouTube cookies file prepared.");

  return cookiePath;
}

/* =========================================================
   TYPE-SPECIFIC YT-DLP ARGUMENTS
   ========================================================= */

function baseYtArgs(type = "youtube") {
  /*
   * Common lightweight arguments.
   */
  const args = ["--no-warnings", "--no-playlist", "--socket-timeout", "6"];

  /*
   * ONLY YOUTUBE:
   *
   * JS runtime
   * POT provider
   * cookies
   *
   * Instagram does NOT receive these.
   */
  if (type === "youtube") {
    args.push(
      "--js-runtimes",
      "node",

      "--extractor-args",

      `youtubepot-bgutilhttp:base_url=${
        process.env.BGUTIL_POT_BASE_URL || "http://127.0.0.1:4416"
      }`,
    );

    if (youtubeCookiesPath && fs.existsSync(youtubeCookiesPath)) {
      args.push("--cookies", youtubeCookiesPath);
    }
  }

  return args;
}

/* =========================================================
   FORMAT HELPERS
   ========================================================= */

function buildFormatLabel(fmt) {
  const resolution = fmt.height ? `${fmt.height}p` : fmt.resolution || "?";

  const fps = fmt.fps && Number(fmt.fps) > 30 ? `${fmt.fps}fps` : "";

  const ext = fmt.ext ? String(fmt.ext).toUpperCase() : "";

  const note = fmt.format_note || "";

  const sizeBytes = fmt.filesize || fmt.filesize_approx || 0;

  const size = sizeBytes ? `~${(sizeBytes / 1048576).toFixed(1)} MB` : "";

  return [resolution, fps, note, ext, size].filter(Boolean).join(" · ");
}

/* =========================================================
   NORMALIZE INFO
   ========================================================= */

function normalizeInfo(info, type) {
  /*
   * =======================================================
   * INSTAGRAM
   * =======================================================
   *
   * Only video.
   *
   * No audio download.
   *
   * Thumbnail returned to frontend.
   */
  if (type === "instagram") {
    const formats = info.formats || [];

    const videoFmt = formats
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

      /*
       * Used by frontend if it wants
       * to show a preview.
       */
      videoUrl: videoFmt?.url || info.url || "",

      /*
       * Instagram is video-only.
       */
      audioUrl: "",
    };
  }

  /*
   * =======================================================
   * YOUTUBE
   * =======================================================
   *
   * Maximum 1440p / 2K.
   */

  const allFormats = info.formats || [];

  const byHeight = new Map();

  for (const fmt of allFormats) {
    if (!fmt.vcodec || fmt.vcodec === "none" || !fmt.height) {
      continue;
    }

    /*
     * HARD 2K LIMIT.
     *
     * 2160p / 4K and above are ignored.
     */
    if (Number(fmt.height) > 1440) {
      continue;
    }

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

/* =========================================================
   GET VIDEO INFO
   ========================================================= */

async function getInfo(url, type) {
  const startedAt = Date.now();

  /*
   * Keep Instagram lightweight:
   * - no YouTube JS runtime
   * - no POT
   * - no cookies
   *
   * YouTube:
   * - JS runtime
   * - POT
   * - cookies
   *
   * IMPORTANT:
   * This timeout only limits metadata fetching.
   * It does NOT limit the actual download job.
   */

  const args = [
    ...baseYtArgs(type),

    "--dump-single-json",
    "--skip-download",
    "--no-check-certificates",
  ];

  /*
   * Instagram:
   *
   * We only need one playable video format.
   * Do not ask yt-dlp to process unnecessary
   * separate video/audio combinations.
   */
  if (type === "instagram") {
    args.push("-f", "best");
  }

  /*
   * YouTube:
   *
   * We only need formats up to 1440p.
   * This prevents 4K/8K formats from being
   * considered by our normalization code.
   *
   * yt-dlp still returns metadata, but our
   * normalized response exposes only <= 1440p.
   */
  args.push("--", url);

  console.log(`[getInfo] START type=${type}`);

  try {
    const { stdout, stderr } = await execFileAsync(ytDlpExecutable(), args, {
      maxBuffer: 50 * 1024 * 1024,

      /*
       * HARD 7 SECOND FETCH LIMIT.
       */
      timeout: INFO_TIMEOUT_MS,

      windowsHide: true,
    });

    const elapsed = Date.now() - startedAt;

    console.log(`[getInfo] yt-dlp finished type=${type} time=${elapsed}ms`);

    if (!stdout.trim()) {
      throw new Error(stderr || "No media information returned");
    }

    const parsed = JSON.parse(stdout.trim());

    const normalized = normalizeInfo(parsed, type);

    return normalized;
  } catch (err) {
    const elapsed = Date.now() - startedAt;

    /*
     * Abort/timeout gets a clean message instead
     * of exposing a huge yt-dlp stack trace.
     */
    if (
      err?.code === "ETIMEDOUT" ||
      /timed out/i.test(String(err?.message || ""))
    ) {
      throw new Error(
        `Fetching ${type === "instagram" ? "Instagram" : "YouTube"} information timed out after 7 seconds. Please try again.`,
      );
    }

    console.error(`[getInfo] FAILED type=${type} time=${elapsed}ms`, err);

    throw err;
  }
}

/* =========================================================
   JOB HELPERS
   ========================================================= */

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
  Object.assign(job, patch, {
    updatedAt: Date.now(),
  });
}

function parseProgress(line) {
  const clean = line.replace(/\x1B\[[0-?]*[ -\/]*[@-~]/g, "");

  const match = clean.match(/\[download\]\s+(\d+(?:\.\d+)?)%/i);

  return match ? Number(match[1]) : null;
}

/* =========================================================
   FILE HELPERS
   ========================================================= */

async function findFinalFile(prefix) {
  const entries = await fsp.readdir(DOWNLOAD_DIR);

  const files = [];

  for (const name of entries) {
    if (
      !name.startsWith(prefix) ||
      name.endsWith(".part") ||
      name.endsWith(".ytdl")
    ) {
      continue;
    }

    const filePath = path.join(DOWNLOAD_DIR, name);

    try {
      const stat = await fsp.stat(filePath);

      if (stat.isFile() && stat.size > 0) {
        files.push({
          filePath,
          size: stat.size,
        });
      }
    } catch {}
  }

  files.sort((a, b) => b.size - a.size);

  return files[0]?.filePath || null;
}

async function cleanupJobFiles(job) {
  if (!job?.prefix) {
    return;
  }

  const entries = await fsp.readdir(DOWNLOAD_DIR).catch(() => []);

  await Promise.all(
    entries
      .filter((name) => name.startsWith(job.prefix))
      .map((name) =>
        fsp
          .rm(path.join(DOWNLOAD_DIR, name), {
            force: true,
          })
          .catch(() => {}),
      ),
  );
}

/* =========================================================
   START DOWNLOAD JOB
   ========================================================= */

function startYtDlpJob(job, params) {
  const prefix = `job-${job.id}`;

  job.prefix = prefix;

  const outputTemplate = path.join(DOWNLOAD_DIR, `${prefix}.%(ext)s`);

  const isAudio = params.mediaType === "audio";

  /*
   * Instagram:
   * video only.
   */
  if (params.type === "instagram" && isAudio) {
    setJob(job, {
      status: "error",

      error: "Instagram downloads are video-only.",
    });

    activeJobs.delete(job.id);

    return;
  }

  const args = [
    ...baseYtArgs(params.type),

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

  /*
   * AUDIO
   *
   * YouTube audio only.
   */
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
  } else if (params.type === "instagram") {
    /*
     * INSTAGRAM VIDEO
     *
     * Best ready-to-play video.
     */
    args.push("-f", "best");
  } else if (params.formatId) {
    /*
     * YOUTUBE SELECTED FORMAT
     *
     * Frontend should only provide
     * formats <= 1440p.
     */
    const formatId = String(params.formatId).replace(/[^\w.+-]/g, "");

    args.push(
      "-f",
      `${formatId}+bestaudio/best`,

      "--merge-output-format",
      "mp4",
    );
  } else {
    /*
     * YOUTUBE DEFAULT
     *
     * HARD 1440p / 2K LIMIT.
     */
    args.push(
      "-f",
      "bestvideo[height<=1440]+bestaudio/best[height<=1440]/best[height<=1440]",

      "--merge-output-format",
      "mp4",
    );
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
    if (!child.killed) {
      child.kill("SIGTERM");
    }

    setJob(job, {
      status: "error",

      error:
        "Download timed out. Please try a smaller video or try again later.",
    });
  }, DOWNLOAD_TIMEOUT_MS);

  const handleLine = (line) => {
    const clean = line.trim();

    if (!clean) {
      return;
    }

    const progress = parseProgress(clean);

    if (progress !== null) {
      setJob(job, {
        progress,

        stage: progress >= 100 ? "Processing..." : "Downloading...",
      });
    }

    if (/\[Merger\]|Merging formats/i.test(clean)) {
      setJob(job, {
        status: "merging",

        stage: "Merging video + audio...",

        progress: Math.max(job.progress || 0, 99),
      });
    }

    if (/\[ExtractAudio\]|Deleting original file/i.test(clean)) {
      setJob(job, {
        status: "processing",

        stage: "Finalizing file...",

        progress: 99,
      });
    }

    if (/Destination:/i.test(clean)) {
      setJob(job, {
        stage: "Downloading...",
      });
    }
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
    if (settled) {
      return;
    }

    settled = true;

    clearTimeout(timeout);

    setJob(job, {
      status: "error",

      error: sanitizeError(err.message),
    });

    activeJobs.delete(job.id);
  });

  child.on("close", async (code) => {
    if (settled) {
      return;
    }

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

      if (!outFile) {
        throw new Error("Downloaded file was not produced by yt-dlp.");
      }

      const stat = await fsp.stat(outFile);

      if (!stat.isFile() || stat.size <= 0) {
        throw new Error("Downloaded file is empty.");
      }

      /*
       * Preserve the actual extension.
       *
       * Audio is always MP3.
       * Video keeps its real extension.
       */
      const actualExtension = path
        .extname(outFile)
        .replace(".", "")
        .toLowerCase();

      const extension = isAudio ? "mp3" : actualExtension || "mp4";

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
      setJob(job, {
        status: "error",

        error: sanitizeError(err.message),
      });

      activeJobs.delete(job.id);

      await cleanupJobFiles(job);
    }
  });
}

/* =========================================================
   HEALTH
   ========================================================= */

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

/* =========================================================
   VIDEO INFO API
   ========================================================= */

app.post("/api/info", rateLimit(20), async (req, res) => {
  const { url, type } = req.body || {};

  if (!url || !isAllowedMediaUrl(url)) {
    return res.status(400).json({
      error: "Please use a valid public Instagram or YouTube URL.",
    });
  }

  if (type === "instagram" && !isInstagramUrl(url)) {
    return res.status(400).json({
      error: "Please use an Instagram Reel URL.",
    });
  }

  if (type === "youtube" && !isYouTubeUrl(url)) {
    return res.status(400).json({
      error: "Please use a YouTube URL.",
    });
  }

  const requestStart = Date.now();

  const cacheKey = `${type}:${String(url).trim()}`;

  console.log(`[api/info] START type=${type} url=${url}`);

  /*
   * =====================================================
   * CACHE HIT
   * =====================================================
   */
  const cached = infoCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    console.log(`[api/info] CACHE HIT: ${Date.now() - requestStart}ms`);

    return res.json(cached.data);
  }

  /*
   * Delete expired cache entry.
   */
  if (cached) {
    infoCache.delete(cacheKey);
  }

  /*
   * =====================================================
   * IN-FLIGHT REQUEST
   * =====================================================
   *
   * If another request for the same URL is already
   * extracting, wait for that exact promise.
   */
  let infoPromise = infoInFlight.get(cacheKey);

  if (infoPromise) {
    console.log("[api/info] Waiting for existing extraction");
  }

  try {
    /*
     * yt-dlp itself should already be prepared by
     * Render startup. This check is effectively instant.
     */
    const ytDlpStart = Date.now();

    await ensureYtDlp();

    console.log(`[api/info] ensureYtDlp: ${Date.now() - ytDlpStart}ms`);

    /*
     * Start extraction only if there isn't already
     * one running for this URL.
     */
    if (!infoPromise) {
      infoPromise = getInfo(url, type);

      infoInFlight.set(cacheKey, infoPromise);
    }

    const data = await infoPromise;

    /*
     * Save successful metadata.
     */
    infoCache.set(cacheKey, {
      data,

      expiresAt: Date.now() + INFO_CACHE_TTL_MS,
    });

    console.log(`[api/info] TOTAL: ${Date.now() - requestStart}ms`);

    return res.json(data);
  } catch (err) {
    console.error(
      `[api/info] FAILED after ${Date.now() - requestStart}ms`,
      err,
    );

    const message = sanitizeError(err.stderr || err.message);

    const isTimeout = /timed out after 7 seconds/i.test(message);

    return res.status(isTimeout ? 504 : 500).json({
      error: message,
    });
  } finally {
    /*
     * Only delete if this request owns
     * the current in-flight promise.
     */
    if (infoInFlight.get(cacheKey) === infoPromise) {
      infoInFlight.delete(cacheKey);
    }
  }
});

/* =========================================================
   START DOWNLOAD API
   ========================================================= */

app.post("/api/download/start", rateLimit(5), async (req, res) => {
  const { url, type, mediaType, formatId, videoTitle } = req.body || {};

  if (!url || !isAllowedMediaUrl(url)) {
    return res.status(400).json({
      error: "Unsupported or invalid media URL.",
    });
  }

  if (!["video", "audio"].includes(mediaType)) {
    return res.status(400).json({
      error: "Invalid media type.",
    });
  }

  /*
   * Instagram = video only.
   */
  if (type === "instagram" && mediaType !== "video") {
    return res.status(400).json({
      error: "Instagram downloads are video-only.",
    });
  }

  if (type === "instagram" && !isInstagramUrl(url)) {
    return res.status(400).json({
      error: "Please use an Instagram URL.",
    });
  }

  if (type === "youtube" && !isYouTubeUrl(url)) {
    return res.status(400).json({
      error: "Please use a YouTube URL.",
    });
  }

  if (activeJobs.size >= MAX_ACTIVE_JOBS) {
    return res.status(429).json({
      error: "The downloader is busy. Please try again in a moment.",
    });
  }

  try {
    await ensureYtDlp();
  } catch (err) {
    return res.status(503).json({
      error: sanitizeError(err.message),
    });
  }

  /*
   * Format ID is cleaned before being passed to yt-dlp.
   */
  let safeFormatId = formatId;

  if (type === "youtube" && formatId) {
    safeFormatId = String(formatId).replace(/[^\w.+-]/g, "");
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

  startYtDlpJob(job, {
    url,

    type,

    mediaType,

    formatId: safeFormatId,

    videoTitle,
  });

  return res.status(202).json({
    jobId: id,

    status: "queued",
  });
});

/* =========================================================
   DOWNLOAD STATUS
   ========================================================= */

app.get("/api/download/status/:jobId", rateLimit(60), (req, res) => {
  const job = jobs.get(req.params.jobId);

  if (!job) {
    return res.status(404).json({
      error: "Download job not found or expired.",
    });
  }

  if (
    job.expiresAt < Date.now() &&
    job.status !== "downloading" &&
    job.status !== "processing" &&
    job.status !== "merging"
  ) {
    return res.status(404).json({
      error: "Download job expired.",
    });
  }

  return res.json(jobPublic(job));
});

/* =========================================================
   DOWNLOAD FILE
   ========================================================= */

app.get("/api/download/file/:jobId", async (req, res) => {
  const job = jobs.get(req.params.jobId);

  if (!job || job.status !== "ready" || !job.filePath) {
    return res.status(404).json({
      error: "Download file is not ready or has expired.",
    });
  }

  try {
    const stat = await fsp.stat(job.filePath);

    if (!stat.isFile() || stat.size <= 0) {
      throw new Error("File is missing or empty.");
    }

    const filename = job.filename || "VidSnatch.mp4";

    const lower = filename.toLowerCase();

    let contentType = "video/mp4";

    if (lower.endsWith(".mp3")) {
      contentType = "audio/mpeg";
    } else if (lower.endsWith(".webm")) {
      contentType = "video/webm";
    } else if (lower.endsWith(".mov")) {
      contentType = "video/quicktime";
    } else if (lower.endsWith(".m4v")) {
      contentType = "video/x-m4v";
    }

    res.setHeader("Content-Type", contentType);

    /*
     * Required for browser video seeking/preview.
     */
    res.setHeader("Accept-Ranges", "bytes");

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

    res.setHeader("X-Content-Type-Options", "nosniff");

    const range = req.headers.range;

    /*
     * ===================================================
     * NORMAL DOWNLOAD
     * ===================================================
     */
    if (!range) {
      res.setHeader("Content-Length", stat.size);

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename.replace(
          /"/g,
          "_",
        )}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      );

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

      stream.pipe(res);

      return;
    }

    /*
     * ===================================================
     * RANGE REQUEST
     * ===================================================
     *
     * Allows:
     *
     * <video>
     * browser preview
     * seeking
     * partial loading
     */
    const match = /^bytes=(\d*)-(\d*)$/i.exec(range);

    if (!match) {
      return res
        .status(416)
        .setHeader("Content-Range", `bytes */${stat.size}`)
        .end();
    }

    let start = match[1] ? Number(match[1]) : 0;

    let end = match[2] ? Number(match[2]) : stat.size - 1;

    /*
     * Suffix request:
     *
     * bytes=-500000
     */
    if (!match[1] && match[2]) {
      const suffixLength = Number(match[2]);

      if (!Number.isFinite(suffixLength) || suffixLength <= 0) {
        return res
          .status(416)
          .setHeader("Content-Range", `bytes */${stat.size}`)
          .end();
      }

      start = Math.max(stat.size - suffixLength, 0);

      end = stat.size - 1;
    }

    if (
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      start < 0 ||
      start >= stat.size ||
      end < start
    ) {
      return res
        .status(416)
        .setHeader("Content-Range", `bytes */${stat.size}`)
        .end();
    }

    end = Math.min(end, stat.size - 1);

    const chunkSize = end - start + 1;

    res.status(206);

    res.setHeader("Content-Range", `bytes ${start}-${end}/${stat.size}`);

    res.setHeader("Content-Length", chunkSize);

    /*
     * IMPORTANT:
     *
     * Do NOT delete the file here.
     *
     * Browser can make multiple Range requests.
     * Cleanup is handled by the normal job TTL.
     */
    const stream = fs.createReadStream(job.filePath, {
      start,
      end,
    });

    stream.on("error", (err) => {
      console.error("[api/download/file]", err);

      res.destroy(err);
    });

    stream.pipe(res);
  } catch (err) {
    jobs.delete(job.id);

    await cleanupJobFiles(job);

    return res.status(404).json({
      error: "Download file is no longer available.",
    });
  }
});

/* =========================================================
   SERVE FRONTEND
   ========================================================= */

if (fs.existsSync(FRONTEND_DIST)) {
  app.use(
    express.static(FRONTEND_DIST, {
      extensions: ["html"],
    }),
  );

  app.get(/^\/(?!api(?:\/|$)|healthz$).*/, (req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, "index.html"));
  });
}

/* =========================================================
   ERROR HANDLER
   ========================================================= */

app.use((err, req, res, next) => {
  console.error("[server]", err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    error: "Internal server error.",
  });
});

/* =========================================================
   CLEANUP EXPIRED JOBS + CACHE
   ========================================================= */

setInterval(async () => {
  const now = Date.now();

  /*
   * Remove expired jobs/files.
   */
  for (const [id, job] of jobs) {
    const running = ["queued", "downloading", "merging", "processing"].includes(
      job.status,
    );

    if (!running && job.expiresAt <= now) {
      await cleanupJobFiles(job);

      jobs.delete(id);
    }
  }

  /*
   * Clean rate-limit records.
   */
  for (const [ip, timestamps] of requestLog) {
    const fresh = timestamps.filter((ts) => now - ts < 60_000);

    if (fresh.length) {
      requestLog.set(ip, fresh);
    } else {
      requestLog.delete(ip);
    }
  }

  /*
   * Clean metadata cache.
   */
  for (const [key, entry] of infoCache) {
    if (entry.expiresAt <= now) {
      infoCache.delete(key);
    }
  }
}, 60_000).unref();

/* =========================================================
   START SERVER
   ========================================================= */

youtubeCookiesPath = await prepareYouTubeCookies();

const server = app.listen(PORT, HOST, () => {
  console.log(`VidSnatch backend listening on http://${HOST}:${PORT}`);

  console.log(`Frontend dist: ${FRONTEND_DIST}`);
});

server.requestTimeout = 0;

server.headersTimeout = 120_000;

process.on("SIGTERM", () => server.close(() => process.exit(0)));

process.on("SIGINT", () => server.close(() => process.exit(0)));

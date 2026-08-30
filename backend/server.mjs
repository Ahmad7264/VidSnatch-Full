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

/* =========================================================
   APP
   ========================================================= */

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

const PORT = Number(process.env.PORT || 10000);
const HOST = "0.0.0.0";

/* =========================================================
   CONFIG
   ========================================================= */

const INFO_TIMEOUT_MS = Number(process.env.INFO_TIMEOUT_MS || 90000);
const INFO_SOCKET_TIMEOUT = Number(process.env.INFO_SOCKET_TIMEOUT || 20);

const INFO_CACHE_TTL_MS = Number(
  process.env.INFO_CACHE_TTL_MS || 15 * 60 * 1000,
);

const DOWNLOAD_TIMEOUT_MS = Number(
  process.env.DOWNLOAD_TIMEOUT_MS || 15 * 60 * 1000,
);

const JOB_TTL_MS = Math.max(
  Number(process.env.JOB_TTL_MS || 15 * 60 * 1000),
  5 * 60 * 1000,
);

const MAX_ACTIVE_JOBS = Number(process.env.MAX_ACTIVE_JOBS || 2);

/* =========================================================
   DIRECTORIES
   ========================================================= */

const DOWNLOAD_DIR = path.join(os.tmpdir(), "vidsnatch-jobs");

const BUNDLED_YTDLP = path.resolve(
  __dirname,
  "bin",
  process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp",
);

const FALLBACK_YTDLP = path.join(
  DOWNLOAD_DIR,
  process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp",
);

const FRONTEND_DIST = path.resolve(__dirname, "../frontend/dist");

await fsp.mkdir(DOWNLOAD_DIR, {
  recursive: true,
});

/* =========================================================
   STATE
   ========================================================= */

const jobs = new Map();

const activeJobs = new Set();

const infoCache = new Map();

const infoInFlight = new Map();

const rateBuckets = new Map();

let youtubeCookiesPath = null;

/* =========================================================
   CORS
   ========================================================= */

const allowedOrigins = new Set([
  "https://vidsnatch.fun",
  "https://www.vidsnatch.fun",
  "http://localhost:5173",
  "http://127.0.0.1:5173",

  ...(process.env.CORS_ORIGIN || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean),
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
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

/* =========================================================
   BODY
   ========================================================= */

app.use(
  express.json({
    limit: "32kb",
  }),
);

/* =========================================================
   SECURITY HEADERS
   ========================================================= */

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

function rateLimit(maxRequests) {
  return (req, res, next) => {
    const ip = req.ip || "unknown";

    const now = Date.now();

    const list = rateBuckets.get(ip) || [];

    const recent = list.filter((time) => now - time < 60_000);

    if (recent.length >= maxRequests) {
      const oldest = recent[0] || now;
      const retryAfter = Math.max(
        1,
        Math.ceil((60_000 - (now - oldest)) / 1000),
      );

      res.setHeader("Retry-After", String(retryAfter));

      return res.status(429).json({
        error: "Too many requests. Please try again in a moment.",
      });
    }

    recent.push(now);

    rateBuckets.set(ip, recent);

    next();
  };
}

/* =========================================================
   PLATFORM DETECTION
   ========================================================= */

const PLATFORM_HOSTS = {
  instagram: ["instagram.com"],

  youtube: ["youtube.com", "youtu.be", "m.youtube.com", "music.youtube.com"],

  facebook: ["facebook.com", "fb.watch", "m.facebook.com"],

  tiktok: ["tiktok.com", "vm.tiktok.com", "vt.tiktok.com"],

  twitter: ["twitter.com", "x.com", "mobile.twitter.com"],

  reddit: ["reddit.com", "www.reddit.com", "old.reddit.com", "redd.it"],

  threads: ["threads.net"],

  pinterest: ["pinterest.com", "pin.it"],

  snapchat: ["snapchat.com"],
};

function cleanHost(hostname) {
  return String(hostname || "")
    .toLowerCase()
    .replace(/^www\./, "");
}

function hostMatches(host, allowed) {
  return host === allowed || host.endsWith(`.${allowed}`);
}

function detectPlatform(rawUrl) {
  try {
    const parsed = new URL(String(rawUrl).trim());

    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }

    const host = cleanHost(parsed.hostname);

    for (const [platform, hosts] of Object.entries(PLATFORM_HOSTS)) {
      if (hosts.some((allowed) => hostMatches(host, allowed))) {
        return platform;
      }
    }

    return null;
  } catch {
    return null;
  }
}

function isAllowedUrl(rawUrl) {
  return !!detectPlatform(rawUrl);
}

/* =========================================================
   URL NORMALIZATION
   ========================================================= */

function normalizeUrl(rawUrl) {
  try {
    const parsed = new URL(String(rawUrl).trim());

    const platform = detectPlatform(rawUrl);

    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "fbclid",
      "gclid",
      "igsh",
      "igshid",
      "si",
    ];

    for (const param of trackingParams) {
      parsed.searchParams.delete(param);
    }

    parsed.hash = "";

    /*
     * YouTube:
     * normalize to stable video URL.
     */
    if (platform === "youtube") {
      const host = cleanHost(parsed.hostname);

      if (host === "youtu.be") {
        const id = parsed.pathname.replace(/^\/+/, "").split("/")[0];

        if (id) {
          return `https://youtu.be/${id}`;
        }
      }

      const id = parsed.searchParams.get("v");

      if (id) {
        return `https://www.youtube.com/watch?v=${id}`;
      }
    }

    return parsed.toString().replace(/\/$/, "");
  } catch {
    return String(rawUrl || "").trim();
  }
}

/* =========================================================
   YT-DLP
   ========================================================= */

async function downloadBinary(url, target) {
  const response = await fetch(url);

  if (!response.ok || !response.body) {
    throw new Error(`Could not download yt-dlp (${response.status})`);
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

  await fsp.writeFile(target, Buffer.concat(chunks, total));
}

async function ensureYtDlp() {
  const configured = process.env.YTDLP_PATH;

  if (configured && fs.existsSync(configured)) {
    return;
  }

  if (fs.existsSync(BUNDLED_YTDLP)) {
    return;
  }

  if (fs.existsSync(FALLBACK_YTDLP)) {
    return;
  }

  const asset =
    process.platform === "win32"
      ? "yt-dlp.exe"
      : process.arch === "arm64"
        ? "yt-dlp_linux_aarch64"
        : "yt-dlp_linux";

  const url = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${asset}`;

  const temp = `${FALLBACK_YTDLP}.download`;

  console.log(`[yt-dlp] downloading ${asset}`);

  await downloadBinary(url, temp);

  await fsp.chmod(temp, 0o755);

  await fsp.rename(temp, FALLBACK_YTDLP);

  console.log("[yt-dlp] ready");
}

function ytDlpPath() {
  return (
    process.env.YTDLP_PATH ||
    (fs.existsSync(BUNDLED_YTDLP) ? BUNDLED_YTDLP : FALLBACK_YTDLP)
  );
}

/* =========================================================
   YOUTUBE COOKIES
   ========================================================= */

async function prepareYouTubeCookies() {
  const cookies = process.env.YOUTUBE_COOKIES;

  if (!cookies || !cookies.trim()) {
    return null;
  }

  const target = path.join(os.tmpdir(), "vidsnatch-youtube-cookies.txt");

  await fsp.writeFile(target, cookies, {
    encoding: "utf8",
    mode: 0o600,
  });

  return target;
}

/* =========================================================
   YT-DLP COMMON ARGS
   ========================================================= */

function ytBaseArgs(platform, mode = "info") {
  const args = [
    "--no-warnings",
    "--no-playlist",

    "--socket-timeout",
    String(mode === "info" ? INFO_SOCKET_TIMEOUT : 10),
  ];

  /*
   * YouTube needs bgutil.
   */
  if (platform === "youtube") {
    args.push(
      "--js-runtimes",
      "node",

      "--extractor-args",
      `youtubepot-bgutilhttp:base_url=${
        process.env.BGUTIL_POT_BASE_URL || "http://127.0.0.1:4416"
      }`,

      /*
       * Current YouTube extraction also needs yt-dlp's EJS challenge
       * components. The GitHub remote component keeps the bundled binary
       * usable on both local Windows and Render without a separate Python
       * installation. Node 24+ is already the project's runtime.
       */
      "--remote-components",
      process.env.YTDLP_EJS_REMOTE_COMPONENTS || "ejs:github",
    );

    if (youtubeCookiesPath && fs.existsSync(youtubeCookiesPath)) {
      args.push("--cookies", youtubeCookiesPath);
    }
  }

  return args;
}

/* =========================================================
   FORMAT LABEL
   ========================================================= */

function formatLabel(format) {
  const height = format.height ? `${format.height}p` : "";

  const fps = format.fps && Number(format.fps) > 30 ? `${format.fps}fps` : "";

  const ext = format.ext ? String(format.ext).toUpperCase() : "";

  const note = format.format_note || "";

  const sizeBytes = format.filesize || format.filesize_approx || 0;

  const size = sizeBytes ? `~${(sizeBytes / 1048576).toFixed(1)} MB` : "";

  return [height, fps, note, ext, size].filter(Boolean).join(" · ");
}

/* =========================================================
   NORMALIZE EXTRACTED INFO
   ========================================================= */

function normalizeInfo(raw, platform) {
  const formats = raw.formats || [];

  /*
   * Instagram / Facebook / TikTok /
   * X / Reddit / Threads / Pinterest /
   * Snapchat:
   *
   * Use yt-dlp's best ready-to-use
   * video format.
   */
  if (platform !== "youtube") {
    const best = formats
      .filter((format) => format.vcodec && format.vcodec !== "none")
      .sort((a, b) => Number(b.height || 0) - Number(a.height || 0))[0];

    return {
      platform,

      title: raw.title || raw.description || `${platform} Video`,

      uploader: raw.uploader || raw.channel || "",

      duration: raw.duration ?? null,

      viewCount: raw.view_count ?? null,

      thumbnail: raw.thumbnail || "",

      resolution: best?.height ? `${best.height}p` : "Available",

      videoUrl: best?.url || raw.url || "",

      formats: [],

      audioFormatId: null,

      supportsAudio: false,
    };
  }

  /*
   * =======================================================
   * YOUTUBE
   * =======================================================
   *
   * Keep maximum 1440p.
   */

  const byHeight = new Map();

  for (const format of formats) {
    if (!format.vcodec || format.vcodec === "none" || !format.height) {
      continue;
    }

    const height = Number(format.height);

    if (height > 1440) {
      continue;
    }

    const key = String(height);

    const previous = byHeight.get(key);

    if (!previous) {
      byHeight.set(key, format);

      continue;
    }

    const currentMuxed = !!(format.acodec && format.acodec !== "none");

    const previousMuxed = !!(previous.acodec && previous.acodec !== "none");

    if (currentMuxed && !previousMuxed) {
      byHeight.set(key, format);
    }
  }

  const videoFormats = [...byHeight.values()].sort(
    (a, b) => Number(b.height || 0) - Number(a.height || 0),
  );

  const audio = formats
    .filter(
      (format) =>
        format.acodec &&
        format.acodec !== "none" &&
        (!format.vcodec || format.vcodec === "none"),
    )
    .sort((a, b) => Number(b.abr || 0) - Number(a.abr || 0))[0];

  return {
    platform: "youtube",

    title: raw.title || "YouTube Video",

    uploader: raw.uploader || raw.channel || "",

    duration: raw.duration ?? null,

    viewCount: raw.view_count ?? null,

    thumbnail: raw.thumbnail || "",

    resolution: videoFormats[0]?.height
      ? `${videoFormats[0].height}p`
      : "Available",

    formats: videoFormats.map((format) => ({
      formatId: String(format.format_id),

      resolution: `${format.height}p`,

      label: formatLabel(format),

      isMuxed: !!(format.acodec && format.acodec !== "none"),
    })),

    audioFormatId: audio?.format_id || "bestaudio",

    supportsAudio: true,
  };
}

/* =========================================================
   GET INFO
   ========================================================= */

async function getInfo(url, platform) {
  const started = Date.now();

  const args = [
    ...ytBaseArgs(platform, "info"),

    "--dump-single-json",

    "--skip-download",

    "--no-check-certificates",
  ];

  /*
   * For non-YouTube platforms,
   * best format is enough for preview.
   */
  if (platform !== "youtube") {
    args.push("-f", "best");
  }

  args.push("--", url);

  console.log(`[getInfo] START platform=${platform}`);

  const { stdout, stderr } = await execFileAsync(ytDlpPath(), args, {
    timeout: INFO_TIMEOUT_MS,

    maxBuffer: 50 * 1024 * 1024,

    windowsHide: true,
  });

  const elapsed = Date.now() - started;

  console.log(
    `[getInfo] yt-dlp finished platform=${platform} time=${elapsed}ms`,
  );

  if (!stdout.trim()) {
    throw new Error(stderr || "No media information returned.");
  }

  const data = JSON.parse(stdout.trim());

  return normalizeInfo(data, platform);
}

/* =========================================================
   ERROR CLEANING
   ========================================================= */

function cleanError(error) {
  const text = String(error || "")
    .replace(/\s+/g, " ")
    .trim();

  if (/sign in to confirm|not a bot|confirm you.?re not a bot/i.test(text)) {
    return "The platform is temporarily blocking this request. Please try again later.";
  }

  if (/private|members.only|login required|not available/i.test(text)) {
    return "This media is private or unavailable for public downloading.";
  }

  if (/unsupported url/i.test(text)) {
    return "This URL is not supported.";
  }

  return text.slice(-800) || "Something went wrong.";
}

/* =========================================================
   /api/info
   ========================================================= */

app.post("/api/info", rateLimit(30), async (req, res) => {
  const rawUrl = req.body?.url;

  if (!rawUrl) {
    return res.status(400).json({
      error: "Please enter a URL.",
    });
  }

  const platform = detectPlatform(rawUrl);

  if (!platform) {
    return res.status(400).json({
      error: "This platform is not supported yet.",
    });
  }

  const normalized = normalizeUrl(rawUrl);

  const cacheKey = `${platform}:${normalized}`;

  const started = Date.now();

  console.log(`[api/info] START platform=${platform} url=${normalized}`);

  /*
   * CACHE HIT
   */
  const cached = infoCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    console.log(`[api/info] CACHE HIT: ${Date.now() - started}ms`);

    return res.json(cached.data);
  }

  if (cached) {
    infoCache.delete(cacheKey);
  }

  /*
   * SHARE SAME IN-FLIGHT REQUEST
   */
  let promise = infoInFlight.get(cacheKey);

  if (promise) {
    console.log(`[api/info] SHARED IN-FLIGHT REQUEST`);
  }

  try {
    /*
     * yt-dlp should already be
     * warm, but keep this as safety.
     */
    await ensureYtDlp();

    if (!promise) {
      promise = getInfo(normalized, platform);

      infoInFlight.set(cacheKey, promise);
    }

    const data = await promise;

    infoCache.set(cacheKey, {
      data,

      expiresAt: Date.now() + INFO_CACHE_TTL_MS,
    });

    console.log(`[api/info] TOTAL: ${Date.now() - started}ms`);

    return res.json(data);
  } catch (error) {
    console.error(`[api/info] FAILED platform=${platform}`, error);

    return res.status(500).json({
      error: cleanError(error?.stderr || error?.message),
    });
  } finally {
    if (infoInFlight.get(cacheKey) === promise) {
      infoInFlight.delete(cacheKey);
    }
  }
});

/* =========================================================
   JOB HELPERS
   ========================================================= */

function publicJob(job) {
  return {
    jobId: job.id,

    status: job.status,

    progress: Math.round(job.progress || 0),

    stage: job.stage,

    filename: job.filename || undefined,

    fileUrl:
      job.status === "ready"
        ? `/api/download/file/${encodeURIComponent(job.id)}`
        : undefined,

    error: job.error || undefined,
  };
}

function updateJob(job, patch) {
  Object.assign(job, patch, {
    updatedAt: Date.now(),
  });
}

/* =========================================================
   PROGRESS
   ========================================================= */

function parseProgress(line) {
  const clean = String(line).replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "");

  const match = clean.match(/\[download\]\s+(\d+(?:\.\d+)?)%/i);

  return match ? Number(match[1]) : null;
}

/* =========================================================
   FILE HELPERS
   ========================================================= */

async function findOutputFile(prefix) {
  const entries = await fsp.readdir(DOWNLOAD_DIR);

  const candidates = [];

  for (const name of entries) {
    if (!name.startsWith(prefix)) {
      continue;
    }

    if (name.endsWith(".part") || name.endsWith(".ytdl")) {
      continue;
    }

    const fullPath = path.join(DOWNLOAD_DIR, name);

    try {
      const stat = await fsp.stat(fullPath);

      if (stat.isFile() && stat.size > 0) {
        candidates.push({
          path: fullPath,

          size: stat.size,
        });
      }
    } catch {}
  }

  candidates.sort((a, b) => b.size - a.size);

  return candidates[0]?.path || null;
}

async function cleanupJob(job) {
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
   START DOWNLOAD
   ========================================================= */

function runDownload(job, params) {
  const prefix = `job-${job.id}`;

  job.prefix = prefix;

  const output = path.join(DOWNLOAD_DIR, `${prefix}.%(ext)s`);

  const isAudio = params.mediaType === "audio";

  /*
   * Instagram audio is not supported.
   */
  if (params.platform === "instagram" && isAudio) {
    updateJob(job, {
      status: "error",

      error: "Instagram downloads are video-only.",
    });

    activeJobs.delete(job.id);

    return;
  }

  const args = [
    ...ytBaseArgs(params.platform, "download"),

    "--newline",

    "--progress",

    "--concurrent-fragments",
    "8",

    "--buffer-size",
    "1M",

    "--retries",
    "5",

    "--fragment-retries",
    "5",

    "--file-access-retries",
    "3",

    "-o",
    output,
  ];

  /*
   * AUDIO
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
  } else if (params.platform === "youtube" && params.formatId) {
    /*
     * YOUTUBE VIDEO
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
     * OTHER PLATFORMS
     */
    args.push(
      "-f",
      "best",

      "--merge-output-format",
      "mp4",
    );
  }

  args.push("--", params.url);

  updateJob(job, {
    status: "downloading",

    stage: "Downloading...",

    progress: 0,

    startedAt: Date.now(),
  });

  console.log(`[download] START platform=${params.platform} job=${job.id}`);

  const child = spawn(ytDlpPath(), args, {
    cwd: DOWNLOAD_DIR,

    stdio: ["ignore", "pipe", "pipe"],

    windowsHide: true,
  });

  job.process = child;

  let stdoutBuffer = "";

  let stderrBuffer = "";

  let finished = false;

  const timeout = setTimeout(() => {
    if (!child.killed) {
      child.kill("SIGTERM");
    }

    updateJob(job, {
      status: "error",

      error: "Download timed out. Please try again.",
    });

    activeJobs.delete(job.id);
  }, DOWNLOAD_TIMEOUT_MS);

  function processLine(line) {
    const clean = line.trim();

    if (!clean) {
      return;
    }

    const progress = parseProgress(clean);

    if (progress !== null) {
      updateJob(job, {
        progress,

        stage: "Downloading...",
      });
    }

    if (/Merging formats|\[Merger\]/i.test(clean)) {
      updateJob(job, {
        status: "merging",

        stage: "Merging video + audio...",

        progress: Math.max(job.progress || 0, 99),
      });
    }

    if (/ExtractAudio/i.test(clean)) {
      updateJob(job, {
        status: "processing",

        stage: "Converting audio...",

        progress: 99,
      });
    }
  }

  child.stdout.on("data", (chunk) => {
    stdoutBuffer += chunk.toString();

    const lines = stdoutBuffer.split(/\r?\n|\r/);

    stdoutBuffer = lines.pop() || "";

    lines.forEach(processLine);
  });

  child.stderr.on("data", (chunk) => {
    stderrBuffer += chunk.toString();

    const lines = stderrBuffer.split(/\r?\n|\r/);

    stderrBuffer = lines.pop() || "";

    lines.forEach(processLine);
  });

  child.on("error", (error) => {
    if (finished) {
      return;
    }

    finished = true;

    clearTimeout(timeout);

    updateJob(job, {
      status: "error",

      error: cleanError(error.message),
    });

    activeJobs.delete(job.id);
  });

  child.on("close", async (code) => {
    if (finished) {
      return;
    }

    finished = true;

    clearTimeout(timeout);

    if (code !== 0) {
      const diagnostic = `${stderrBuffer}\n${stdoutBuffer}`.trim();

      updateJob(job, {
        status: "error",

        error: cleanError(diagnostic || `yt-dlp exited with code ${code}`),
      });

      activeJobs.delete(job.id);

      await cleanupJob(job);

      return;
    }

    try {
      updateJob(job, {
        status: "processing",

        stage: "Finalizing file...",

        progress: 99,
      });

      const outputFile = await findOutputFile(prefix);

      if (!outputFile) {
        throw new Error("Downloaded file was not found.");
      }

      const stat = await fsp.stat(outputFile);

      if (!stat.isFile() || stat.size <= 0) {
        throw new Error("Downloaded file is empty.");
      }

      const extension =
        params.mediaType === "audio"
          ? "mp3"
          : path.extname(outputFile).replace(".", "").toLowerCase() || "mp4";

      const safeTitle =
        String(params.videoTitle || params.platform || "VidSnatch")
          .replace(/[\\/:*?"<>|\u0000-\u001F]/g, "")
          .replace(/\s+/g, "_")
          .replace(/_+/g, "_")
          .slice(0, 100) || "VidSnatch";

      const filename = `VidSnatch_${safeTitle}.${extension}`;

      const finalPath = path.join(DOWNLOAD_DIR, `${prefix}-final.${extension}`);

      await fsp.rename(outputFile, finalPath);

      updateJob(job, {
        status: "ready",

        stage: "Ready",

        progress: 100,

        filePath: finalPath,

        filename,

        size: stat.size,

        expiresAt: Date.now() + JOB_TTL_MS,
      });

      activeJobs.delete(job.id);

      console.log(`[download] READY job=${job.id}`);
    } catch (error) {
      updateJob(job, {
        status: "error",

        error: cleanError(error.message),
      });

      activeJobs.delete(job.id);

      await cleanupJob(job);
    }
  });
}

/* =========================================================
   /api/download/start
   ========================================================= */

app.post("/api/download/start", rateLimit(20), async (req, res) => {
  const { url, platform, type, mediaType, formatId, videoTitle } =
    req.body || {};

  if (!url) {
    return res.status(400).json({
      error: "Please enter a URL.",
    });
  }

  const detected = detectPlatform(url);

  if (!detected) {
    return res.status(400).json({
      error: "This platform is not supported yet.",
    });
  }

  /*
   * Frontend platform value is not trusted.
   * Backend detects it again.
   */
  const finalPlatform = detected;

  /*
   * Accept old frontend's `type`
   * for backward compatibility.
   */
  const requestedPlatform = platform || type || finalPlatform;

  if (requestedPlatform !== finalPlatform) {
    return res.status(400).json({
      error: "The selected platform does not match the URL.",
    });
  }

  if (!["video", "audio"].includes(mediaType)) {
    return res.status(400).json({
      error: "Invalid media type.",
    });
  }

  if (finalPlatform === "instagram" && mediaType === "audio") {
    return res.status(400).json({
      error: "Instagram downloads are video-only.",
    });
  }

  if (activeJobs.size >= MAX_ACTIVE_JOBS) {
    return res.status(429).json({
      error: "Downloader is currently busy. Please try again in a moment.",
    });
  }

  try {
    await ensureYtDlp();
  } catch (error) {
    return res.status(503).json({
      error: cleanError(error.message),
    });
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

    prefix: null,
  };

  jobs.set(id, job);

  activeJobs.add(id);

  runDownload(job, {
    url: normalizeUrl(url),

    platform: finalPlatform,

    mediaType,

    formatId,

    videoTitle,
  });

  return res.status(202).json({
    jobId: id,

    status: "queued",

    platform: finalPlatform,
  });
});

/* =========================================================
   /api/download/status
   ========================================================= */

app.get("/api/download/status/:jobId", rateLimit(90), (req, res) => {
  const job = jobs.get(req.params.jobId);

  if (!job) {
    return res.status(404).json({
      error: "Download job not found or expired.",
    });
  }

  return res.json(publicJob(job));
});

/* =========================================================
   /api/download/file
   ========================================================= */

app.get("/api/download/file/:jobId", async (req, res) => {
  const requestedId = String(req.params.jobId || "").replace(
    /[^a-zA-Z0-9]/g,
    "",
  );
  let job = jobs.get(requestedId);

  /*
   * A ready job must remain downloadable even if the in-memory job map was
   * briefly lost/reloaded. Recover the final file from the temp directory
   * instead of returning a misleading 404.
   */
  if (!job) {
    const recoveredPrefix = `job-${requestedId}`;
    const recoveredFile = await findOutputFile(recoveredPrefix);

    if (recoveredFile) {
      job = {
        id: requestedId,
        status: "ready",
        filePath: recoveredFile,
        filename: `VidSnatch_video${path.extname(recoveredFile) || ".mp4"}`,
        prefix: recoveredPrefix,
        expiresAt: Date.now() + JOB_TTL_MS,
      };
      jobs.set(requestedId, job);
    }
  }

  if (!job || job.status !== "ready" || !job.filePath) {
    return res.status(404).json({
      error:
        "Download file is not ready or has expired. Please wait a moment and try again.",
    });
  }

  try {
    const stat = await fsp.stat(job.filePath);

    if (!stat.isFile() || stat.size <= 0) {
      throw new Error("File missing.");
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
    }

    res.setHeader("Content-Type", contentType);

    res.setHeader("Accept-Ranges", "bytes");

    res.setHeader("Cache-Control", "no-store");

    const range = req.headers.range;

    /*
     * Full file.
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

      fs.createReadStream(job.filePath).pipe(res);

      return;
    }

    /*
     * Range request.
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

    if (!match[1] && match[2]) {
      const suffix = Number(match[2]);

      start = Math.max(stat.size - suffix, 0);

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

    const length = end - start + 1;

    res.status(206);

    res.setHeader("Content-Range", `bytes ${start}-${end}/${stat.size}`);

    res.setHeader("Content-Length", length);

    fs.createReadStream(job.filePath, {
      start,
      end,
    }).pipe(res);
  } catch (error) {
    console.error(`[download/file] ${job.id}:`, error?.message || error);

    return res.status(503).json({
      error: "Download file is temporarily unavailable. Please try again.",
    });
  }
});

/* =========================================================
   HEALTH
   ========================================================= */

app.get("/healthz", async (req, res) => {
  let ytReady = false;

  try {
    await ensureYtDlp();

    ytReady = fs.existsSync(ytDlpPath());
  } catch {}

  res.json({
    ok: true,

    service: "vidsnatch-backend",

    ytDlpReady: ytReady,

    activeJobs: activeJobs.size,

    cachedInfo: infoCache.size,

    time: new Date().toISOString(),
  });
});

/* =========================================================
   FRONTEND
   ========================================================= */

if (fs.existsSync(FRONTEND_DIST)) {
  app.use(
    express.static(FRONTEND_DIST, {
      extensions: ["html"],
      maxAge: "1h",
    }),
  );

  app.get(/^\/(?!api(?:\/|$)|healthz$).*/, (req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, "index.html"));
  });
}

/* =========================================================
   CLEANUP
   ========================================================= */

setInterval(async () => {
  const now = Date.now();

  /*
   * Jobs
   */
  for (const [id, job] of jobs) {
    const running = ["queued", "downloading", "merging", "processing"].includes(
      job.status,
    );

    if (!running && job.expiresAt <= now) {
      await cleanupJob(job);

      jobs.delete(id);
    }
  }

  /*
   * Info cache
   */
  for (const [key, entry] of infoCache) {
    if (entry.expiresAt <= now) {
      infoCache.delete(key);
    }
  }

  /*
   * Rate buckets
   */
  for (const [ip, times] of rateBuckets) {
    const fresh = times.filter((time) => now - time < 60_000);

    if (fresh.length) {
      rateBuckets.set(ip, fresh);
    } else {
      rateBuckets.delete(ip);
    }
  }
}, 60_000).unref();

/* =========================================================
   START
   ========================================================= */

async function startServer() {
  try {
    console.log("Preparing VidSnatch backend...");

    /*
     * IMPORTANT:
     *
     * yt-dlp is prepared BEFORE
     * HTTP server accepts users.
     *
     * This removes first-request
     * yt-dlp setup delay.
     */
    const ytStart = Date.now();

    await ensureYtDlp();

    console.log(`[startup] yt-dlp ready in ${Date.now() - ytStart}ms`);

    youtubeCookiesPath = await prepareYouTubeCookies();

    if (youtubeCookiesPath) {
      console.log("[startup] YouTube cookies ready");
    }

    const server = app.listen(PORT, HOST, () => {
      console.log(`VidSnatch listening on ${HOST}:${PORT}`);

      console.log(`INFO cache: ${INFO_CACHE_TTL_MS / 60000} minutes`);

      console.log(
        `Supported platforms: ${Object.keys(PLATFORM_HOSTS).join(", ")}`,
      );
    });

    server.requestTimeout = 0;

    server.headersTimeout = 120_000;

    const shutdown = () => {
      console.log("Shutting down VidSnatch...");

      for (const job of jobs.values()) {
        try {
          if (job.process && !job.process.killed) {
            job.process.kill("SIGTERM");
          }
        } catch {}
      }

      server.close(() => {
        process.exit(0);
      });

      setTimeout(() => process.exit(0), 5000).unref();
    };

    process.once("SIGTERM", shutdown);

    process.once("SIGINT", shutdown);
  } catch (error) {
    console.error("Startup failed:", error);

    process.exit(1);
  }
}

startServer();

import "./style.css";
/* ============================================================
   VidSnatch Universal Downloader
   ============================================================ */

const API = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, "");

/* ============================================================
   STATE
   ============================================================ */

let currentUrl = "";
let currentPlatform = "";
let currentTitle = "";

let selectedFormatId = null;
let selectedIsMuxed = false;

let audioFormatId = null;
let supportsAudio = false;

let infoController = null;

let requestToken = 0;

let activeDownloadJob = null;

/*
 * Frontend metadata cache.
 *
 * Backend has its own cache too.
 */
const INFO_CACHE_TTL = 5 * 60 * 1000;

const infoCache = new Map();

/* ============================================================
   DOM
   ============================================================ */

function $(id) {
  return document.getElementById(id);
}

function show(id) {
  const el = $(id);

  if (el) {
    el.classList.remove("hidden");
  }
}

function hide(id) {
  const el = $(id);

  if (el) {
    el.classList.add("hidden");
  }
}

function text(id, value) {
  const el = $(id);

  if (el) {
    el.textContent = value ?? "";
  }
}

/* ============================================================
   TOAST
   ============================================================ */

function showToast(message, duration = 4500) {
  const toast = $("toast");

  if (!toast) {
    return;
  }

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

/* ============================================================
   PLATFORM DETECTION — FRONTEND
   ============================================================ */

const PLATFORM_HOSTS = {
  instagram: ["instagram.com"],

  youtube: ["youtube.com", "youtu.be", "m.youtube.com", "music.youtube.com"],

  facebook: ["facebook.com", "fb.watch", "m.facebook.com"],

  tiktok: ["tiktok.com", "vm.tiktok.com", "vt.tiktok.com"],

  twitter: ["twitter.com", "x.com", "mobile.twitter.com"],

  reddit: ["reddit.com", "redd.it"],

  threads: ["threads.net"],

  pinterest: ["pinterest.com", "pin.it"],

  snapchat: ["snapchat.com"],
};

function cleanHost(hostname) {
  return String(hostname || "")
    .toLowerCase()
    .replace(/^www\./, "");
}

function detectPlatform(rawUrl) {
  try {
    const parsed = new URL(String(rawUrl).trim());

    const host = cleanHost(parsed.hostname);

    for (const [platform, hosts] of Object.entries(PLATFORM_HOSTS)) {
      for (const allowed of hosts) {
        if (host === allowed || host.endsWith(`.${allowed}`)) {
          return platform;
        }
      }
    }

    return "";
  } catch {
    return "";
  }
}

/* ============================================================
   URL NORMALIZATION
   ============================================================ */

function normalizeUrl(rawUrl) {
  try {
    const parsed = new URL(String(rawUrl).trim());

    const tracking = [
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

    for (const parameter of tracking) {
      parsed.searchParams.delete(parameter);
    }

    parsed.hash = "";

    /*
     * Stable YouTube URL.
     */
    const host = cleanHost(parsed.hostname);

    if (host === "youtu.be") {
      const id = parsed.pathname.replace(/^\/+/, "").split("/")[0];

      if (id) {
        return `https://youtu.be/${id}`;
      }
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com"
    ) {
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

/* ============================================================
   CACHE
   ============================================================ */

function getCachedInfo(key) {
  const cached = infoCache.get(key);

  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    infoCache.delete(key);

    return null;
  }

  return cached.data;
}

function setCachedInfo(key, data) {
  infoCache.set(key, {
    data,

    expiresAt: Date.now() + INFO_CACHE_TTL,
  });

  /*
   * Keep memory bounded.
   */
  if (infoCache.size > 30) {
    const first = infoCache.keys().next().value;

    if (first) {
      infoCache.delete(first);
    }
  }
}

/* ============================================================
   API
   ============================================================ */

async function fetchInfo(url, platform, controller) {
  const normalized = normalizeUrl(url);

  const cacheKey = `${platform}:${normalized}`;

  /*
   * Browser cache.
   */
  const cached = getCachedInfo(cacheKey);

  if (cached) {
    return cached;
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(`${API}/api/info`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        url: normalized,

        platform,
      }),

      cache: "no-store",

      signal: controller?.signal,
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 429 && attempt < 2) {
      const retryAfter = Number(response.headers.get("Retry-After"));
      const waitMs = Number.isFinite(retryAfter)
        ? Math.min(Math.max(retryAfter, 1) * 1000, 5000)
        : 2000 * (attempt + 1);

      await sleep(waitMs);
      continue;
    }

    if (!response.ok || data.error) {
      throw new Error(data.error || `Fetch failed (${response.status})`);
    }

    setCachedInfo(cacheKey, data);

    return data;
  }

  throw new Error("Too many requests. Please try again in a moment.");
}

/* ============================================================
   UNIVERSAL FETCH
   ============================================================ */

async function fetchUniversal() {
  const input = $("universal-url-input");
  const fetchButton = $("universal-fetch-btn");

  if (!input) {
    return;
  }

  // Prevent duplicate requests from a double click / Enter + click.
  if (fetchButton?.disabled) {
    return;
  }

  const rawUrl = input.value.trim();

  if (!rawUrl) {
    showToast("⚠️ Please paste a video URL first.");

    return;
  }

  const platform = detectPlatform(rawUrl);

  if (!platform) {
    showToast("❌ This platform is not supported yet.", 5000);

    showPlatformError("This URL is not from a supported platform.");

    return;
  }

  /*
   * Cancel old request.
   */
  if (infoController) {
    infoController.abort();
  }

  infoController = new AbortController();

  const token = ++requestToken;

  currentUrl = normalizeUrl(rawUrl);

  currentPlatform = platform;

  selectedFormatId = null;

  selectedIsMuxed = false;

  audioFormatId = null;

  supportsAudio = false;

  /*
   * Reset UI.
   */
  hide("universal-result");

  hide("universal-error");

  show("universal-loader");

  if (fetchButton) {
    fetchButton.disabled = true;
  }

  /*
   * Show detected platform.
   */
  showPlatformBadge(platform);

  try {
    const data = await fetchInfo(currentUrl, platform, infoController);

    /*
     * Ignore stale response.
     */
    if (token !== requestToken) {
      return;
    }

    renderUniversalResult(data, platform);

    show("universal-result");
  } catch (error) {
    if (error?.name === "AbortError") {
      return;
    }

    if (token !== requestToken) {
      return;
    }

    showPlatformError(error.message || "Could not fetch video information.");
  } finally {
    if (token === requestToken) {
      hide("universal-loader");

      if (fetchButton) {
        fetchButton.disabled = false;
      }

      infoController = null;
    }
  }
}

/* ============================================================
   PLATFORM BADGE
   ============================================================ */

function platformName(platform) {
  const names = {
    instagram: "Instagram",

    youtube: "YouTube",

    facebook: "Facebook",

    tiktok: "TikTok",

    twitter: "X / Twitter",

    reddit: "Reddit",

    threads: "Threads",

    pinterest: "Pinterest",

    snapchat: "Snapchat",
  };

  return names[platform] || platform;
}

function platformIcon(platform) {
  const icons = {
    instagram: "📸",

    youtube: "▶️",

    facebook: "f",

    tiktok: "♪",

    twitter: "𝕏",

    reddit: "●",

    threads: "@",

    pinterest: "P",

    snapchat: "👻",
  };

  return icons[platform] || "🌐";
}

function showPlatformBadge(platform) {
  const badge = $("detected-platform");

  if (!badge) {
    return;
  }

  badge.textContent = `${platformIcon(platform)} ${platformName(platform)}`;
}

/* ============================================================
   RESULT RENDERING
   ============================================================ */

function renderUniversalResult(data, platform) {
  currentTitle = data.title || `${platformName(platform)} Video`;

  supportsAudio = !!data.supportsAudio;

  audioFormatId = data.audioFormatId || null;

  text(
    "universal-platform",
    `${platformIcon(platform)} ${platformName(platform)}`,
  );

  text("universal-title", currentTitle);

  text("universal-uploader", data.uploader ? `👤 ${data.uploader}` : "👤 —");

  text("universal-duration", `⏱ ${formatDuration(data.duration)}`);

  text(
    "universal-views",
    data.viewCount != null ? `👁 ${formatViews(data.viewCount)}` : "👁 —",
  );

  text("universal-resolution", `📐 ${data.resolution || "Available"}`);

  /*
   * Thumbnail.
   */
  const thumbnail = $("universal-thumbnail");

  if (thumbnail) {
    thumbnail.src = data.thumbnail || "";

    thumbnail.alt = currentTitle;
  }

  /*
   * Direct video preview for
   * platforms where yt-dlp gives
   * a direct URL.
   */
  const video = $("universal-video");

  if (video) {
    if (data.videoUrl) {
      video.src = data.videoUrl;

      video.load();

      show("universal-video-wrap");
    } else {
      video.removeAttribute("src");

      hide("universal-video-wrap");
    }
  }

  /*
   * Quality buttons.
   */
  renderFormats(data.formats || []);

  /*
   * Audio button.
   */
  const audioButton = $("universal-audio-btn");

  if (audioButton) {
    if (platform === "youtube") {
      audioButton.disabled = false;

      audioButton.classList.remove("hidden");
    } else {
      audioButton.disabled = true;

      audioButton.classList.add("hidden");
    }
  }

  /*
   * Download wrapper.
   */
  hide("universal-download-wrap");
}

/* ============================================================
   FORMAT RENDER
   ============================================================ */

function renderFormats(formats) {
  const grid = $("universal-formats");

  if (!grid) {
    return;
  }

  grid.innerHTML = "";

  if (!formats.length) {
    text("universal-quality-label", "Available video");

    return;
  }

  const fragment = document.createDocumentFragment();

  formats.forEach((format, index) => {
    const button = document.createElement("button");

    button.type = "button";

    button.className = "format-btn";

    button.dataset.formatId = format.formatId;

    button.textContent =
      format.label || format.resolution || `Format ${index + 1}`;

    button.addEventListener("click", () => {
      selectFormat(button, format);
    });

    fragment.appendChild(button);
  });

  grid.appendChild(fragment);

  /*
   * Automatically select first
   * / highest quality.
   */
  const first = grid.querySelector(".format-btn");

  if (first) {
    first.click();
  }
}

/* ============================================================
   FORMAT SELECT
   ============================================================ */

function selectFormat(button, format) {
  document
    .querySelectorAll("#universal-formats .format-btn")
    .forEach((item) => item.classList.remove("active"));

  button.classList.add("active");

  selectedFormatId = format.formatId;

  selectedIsMuxed = !!format.isMuxed;

  const wrap = $("universal-download-wrap");

  const label = $("universal-download-label");

  if (wrap) {
    wrap.classList.remove("hidden");
  }

  if (label) {
    label.textContent = `Download ${format.resolution || "Video"}`;
  }
}

/* ============================================================
   UNIVERSAL VIDEO DOWNLOAD
   ============================================================ */

async function downloadUniversalVideo() {
  if (!currentUrl) {
    showToast("⚠️ Fetch a video first.");

    return;
  }

  /*
   * For YouTube, quality is selected.
   *
   * Other platforms may not return
   * format IDs.
   */
  await startDownload(
    {
      url: currentUrl,

      platform: currentPlatform,

      mediaType: "video",

      formatId: selectedFormatId,

      videoTitle: currentTitle,
    },
    "universal",
  );
}

/* ============================================================
   UNIVERSAL AUDIO
   ============================================================ */

async function downloadUniversalAudio() {
  if (!currentUrl) {
    showToast("⚠️ Fetch a video first.");

    return;
  }

  if (currentPlatform !== "youtube") {
    showToast(
      "⚠️ Audio download is currently available for supported YouTube videos.",
    );

    return;
  }

  await startDownload(
    {
      url: currentUrl,

      platform: "youtube",

      mediaType: "audio",

      formatId: audioFormatId,

      videoTitle: currentTitle,
    },
    "universal",
  );
}

/* ============================================================
   DOWNLOAD
   ============================================================ */

async function startDownload(params, prefix) {
  if (activeDownloadJob) {
    showToast("⚠️ Another download is already preparing.");

    return;
  }

  activeDownloadJob = true;

  resetProgress(prefix);

  try {
    const response = await fetch(`${API}/api/download/start`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(params),

      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.jobId) {
      throw new Error(data.error || "Could not start download.");
    }

    const jobId = data.jobId;

    showToast("⬇️ Download started...", 4000);

    let firstCheck = true;

    let lastProgress = 0;
    let statusRateLimitRetries = 0;

    while (true) {
      // Keep polling responsive without hammering the 90 req/min status limit.
      await sleep(firstCheck ? 250 : 800);

      firstCheck = false;

      const statusResponse = await fetch(
        `${API}/api/download/status/${encodeURIComponent(jobId)}`,
        {
          cache: "no-store",
        },
      );

      const status = await statusResponse.json().catch(() => ({}));

      if (statusResponse.status === 429 && statusRateLimitRetries < 3) {
        statusRateLimitRetries += 1;

        const retryAfter = Number(statusResponse.headers.get("Retry-After"));
        const waitMs = Number.isFinite(retryAfter)
          ? Math.min(Math.max(retryAfter, 1) * 1000, 5000)
          : 2000;

        await sleep(waitMs);
        continue;
      }

      if (!statusResponse.ok) {
        throw new Error(status.error || "Could not read download status.");
      }

      statusRateLimitRetries = 0;

      const progress = Math.max(lastProgress, Number(status.progress) || 0);

      lastProgress = progress;

      let label = status.stage || "Downloading...";

      if (status.status === "downloading") {
        label = `⬇️ ${label}`;
      }

      if (status.status === "merging") {
        label = "🔀 Merging video + audio...";
      }

      if (status.status === "processing") {
        label = "⚙️ Finalizing...";
      }

      updateProgress(prefix, progress, label);

      if (status.status === "error") {
        throw new Error(status.error || "Download failed.");
      }

      if (status.status === "ready") {
        updateProgress(prefix, 100, "⬇️ Starting download...");

        await triggerDownload(
          jobId,
          status.filename || data.filename || buildDownloadFilename(currentTitle, params.mediaType === "audio" ? "mp3" : "mp4"),
        );

        finishProgress(prefix);

        showToast("✅ Download started!", 5000);

        break;
      }
    }
  } catch (error) {
    console.error("[download]", error);

    failProgress(prefix, error.message);

    showToast(`❌ ${error.message || "Download failed."}`, 6000);
  } finally {
    activeDownloadJob = null;
  }
}

/* ============================================================
   PROGRESS
   ============================================================ */

function resetProgress(prefix) {
  show(`${prefix}-progress`);

  const fill = $(`${prefix}-progress-fill`);

  const label = $(`${prefix}-progress-label`);

  if (fill) {
    fill.style.width = "0%";
  }

  if (label) {
    label.textContent = "⏳ Preparing download...";
  }
}

function updateProgress(prefix, percent, label) {
  show(`${prefix}-progress`);

  const fill = $(`${prefix}-progress-fill`);

  const labelElement = $(`${prefix}-progress-label`);

  const safe = Math.max(0, Math.min(100, Number(percent) || 0));

  if (fill) {
    fill.style.transition = "width 0.25s ease";

    fill.style.width = `${safe}%`;
  }

  if (labelElement) {
    labelElement.textContent = `${label} — ${Math.round(safe)}%`;
  }
}

function finishProgress(prefix) {
  const fill = $(`${prefix}-progress-fill`);

  const label = $(`${prefix}-progress-label`);

  if (fill) {
    fill.style.width = "100%";
  }

  if (label) {
    label.textContent = "✅ Download started";
  }

  setTimeout(() => hide(`${prefix}-progress`), 5000);
}

function failProgress(prefix, message) {
  const label = $(`${prefix}-progress-label`);

  if (label) {
    label.textContent = `❌ ${message || "Download failed"}`;
  }

  setTimeout(() => hide(`${prefix}-progress`), 6000);
}

/* ============================================================
   BROWSER DOWNLOAD
   ============================================================ */

function buildDownloadFilename(title, extension = "mp4") {
  const safeTitle = String(title || "video")
    .replace(/[\\/:*?"<>|\u0000-\u001F]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 100) || "video";

  return `VidSnatch_${safeTitle}.${extension}`;
}

async function triggerDownload(jobId, filename = "VidSnatch.mp4") {
  const fileUrl = `${API}/api/download/file/${encodeURIComponent(jobId)}`;
  let response = null;
  let lastError = null;

  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      response = await fetch(fileUrl, {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      });

      if (response.ok) break;

      const payload = await response.json().catch(() => ({}));
      lastError = new Error(
        payload.error || `Download file unavailable (${response.status}).`,
      );
    } catch (error) {
      lastError = error;
    }

    if (attempt < 5) {
      await sleep(700 * (attempt + 1));
    }
  }

  if (!response?.ok) {
    throw lastError || new Error("Download file unavailable.");
  }

  const blob = await response.blob();
  if (!blob.size) {
    throw new Error("Downloaded file is empty.");
  }

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(objectUrl);
  }, 1500);
}

/* ============================================================
   ERRORS
   ============================================================ */

function showPlatformError(message) {
  const error = $("universal-error");

  if (!error) {
    showToast(`❌ ${message}`, 6000);

    return;
  }

  error.textContent = `❌ ${message}`;

  show("universal-error");

  hide("universal-result");
}

/* ============================================================
   FORMAT HELPERS
   ============================================================ */

function formatDuration(value) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "—";
  }

  const total = Math.max(0, Math.floor(Number(value)));

  const hours = Math.floor(total / 3600);

  const minutes = Math.floor((total % 3600) / 60);

  const seconds = total % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      seconds,
    ).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatViews(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  if (number >= 1_000_000_000) {
    return `${(number / 1_000_000_000).toFixed(1)}B`;
  }

  if (number >= 1_000_000) {
    return `${(number / 1_000_000).toFixed(1)}M`;
  }

  if (number >= 1_000) {
    return `${(number / 1_000).toFixed(1)}K`;
  }

  return String(number);
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/* ============================================================
   ENTER KEY
   ============================================================ */

document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") {
    return;
  }

  const active = document.activeElement;

  if (active?.id === "universal-url-input") {
    event.preventDefault();

    fetchUniversal();
  }
});

/* ============================================================
   LEGAL CONTENT
   ============================================================ */

const legalContent = {
  terms: {
    title: "Terms of Service",

    html: `
      <p>
        Welcome to VidSnatch. By using this website,
        you agree to use the service responsibly and
        in accordance with applicable laws and platform
        terms.
      </p>

      <h3>Use of the Service</h3>

      <p>
        VidSnatch provides an interface for processing
        publicly accessible media URLs. You are responsible
        for ensuring that you have the necessary rights or
        permission to download content.
      </p>

      <h3>Prohibited Use</h3>

      <p>
        You must not use VidSnatch for unlawful activities,
        copyright infringement, unauthorized distribution,
        or abuse of the service.
      </p>

      <h3>User Responsibility</h3>

      <p>
        Users are responsible for the media they process
        and how downloaded content is used.
      </p>
    `,
  },

  privacy: {
    title: "Privacy Policy",

    html: `
      <p>
        VidSnatch is designed to provide a simple media
        downloading service while minimizing unnecessary
        collection of personal information.
      </p>

      <h3>URLs</h3>

      <p>
        URLs submitted to VidSnatch are processed by the
        server to retrieve media information and prepare
        requested downloads.
      </p>

      <h3>Temporary Files</h3>

      <p>
        Download files may be temporarily stored while
        a download job is processed. Temporary files are
        automatically removed after the job expires.
      </p>

      <h3>Personal Information</h3>

      <p>
        Do not submit passwords, private account details,
        or sensitive information to VidSnatch.
      </p>
    `,
  },

  copyright: {
    title: "Copyright",

    html: `
      <p>
        VidSnatch respects copyright and intellectual
        property rights.
      </p>

      <h3>User Responsibility</h3>

      <p>
        Only download content that you own, have permission
        to use, or are legally permitted to download.
      </p>

      <h3>Platform Terms</h3>

      <p>
        Always respect the terms of service and copyright
        policies of the platform where the content was
        originally published.
      </p>
    `,
  },

  contact: {
    title: "Contact VidSnatch",

    html: `
      <p>
        For technical issues, copyright concerns, or
        general questions, contact the VidSnatch team.
      </p>

      <h3>Email</h3>

      <p>
        <a href="mailto:contact@vidsnatch.fun">
          contact@vidsnatch.fun
        </a>
      </p>
    `,
  },
};

/* ============================================================
   LEGAL MODAL
   ============================================================ */

function openLegalModal(type) {
  const modal = $("legal-modal");

  const title = $("legal-modal-title");

  const content = $("legal-modal-content");

  const data = legalContent[type];

  if (!modal || !title || !content || !data) {
    return;
  }

  title.textContent = data.title;

  content.innerHTML = data.html;

  modal.classList.remove("hidden");

  document.body.classList.add("legal-modal-open");
}

function closeLegalModal() {
  const modal = $("legal-modal");

  if (!modal) {
    return;
  }

  modal.classList.add("hidden");

  document.body.classList.remove("legal-modal-open");
}

/* ============================================================
   MODAL EVENTS
   ============================================================ */

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLegalModal();
  }
});

$("legal-modal")?.addEventListener("click", (event) => {
  if (event.target === event.currentTarget) {
    closeLegalModal();
  }
});

/* ============================================================
   GLOBAL FUNCTIONS
   ============================================================ */

window.fetchUniversal = fetchUniversal;

window.downloadUniversalVideo = downloadUniversalVideo;

window.downloadUniversalAudio = downloadUniversalAudio;

window.selectFormat = selectFormat;

window.openLegalModal = openLegalModal;

window.closeLegalModal = closeLegalModal;

/*
 * Backward-compatible aliases.
 *
 * These allow old buttons/functions to
 * keep working until index.html is replaced.
 */
window.fetchInstagram = fetchUniversal;

window.fetchYouTube = fetchUniversal;

window.downloadInstagramVideo = downloadUniversalVideo;

window.downloadYouTubeVideo = downloadUniversalVideo;

window.downloadYouTubeAudio = downloadUniversalAudio;

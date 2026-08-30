/* ============================================================
   VidSnatch Shared Downloader
   File: frontend/public/downloader.js

   Supports:
   YouTube
   Instagram
   Facebook
   TikTok
   X / Twitter
   Reddit
   Threads
   Pinterest
   Snapchat

   Works with:
   - Home universal downloader
   - Dedicated SEO downloader pages
   - translations.js
   ============================================================ */

(() => {
  "use strict";

  /* ==========================================================
     CONFIG
     ========================================================== */

  const API = (window.VIDSNATCH_API || window.location.origin).replace(
    /\/$/,
    "",
  );

  const INFO_TIMEOUT = 90000;
  const DOWNLOAD_TIMEOUT = 120000;

  const STATUS_INTERVAL = 700;
  const MAX_STATUS_CHECKS = 430;

  /* ==========================================================
     STATE
     ========================================================== */

  let currentUrl = "";
  let currentPlatform = "";
  let currentTitle = "";

  let selectedFormatId = "";
  let audioFormatId = "";

  let currentFormats = [];

  let activeDownloadJob = false;
  let initialized = false;

  /* ==========================================================
     DOM ID ALIASES
     ========================================================== */

  /*
   * Home page uses universal-* IDs.
   *
   * Dedicated pages may use:
   * video-url
   * fetch-video
   * download-video
   * download-audio
   * formats-grid
   * downloader-result
   * etc.
   *
   * This allows one downloader.js to work on both.
   */

  const IDS = {
    url: ["universal-url-input", "video-url"],

    fetch: ["universal-fetch-btn", "fetch-video"],

    clear: ["universal-clear-btn", "clear-url"],

    videoDownload: ["universal-download-btn", "download-video"],

    audioDownload: ["universal-audio-btn", "download-audio"],

    copy: ["universal-copy-btn", "copy-url"],

    thumbnail: ["universal-thumbnail", "yt-thumbnail"],

    video: ["universal-video", "yt-video"],

    formats: ["universal-formats", "formats-grid"],

    result: ["universal-result", "downloader-result", "yt-result"],

    loader: ["universal-loader", "downloader-loader", "yt-loader"],

    error: ["universal-error", "downloader-error", "yt-error"],

    errorText: ["universal-error-text"],

    detectedPlatform: ["universal-detected-platform", "detected-platform"],

    platform: ["universal-platform", "result-platform"],

    title: ["universal-title", "result-title"],

    duration: ["universal-duration", "result-duration"],

    views: ["universal-views", "result-views"],

    author: ["universal-author", "result-author"],

    qualityLabel: ["universal-quality-label"],

    downloadLabel: ["universal-download-label"],

    downloadWrap: ["universal-download-wrap"],

    videoWrap: ["universal-video-wrap", "video-preview-wrap"],

    progress: ["universal-download-progress", "download-progress"],

    progressFill: ["universal-progress-fill", "progress-fill"],

    progressLabel: ["universal-progress-label", "progress-label"],

    toast: ["toast"],
  };

  /* ==========================================================
     DOM HELPERS
     ========================================================== */

  function getElement(name) {
    const candidates = IDS[name] || [name];

    for (const id of candidates) {
      const element = document.getElementById(id);

      if (element) {
        return element;
      }
    }

    return null;
  }

  function show(name) {
    const element = getElement(name);

    if (!element) {
      return;
    }

    element.classList.remove("hidden");

    element.removeAttribute("hidden");
  }

  function hide(name) {
    const element = getElement(name);

    if (!element) {
      return;
    }

    element.classList.add("hidden");

    element.setAttribute("hidden", "");
  }

  function setText(name, value) {
    const element = getElement(name);

    if (!element) {
      return;
    }

    element.textContent = value ?? "";
  }

  /* ==========================================================
     TRANSLATION
     ========================================================== */

  function translate(key, fallback) {
    try {
      const translator = window.VidSnatchTranslations;

      if (translator && typeof translator.translate === "function") {
        const result = translator.translate(key);

        if (result && result !== key) {
          return result;
        }
      }
    } catch {}

    return fallback || key;
  }

  function currentLanguage() {
    try {
      return localStorage.getItem("vidsnatch-language") || "en";
    } catch {
      return "en";
    }
  }

  /* ==========================================================
     GENERAL HELPERS
     ========================================================== */

  function sanitizeText(value) {
    return String(value ?? "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function normalizeUrl(value) {
    const raw = sanitizeText(value);

    if (!raw) {
      return "";
    }

    if (/^https?:\/\//i.test(raw)) {
      return raw;
    }

    return `https://${raw}`;
  }

  function safeUrl(value) {
    try {
      const url = new URL(normalizeUrl(value));

      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return null;
      }

      return url;
    } catch {
      return null;
    }
  }

  /* ==========================================================
     PLATFORM DETECTION
     ========================================================== */

  function detectPlatform(value) {
    const parsed = safeUrl(value);

    if (!parsed) {
      return "";
    }

    const host = parsed.hostname
      .toLowerCase()
      .replace(/^www\./, "")
      .replace(/^m\./, "");

    if (
      host === "youtube.com" ||
      host === "youtu.be" ||
      host.endsWith(".youtube.com")
    ) {
      return "youtube";
    }

    if (
      host === "instagram.com" ||
      host === "instagr.am" ||
      host.endsWith(".instagram.com")
    ) {
      return "instagram";
    }

    if (
      host === "facebook.com" ||
      host === "fb.watch" ||
      host.endsWith(".facebook.com")
    ) {
      return "facebook";
    }

    if (host === "tiktok.com" || host.endsWith(".tiktok.com")) {
      return "tiktok";
    }

    if (
      host === "twitter.com" ||
      host === "x.com" ||
      host.endsWith(".twitter.com") ||
      host.endsWith(".x.com")
    ) {
      return "twitter";
    }

    if (
      host === "reddit.com" ||
      host === "redd.it" ||
      host.endsWith(".reddit.com")
    ) {
      return "reddit";
    }

    if (host === "threads.net" || host.endsWith(".threads.net")) {
      return "threads";
    }

    if (
      host === "pinterest.com" ||
      host === "pin.it" ||
      host.endsWith(".pinterest.com")
    ) {
      return "pinterest";
    }

    if (host === "snapchat.com" || host.endsWith(".snapchat.com")) {
      return "snapchat";
    }

    return "";
  }

  function platformLabel(platform) {
    const labels = {
      youtube: "YouTube",
      instagram: "Instagram",
      facebook: "Facebook",
      tiktok: "TikTok",
      twitter: "X / Twitter",
      reddit: "Reddit",
      threads: "Threads",
      pinterest: "Pinterest",
      snapchat: "Snapchat",
    };

    return labels[platform] || "Video";
  }

  /* ==========================================================
     FETCH WITH TIMEOUT
     ========================================================== */

  async function fetchWithTimeout(url, options = {}, timeout = 30000) {
    const controller = new AbortController();

    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      return await fetch(url, {
        ...options,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  }

  async function readJson(response) {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }

  /* ==========================================================
     TOAST
     ========================================================== */

  function showToast(message, duration = 3500) {
    const toast = getElement("toast");

    if (!toast) {
      console.log("[VidSnatch]", message);

      return;
    }

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toast._vidsnatchTimer);

    toast._vidsnatchTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, duration);
  }

  /* ==========================================================
     RESET
     ========================================================== */

  function resetResult() {
    currentTitle = "";

    selectedFormatId = "";
    audioFormatId = "";

    currentFormats = [];

    hide("result");
    hide("downloadWrap");
    hide("videoWrap");
    hide("loader");
    hide("error");

    setText("errorText", "");

    setText("platform", "");

    setText("title", "");

    setText("duration", "");

    setText("views", "");

    setText("author", "");

    setText("qualityLabel", translate("quality.title", "Available Quality"));

    const thumbnail = getElement("thumbnail");

    if (thumbnail) {
      thumbnail.removeAttribute("src");
    }

    const video = getElement("video");

    if (video) {
      try {
        video.pause();
      } catch {}

      video.removeAttribute("src");

      try {
        video.load();
      } catch {}
    }

    const formats = getElement("formats");

    if (formats) {
      formats.innerHTML = "";
    }
  }

  /* ==========================================================
     ERROR
     ========================================================== */

  function showError(message) {
    hide("loader");

    const finalMessage =
      sanitizeText(message) ||
      translate("error.fetch", "Unable to fetch video information.");

    const errorText = getElement("errorText");

    if (errorText) {
      errorText.textContent = finalMessage;
    }

    const error = getElement("error");

    if (error) {
      if (!errorText && error.id === "downloader-error") {
        error.textContent = finalMessage;
      }

      show("error");
    }
  }

  /* ==========================================================
     LOADING
     ========================================================== */

  function setLoading(loading) {
    const button = getElement("fetch");

    if (loading) {
      show("loader");

      if (button) {
        button.disabled = true;

        button.dataset.vidsnatchOriginal = button.textContent;

        button.textContent = translate(
          "loading.fetching",
          "Fetching video information...",
        );
      }

      return;
    }

    hide("loader");

    if (button) {
      button.disabled = false;

      button.textContent = translate("button.fetch", "Fetch Video");
    }
  }

  /* ==========================================================
     PROGRESS
     ========================================================== */

  function resetProgress() {
    const fill = getElement("progressFill");

    if (fill) {
      fill.style.width = "0%";
    }

    setText(
      "progressLabel",
      translate("loading.preparing", "Preparing download..."),
    );

    hide("progress");
  }

  function updateProgress(value, status) {
    const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

    const fill = getElement("progressFill");

    if (fill) {
      fill.style.width = `${safeValue}%`;
    }

    setText(
      "progressLabel",
      status ||
        `${translate(
          "loading.processing",
          "Processing your download...",
        )} ${Math.round(safeValue)}%`,
    );

    show("progress");
  }

  /* ==========================================================
     INFO API
     ========================================================== */

  async function fetchInfo(url, platform) {
    const response = await fetchWithTimeout(
      `${API}/api/info`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Accept: "application/json",
        },

        body: JSON.stringify({
          url,
          platform,
          type: platform,
        }),

        cache: "no-store",
      },
      INFO_TIMEOUT,
    );

    const data = await readJson(response);

    if (!response.ok) {
      throw new Error(
        data.error ||
          translate(
            "error.fetch",
            `Unable to fetch video information (${response.status}).`,
          ),
      );
    }

    return data;
  }

  /* ==========================================================
     INFO NORMALIZATION
     ========================================================== */

  function normalizeInfo(data) {
    if (!data) {
      return {};
    }

    if (data.data && typeof data.data === "object") {
      return data.data;
    }

    if (data.result && typeof data.result === "object") {
      return data.result;
    }

    if (data.info && typeof data.info === "object") {
      return data.info;
    }

    return data;
  }

  /* ==========================================================
     FORMAT NORMALIZATION
     ========================================================== */

  function normalizeFormat(format, index) {
    if (!format) {
      return null;
    }

    if (typeof format === "string") {
      return {
        formatId: format,

        format_id: format,

        label: format,

        quality: format,

        resolution: format,

        type: "video",

        index,
      };
    }

    const formatId =
      format.formatId || format.format_id || format.id || format.itag || "";

    const height = Number(format.height) || 0;

    const width = Number(format.width) || 0;

    const resolution =
      format.resolution ||
      (height ? `${height}p` : width && height ? `${width}x${height}` : "");

    const type = format.type || (format.vcodec === "none" ? "audio" : "video");

    return {
      ...format,

      formatId,

      format_id: format.format_id || formatId,

      id: format.id || formatId,

      label:
        format.label || format.quality || resolution || `Format ${index + 1}`,

      quality: format.quality || format.qualityLabel || resolution || "",

      resolution,

      type,

      height,

      width,

      filesize: format.filesize || format.filesize_approx || 0,

      index,
    };
  }

  function normalizeFormats(formats) {
    if (!Array.isArray(formats)) {
      return [];
    }

    return formats.map(normalizeFormat).filter(Boolean);
  }

  /* ==========================================================
     FORMAT SIZE
     ========================================================== */

  function formatSize(bytes) {
    const value = Number(bytes);

    if (!Number.isFinite(value) || value <= 0) {
      return "";
    }

    const units = ["B", "KB", "MB", "GB"];

    let size = value;

    let unit = 0;

    while (size >= 1024 && unit < units.length - 1) {
      size /= 1024;

      unit++;
    }

    const decimals = size >= 100 ? 0 : size >= 10 ? 1 : 2;

    return `${size.toFixed(decimals)} ${units[unit]}`;
  }

  /* ==========================================================
     FORMAT LABEL
     ========================================================== */

  function formatLabel(format) {
    const parts = [];

    if (format.resolution) {
      parts.push(format.resolution);
    } else if (format.quality) {
      parts.push(format.quality);
    }

    if (format.ext) {
      parts.push(String(format.ext).toUpperCase());
    }

    const size = formatSize(format.filesize);

    if (size) {
      parts.push(size);
    }

    return (
      parts.join(" • ") || format.label || `Format ${(format.index || 0) + 1}`
    );
  }

  /* ==========================================================
     RENDER FORMAT BUTTONS
     ========================================================== */

  function renderFormats(formats) {
    const grid = getElement("formats");

    if (!grid) {
      return;
    }

    grid.innerHTML = "";

    currentFormats = normalizeFormats(formats);

    if (!currentFormats.length) {
      setText("qualityLabel", translate("quality.video", "Available Video"));

      return;
    }

    setText("qualityLabel", translate("quality.title", "Available Quality"));

    const fragment = document.createDocumentFragment();

    currentFormats.forEach((format, index) => {
      const button = document.createElement("button");

      button.type = "button";

      button.className = "format-btn";

      button.dataset.formatId = format.formatId || "";

      button.dataset.index = String(index);

      button.setAttribute("aria-pressed", "false");

      button.textContent = formatLabel(format);

      button.addEventListener("click", () => {
        selectFormat(button, format);
      });

      fragment.appendChild(button);
    });

    grid.appendChild(fragment);

    const first = grid.querySelector(".format-btn");

    if (first) {
      first.click();
    }
  }

  /* ==========================================================
     SELECT FORMAT
     ========================================================== */

  function selectFormat(button, format) {
    const grid = getElement("formats");

    if (grid) {
      grid.querySelectorAll(".format-btn").forEach((item) => {
        item.classList.remove("active");

        item.setAttribute("aria-pressed", "false");
      });
    }

    button.classList.add("active");

    button.setAttribute("aria-pressed", "true");

    selectedFormatId = format.formatId || format.format_id || format.id || "";

    const resolution =
      format.resolution || format.quality || format.label || "Video";

    const label = getElement("downloadLabel");

    if (label) {
      label.textContent = `${translate(
        "button.download",
        "Download Video",
      )} ${resolution}`;
    }

    show("downloadWrap");
  }

  /* ==========================================================
     RENDER INFO
     ========================================================== */

  function renderInfo(rawData, detectedPlatform) {
    const data = normalizeInfo(rawData);

    currentTitle = sanitizeText(
      data.title || data.fulltitle || data.name || "Video",
    );

    currentPlatform =
      sanitizeText(
        data.platform || data.extractor || detectedPlatform,
      ).toLowerCase() || detectedPlatform;

    setText("platform", platformLabel(currentPlatform));

    setText("title", currentTitle);

    setText("duration", data.duration ? formatDuration(data.duration) : "");

    const views = data.viewCount || data.view_count || data.views || 0;

    setText("views", views ? formatNumber(views) : "");

    setText(
      "author",
      sanitizeText(
        data.uploader || data.channel || data.author || data.username || "",
      ),
    );

    /* --------------------------------------------------------
       THUMBNAIL
       -------------------------------------------------------- */

    const thumbnail = getElement("thumbnail");

    const thumbnailUrl =
      data.thumbnail || data.thumbnailUrl || data.thumbnail_url || "";

    if (thumbnail && thumbnailUrl) {
      thumbnail.src = thumbnailUrl;

      thumbnail.alt = currentTitle;

      thumbnail.loading = "lazy";

      thumbnail.decoding = "async";

      thumbnail.onerror = () => {
        thumbnail.removeAttribute("src");
      };
    }

    /* --------------------------------------------------------
       VIDEO PREVIEW
       -------------------------------------------------------- */

    const video = getElement("video");

    if (video && data.videoUrl) {
      video.src = data.videoUrl;

      try {
        video.load();
      } catch {}

      show("videoWrap");
    } else {
      hide("videoWrap");
    }

    /* --------------------------------------------------------
       AUDIO
       -------------------------------------------------------- */

    audioFormatId = data.audioFormatId || data.audio_format_id || "bestaudio";

    const audioButton = getElement("audioDownload");

    if (audioButton) {
      if (currentPlatform === "youtube") {
        audioButton.disabled = false;

        audioButton.classList.remove("hidden");

        audioButton.removeAttribute("hidden");
      } else {
        audioButton.disabled = true;

        audioButton.classList.add("hidden");
      }
    }

    /* --------------------------------------------------------
       FORMATS
       -------------------------------------------------------- */

    renderFormats(data.formats || data.downloads || []);

    show("result");

    hide("error");
  }

  /* ==========================================================
     DURATION
     ========================================================== */

  function formatDuration(value) {
    const seconds = Number(value);

    if (!Number.isFinite(seconds) || seconds < 0) {
      return "";
    }

    const total = Math.floor(seconds);

    const hours = Math.floor(total / 3600);

    const minutes = Math.floor((total % 3600) / 60);

    const secs = total % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(
        secs,
      ).padStart(2, "0")}`;
    }

    return `${minutes}:${String(secs).padStart(2, "0")}`;
  }

  /* ==========================================================
     NUMBER
     ========================================================== */

  function formatNumber(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return String(value ?? "");
    }

    try {
      return new Intl.NumberFormat(undefined).format(number);
    } catch {
      return String(number);
    }
  }

  /* ==========================================================
     FETCH UNIVERSAL VIDEO
     ========================================================== */

  async function fetchUniversalVideo() {
    const input = getElement("url");

    if (!input) {
      return;
    }

    const normalized = normalizeUrl(input.value);

    if (!normalized) {
      showToast(
        `⚠️ ${translate("error.empty", "Please paste a video URL first.")}`,
      );

      input.focus();

      return;
    }

    const platform = detectPlatform(normalized);

    if (!platform) {
      showError(
        translate(
          "error.unsupported",
          "This URL is not from a supported platform.",
        ),
      );

      return;
    }

    currentUrl = normalized;

    currentPlatform = platform;

    resetResult();
    resetProgress();

    setText(
      "detectedPlatform",
      `${translate("result.detected", "Detected")}: ${platformLabel(platform)}`,
    );

    setLoading(true);

    try {
      const data = await fetchInfo(normalized, platform);

      renderInfo(data, platform);

      hide("error");

      showToast(
        `✅ ${translate("status.infoLoaded", "Video information loaded.")}`,
        3000,
      );
    } catch (error) {
      console.error("[VidSnatch] Fetch error:", error);

      showError(
        error?.message ||
          translate("error.fetch", "Unable to fetch video information."),
      );
    } finally {
      setLoading(false);
    }
  }

  /* ==========================================================
     CLEAR
     ========================================================== */

  function clearInput() {
    const input = getElement("url");

    if (input) {
      input.value = "";

      input.focus();
    }

    currentUrl = "";

    currentPlatform = "";

    currentTitle = "";

    resetResult();
    resetProgress();

    setText("detectedPlatform", "");
  }

  /* ==========================================================
     COPY URL
     ========================================================== */

  async function copyCurrentUrl() {
    const input = getElement("url");

    const value = currentUrl || input?.value || "";

    if (!value) {
      showToast(
        `⚠️ ${translate("error.empty", "Please paste a video URL first.")}`,
      );

      return;
    }

    try {
      await navigator.clipboard.writeText(value);

      showToast(`✓ ${translate("button.copy", "URL copied.")}`, 2500);
    } catch {
      try {
        if (input) {
          input.select();

          document.execCommand("copy");

          showToast(`✓ ${translate("button.copy", "URL copied.")}`, 2500);

          return;
        }
      } catch {}

      showToast(`⚠️ ${translate("error.copy", "Unable to copy URL.")}`, 2500);
    }
  }

  /* ==========================================================
     DOWNLOAD START
     ========================================================== */

  async function startDownload(params) {
    if (activeDownloadJob) {
      showToast(
        `⚠️ ${translate(
          "error.busy",
          "Another download is already preparing.",
        )}`,
      );

      return;
    }

    activeDownloadJob = true;

    resetProgress();

    updateProgress(0, translate("loading.preparing", "Preparing download..."));

    try {
      const response = await fetchWithTimeout(
        `${API}/api/download/start`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Accept: "application/json",
          },

          body: JSON.stringify(params),

          cache: "no-store",
        },
        DOWNLOAD_TIMEOUT,
      );

      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            translate("error.download", "Download failed. Please try again."),
        );
      }

      /*
       * Some backends can return a direct
       * download URL immediately.
       */

      const directUrl =
        data.url ||
        data.fileUrl ||
        data.downloadUrl ||
        data.download_url ||
        data.file?.url ||
        null;

      if (directUrl) {
        updateProgress(100, translate("status.ready", "Download ready."));

        await triggerDownload(
          directUrl,
          data.filename ||
            buildFilename(
              currentTitle,
              currentPlatform,
              params.mediaType === "audio" ? "mp3" : "mp4",
            ),
        );

        showToast(
          `✅ ${translate("status.success", "Your download is ready.")}`,
          5000,
        );

        return;
      }

      const jobId = data.jobId || data.job_id || data.id || data.job?.id;

      if (!jobId) {
        throw new Error(
          data.error ||
            translate("error.download", "Could not start download."),
        );
      }

      showToast(
        `⬇️ ${translate("status.started", "Download started...")}`,
        4000,
      );

      await monitorDownload(jobId, data);
    } catch (error) {
      console.error("[VidSnatch] Download error:", error);

      showToast(
        `❌ ${
          error?.message ||
          translate("error.download", "Download failed. Please try again.")
        }`,
        5000,
      );
    } finally {
      activeDownloadJob = false;
    }
  }

  /* ==========================================================
     MONITOR DOWNLOAD
     ========================================================== */

  async function monitorDownload(jobId, startData = {}) {
    let lastProgress = 0;

    for (let attempt = 0; attempt < MAX_STATUS_CHECKS; attempt++) {
      await sleep(attempt === 0 ? 350 : STATUS_INTERVAL);

      const response = await fetchWithTimeout(
        `${API}/api/download/status/${encodeURIComponent(jobId)}`,
        {
          headers: {
            Accept: "application/json",
          },

          cache: "no-store",
        },
        30000,
      );

      const status = await readJson(response);

      if (!response.ok) {
        throw new Error(
          status.error ||
            status.message ||
            translate(
              "error.downloadStatus",
              "Could not read download status.",
            ),
        );
      }

      const progress = Math.max(
        lastProgress,
        Number(status.progress) ||
          Number(status.percent) ||
          Number(status.percentage) ||
          0,
      );

      lastProgress = progress;

      const statusName = String(
        status.status || status.state || "",
      ).toLowerCase();

      const message =
        status.message || status.statusText || status.detail || "";

      updateProgress(
        progress,
        message ||
          (statusName === "processing"
            ? `${translate(
                "loading.processing",
                "Processing your download...",
              )} ${Math.round(progress)}%`
            : `${translate(
                "loading.preparing",
                "Preparing download...",
              )} ${Math.round(progress)}%`),
      );

      /* --------------------------------------------------------
         READY
         -------------------------------------------------------- */

      if (
        statusName === "ready" ||
        statusName === "completed" ||
        statusName === "complete" ||
        statusName === "finished" ||
        statusName === "success" ||
        status.ready === true
      ) {
        updateProgress(100, translate("status.ready", "Download ready."));

        const fileUrl =
          status.fileUrl ||
          status.file_url ||
          status.url ||
          status.downloadUrl ||
          status.download_url ||
          startData.fileUrl ||
          startData.url ||
          `${API}/api/download/file/${encodeURIComponent(jobId)}`;

        const extension = startData.mediaType === "audio" ? "mp3" : "mp4";

        await triggerDownload(
          fileUrl,
          status.filename ||
            startData.filename ||
            buildFilename(currentTitle, currentPlatform, extension),
        );

        showToast(
          `✅ ${translate("status.success", "Your download is ready.")}`,
          5000,
        );

        return;
      }

      /* --------------------------------------------------------
         ERROR
         -------------------------------------------------------- */

      if (
        statusName === "error" ||
        statusName === "failed" ||
        statusName === "cancelled" ||
        statusName === "canceled"
      ) {
        throw new Error(
          status.error ||
            status.message ||
            translate("error.download", "Download failed. Please try again."),
        );
      }
    }

    throw new Error(
      translate(
        "error.timeout",
        "The download is taking too long. Please try again.",
      ),
    );
  }

  /* ==========================================================
     TRIGGER DOWNLOAD
     ========================================================== */

  async function triggerDownload(fileUrl, filename) {
    if (!fileUrl) {
      throw new Error(
        translate("error.download", "Download URL is unavailable."),
      );
    }

    /*
     * Fetch the file first and create a Blob URL. This prevents the browser
     * from navigating the current page to /api/download/file/:jobId and also
     * gives us a small retry window for the ready->file filesystem handoff.
     */
    let response = null;
    let lastError = null;

    for (let attempt = 0; attempt < 4; attempt++) {
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

      if (attempt < 3) {
        await sleep(500 * (attempt + 1));
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
    link.download = sanitizeFilename(filename || "VidSnatch.mp4");
    link.rel = "noopener";
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      link.remove();
      URL.revokeObjectURL(objectUrl);
    }, 1500);
  }

  /* ==========================================================
     FILENAME
     ========================================================== */

  function sanitizeFilename(value) {
    return (sanitizeText(value) || "vidsnatch-download")
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 150);
  }

  function buildFilename(title, platform, extension) {
    const safeTitle = sanitizeFilename(title || "video");

    const safePlatform = sanitizeFilename(platform || "download");

    return `${safeTitle}-${safePlatform}.${extension || "mp4"}`;
  }

  /* ==========================================================
     VIDEO DOWNLOAD
     ========================================================== */

  async function downloadUniversalVideo() {
    if (!currentUrl) {
      showToast(
        `⚠️ ${translate("error.empty", "Please fetch a video first.")}`,
      );

      return;
    }

    await startDownload({
      url: currentUrl,

      platform: currentPlatform,

      type: currentPlatform,

      mediaType: "video",

      formatId: selectedFormatId || undefined,

      videoTitle: currentTitle,
    });
  }

  /* ==========================================================
     AUDIO DOWNLOAD
     ========================================================== */

  async function downloadUniversalAudio() {
    if (!currentUrl) {
      showToast(
        `⚠️ ${translate("error.empty", "Please fetch a video first.")}`,
      );

      return;
    }

    if (currentPlatform !== "youtube") {
      showToast(
        `⚠️ ${translate(
          "error.audioUnsupported",
          "Audio download is currently available for supported YouTube videos.",
        )}`,
        4500,
      );

      return;
    }

    await startDownload({
      url: currentUrl,

      platform: "youtube",

      type: "youtube",

      mediaType: "audio",

      formatId: audioFormatId || "bestaudio",

      videoTitle: currentTitle,
    });
  }

  /* ==========================================================
     BUTTON STATE
     ========================================================== */

  function setButtonsBusy(busy) {
    const videoButton = getElement("videoDownload");

    const audioButton = getElement("audioDownload");

    if (videoButton) {
      videoButton.disabled = Boolean(busy);
    }

    if (audioButton) {
      audioButton.disabled = Boolean(busy);
    }
  }

  /* ==========================================================
     LIVE LANGUAGE SYNC
     ========================================================== */

  function refreshTranslatedDownloaderUI() {
    try {
      const fetchButton = getElement("fetch");

      if (fetchButton && !fetchButton.disabled) {
        fetchButton.textContent = translate("button.fetch", "Fetch Video");
      }

      const videoButton = getElement("videoDownload");

      if (videoButton) {
        const resolution = videoButton.dataset.vidsnatchResolution;

        videoButton.textContent = resolution
          ? `${translate("button.download", "Download Video")} ${resolution}`
          : translate("button.download", "Download Video");
      }

      const audioButton = getElement("audioDownload");

      if (audioButton) {
        audioButton.textContent = translate("button.audio", "Download MP3");
      }

      const quality = getElement("qualityLabel");

      if (quality) {
        quality.textContent = translate("quality.title", "Available Quality");
      }

      /*
       * Keep current selected format button.
       * Only the surrounding dynamic text is translated.
       */
      const downloadLabel = getElement("downloadLabel");

      if (downloadLabel && selectedFormatId) {
        const selected = currentFormats.find(
          (format) => String(format.formatId) === String(selectedFormatId),
        );

        if (selected) {
          const resolution =
            selected.resolution ||
            selected.quality ||
            selected.label ||
            "Video";

          downloadLabel.textContent = `${translate(
            "button.download",
            "Download Video",
          )} ${resolution}`;
        }
      }
    } catch {}
  }

  /* ==========================================================
     LANGUAGE EVENT
     ========================================================== */

  window.addEventListener("vidsnatch:languagechange", () => {
    refreshTranslatedDownloaderUI();
  });

  window.addEventListener("languagechange", () => {
    refreshTranslatedDownloaderUI();
  });

  /*
   * Some versions of translations.js update the DOM
   * without dispatching a custom event.
   *
   * This small observer catches language attribute
   * changes without touching downloader functionality.
   */

  function observeLanguageChanges() {
    if (typeof MutationObserver === "undefined") {
      return;
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          (mutation.attributeName === "lang" ||
            mutation.attributeName === "dir")
        ) {
          refreshTranslatedDownloaderUI();

          break;
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
    });
  }

  /* ==========================================================
     EVENTS
     ========================================================== */

  function bindEvents() {
    /*
     * Prevent duplicate listeners if this file
     * accidentally gets loaded more than once.
     */

    if (initialized) {
      return;
    }

    initialized = true;

    /* --------------------------------------------------------
       FETCH
       -------------------------------------------------------- */

    const fetchButton = getElement("fetch");

    if (fetchButton) {
      fetchButton.addEventListener("click", fetchUniversalVideo);
    }

    /* --------------------------------------------------------
       URL INPUT
       -------------------------------------------------------- */

    const input = getElement("url");

    if (input) {
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();

          fetchUniversalVideo();
        }
      });

      input.addEventListener("input", () => {
        hide("error");

        const platform = detectPlatform(input.value);

        if (platform) {
          setText(
            "detectedPlatform",
            `${translate("result.detected", "Detected")}: ${platformLabel(
              platform,
            )}`,
          );
        } else {
          setText("detectedPlatform", "");
        }
      });

      input.addEventListener("paste", () => {
        setTimeout(() => {
          const platform = detectPlatform(input.value);

          if (platform) {
            setText(
              "detectedPlatform",
              `${translate("result.detected", "Detected")}: ${platformLabel(
                platform,
              )}`,
            );
          }
        }, 0);
      });
    }

    /* --------------------------------------------------------
       CLEAR
       -------------------------------------------------------- */

    const clearButton = getElement("clear");

    if (clearButton) {
      clearButton.addEventListener("click", clearInput);
    }

    /* --------------------------------------------------------
       VIDEO DOWNLOAD
       -------------------------------------------------------- */

    const videoButton = getElement("videoDownload");

    if (videoButton && !videoButton.dataset.vidsnatchBound) {
      videoButton.dataset.vidsnatchBound = "true";

      videoButton.addEventListener("click", async () => {
        setButtonsBusy(true);

        try {
          await downloadUniversalVideo();
        } finally {
          setButtonsBusy(false);
        }
      });
    }

    /* --------------------------------------------------------
       AUDIO DOWNLOAD
       -------------------------------------------------------- */

    const audioButton = getElement("audioDownload");

    if (audioButton && !audioButton.dataset.vidsnatchBound) {
      audioButton.dataset.vidsnatchBound = "true";

      audioButton.addEventListener("click", async () => {
        setButtonsBusy(true);

        try {
          await downloadUniversalAudio();
        } finally {
          setButtonsBusy(false);
        }
      });
    }

    /* --------------------------------------------------------
       COPY
       -------------------------------------------------------- */

    const copyButton = getElement("copy");

    if (copyButton) {
      copyButton.addEventListener("click", copyCurrentUrl);
    }
  }

  /* ==========================================================
     INITIALIZE
     ========================================================== */

  function init() {
    bindEvents();

    resetResult();

    resetProgress();

    hide("loader");
    hide("error");
    hide("result");

    refreshTranslatedDownloaderUI();

    observeLanguageChanges();

    /*
     * translations.js may load immediately after this script.
     * Refresh a few times so the final selected language
     * is applied without changing downloader behavior.
     */

    setTimeout(refreshTranslatedDownloaderUI, 50);

    setTimeout(refreshTranslatedDownloaderUI, 250);

    setTimeout(refreshTranslatedDownloaderUI, 1000);

    console.log("[VidSnatch] Shared downloader initialized.");
  }

  /* ==========================================================
     PUBLIC API
     ========================================================== */

  window.VidSnatchDownloader = {
    fetch: fetchUniversalVideo,

    downloadVideo: downloadUniversalVideo,

    downloadAudio: downloadUniversalAudio,

    clear: clearInput,

    copy: copyCurrentUrl,

    detectPlatform: detectPlatform,

    getState() {
      return {
        currentUrl,
        currentPlatform,
        currentTitle,
        selectedFormatId,
        audioFormatId,
        activeDownloadJob,
        language: currentLanguage(),
      };
    },
  };

  /* ==========================================================
     DOM READY
     ========================================================== */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, {
      once: true,
    });
  } else {
    init();
  }
})();

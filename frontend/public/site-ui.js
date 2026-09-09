/* VidSnatch V5 — one shared site shell for every page. */
(() => {
  "use strict";

  const LANG_KEY = "vidsnatch-language";
  const THEME_KEY = "vidsnatch-theme";

  const PLATFORMS = [
    ["instagram", "◎", "Instagram", "/instagram-reel-downloader/"],
    ["youtube", "▶", "YouTube", "/youtube-video-downloader/"],
    ["facebook", "f", "Facebook", "/facebook-video-downloader/"],
    ["tiktok", "♪", "TikTok", "/tiktok-video-downloader/"],
    ["twitter", "𝕏", "X / Twitter", "/twitter-video-downloader/"],
    ["reddit", "●", "Reddit", "/reddit-video-downloader/"],
    ["threads", "@", "Threads", "/threads-video-downloader/"],
    ["pinterest", "P", "Pinterest", "/pinterest-video-downloader/"],
    ["snapchat", "👻", "Snapchat", "/snapchat-video-downloader/"],
  ];

  const FALLBACK_LANGUAGES = {
    en:{nativeName:"English",direction:"ltr"}, hi:{nativeName:"हिन्दी",direction:"ltr"},
    fr:{nativeName:"Français",direction:"ltr"}, te:{nativeName:"తెలుగు",direction:"ltr"},
    ta:{nativeName:"தமிழ்",direction:"ltr"}, kn:{nativeName:"ಕನ್ನಡ",direction:"ltr"},
    ar:{nativeName:"العربية",direction:"rtl"}, bn:{nativeName:"বাংলা",direction:"ltr"},
    es:{nativeName:"Español",direction:"ltr"}, pt:{nativeName:"Português",direction:"ltr"},
    de:{nativeName:"Deutsch",direction:"ltr"}, it:{nativeName:"Italiano",direction:"ltr"},
    tr:{nativeName:"Türkçe",direction:"ltr"}, id:{nativeName:"Bahasa Indonesia",direction:"ltr"},
    vi:{nativeName:"Tiếng Việt",direction:"ltr"}, ja:{nativeName:"日本語",direction:"ltr"},
    ko:{nativeName:"한국어",direction:"ltr"}, zh:{nativeName:"中文",direction:"ltr"},
    ru:{nativeName:"Русский",direction:"ltr"}, ur:{nativeName:"اردو",direction:"rtl"}
  };

  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const tApi = () => window.VidSnatchTranslations || null;
  const languages = () => tApi()?.languages || FALLBACK_LANGUAGES;

  function getLanguage() {
    try {
      const api=tApi();
      const v=api?.getLanguage?.() || localStorage.getItem(LANG_KEY) || "en";
      return languages()[v] ? v : "en";
    } catch { return "en"; }
  }

  function translate(key, fallback="") {
    try {
      const v=tApi()?.translate?.(key);
      if (v && v !== key) return v;
    } catch {}
    return fallback || key;
  }

  function normalizePath(path) {
    try { return new URL(path, location.origin).pathname.replace(/\/+$/, "") || "/"; }
    catch { return String(path || "/").replace(/\/+$/, "") || "/"; }
  }

  function platformMarkup() {
    const current=normalizePath(location.pathname);
    return PLATFORMS.map(([key,icon,fallback,href]) => `
      <a class="nav-platform${normalizePath(href)===current?" active":""}"
         data-platform="${key}" href="${href}" title="${fallback} Video Downloader">
        <span class="nav-platform-icon" aria-hidden="true">${icon}</span>
        <span class="nav-platform-text">${translate(`nav.${key}`, fallback)}</span>
      </a>`).join("");
  }

  function languageMarkup() {
    const current=getLanguage();
    return Object.entries(languages()).map(([code,info]) => `
      <button type="button" class="vs-language-option${code===current?" active":""}"
        data-vs-language="${code}" role="option" aria-selected="${code===current}">${info.nativeName}</button>`).join("");
  }

  function navbarMarkup() {
    const current = getLanguage();
    const info = languages()[current] || FALLBACK_LANGUAGES.en;
    return `
      <header class="site-header vs-shared-header" data-vs-shared-header="true">
        <nav class="navbar" aria-label="Main navigation" dir="ltr">
          <a class="brand" href="/" aria-label="VidSnatch Home">
            <span class="logo-icon" aria-hidden="true">⚡</span><span>VidSnatch</span>
          </a>
          <div class="nav-platforms" data-vs-platforms>${platformMarkup()}</div>
          <div class="nav-actions">
            ${themeMarkup()}
            <div class="language-selector vs-language-selector">
              <button type="button" class="language-btn" id="vs-language-btn"
                aria-haspopup="listbox" aria-expanded="false">
                <span aria-hidden="true">🌐</span><span id="vs-current-language">${info.nativeName}</span><span aria-hidden="true">⌄</span>
              </button>
              <div class="language-menu hidden" id="vs-language-menu" role="listbox" aria-label="Languages">
                ${languageMarkup()}
              </div>
            </div>
            <button type="button" class="vs-mobile-menu-btn" id="vs-mobile-menu-btn"
              aria-expanded="false" aria-controls="vs-mobile-menu" aria-label="Open navigation menu" title="Menu">
              <span aria-hidden="true">☰</span>
            </button>
          </div>
        </nav>
        <div class="vs-mobile-menu hidden" id="vs-mobile-menu" aria-label="All platforms">
          <div class="vs-mobile-menu-grid">${platformMarkup()}</div>
        </div>
      </header>`;
  }

  function themeMarkup() {
    return `<button type="button" id="vs-theme-toggle" class="vs-theme-toggle" aria-pressed="false">
      <span class="vs-theme-icon" aria-hidden="true">☾</span>
      <span class="vs-theme-label">Night</span>
      <span class="vs-theme-track" aria-hidden="true"><span class="vs-theme-knob"></span></span>
    </button>`;
  }

  function faqMarkup() {
    return `<section class="faq-section vs-shared-faq" data-vs-shared-content="faq">
      <div class="section-heading">
        <span class="eyebrow" data-i18n="faq.eyebrow">FAQ</span>
        <h2 data-i18n="faq.title">Frequently Asked Questions</h2>
      </div>
      <div class="faq-list">
        <details class="faq-item"><summary>What platforms does VidSnatch support?</summary><p>VidSnatch supports public media URLs from YouTube, Instagram, TikTok, Facebook, X, Reddit, Threads, Pinterest and Snapchat, subject to platform availability and technical restrictions.</p></details>
        <details class="faq-item"><summary>How do I download a video?</summary><p>Paste a supported public video URL into the downloader, select an available quality, and start the download.</p></details>
        <details class="faq-item"><summary>Is VidSnatch free to use?</summary><p>Yes. VidSnatch provides the downloader interface without requiring an account or subscription.</p></details>
        <details class="faq-item"><summary>Can I download private videos?</summary><p>No. VidSnatch is intended for publicly accessible media and cannot guarantee access to private, restricted or unavailable content.</p></details>
      </div>
    </section>`;
  }

  function footerMarkup() {
    const year=new Date().getFullYear();
    return `<footer class="site-footer vs-shared-footer" data-vs-shared-content="footer">
      <div class="footer-inner">
        <div class="footer-brand"><div class="footer-logo">⚡ VidSnatch</div>
          <p class="footer-note" data-i18n="footer.note">For personal use only. Respect copyright laws, platform rules and content creators.</p>
        </div>
        <div class="footer-links">
          <button type="button" data-vs-legal="terms" data-i18n="footer.terms">Terms</button>
          <button type="button" data-vs-legal="privacy" data-i18n="footer.privacy">Privacy</button>
          <button type="button" data-vs-legal="copyright" data-i18n="footer.copyright">Copyright</button>
          <button type="button" data-vs-legal="contact" data-i18n="footer.contact">Contact</button>
        </div>
        <div class="footer-copy">© ${year} VidSnatch. All rights reserved.</div>
      </div>
    </footer>`;
  }

  const LEGAL={
    terms:["Terms of Service","VidSnatch provides an interface for processing publicly accessible media URLs. Use the service responsibly and only download content you own, have permission to use, or are legally permitted to download."],
    privacy:["Privacy Policy","URLs submitted to VidSnatch are processed to retrieve media information and prepare requested downloads. Temporary download files may be removed automatically after processing. Do not submit passwords or sensitive information."],
    copyright:["Copyright","VidSnatch respects copyright and intellectual property rights. Always respect the copyright policies and terms of the platform where the content was published."],
    contact:["Contact VidSnatch","For technical issues, copyright concerns, or general questions, contact contact@vidsnatch.fun."]
  };

  function modalMarkup(){return `<div id="vs-legal-modal" class="legal-modal hidden" role="dialog" aria-modal="true" aria-labelledby="vs-legal-title"><div class="legal-modal-card"><div class="legal-modal-header"><h2 id="vs-legal-title"></h2><button type="button" class="legal-modal-close" data-vs-close-legal>×</button></div><div id="vs-legal-content" class="legal-modal-content"></div></div></div>`;}

  function removeOldShell() {
    $$('[data-vs-shared-header="true"], #site-header, .vs-theme-row, .site-footer, .downloader-footer, .faq-section, .downloader-faq, #legal-modal, #vs-legal-modal').forEach(el=>el.remove());
    // Legacy downloader navs only; never remove main content.
    $$('body > nav.downloader-nav, body > header.downloader-nav').forEach(el=>el.remove());
  }

  function closeLanguageMenu(){
    const menu=$("#vs-language-menu"), btn=$("#vs-language-btn");
    if(!menu)return; menu.classList.add("hidden"); btn?.setAttribute("aria-expanded","false");
  }
  function toggleLanguageMenu(){
    const menu=$("#vs-language-menu"), btn=$("#vs-language-btn"); if(!menu)return;
    const open=!menu.classList.contains("hidden"); menu.classList.toggle("hidden",open); btn?.setAttribute("aria-expanded",String(!open));
  }

  function closeMobileMenu(){
    const menu=$("#vs-mobile-menu"), btn=$("#vs-mobile-menu-btn");
    if(!menu)return;
    menu.classList.add("hidden");
    btn?.setAttribute("aria-expanded","false");
    btn?.setAttribute("aria-label","Open navigation menu");
  }

  function toggleMobileMenu(){
    const menu=$("#vs-mobile-menu"), btn=$("#vs-mobile-menu-btn");
    if(!menu)return;
    const open=!menu.classList.contains("hidden");
    menu.classList.toggle("hidden",open);
    btn?.setAttribute("aria-expanded",String(!open));
    btn?.setAttribute("aria-label",open?"Open navigation menu":"Close navigation menu");
    if(!open)closeLanguageMenu();
  }

  function updateNavbarLanguage(language=getLanguage()){
    const info=languages()[language]||languages().en||FALLBACK_LANGUAGES.en;
    const current=$("#vs-current-language"); if(current)current.textContent=info.nativeName;
    $$('[data-vs-language]').forEach(b=>{const active=b.dataset.vsLanguage===language;b.classList.toggle("active",active);b.setAttribute("aria-selected",String(active));});
    $$('.nav-platform').forEach(a=>{const p=PLATFORMS.find(x=>x[0]===a.dataset.platform);if(!p)return;const s=$(".nav-platform-text",a);if(s)s.textContent=translate(`nav.${p[0]}`,p[2]);});
    const header=$(".vs-shared-header"); if(header)header.dir="ltr";
    document.documentElement.lang=language;
    document.documentElement.dir=info.direction||"ltr";
    // The shared shell is intentionally LTR even for Arabic/Urdu.
    if(header)header.dir="ltr";
    try{tApi()?.apply?.();}catch{}
  }

  function setLanguage(language){
    if(!languages()[language])language="en";
    try{localStorage.setItem(LANG_KEY,language);}catch{}
    const api=tApi();
    if(api?.setLanguage){api.setLanguage(language);}
    else{updateNavbarLanguage(language);}
    closeLanguageMenu();
  }

  function getTheme(){try{return localStorage.getItem(THEME_KEY)==="dark"?"dark":"light";}catch{return"light";}}
  function applyTheme(theme){
    const dark=theme==="dark";
    document.documentElement.dataset.theme=dark?"dark":"light";
    document.documentElement.classList.toggle("vs-dark-mode",dark);
    document.body.classList.toggle("dark-mode",dark);
    document.body.classList.toggle("vs-dark-mode",dark);
    document.body.dataset.theme=dark?"dark":"light";
    const b=$("#vs-theme-toggle"); if(!b)return;
    b.setAttribute("aria-pressed",String(dark)); b.setAttribute("aria-label",dark?"Switch to day mode":"Switch to night mode"); b.title=dark?"Switch to day mode":"Switch to night mode";
    $(".vs-theme-icon",b).textContent=dark?"☀":"☾"; $(".vs-theme-label",b).textContent=dark?"Day":"Night";
    $(".vs-theme-knob",b).setAttribute("data-position",dark?"right":"left");
  }
  function saveTheme(theme){const v=theme==="dark"?"dark":"light";try{localStorage.setItem(THEME_KEY,v);}catch{}applyTheme(v);}

  function bindEvents(){
    document.addEventListener("click",e=>{
      const lang=e.target.closest("[data-vs-language]");
      if(lang){e.preventDefault();e.stopPropagation();setLanguage(lang.dataset.vsLanguage);return;}
      if(e.target.closest("#vs-language-btn")){e.preventDefault();e.stopPropagation();toggleLanguageMenu();return;}
      if(e.target.closest("#vs-mobile-menu-btn")){e.preventDefault();e.stopPropagation();toggleMobileMenu();return;}
      if(e.target.closest("#vs-mobile-menu .nav-platform")){closeMobileMenu();return;}
      const theme=e.target.closest("#vs-theme-toggle");
      if(theme){e.preventDefault();saveTheme(getTheme()==="dark"?"light":"dark");return;}
      const legal=e.target.closest("[data-vs-legal]");
      if(legal){const d=LEGAL[legal.dataset.vsLegal];if(d){$("#vs-legal-title").textContent=d[0];$("#vs-legal-content").textContent=d[1];$("#vs-legal-modal").classList.remove("hidden");document.body.classList.add("legal-modal-open");}return;}
      if(e.target.closest("[data-vs-close-legal]") || e.target.id==="vs-legal-modal"){$("#vs-legal-modal")?.classList.add("hidden");document.body.classList.remove("legal-modal-open");return;}
      if(!e.target.closest(".vs-language-selector"))closeLanguageMenu();
    });
    document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeLanguageMenu();closeMobileMenu();$("#vs-legal-modal")?.classList.add("hidden");document.body.classList.remove("legal-modal-open");}});
    window.addEventListener("vidsnatch:languagechange",e=>updateNavbarLanguage(e.detail?.language||getLanguage()));
  }

  function install(){
    if(!document.body)return;
    removeOldShell();
    document.body.insertAdjacentHTML("afterbegin",navbarMarkup());
    const main=$("main");
    if(main){
      main.insertAdjacentHTML("beforeend",faqMarkup());
      main.insertAdjacentHTML("afterend",footerMarkup());
    } else {
      document.body.insertAdjacentHTML("beforeend",faqMarkup()+footerMarkup());
    }
    document.body.insertAdjacentHTML("beforeend",modalMarkup());
    updateNavbarLanguage(getLanguage()); applyTheme(getTheme());
  }

  function init(){
    if(document.documentElement.dataset.vsSiteUIInitialized==="true")return;
    document.documentElement.dataset.vsSiteUIInitialized="true";
    bindEvents(); install();
  }

  window.VidSnatchSiteUI={init,setLanguage,getLanguage,getTheme,saveTheme,toggleTheme:()=>saveTheme(getTheme()==="dark"?"light":"dark")};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
